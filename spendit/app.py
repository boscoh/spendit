# !/usr/bin/env python
import inspect
import json
import logging
import os
import socket
import threading
import time
import traceback
import webbrowser
from contextlib import closing
from io import BytesIO
from urllib.request import urlopen

import colorama
import psutil
import structlog
import uvicorn
from addict import Dict
from fastapi import FastAPI, UploadFile, File, Form
from path import Path
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import FileResponse, StreamingResponse
from starlette.staticfiles import StaticFiles

from . import handlers
from .fs import dump_yaml, get_time_str

logger = structlog.get_logger(__name__)
this_dir = Path(__file__).parent


def make_app(config):
    """
    :param config: dict
        data_dir: str - location of sqlite db and where to store downloaded files
        dev: boolean - triggers dev mode, running in dev mode with hot reload
    """
    client_dir = this_dir / "client"

    config = Dict(config)
    if "data_dir" not in config:
        config.data_dir = this_dir / "data"
    data_dir = config.data_dir

    logger.info("make_app", config=config)

    handlers.init(config)

    app = FastAPI()

    if config.dev:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @app.post("/rpc-run")
    async def rpc_run(data: dict):
        job_id = data.get("id", None)
        method = data.get("method")

        if method == "kill":
            psutil.Process(os.getpid()).kill()

        params = data.get("params", [])
        start_time = time.perf_counter_ns()
        try:
            if not hasattr(handlers, method):
                raise Exception(f"rpc-run {method} is not found")

            logger.info("rpc_run_start", method=method, params=params)
            fn = getattr(handlers, method)
            if inspect.iscoroutinefunction(fn):
                result = await fn(*params)
            else:
                result = fn(*params)
            payload = {"result": result, "jsonrpc": "2.0", "id": job_id}
            elapsed_ms = round((time.perf_counter_ns() - start_time) / 1e6)
            time_str = get_time_str(elapsed_ms / 1000)
            logger.info("rpc_run_finish", method=method, time=time_str)

        except Exception:
            elapsed_ms = round((time.perf_counter_ns() - start_time) / 1e6)
            time_str = get_time_str(elapsed_ms / 1000)
            error_lines = str(traceback.format_exc()).splitlines()
            logger.info(
                "rpc_run_error", method=method, time=time_str, error=error_lines[-1]
            )
            for line in error_lines:
                print(line)
            payload = {
                "error": {"code": -1, "message": error_lines},
                "jsonrpc": "2.0",
                "id": job_id,
            }
        return payload

    @app.get("/download/{file_id}")
    async def stream_file_for_download(file_id: str):
        try:
            full_fname = data_dir / file_id
            logger.info("download", file_id=file_id, full_fname=full_fname)
            blob = Path(full_fname).read_bytes()
            bytes_io = BytesIO(blob)
            return StreamingResponse(bytes_io, media_type="application/octet-stream")
        except Exception as e:
            error_lines = str(traceback.format_exc()).splitlines()
            logger.error("download_error", lines=error_lines)
            raise e

    @app.post("/upload/")
    async def receive_uploaded_file(
        file: UploadFile = File(...),
        method: str = Form(...),
        paramsJson: str = Form(...),
    ):
        try:
            fname = file.filename.replace(" ", "-")
            full_fname = data_dir / fname

            stem = full_fname.stem
            ext = full_fname.ext
            i = 1
            while full_fname.exists():
                full_fname = full_fname.parent / f"{stem}({i}){ext}"
                i += 1

            data_dir.makedirs_p()
            with open(full_fname, "wb+") as f:
                f.write(file.file.read())
            logger.info("save", filename=full_fname)

            if not hasattr(handlers, method):
                raise Exception(f"rpc-run {method} is not found")

            start_time = time.perf_counter_ns()
            params = [full_fname] + json.loads(paramsJson)
            logger.info("upload_handler_start", method=method, params=params)
            fn = getattr(handlers, method)
            if inspect.iscoroutinefunction(fn):
                result = await fn(*params)
            else:
                result = fn(*params)
            elapsed_ms = round((time.perf_counter_ns() - start_time) / 1e6)
            time_str = get_time_str(elapsed_ms / 1000)
            logger.info("upload_handler_finish", method=method, time=time_str)

            return {"result": result, "jsonrpc": "2.0", "id": None}
        except Exception as e:
            error_lines = str(traceback.format_exc()).splitlines()
            logger.error("upload_error", lines=error_lines)
            raise e

    @app.get("/")
    @app.get("/about")
    async def serve_index(request: Request):
        logger.info("root path")
        return FileResponse(client_dir / "index.html")

    @app.get("/table/{rest_of_path:path}")
    async def serve_tables(request: Request, rest_of_path: str):
        return FileResponse(client_dir / "index.html")

    if client_dir:
        # All other calls diverted to static files
        app.mount("/", StaticFiles(directory=client_dir), name="dist")

    return app


