import { h, render, Component } from 'preact';
import { Fragment } from 'preact/compat';
import { CircularProgress } from '@cpsdqs/yamdl';
import { LoginAuthStates } from '../protocol';
import isSpecialPage from './features/login/is-special-page';
import { Worker } from './core';
import { coreContext } from './core/connection';
import { routerContext } from './router';
import { insecureContext } from './locale';
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
    clients: lazyPath(() => import(/* webpackChunkName: "clients-tasks" */ './features/pages/administration/clients/tasks')),
    countries: lazyPath(() => import(/* webpackChunkName: "countries-tasks" */ './features/pages/administration/countries/tasks')),
    codeholders: lazyPath(() => import(/* webpackChunkName: "codeholders-tasks" */ './features/pages/codeholders/tasks')),
    adminGroups: lazyPath(() => import(/* webpackChunkName: "admin-groups-tasks" */ './features/pages/administration/groups/tasks')),
    lists: lazyPath(() => import(/* webpackChunkName: "lists-tasks" */ './features/pages/lists/tasks')),
    payments: lazyPath(() => import(/* webpackChunkName: "payments-tasks" */ './features/pages/payments/tasks')),
    votes: lazyPath(() => import(/* webpackChunkName: "votes-tasks" */ './features/pages/votes/tasks')),
    queries: lazyPath(() => import(/* webpackChunkName: "queries-tasks" */ './features/queries')),
};
const loadTaskView = async (taskPath) => {
    if (!taskPath) return null;
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

/// AKSO session manager.
class Session extends Component {
    state = {
        /// the Login component
        login: null,
        /// the App component
        app: null,
        /// whether or not we’re logged in
        loggedIn: false,
        /// whether or not we should show the login page
        /// this exists to allow for animation buffer time between login and when the app displays
        showLogin: false,
        /// if true, the app will play the you-just-logged-in animation
        wasLoggedOut: false,
        /// if true, this is a special page (e.g. password reset) and must show the login screen
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
            this.appPromise =
                import(/* webpackChunkName: "app", webpackPrefetch: true */ './app');
            this.appPromise.then(e => this.setState({ app: e.default }));
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
        this.setState({ loggedIn: data.authState === LoginAuthStates.LOGGED_IN && data.isAdmin });
        if (data.authState && (data.authState !== LoginAuthStates.LOGGED_IN || !data.isAdmin)) {
            clearTimeout(this.#hideLoginTimeout);
            this.setState({ showLogin: true, wasLoggedOut: true });
            this.loadLogin();
        } else if (data.authState && this.state.showLogin) {
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
            this.#taskViews.set(id, {
                path,
                view: taskView,
                died: 0,
            });
            this.forceUpdate();
        }
    };
    #onRemoveTask = (id) => {
        this.#tasks.delete(id);
        const view = this.#taskViews.get(id);
        if (view) this.#taskViews.set(id, {
            ...view,
            died: Date.now(),
        });
    };
    #cleanTasks = () => {
        const toBeRemoved = new Set();
        for (const [id, { died }] of this.#taskViews.entries()) {
            if (died && Date.now() - died > 500) toBeRemoved.add(id);
        }
        for (const id of toBeRemoved) this.#taskViews.delete(id);
    };

    #appRef = null;
    #onRouterNavigationRequest = (...args) => {
        if (this.#appRef) this.#appRef.onRouterNavigationRequest(...args);
    };

    render () {
        const { loggedIn, showLogin, wasLoggedOut, specialPage, login: Login, app: App } = this.state;

        let login = null;
        let app = null;
        if (Login && (showLogin || specialPage)) {
            login = <Login />;
        }

        const tasks = [];
        let renderTasksHere = true;
        for (const [id, { path, view, died }] of this.#taskViews.entries()) {
            tasks.push(
                <TaskView
                    key={id}
                    id={id}
                    path={path}
                    core={this.core}
                    view={view}
                    isDead={!!died} />
            );
        }

        if (loggedIn && App) {
            // also pass tasks because those need some contexts only available in the app
            app = <App animateIn={wasLoggedOut} ref={view => this.#appRef = view} tasks={tasks} />;
            renderTasksHere = false;
        }

        return (
            <coreContext.Provider value={this.core}>
                <routerContext.Provider value={{
                    navigate: this.#onRouterNavigationRequest,
                }}>
                    <Fragment>
                        <LoadingIndicator loading={!login && !app} />
                        {app}
                        {login}
                        {renderTasksHere ? tasks : null}
                    </Fragment>
                </routerContext.Provider>
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

(async () => {
    if (!('PointerEvent' in window)) {
        await import('@wessberg/pointer-events');
    }

    const sessionRoot = document.createElement('div');
    sessionRoot.id = 'session-root';
    sessionRoot.className = 'root-container';
    document.body.appendChild(sessionRoot);
    if (window.isSecureContext) {
        render(<Session />, sessionRoot);
    } else {
        console.error('insecure context!'); // eslint-disable-line no-console
        sessionRoot.style.padding = '24px';
        sessionRoot.style.textAlign = 'center';
        sessionRoot.textContent = insecureContext;
    }
})();

// don’t show “add to homescreen” prompt
window.addEventListener('beforeinstallprompt', e => e.preventDefault());
