import json
import os
import subprocess
import time
from glob import glob

import numpy as np
from addict import Dict
from path import Path
from pydash import py_
from rich.pretty import pretty_repr
from ruyaml import YAML

yaml = YAML(typ="safe")
yaml.default_flow_style = False
yaml.encoding = "utf-8"
yaml.allow_unicode = True


class Encoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, np.ndarray):
            return o.tolist()
        return str(o)


def decode(o):
    if isinstance(o, dict):
        return {k: decode(v) for k, v in o.items()}
    elif isinstance(o, list):
        return [decode(item) for item in o]
    return o


def load_json(f, is_addict=False):
    with open(f) as handle:
        result = decode(json.load(handle))
    if is_addict:
        result = Dict(result)
    return result


def dump_json(o, f):
    check_file_dir(f)
    with open(f, "w", encoding="utf-8") as handle:
        json.dump(o, handle, cls=Encoder)


def load_yaml(f, is_addict=False):
    with open(f) as handle:
        result = decode(yaml.load(handle))
    if is_addict:
        result = Dict(result)
    return result


def load_yaml_dict(f):
    return load_yaml(f, is_addict=True)


def dump_yaml(o, f, mode="w"):
    check_file_dir(f)
    o = json.loads(json.dumps(o, cls=Encoder))
    with open(f, mode, encoding="utf-8") as handle:
        yaml.dump(o, handle)


def get_yaml_str(o, indent=0):
    o = json.loads(json.dumps(o, cls=Encoder, default=str))
    import textwrap
    from io import StringIO

    handle = StringIO()
    yaml.dump(o, handle)
    s = handle.getvalue()
    if indent:
        s = textwrap.indent(s, " " * indent)
    if s.endswith("\n"):
        s = s[:-1]
    return s


def print_yaml(o, indent=2):
    print(get_yaml_str(o, indent=indent))


def ensure_dir(d):
    Path(d).makedirs_p()


def check_file_dir(f):
    ensure_dir(Path(f).abspath().parent)


def clear_dir(d):
    path = Path(d)
    if not path.exists():
        ensure_dir(path)
    elif path.isdir():
        for f in path.files():
            f.remove()
        for d in path.dirs():
            d.rmtree()
    else:
        raise ValueError(f"Error: {d} is not a directory")


def copy_to_dir(src, dest_dir):
    src, dest_dir = Path(src), Path(dest_dir)
    dest_dir.makedirs_p()
    dst = dest_dir / src.name
    if dst.abspath() != src.abspath():
        src.copyfile(dst)


def copy_file(source, target, follow_symlinks=True) -> None:
    source, target = Path(source), Path(target)
    if target.exists():
        return
    check_file_dir(target)
    source.copyfile(target, follow_symlinks=follow_symlinks)


def run(cmd, env=None):
    print(">>>>", cmd)
    subprocess.run(cmd, shell=True, check=True, env=env)


def run_with_output(cmd):
    bytes_output = subprocess.check_output(cmd.split())
    return bytes_output.decode("utf-8", errors="ignore")


def append_to_key_list(a_dict, key, val):
    if key not in a_dict:
        a_dict[key] = []
    a_dict[key].append(val)


def transfer_glob_str(from_dir, glob_str, to_dir):
    """
    Make copies of files in from_dir/glob_str in the directory to_dir

        >>> transfer_glob_str('source', '**/*.html', 'target')
    """
    from_dir = Path(from_dir)
    to_dir = Path(to_dir)
    for f in glob(from_dir / glob_str, recursive=True):
        rel_dir = Path(f).parent.relpath(from_dir)
        to_rel_dir = to_dir / rel_dir
        copy_to_dir(f, to_rel_dir)


saved_dirs = []


def push_dir(new_dir):
    new_dir = Path(new_dir)
    new_dir.makedirs_p()
    save_dir = os.getcwd()
    saved_dirs.append(save_dir)
    new_dir.chdir()


def pop_dir():
    if len(saved_dirs):
        save_dir = saved_dirs.pop()
        os.chdir(save_dir)


def load_yaml_from_yaml_url(v):
    tokens = v.replace("yaml://", "").split("/")
    yaml_fname, dict_path = tokens[0:2]
    d = load_yaml_dict(yaml_fname)
    return py_.get(d, dict_path)


def walk_object(o):
    if isinstance(o, dict):
        a_dict = o
        for k, v in a_dict.items():
            if isinstance(v, dict) or isinstance(v, list):
                walk_object(v)
            elif isinstance(v, str):
                if v.startswith("yaml://"):
                    a_dict[k] = load_yaml_from_yaml_url(v)
    elif isinstance(o, list):
        a_list = o
        for i in range(len(a_list)):
            v = a_list[i]
            if isinstance(v, dict) or isinstance(v, list):
                walk_object(v)
            elif isinstance(v, str):
                if v.startswith("yaml://"):
                    a_list[i] = load_yaml_from_yaml_url(v)


def parse_dict_with_yaml_url(o):
    parsed_o = Dict(o)
    walk_object(parsed_o)
    return parsed_o


def repr_lines(o, prefix=""):
    lines = pretty_repr(o).split("\n")
    lines[0] = prefix + lines[0]
    return lines


time_store = []


def tic(msg="No message"):
    ti = time.perf_counter_ns()  # final time
    time_store.append((msg, ti))
    return f"{msg}:started..."


def toc():
    tf = time.perf_counter_ns()  # final time
    if not len(time_store):
        delta_ms = 0
        msg = "no tic"
    else:
        msg, ti = time_store.pop()
        delta_ns = tf - ti
        delta_ms = round(delta_ns / 1000000)
    time_s = get_time_str(delta_ms / 1000)
    return f"{msg}:finished in {time_s}"


def get_time_str(seconds):
    days = seconds // 86400
    seconds -= days * 86400
    hours = seconds // 3600
    seconds -= hours * 3600
    minutes = seconds // 60
    seconds -= minutes * 60
    if days > 0:
        value = "%d:%d:%02d:%02d" % (
            days,
            hours,
            minutes,
            seconds,
        )
    elif hours > 0:
        value = "%d:%02d:%02d" % (
            hours,
            minutes,
            seconds,
        )
    elif minutes > 0:
        value = "%02d:%02d" % (minutes, seconds)
    elif seconds >= 1:
        value = "%.3fs" % seconds
    elif seconds > 0.001:
        value = "%.0fms" % (seconds * 1000)
    else:
        value = "<1ms"
    return value


