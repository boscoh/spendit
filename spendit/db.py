import json
import logging
import sqlite3

import duckdb
import pandas
from path import Path
from pydash import py_

__doc__ = """
Interface to an SQLite3 database for storage, with accessor methods to both ingest
and generate pandas dataframes
"""

logger = logging.getLogger(__name__)

data_dir = Path(__file__).abspath().parent / "data"
sqlite_fname = data_dir / "data.sqlite"


class SqliteDb:
    def __init__(self, db_fname=sqlite_fname, table="transactions"):
        self.db_fname = db_fname
        self.conn = self.make_conn()
        self.cursor = self.conn.cursor()
        self.table = table
        self.id_column = "id"

    def make_conn(self):
        return sqlite3.connect(self.db_fname)

    def execute(self, *args):
        return self.cursor.execute(*args)

    def execute_to_df(self, sql, params=None):
        return pandas.read_sql_query(sql, self.conn, params=params)

    def commit(self):
        self.conn.commit()

    def set_from_df(self, df, table, if_exists="append"):
        """
        :param if_exists: fail, append, replace
        """
        df.to_sql(con=self.conn, name=table, index=False, if_exists=if_exists)
        self.commit()

    def replace_table_with_df(self, df, table=None):
        if table is None:
            table = self.table
        self.set_from_df(df, table, if_exists="replace")

    def add_column(self, name, col_type="text", table=None):
        if table is None:
            table = self.table
        self.execute(f"ALTER TABLE {table} ADD COLUMN '{name}' '{col_type}'")
        self.commit()

    def get_columns(self, table=None):
        if table is None:
            table = self.table
        queries = self.execute(f"PRAGMA table_info('{table}')").fetchall()
        return [r[1] for r in queries]

    def close(self):
        self.conn.close()

    def get_tables(self):
        rows = self.execute("SELECT name FROM sqlite_master").fetchall()
        return [r[0] for r in rows]

    def get_df(self, table=None):
        if table is None:
            table = self.table
        return pandas.read_sql_query(f"SELECT * from {table}", self.conn)

    def get_row(self, id, table=None):
        if table is None:
            table = self.table
        return self.execute(
            f"SELECT * FROM {table} WHERE {self.id_column} = ?", (id,)
        ).fetchall()

    def get_json(self, table=None):
        if table is None:
            table = self.table
        return json.loads(self.get_df(table).to_json(orient="split"))

    def get_csv(self, table=None):
        if table is None:
            table = self.table
        return self.get_df(table).to_csv(index=False)

    def insert(self, entry, table=None):
        """
        Assumes there is a
        :param entry:
            <k>: <v>
        """
        if table is None:
            table = self.table
        keys = ",".join(entry.keys())
        questions = ",".join(["?" for _ in range(len(entry))])
        sql = f"INSERT INTO {table} ({keys}) VALUES ({questions})"
        self.execute(sql, tuple(entry.values()))
        self.commit()
        return self.cursor.lastrowid

    def update(self, id, vals, table=None):
        """
        :param vals:
            <k>: <v>
        """
        if table is None:
            table = self.table
        for k, v in vals.items():
            self.execute(
                f"UPDATE {table} SET {k}=? WHERE {self.id_column} = ?", (v, id)
            )
        self.commit()
        logger.info(f"update {id} {vals}")

    def drop_table(self, table):
        if table in self.get_tables():
            self.execute(f'DROP TABLE {table}')
            self.commit()

    def rename_table(self, table, new_table):
        if table in self.get_tables():
            new_table = py_.snake_case(new_table)
            self.execute(f"ALTER TABLE {table} RENAME to {new_table};")
            self.commit()


def rename_df_to_snake(df):
    columns = df.columns.to_list()
    snake_by_old = {c: py_.snake_case(c) for c in columns}
    df.rename(columns=snake_by_old, inplace=True)
    return df
