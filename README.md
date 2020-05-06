# AKSO Admin Dashboard
## Usage
### Building
```sh
npm install --dev
npx webpack --env prod
# ^ pass `--env analyze` to open webpack bundle analyzer, or no environment to build for development
```
Build output will be located at `/dist`.

Pass an environment variable named `AKSO_BASE` to override the API url base (default: https://apitest.akso.org/).

### Server Setup
- All files in `dist` should be served at `/`
- All files in `assets` should be served at `/assets`
- Additional files to be served at `/`:
    + `src/manifest.json`
    + `assets/apple-touch-icon.png`
- All unrecognized URLs should fall back to `dist/index.html`

Also see `test-server.js` for reference (or for testing).

#### Fun with Cookies
One may notice how trying to log in using the test server or webpack dev server doesn't actually work with a mysterious error about `GET /auth` returning 404 after successful `PUT /auth`. This is due to recent browsers enforcing measures for cookies only being allowed on the same host as the API host.

A hacky workaround:

1. Add `127.0.0.1    localtest.akso.org` to `/etc/hosts`
2. Set a public host on the dev server when running it (e.g. `webpack-dev-server --public localtest.akso.org`)
3. Open `localtest.akso.org:2576` instead of `localhost:2576`

## License
This project is licensed under the GPL 3 or later.
