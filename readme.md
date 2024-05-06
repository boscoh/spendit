# num-app

Skeleton data webapp that runs both locally and remotely, with usef dev setup options.

- equivalent Vue3, React and Svelte
- simple rpc-json bridge
- fastapi server 
- dev mode for server and client
- auto startup for dev
- cli startup mode
- random ports means multiple copies can be started

## CLIENT

For all clients, the following has been implemented:
- routes
- bootstrap
- reactive states
- global store
- rpc load/update from server

_todo_:
  - param in routes
  - state
  - load file into db
  - plotly graph of data
  - transactions from kaggle

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
- offsetDays/categories save in db per table
- change main name for python import