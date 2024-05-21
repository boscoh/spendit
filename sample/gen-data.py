import random
import sys

import arrow
import pandas
from path import Path
from pydash import py_

sys.path.append(Path(__file__).parent.parent)
from spendit import handlers

sample_dir = Path(__file__).parent


def make_samples(entries_df, test1_csv, start_date, end_date):
    def make_entry_from_row(row, date):
        return {
            "date": date.isoformat()[:10],
            "description": row.description,
            "amount": row.amount,
        }

    def make_entry(category_df, date):
        i = random.randint(0, len(category_df) - 1)
        return make_entry_from_row(category_df.iloc[i], date)

    df_by_category = {}
    random_entry_by_day = [("T", 1), ("A", 50), ("D", 3), ("S", 10), ("G", 7), ("V", 12)]
    for [category, n_day] in random_entry_by_day:
        df_by_category[category] = entries_df[entries_df.category == category]

    utilities_df = entries_df[entries_df.category == "U"]
    utility_rows = []
    for i, row in utilities_df.iterrows():
        utility_rows.append([row, random.randint(1, 25)])

    entries = []
    date = start_date
    while date < end_date:
        for category, n_day in random_entry_by_day:
            if random.randint(1, n_day) == 1:
                df = df_by_category[category]
                entries.append(make_entry(df, date))
        for row, day in utility_rows:
            if date.day == day:
                entries.append(make_entry_from_row(row, date))
        date = date.shift(days=1)

    df = pandas.DataFrame(entries)
    df.to_csv(test1_csv)
    name = py_.snake_case(test1_csv.stem)

    handlers.init()
    if name in handlers.get_report_names():
        handlers.delete_report(name)
    handlers.inject_csv(test1_csv)


if __name__ == "__main__":
    entries_csv = sample_dir / "entries.csv"
    entries_df = pandas.read_csv(entries_csv)
    entries_df.sort_values(by="category", inplace=True)
    entries_df.to_csv(entries_csv, index=False)

    end_date = arrow.utcnow()
    start_date = end_date.shift(years=-1)
    make_samples(entries_df, sample_dir / "example1.csv", start_date, end_date)

    end_date = arrow.get(2022, 9, 3)
    start_date = end_date.shift(months=-7)
    make_samples(entries_df, sample_dir / "example2.csv", start_date, end_date)
