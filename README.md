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

### Development
Due to same-site cookie policies, the AKSO API must be served from the same host as the admin dashboard. Hence, the dev server script runs a proxy to `apitest.asko.org` at `localhost:2577`.

To start the dev server, run:

```sh
npm start
```

## License
This project is licensed under the GPL 3 or later.
