import os
from typing import Optional

import pandas
import psutil
import structlog
from path import Path
from pydash import py_

from db import SqliteDb
from db import rename_df_to_snake
from fs import load_yaml, dump_yaml

logger = structlog.getLogger(__name__)
data_dir = Path(__file__).parent
db: Optional[SqliteDb] = None


def init(config):
    global data_dir, db
    data_dir = config["data_dir"]
    db = SqliteDb(data_dir / "data.sqlite")
    if config.get("csv"):
        inject_csv(config["csv"])


def inject_csv(csv, table=None):
    df = pandas.read_csv(csv)
    if "category" not in df:
        df["category"] = ""
    if "id" not in df.columns:
        columns = list(df.columns)
        df["id"] = df.index
        df = df[["id"] + columns]
    rename_df_to_snake(df)
    if table is None:
        table = py_.snake_case(Path(csv).stem)
    db.replace_table_with_df(df, table)


def kill():
    db.close()
    psutil.Process(os.getpid()).kill()


def get_tables():
    return db.get_tables()


def get_transactions(table):
    return db.get_json(table)


def update_transactions(table, row_id, vals):
    db.update(row_id, vals, table)
    return {"success": True}


def get_csv():
    return db.get_csv()


def set_categories(categories):
    dump_yaml(categories, data_dir / "categories.yaml")


def get_categories():
    return load_yaml(data_dir / "categories.yaml")


def autofill(table):
    category_sets = get_categories()
    for c in category_sets:
        if c["filter"]:
            c["keywords"] = set(c["filter"].lower().split())
        else:
            c["keywords"] = set()

    def get_category(description):
        words = set(description.split())
        for category_set in category_sets:
            if list(category_set["keywords"] & words):
                return category_set["key"]
        return ""

    for i, row in db.get_df(table).iterrows():
        category = get_category(row.description.lower())
        if category == "X" and row.category:
            db.update(row.id, {"category": None}, table)
        elif category and category != row.category:
            db.update(row.id, {"category": category}, table)
