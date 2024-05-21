from path import Path

from .app import make_app, init_logging
from .fs import load_yaml

# Instantiates fast-api app with config from app.yaml
init_logging()
this_dir = Path(__file__).parent
app = make_app(load_yaml(this_dir / "app.yaml"))
