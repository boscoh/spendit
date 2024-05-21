import json
from typing import Optional

import pandas
from path import Path
from pydash import py_

from .db import SqliteDb
from .fs import load_yaml

db: Optional[SqliteDb] = None
data_dir = None
db_name = "data.sqlite3"


def init(config=None):
    """
    :param config: dict - optional {"data_dir": str}
    """
    global db
    global data_dir

    if config is None:
        config = {}
    if "data_dir" in config:
        data_dir = config["data_dir"]
    else:
        data_dir = Path(__file__).parent / "data"

    db = SqliteDb(data_dir / db_name)

    db.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            report_id INTEGER PRIMARY KEY, 
            name text NOT NULL, 
            offset_days INT,
            json_categories TEXT
        );
    """)
    db.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            transaction_id INTEGER PRIMARY KEY, 
            report_id INTEGER,
            description text, 
            date text,
            amount FLOAT,
            category text
        );
    """)
    db.commit()


def get_report_names():
    df = db.get_df(table="reports")
    return df.name.tolist()


def get_report_row(report):
    sql = "select * from reports where name = ?"
    params = [report]
    df = db.execute_to_df(sql, params=params)
    return df.iloc[0].to_dict()


def update_report(report, val_by_col):
    report_row = get_report_row(report)
    params = []
    sql = "UPDATE reports "
    for i_val, (col, val) in enumerate(val_by_col.items()):
        sql += "SET " if i_val == 0 else "AND "
        sql += f"{col} = ? "
        params.append(str(val))
    sql += "WHERE report_id = ?"
    params.append(str(report_row["report_id"]))
    db.execute(sql, params)
    db.commit()


def delete_report(report):
    params = [str(get_report_id(report))]
    sql = "DELETE FROM transactions WHERE report_id = ?"
    db.execute(sql, params)
    sql = "DELETE FROM reports WHERE report_id = ?"
    db.execute(sql, params)
    db.commit()


def rename_report(report, new_report):
    update_report(report, {"name": new_report})


def get_report_id(report):
    return get_report_row(report)["report_id"]


def get_categories(report):
    report_row = get_report_row(report)
    return json.loads(report_row["json_categories"])


def update_categories(categories, report):
    update_report(report, {"json_categories": json.dumps(categories)})


def get_df(report):
    sql = "select * from transactions where report_id = ?"
    params = [str(get_report_id(report))]
    df = db.execute_to_df(sql, params=params)
    df.rename(columns={"transaction_id": "id"}, inplace=True)
    df.sort_values(by="date", inplace=True)
    return df[["id", "date", "description", "amount", "category"]]


def get_transactions(report):
    df = get_df(report)
    return json.loads(df.to_json(orient="split"))


def get_csv(report):
    return get_df(report).to_csv(index=False)


def update_transaction(report, row_id, val_by_col):
    params = []
    sql = "UPDATE transactions "
    for i_val, (col, val) in enumerate(val_by_col.items()):
        sql += "SET " if i_val == 0 else "AND "
        sql += f"{col} = ? "
        params.append(str(val))
    sql += "WHERE report_id = ? AND transaction_id = ? "
    params.append(str(get_report_id(report)))
    params.append(str(row_id))
    db.execute(sql, params)
    db.commit()


def autofill(report):
    category_sets = get_categories(report)
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

    for i, row in get_df(report).iterrows():
        category = get_category(row.description.lower())
        if category == "X" and row.category:
            update_transaction(report, row.id, {"category": None})
        elif category and category != row.category:
            update_transaction(report, row.id, {"category": category})


def inject_csv(csv):
    name = py_.snake_case(Path(csv).stem)
    if name in get_report_names():
        return
    categories = load_yaml(data_dir / "categories.yaml")
    report_id = db.insert(
        table="reports",
        entry={
            "name": name,
            "json_categories": json.dumps(categories),
        },
    )

    df = pandas.read_csv(csv)
    df.rename(columns={"debit_amount": "amount"}, inplace=True)
    if "category" not in df:
        df["category"] = None
    df = df[["date", "description", "amount", "category"]]
    df["report_id"] = report_id
    db.set_from_df(df, "transactions", if_exists="append")


def upload_csv(fname):
    # logger.info('upload_csv', fname=fname)
    fname = Path(fname)
    inject_csv(fname)
    fname.remove_p()
    return {"filename": fname}


if __name__ == "__main__":
    data_dir = Path(__file__).parent / "data"
    (data_dir / db_name).remove_p()
    init({"data_dir": data_dir})
    sample_dir = Path(__file__).parent / "../sample"
    inject_csv(sample_dir / "westpac_bosco.csv")
    inject_csv(sample_dir / "anz_tiz.csv")
