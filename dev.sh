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

if command -v psword &> /dev/null
then
  psword -k MacOS/Python
  psword -k node
  psword -k mambaforge
  psword -k python
fi

ttab "source .venv/bin/activate; cd server; python cli.py run --dev"

# set apiUrl set for client
cd rpc
cp config.dev.json config.json
cd ..
ttab "cd client-$1; npm run dev;"


