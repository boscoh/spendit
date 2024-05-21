# to open tabs in terminal for both client server and
# backend server in *nix, install ttab using `npm i -g ttab`
# on mac, need to change
#   System P
#   refs -> Security -> Privacy -> Accessibility: add Terminal

# check options for input example file
if [[ "$1" =~ ^(react|vue3|svelte)$ ]]; then
    echo "opening $1 client"
else
    echo "Pleas choose the client type react|vue3|svelte"
    exit 1
fi

cd "$(dirname "$0")"

if [ -f ./sh/clear_ps.sh ]; then
  ./sh/clear_ps.sh
fi

ttab "source .venv/bin/activate; cd spendit; python3 cli.py run --dev"

# set apiUrl set for client
cd rpc
cp config.dev.json config.json
cd ..

if [ ! -d "client-$1/node_modules" ]; then
  cd "client-$1"
  echo "installing client dependencies"
  npm install .
  cd ..
fi
ttab "cd client-$1; npm run dev;"


