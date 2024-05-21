#!/usr/bin/env python
import sys
import time

import click
import structlog
from path import Path

this_dir = Path(__file__).parent
logger = structlog.get_logger(__name__)


@click.group()
def cli():
    pass


@cli.command()
@click.option("--dev", is_flag=True, help="Run continuous server")
@click.option("--port", default=None, help="port number")
@click.option("--csv", default=None, help="starter data in csv file")
def run(dev, port, csv):
    """
    Run the data server
    """
    # hack to load sibling modules for cli.py
    sys.path.append(this_dir.parent)
    from spendit.app import run_server

    if csv:
        csv = str(Path(csv).abspath())
    else:
        csv = None
    run_server(dict(dev=dev, port=port, csv=csv))


@cli.command()
@click.argument("url")
def open_url(url):
    """
    Waits for server staring before opening built client
    """
    # hack to load sibling modules for cli.py
    sys.path.append(this_dir.parent)
    from spendit.app import open_url_in_background
    from spendit.fs import load_yaml

    app_yaml = this_dir / "app.yaml"
    while not app_yaml.exists():
        time.sleep(1)
    config = load_yaml(app_yaml, is_addict=True)
    server_url = f"http://localhost:{config.port}"
    open_url_in_background(server_url, url)


if __name__ == "__main__":
    cli()
