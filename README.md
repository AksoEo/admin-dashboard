# AKSO Admin Dashboard
### Building
Make sure the git submodules are present.

```sh
npm install --dev
env AKSO_BASE=https://api.akso.org npm run build
```
Build output will be located at `/dist`.

To build for development, run `npx webpack`, and to analyze the webpack bundle, use `npx webpack --env analyze`.
Passing an environment variable named `AKSO_BASE` overrides the API url (default: https://apitest.akso.org/).

### Server Setup
- All files in `dist` should be served at `/`
- All files in `assets` should be served at `/assets`
- Additional files to be served at `/`:
    + `src/manifest.json`
    + `assets/apple-touch-icon.png`
- All unrecognized URLs should fall back to `dist/index.html`

Also see `test-server.js` for reference (or for testing).

### Development
Due to same-site cookie policies, the AKSO API must be served from the same host as the admin dashboard. Hence, the dev server script runs a proxy to `apitest.asko.org` at `localhost:2577`.

To start the dev server, run:

```sh
npm start
```

## License
This project is licensed under the GPL 3 or later.
