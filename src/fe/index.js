import { h, render, Component } from 'preact';
import { lazy, Suspense, Fragment } from 'preact/compat';
import { CircularProgress } from '@cpsdqs/yamdl';
import { LoginAuthStates } from '../protocol';
import isSpecialPage from './features/login/is-special-page';
import { Worker } from './core';
import { coreContext } from './core/connection';
import TaskView from './task-view';
import './style';

import './chrome-focus';

// copy-pasted from core/paths; (is this a good idea?)
const lazyPath = (f, map = (res => res.default)) => {
    let promise;
    function lazy () {
        if (!promise) {
            promise = f().then(map).catch(err => {
                promise = null;
                throw new Error('failed to load chunk: ' + err.toString());
            });
        }
        return promise;
    }
    lazy.isLazy = true;
    return lazy;
};
const genericTaskViews = () => import(/* webpackChunkName: "generic-tasks" */ './tasks');
const taskViews = {
    info: lazyPath(genericTaskViews, res => res.info),
    login: lazyPath(() => import(/* webpackChunkName: "login-tasks" */ './features/login/tasks')),
};
const loadTaskView = async (taskPath) => {
    const path = taskPath.split('/');
    let o = taskViews;
    for (let i = 0; i < path.length; i++) {
        const p = path[i];
        if (!(p in o)) return null;
        o = o[p];
        if (o.isLazy) o = await o();
        if (i === path.length - 1) {
            return o || null;
        }
    }
};

class Session extends Component {
    state = {
        login: null,
        app: null,
        loggedIn: false,
        showLogin: false,
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

        this.tasksView = this.core.createDataView('#tasks');
        this.tasksView.on('update', this.#onTasksUpdate);

        if (isSpecialPage()) {
            this.setState({ specialPage: true });
        }

        this.loadApp();
    }

    #hideLoginTimeout = null;
    #onLoginUpdate = data => {
        this.setState({ loggedIn: data.authState === LoginAuthStates.LOGGED_IN });
        if (data.authState !== LoginAuthStates.LOGGED_IN) {
            clearTimeout(this.#hideLoginTimeout);
            this.setState({ showLogin: true });
            this.loadLogin();
        } else if (this.state.showLogin) {
            if (this.#hideLoginTimeout === null) {
                this.#hideLoginTimeout = setTimeout(() => {
                    this.setState({ showLogin: false });
                    this.#hideLoginTimeout = null;
                }, 1000);
            }
        }
    };

    #taskViews = new Map();
    #tasks = new Set();
    #onTasksUpdate = data => {
        for (const id in data) {
            if (!this.#tasks.has(id)) {
                this.#onAddTask(id, data[id]);
            }
        }
        for (const id of this.#tasks.keys()) {
            if (!(id in data)) {
                this.#onRemoveTask(id);
            }
        }
        this.#cleanTasks();
        this.forceUpdate();
    };
    #onAddTask = async (id, path) => {
        this.#tasks.add(id);
        const taskView = await loadTaskView(path);
        if (taskView !== null) {
            this.#taskViews.set(id, [taskView, 0]);
            this.forceUpdate();
        }
    };
    #onRemoveTask = (id) => {
        this.#tasks.delete(id);
        const view = this.#taskViews.get(id);
        if (view) this.#taskViews.set(id, [view[0], Date.now()]);
    };
    #cleanTasks = () => {
        const toBeRemoved = new Set();
        for (const [id, [view, deathTime]] of this.#taskViews.entries()) {
            if (deathTime && Date.now() - deathTime > 500) toBeRemoved.add(id);
        }
        for (const id of toBeRemoved) this.#taskViews.delete(id);
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
        const { loggedIn, showLogin, specialPage, login: Login, app: App, limbo } = this.state;

        let login = null;
        let app = null;
        if (!limbo) {
            if (Login && (showLogin || specialPage)) {
                login = <Login />;
            }
            if (loggedIn && App) {
                app = <App />;
            }
        }

        const tasks = [];
        for (const [id, [view, deathTime]] of this.#taskViews.entries()) {
            tasks.push(
                <TaskView id={id} core={this.core} view={view} isDead={!!deathTime} />
            );
        }

        return (
            <coreContext.Provider value={this.core}>
                <Fragment>
                    <LoadingIndicator loading={!login && !app} />
                    {app}
                    {login}
                    {tasks}
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