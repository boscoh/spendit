# spendit

Skeleton data webapp that runs both locally and remotely, with  dev setup options.

- equivalent Vue3, React and Svelte clients
- rpc bridge to fastapi python server
- convenient clie with dev modes for server and client, and port mappings

## CLIENT

For all clients, the following has been implemented:
- dynamic routes
- global store
- modals
- fully interactive graph
- crud and forms to db
- bootstrap styles for cross-framework designs

### Client

dev mode with `dev.sh`:

- install `ttab` using `npm i -g ttab`
- on mac, need to change
   - System Prefs -> Security -> Privacy -> Accessibility: add Terminal
- will open a terminal for the server in dev mode and the client-dev-server

### Installing client-react

[ref](https://www.linkedin.com/pulse/installing-react-vite-beginners-guide-richard-oliver-bray/)

```
npx create-vite client-react --template react
cd client-react && npm i && npm run dev
```

### todo
- merge datasets
- names: spendit vs. sortable
- generate fake data
- update api for svelte/react
@done
- offsetDays/categories save in db per table @done
- redo database 
- change main name for python import @done
- state @done
- load file into db @done
- plotly graph of data @done

### config
- `/etc/nginx/sites-enabled/fastapi`:
    ```
    server {
        listen 80;
        server_name ~^(.+)$;
        location / {
            proxy_pass http://0.0.0.0:9023;
        }
    
    }
    ```
- `/etc/supervisor/conf.d/fastapi.conf`:
   ```
    [program:fastapi]
    directory=/home/boscoh/spendit/spendit
    command=/home/boscoh/spendit/.venv/bin/python3 cli.py run --port 9023
    autostart=true
    user=boscoh
    autorestart=true
    stopasgroup=true
    killasgroup=true
    stderr_logfile=/var/log/spendit/errors
    stdout_logfile=/var/log/spendit/logs
    ```