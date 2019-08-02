import { h, render } from 'preact';
import { CircularProgress } from 'yamdl';
import Login, { isSpecialPage } from './login';
import client from './client';
import './style';

import './chrome-focus';

/** @jsx h */

/** Shows the login screen if not logged in and opens the app. */
function beginSession () {
    client.restoreSession().catch(err => {
        // TODO: handle error properly
        /* eslint-disable no-console */
        console.error('failed to restore session', err);
        /* eslint-enable no-console */
        return false;
    }).then(response => {
        if (response && !response.isAdmin) return client.logOut();
        else return response;
    }).then(response => {
        const app = import(/* webpackChunkName: "app", webpackPrefetch: true */ './app');

        if (isSpecialPage() || !response || !response.totpUsed) {
            const loginRoot = document.createElement('div');
            loginRoot.id = 'login-root';
            loginRoot.className = 'root-container';
            document.body.appendChild(loginRoot);

            let virtualLoginRoot; // eslint-disable-line prefer-const
            let didLogin = false;
            const onLogin = function () {
                // FIXME: sometimes it creates two react roots? i suspect it calls onLogin twice
                // so here’s a quick fix
                if (didLogin) return;
                didLogin = true;
                loginRoot.classList.add('animate-out');
                setTimeout(() => {
                    // unmount to clean up
                    render(() => null, loginRoot, virtualLoginRoot);
                    document.body.removeChild(loginRoot);
                }, 1000);

                setTimeout(() => initApp(app, true), 300);
            };

            virtualLoginRoot = render(<Login onLogin={onLogin} />, loginRoot);
        } else {
            initApp(app);
        }
    });
}

/**
 * Opens the app.
 * @param {Promise<Object>} app - the result of `import('./app')`
 * @param {boolean} shouldPlayLoginAnimation - if false, will not play the “logged in” animation
 */
function initApp (app, shouldPlayLoginAnimation = false) {
    const loadingRoot = document.createElement('div');
    loadingRoot.id = 'app-loading';
    let virtualLoadingRoot;

    let appLoaded = false;
    let addedLoadingIndicator = false;
    setTimeout(() => {
        if (appLoaded) return;
        render(<CircularProgress indeterminate />, loadingRoot);
        document.body.appendChild(loadingRoot);
        addedLoadingIndicator = true;
    }, 500);

    app.then(app => {
        appLoaded = true;
        if (addedLoadingIndicator) {
            loadingRoot.classList.add('animate-out');
            setTimeout(() => {
                // unmount to clean up
                render(() => null, loadingRoot, virtualLoadingRoot);
                document.body.removeChild(loadingRoot);
            }, 1000);
        }

        const appRoot = app.init(shouldPlayLoginAnimation, () => {
            // logged out
            client.logOut().then(() => {
                // TODO: unmountComponentAtNode here
                document.body.removeChild(appRoot);
                beginSession();
            });
        });
    }).catch(err => {
        const errorContainer = document.createElement('pre');
        errorContainer.classList.add('global-error-container');
        errorContainer.textContent = `Error rendering application: ${err.message}\n\n${err.stack}`;
        document.body.appendChild(errorContainer);
        /* eslint-disable no-console */
        console.error(err);
        /* eslint-enable no-console */
    });
}

beginSession();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/**service worker file name (see webpack config)**');
}

// don’t show “add to homescreen” prompt
window.addEventListener('beforeinstallprompt', e => e.preventDefault());
