import { h, render } from 'preact';
import { CircularProgressIndicator } from './p-components/progress';
import Login, { isSpecialPage } from './login';
import client from './client';
import './style';

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

            const onLogin = function () {
                window.localStorage.demoLoggedIn = true;
                loginRoot.classList.add('animate-out');
                setTimeout(() => {
                    document.body.removeChild(loginRoot);
                }, 1000);

                setTimeout(() => initApp(app, true), 300);
            };

            render(<Login onLogin={onLogin} />, loginRoot);
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
    render(<CircularProgressIndicator indeterminate />, loadingRoot);

    let appLoaded = false;
    let addedLoadingIndicator = false;
    setTimeout(() => {
        if (appLoaded) return;
        document.body.appendChild(loadingRoot);
        addedLoadingIndicator = true;
    }, 500);

    app.then(app => {
        appLoaded = true;
        if (addedLoadingIndicator) {
            loadingRoot.classList.add('animate-out');
            setTimeout(() => {
                document.body.removeChild(loadingRoot);
            }, 1000);
        }

        const appRoot = app.init(shouldPlayLoginAnimation, () => {
            // logged out
            client.logOut().then(() => {
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
