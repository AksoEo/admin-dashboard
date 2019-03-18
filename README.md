# AKSO Admin Dashboard
## Usage
### Building
```sh
npm install --dev
npx webpack --env prod
# ^ pass `--env analyze` to open webpack bundle analyzer, or no environment to build for development
```
Build output will be located at `/dist`.

### Server Setup
- All files in `dist` should be served at `/`
- All files in `assets` should be served at `/assets`
- Additional files to be served at `/`:
    + `src/manifest.json`
    + `src/apple-touch-icon.png`
- All unrecognized URLs should fall back to `dist/index.html`

Also see `test-server.js` for reference (or for testing).
