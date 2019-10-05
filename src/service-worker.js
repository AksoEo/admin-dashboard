/* eslint-disable no-console */

const SERVICE_WORKER_DEV = false;
const DEV = !SERVICE_WORKER_DEV && '@!AKSO-MAGIC:dev';
const ASSETS = '@!AKSO-MAGIC:assets'
    .map(asset => `/${asset}`)
    .filter(asset => !asset.endsWith('.map'))
    .concat([
        '/',
        // common assets
        '/assets/favicon.png',
        '/assets/logo.svg',
        '/assets/logo-dark.svg',
        '/assets/logo-label.svg',
        '/assets/logo-label-dark.svg',
        '/assets/roboto/Roboto-Regular.woff2',
        '/assets/roboto/Roboto-Bold.woff2',
    ]);
const VERSION = require('../package.json').version;
const CACHE_NAME = `akso-${VERSION}`;

self.addEventListener('install', event => {
    console.log('[SW] installing service worker');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
            .then(() => console.log('[SW] successfully added all assets to the cache'))
            .catch(err => {
                console.error('[SW] failed to create cache', err);
                throw err;
            })
    );
});

self.addEventListener('activate', event => {
    console.log('[SW] getting rid of all other caches');
    event.waitUntil(
        // remove old caches
        caches.keys().then(keys => Promise.all(
            keys
                .filter(cache => cache.startsWith('akso') && cache !== CACHE_NAME)
                .map(cache => caches.delete(cache))
        )).then(() => console.log('[SW] activated service worker'))
            .catch(err => {
                console.error('[SW] failed to remove old caches', err);
                throw err;
            }),
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

    console.debug(`[SW] got request for ${event.request.url}, matching against cache…`);

    event.respondWith(caches.match(event.request).then(response => {
        if (response) {
            console.debug(`[SW] found cached item for ${event.request.url}`);
            return response;
        } else {
            console.debug(`[SW] fetching from network: ${event.request.url} (cred: ${event.request.credentials})`);
            return fetchFromNetwork(event);
        }
    }).catch(() => fetchFromNetwork(event)));
});