def init_logging():
    # Configure structlog to output structured logs in JSON format

    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer(),
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
    )

    # https://www.structlog.org/en/stable/console-output.html

    cr = structlog.dev.ConsoleRenderer(
        columns=[
            # Render the timestamp without the key name in yellow.
            structlog.dev.Column(
                "timestamp",
                structlog.dev.KeyValueColumnFormatter(
                    key_style=None,
                    value_style=colorama.Fore.YELLOW,
                    reset_style=colorama.Style.RESET_ALL,
                    value_repr=str,
                ),
            ),
            # Render the event without the key name in bright magenta.
            structlog.dev.Column(
                "event",
                structlog.dev.KeyValueColumnFormatter(
                    key_style=None,
                    value_style=colorama.Style.BRIGHT + colorama.Fore.MAGENTA,
                    reset_style=colorama.Style.RESET_ALL,
                    value_repr=str,
                ),
            ),
            # Default formatter for all keys not explicitly mentioned. The key is
            # cyan, the value is green.
            structlog.dev.Column(
                "",
                structlog.dev.KeyValueColumnFormatter(
                    key_style=colorama.Fore.CYAN,
                    value_style=colorama.Fore.GREEN,
                    reset_style=colorama.Style.RESET_ALL,
                    value_repr=str,
                ),
            ),
        ]
    )

    structlog.configure(processors=structlog.get_config()["processors"][:-1] + [cr])

    logging.basicConfig(
        level=logging.INFO, format="%(levelname)s:%(name)s:%(funcName)s: %(message)s"
    )


def open_url_in_background(test_url, open_url=None, sleep_in_s=1):
    """
    Polls server in background thread then opens a url in webbrowser
    """
    if open_url is None:
        open_url = test_url

    def inner():
        elapsed = 0
        while True:
            try:
                response_code = urlopen(test_url).getcode()
                if response_code < 400:
                    logger.info("open", url=open_url)
                    webbrowser.open(open_url)
                    return
            except:
                time.sleep(sleep_in_s)
                elapsed += sleep_in_s
                logger.info("wait", url=test_url, elapsed_s=elapsed)

    # creates a thread to poll server before opening client
    threading.Thread(target=inner).start()


def find_free_port():
    with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(("", 0))
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        port = s.getsockname()[1]
    return port


def run_server(config):
    config = Dict(config)
    if config.dev:  # dev mode
        # open client in dev mode
        config.port = 9023
        open_url_in_background(
            f"http://localhost:{config.port}",
            "http://localhost:5173",
        )
        # Need to run from here for relative imports in spending.run in uvicorn
        this_dir.parent.chdir()
        # Save app.yaml so uvicorn spendit.run:app can load config
        dump_yaml(config, "spendit/app.yaml")
        os.system(f"uvicorn spendit.run:app --reload --port {config.port}")
    else:  # production mode
        # open pre-built client
        if not config.port:
            config.port = find_free_port()
        open_url_in_background(f"http://localhost:{config.port}")
        uvicorn.run(make_app(config), port=config.port, log_level="critical")
