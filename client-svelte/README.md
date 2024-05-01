# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

Bootstrap <https://github.com/svelte-add/bootstrap/tree/main>:

```bash
npx svelte-add@latest bootstrap
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.


## For SPA build

- https://www.matthewmoisen.com/blog/how-to-create-a-spa-using-sveltekit-with-no-node-or-server-side-routing/
- copy /node_modules/bootstrap/dist/js/bootstrap.bundle.min.js to /static/bootstrap.bundle.min.js
- load dynamically

- fallbacks for dynamic routes https://stackoverflow.com/questions/78159917/how-to-do-dynamic-routing-path-slug-page-svelte-when-using-adapter-static
- page routing https://stackoverflow.com/questions/65930303/sveltekit-how-do-i-do-slug-based-dynamic-routing