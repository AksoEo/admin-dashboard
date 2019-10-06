import { h, render, Component } from 'preact';
import { Fragment } from 'preact/compat';
import { CircularProgress } from '@cpsdqs/yamdl';
import isSpecialPage from './features/login/is-special-page';
import { Worker } from './core';
import { coreContext } from './core/connection';
import './style';

import './chrome-focus';

class Session extends Component {
    state = {
        login: null,
        app: null,
        transition: null,
        showLogin: false,
        loggedIn: false,
        limbo: false,
        specialPage: false,
    };

    loadLogin () {
        if (!this.loginPromise) {
            this.loginPromise =
                import(/* webpackChunkName: "login", webpackPrefetch: true */ './features/login');
            this.loginPromise.then(e => this.setState({ login: e.default }));
        }
    }

    loadApp () {
        if (!this.appPromise) {
            // TODO
            /*this.appPromise =
                import(/* webpackChunkName: "app", webpackPrefetch: true / './app');*/
            // this.appPromise.then(e => this.setState({ app: e.default }));
        }
    }

    componentDidMount () {
        this.core = new Worker();
        this.loginView = this.core.createDataView('login');
        this.loginView.on('update', this.#onLoginUpdate);

        if (isSpecialPage()) {
            this.setState({ specialPage: true });
        }
        this.loadApp();
        /*
        client.restoreSession().catch(err => {
            // TODO: handle error properly
            console.error('failed to restore session', err); // eslint-disable-line no-console
            return false;
        }).then(response => {
            if (isSpecialPage() || !response || !response.totpUsed || !response.isAdmin) {
                this.setState({ showLogin: true, authCheck: response });
                this.loadLogin();
            } else this.setState({ loggedIn: true });

            this.loadApp();
        });*/
    }

    #onLoginUpdate = data => {
        this.setState({ loggedIn: data.loggedIn && !data.totpRequired });
        if (!data.loggedIn || data.totpRequired) {
            this.setState({ showLogin: true });
            this.loadLogin();
        }
    };

    onLogin = (transition) => {
        this.setState({ loggedIn: true, transition });
        this.loadApp();
    };
    onLogout = () => {
        this.setState({ loggedIn: false, showLogin: true, limbo: true, transition: null });
        this.loadLogin();
        /*client.logOut().then(() => this.setState({ limbo: false })).catch(err => {
            console.error('failed to log out', err); // eslint-disable-line no-console
            this.setState({ loggedIn: true, limbo: false });
        });*/
    };

    render () {
        const { loggedIn, showLogin, specialPage, login: Login, app: App, transition, limbo } = this.state;

        let login = null;
        let app = null;
        if (!limbo) {
            if (Login && (showLogin || specialPage)) {
                login = <Login />;
            }
            if (loggedIn && App) {
                app = <App
                    onDirectTransition={(...a) => this.transition && this.transition.direct(...a)}
                    onLogout={this.onLogout} />;
            }
        }

        let extra = null;
        if (transition) {
            const { component: Transition, props } = transition;
            extra = <Transition
                ref={transition => this.transition = transition}
                onEnd={() => this.setState({ transition: null })}
                {...props} />;
        }

        return (
            <coreContext.Provider value={this.core}>
                <Fragment>
                    <LoadingIndicator loading={!login && !app && !extra} />
                    {app}
                    {login}
                    {extra}
                </Fragment>
            </coreContext.Provider>
        );
    }
}

class LoadingIndicator extends Component {
    state = {
        visible: false,
    };

    componentDidMount () {
        this.setState({ visible: this.props.loading });
        if (this.props.loading) this.visibleTime = Date.now();
    }
    componentDidUpdate (prevProps) {
        if (prevProps.loading !== this.props.loading) {
            if (!this.props.loading) {
                if (Date.now() - this.visibleTime < 500) {
                    // loading indicator never appeared
                    this.setState({ visible: false });
                } else {
                    this.hideTimeout = setTimeout(() => {
                        this.setState({ visible: false });
                    }, 1000);
                }
            } else {
                clearTimeout(this.hideTimeout);
                this.setState({ visible: true });
                this.visibleTime = Date.now();
            }
        }
    }

    render () {
        if (!this.state.visible) return null;
        return (
            <div id="app-loading-indicator" class={!this.props.loading ? 'animate-out' : ''}>
                <CircularProgress indeterminate />
            </div>
        );
    }
}

const sessionRoot = document.createElement('div');
sessionRoot.id = 'session-root';
sessionRoot.className = 'root-container';
document.body.appendChild(sessionRoot);
render(<Session />, sessionRoot);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/' + '@!AKSO-MAGIC:chunk:service-worker');
}

// don’t show “add to homescreen” prompt
window.addEventListener('beforeinstallprompt', e => e.preventDefault());
