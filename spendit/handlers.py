import json
from typing import Optional

import pandas
from path import Path
from pydash import py_
from sqladaptor import SqliteAdaptor

from .fs import load_yaml

db: Optional[SqliteAdaptor] = None
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

    db = SqliteAdaptor(data_dir / db_name)
    db.create_table(
        "reports",
        {
            "type": "object",
            "properties": {
                "report_id": {"type": "integer"},
                "name": {"type": "string"},
                "offset_days": {"type": "integer"},
                "json_categories": {"type": "string"},
            },
            "required": ["report_id"],
        },
    )
    db.create_table(
        "transactions",
        {
            "type": "object",
            "properties": {
                "transaction_id": {"type": "integer"},
                "report_id": {"type": "integer"},
                "description": {"type": "string"},
                "date": {"type": "string"},
                "amount": {"type": "number"},
                "category": {"type": "string"},
            },
            "required": ["transaction_id"],
        },
    )


def get_report_names():
    df = db.get_df("reports")
    return df.name.tolist()


def get_report_dict(report):
    return db.get_one_dict("reports", {"name": report})


def update_report(report, val_by_col):
    db.update("reports", {"name": report}, val_by_col)


def delete_report(report):
    db.delete("transactions", {"report_id": get_report_id(report)})
    db.delete("reports", {"report_id": get_report_id(report)})


def rename_report(report, new_report):
    db.update("reports", {"name": report}, {"name": new_report})


def get_report_id(report):
    return get_report_dict(report)["report_id"]


def get_categories(report):
    report_row = get_report_dict(report)
    return json.loads(report_row["json_categories"])


def update_categories(categories, report):
    update_report(report, {"json_categories": json.dumps(categories)})


def get_df(report):
    df = db.get_df("transactions", {"report_id": str(get_report_id(report))})
    df.rename(columns={"transaction_id": "id"}, inplace=True)
    df.sort_values(by="date", inplace=True)
    return df[["id", "date", "description", "amount", "category"]]


def get_transactions(report):
    df = get_df(report)
    return json.loads(df.to_json(orient="split"))


def get_csv(report):
    return get_df(report).to_csv(index=False)


def update_transaction(report, transaction_id, vals):
    db.update(
        "transactions",
        {
            "report_id": get_report_id(report),
            "transaction_id": transaction_id,
        },
        vals,
    )


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
        "reports",
        {"name": name, "json_categories": json.dumps(categories)},
    )
    df = pandas.read_csv(csv)
    df.rename(columns={"debit_amount": "amount"}, inplace=True)
    if "category" not in df:
        df["category"] = None
    df = df[["date", "description", "amount", "category"]]
    df["report_id"] = report_id
    db.set_from_df("transactions", df, if_exists="append")


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
