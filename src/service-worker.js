const DEV = JSON.parse('**true if dev mode (see webpack config)**');
/* eslint-disable quotes */
const ASSETS = JSON.parse("**list of assets goes here (see webpack config)**")
    .map(asset => `/${asset}`)
    .concat(['/']);
/* eslint-enable quotes */
const VERSION = require('../package.json').version;
const CACHE_NAME = `akso-${VERSION}`;

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', event => {
    event.waitUntil(
        // remove old caches
        caches.keys().then(keys => Promise.all(
            keys
                .filter(cache => cache.startsWith('akso') && cache !== CACHE_NAME)
                .map(cache => caches.delete(cache))
        ))
    );
});

function fetchFromNetwork (event) {
    return fetch(event.request, { credentials: 'include' }).catch(err => {
        if (event.request.mode === 'navigate') {
            return caches.match('/');
        } else {
            return Promise.reject(err);
        }
    });
}

self.addEventListener('fetch', event => {
    if (DEV) {
        // development mode: always fetch from network
        event.respondWith(fetchFromNetwork(event));
        return;
    }
    event.respondWith(caches.match(event.request).then(response => {
        if (response) return response;
        else return fetchFromNetwork(event);
    }).catch(() => fetchFromNetwork(event)));
});
