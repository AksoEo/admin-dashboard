import { h, render, Component } from 'preact';
import { Fragment } from 'preact/compat';
import { CircularProgress } from 'yamdl';
import { LoginAuthStates } from '../protocol';
import isSpecialPage from './features/login/is-special-page';
import { Worker } from './core';
import { coreContext } from './core/connection';
import { routerContext } from './router';
import { insecureContext, getAuthSureIsTakingAWhile, getAuthTryCounter } from './locale';
import config from '../config.val';
import TaskView from './task-view';
import './style';

import 'preact-debug-if-dev';
import './chrome-focus';

// --- TASK VIEW REGISTRY ---
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
    openExternalLink: lazyPath(genericTaskViews, res => res.openExternalLink),
    login: lazyPath(() => import(/* webpackChunkName: "login-tasks" */ './features/login/tasks')),
    clients: lazyPath(() => import(/* webpackChunkName: "clients-tasks" */ './features/pages/administration/clients/tasks')),
    congresses: lazyPath(() => import(/* webpackChunkName: "congresses-tasks" */ './features/pages/congresses/tasks')),
    countries: lazyPath(() => import(/* webpackChunkName: "countries-tasks" */ './features/pages/administration/countries/tasks')),
    countryLists: lazyPath(() => import(/* webpackChunkName: "country-lists-tasks" */ './features/pages/administration/country-lists/tasks')),
    orgLists: lazyPath(() => import(/* webpackChunkName: "org-lists-tasks" */ './features/pages/administration/org-lists/tasks')),
    codeholders: lazyPath(() => import(/* webpackChunkName: "codeholders-tasks" */ './features/pages/codeholders/tasks')),
    delegations: lazyPath(() => import(/* webpackChunkName: "delegations-tasks" */ './features/pages/delegations/tasks')),
    adminGroups: lazyPath(() => import(/* webpackChunkName: "admin-groups-tasks" */ './features/pages/administration/groups/tasks')),
    lists: lazyPath(() => import(/* webpackChunkName: "lists-tasks" */ './features/pages/lists/tasks')),
    intermediaries: lazyPath(() => import(/* webpackChunkName: "intermediaries-tasks" */ './features/pages/intermediaries/intermediaries/tasks')),
    memberships: lazyPath(() => import(/* webpackChunkName: "memberships-tasks" */ './features/pages/memberships/tasks')),
    magazines: lazyPath(() => import(/* webpackChunkName: "magazines-tasks" */ './features/pages/magazines/tasks')),
    newsletters: lazyPath(() => import(/* webpackChunkName: "newsletters-tasks" */ './features/pages/newsletters/tasks')),
    notifTemplates: lazyPath(() => import(/* webpackChunkName: "notif-templates-tasks" */ './features/pages/notif-templates/tasks')),
    roles: lazyPath(() => import(/* webpackChunkName: "roles-tasks" */ './features/pages/roles/tasks')),
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
        this.createCore();

        if (isSpecialPage()) {
            this.setState({ specialPage: true });
        }

        this.loadApp();
    }

    createCore () {
        if (this.loginView) this.loginView.drop();
        if (this.tasksView) this.tasksView.drop();
        if (this.core) this.core.drop();

        this.core = new Worker();
        this.loginView = this.core.createDataView('login');
        this.loginView.on('update', this.#onLoginUpdate);

        this.tasksView = this.core.createDataView('#tasks');
        this.tasksView.on('update', this.#onTasksUpdate);
    }

    #hideLoginTimeout = null;
    #firstSession = true;
    #onLoginUpdate = data => {
        if (data.completed) {
            // session completed; re-create core
            this.createCore();
            this.setState({ showLogin: true });
            return;
        }

        if (data.getAuthTries) {
            this.setState({ getAuthTries: data.getAuthTries });
        }

        this.setState({ loggedIn: data.authState === LoginAuthStates.LOGGED_IN && data.isAdmin });
        if (data.authState && (data.authState !== LoginAuthStates.LOGGED_IN || !data.isAdmin)) {
            clearTimeout(this.#hideLoginTimeout);
            this.setState({ wasLoggedOut: true });
            if (this.#firstSession) {
                this.setState({ showLogin: true });
                this.#firstSession = false;
            }
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
                        {!login && !app && <GetAuthSureIsTakingAWhile tries={this.state.getAuthTries} />}
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

class GetAuthSureIsTakingAWhile extends Component {
    componentDidMount () {
        this.updateInterval = setInterval(this.update, 50);
    }
    componentWillUnmount () {
        clearInterval(this.updateInterval);
    }
    update = () => this.forceUpdate();
    render ({ tries }) {
        if (!tries || tries[0] < 2) return;
        const [tryCount, nextTry] = tries;

        const contents = getAuthSureIsTakingAWhile.split(/[|]/g).map((x, i) =>
            i % 2 === 0 ? x : <a href={x} target="_blank" rel="noreferrer">{x}</a>);

        return (
            <Fragment>
                <div id="get-auth-sure-is-taking-a-while">
                    {contents}
                </div>
                <div id="get-auth-sitaw-backend-url">
                    <span class="inner-prog-box">
                        {(Date.now() < nextTry) && (
                            <span class="next-try-ind">{Math.ceil((nextTry - Date.now()) / 1000)}s</span>
                        )}
                        <CircularProgress
                            class="inner-progress"
                            small
                            indeterminate={(Date.now() + 300 > nextTry) || (Date.now() > nextTry)} />
                    </span>
                    <a
                        href={config.base}
                        target="_blank"
                        rel="noreferrer">{config.base}</a>
                    <span class="try-counter">{getAuthTryCounter(tryCount)}</span>
                </div>
            </Fragment>
        );
    }
}

if (navigator.standalone) {
    // iOS standalone mode
    document.body.classList.add('is-ios-standalone');
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
