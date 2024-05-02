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
duckdb_fname = data_dir / "data.duckdb"


class SqliteDb:
    def __init__(self, db_fname=sqlite_fname, table="transactions"):
        self.db_fname = db_fname
        self.conn = self.make_conn()
        self.cursor = self.conn.cursor()
        self.table = table
        self.id_column = "id"

    def make_conn(self):
        return sqlite3.connect(self.db_fname)

    def execute(self, *args, **kwargs):
        return self.cursor.execute(*args, **kwargs)

    def commit(self):
        self.conn.commit()

    def replace_table_with_df(self, df, table=None):
        if table is None:
            table = self.table
        df.to_sql(table, con=self.conn, index=False, if_exists="replace")
        self.commit()

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


class DuckDb:
    def __init__(self, db_fname=duckdb_fname, table="transactions"):
        self.db_fname = db_fname
        self.table = table
        self.conn = duckdb.connect(database=db_fname, read_only=False)

    def replace_table_with_df(self, df):
        # must use global to allow duckdb to find the global_df
        global global_df
        global_df = df
        self.conn.execute(f"CREATE TABLE {self.table} AS SELECT * FROM 'global_df'")
        self.conn.commit()

    def add_column(self, name, col_type="VARCHAR"):
        self.conn.execute(f"ALTER TABLE {self.table} ADD COLUMN {name} {col_type}")
        self.conn.commit()

    def close(self):
        self.conn.close()
        self.conn = None

    def get_tables(self):
        return [t[0] for t in self.conn.execute("SHOW TABLES").fetchall()]

    def get_df(self):
        return self.conn.execute(f"SELECT * FROM '{self.table}'").df()

    def get_json(self):
        return json.loads(self.get_df().to_json(orient="split"))

    def get_csv(self):
        return self.get_df().to_csv()

    def update(self, id, vals):
        """
        :param vals:
            <k>: <v>
        """
        k, v = list(vals.items())[0]
        self.conn.execute(f"UPDATE {self.table} SET {k}=? WHERE id = ?", (v, id))
        self.conn.commit()


def rename_df_to_snake(df):
    columns = df.columns.to_list()
    snake_by_old = {c: py_.snake_case(c) for c in columns}
    df.rename(columns=snake_by_old, inplace=True)
    return df
