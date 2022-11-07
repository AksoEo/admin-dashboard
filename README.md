# AKSO Admin Dashboard
### Building
Make sure the git submodules are present! If not, run `git submodule init && git submodule update`.

```sh
npm install --dev
npm run build
```
Build output will be located at `/dist`.

To build for development, run `npx webpack`, and to analyze the webpack bundle, use `npm run analyze`.
Passing an environment variable named `AKSO_BASE` overrides the API url (default: https://api.akso.org/v1).

### Server Setup
- All files in `dist` should be served at `/`
- All files in `assets` should be served at `/assets`
- Additional files to be served at `/`:
    + `src/manifest.json`
    + `assets/apple-touch-icon.png`
- All unrecognized URLs should fall back to `dist/index.html`
- `assets/insecure-content` should have a lax content security policy that allows for inline styles. This is used to preview rendered HTML.

Also see `test-server.js` for reference (or for testing).

### Development
To start the dev server, run:

```sh
npm run dev
```

## License
This project is licensed under the GPL 3 or later.
