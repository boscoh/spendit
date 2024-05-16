import re

import pandas
from path import Path
import numpy

sample_dir = Path("sample")


def prep_df():
    source_csv_fname = sample_dir / "westpac_bosco.csv"
    df = pandas.read_csv(source_csv_fname)
    df = df.rename(columns={"debit_amount": "amount"})

    i_col_description = df.columns.get_loc('description')
    for i, description in enumerate(df.description):
        for match in re.findall("(\d+)", description):
            n = len(match)
            if n >= 4:
                zero_number_str = "0" * len(match)
                description = description.replace(match, zero_number_str)
        for match in re.findall("\d+/\\d+", description):
            description = description.replace(match, "")
        if description.lower().endswith("aus"):
            description = description[:-3]
        description = description.rstrip()
        df.iloc[i, i_col_description] = description

    keep_indices = []
    for i in range(len(df)):
        description = df.iloc[i].description.lower()
        for word in [
            "dockland",
            "osko",
            "rutherglen",
            "bosco",
            "foreign",
            "wodonga",
            "corowa",
            "albury",
            "wahgunyah",
        ]:
            if word in description:
                break
        else:
            keep_indices.append(i)
    df = df.iloc[keep_indices]

    keep_indices = []
    for i in range(len(df)):
        category = df.iloc[i].category
        if not pandas.isna(category) and category:
            keep_indices.append(i)
    df = df.iloc[keep_indices]

    df2 = df[['description', "category"]].copy()
    df2.drop_duplicates(inplace=True)
    df3 = df[["description", "amount"]].groupby('description').mean()
    df3["amount"] = df3["amount"].round(0)
    df = df2.join(df3, on="description")
    df = df[["category", "amount", "description"]]

    i_col_category = df.columns.get_loc('category')
    for i in range(len(df)):
        row = df.iloc[i]
        if row.category == "D" and row.amount < 6.5:
            df.iloc[i, i_col_category] = "T"

    df.sort_values(by="category", inplace=True)
    df.to_csv(sample_dir / "entries.csv", index=False)

    # print(df)


if __name__ == "__main__":
    prep_df()
