# Builds SPA client for cli

# check options for input example file
if [[ "$1" =~ ^(react|vue3|svelte)$ ]]; then
    echo "client: $1"
else
    echo "Choose type of client: (react|vue3|svelte)"
    exit 1
fi

# goto this directory
cd "$(dirname "$0")"

# set apiUrl set for client
cd rpc
cp config.build.json config.json
cd ..

# build the client in src directory
cd "client-$1"
if [ ! -d "node_modules" ]; then
  npm install .
  cd ..
fi
echo "build $1 client"
npm run build
cd ..

# copy SPA client for server to find
if [[ "$1" == "svelte" ]]; then
  dist_name="client-$1/build"
else
  dist_name="client-$1/dist"
fi
rm -rf spendit/client
cp -r $dist_name spendit/client

if [ -d ".git" ]; then
  echo "update git repo"
  git add spendit/client
fi
