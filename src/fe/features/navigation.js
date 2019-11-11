import { h } from 'preact';
import { PureComponent, Suspense } from 'preact/compat';
import { Button, CircularProgress } from '@cpsdqs/yamdl';
import EventProxy from '../components/event-proxy';
import { CardStackProvider, CardStackRenderer } from '../components/card-stack';
import pages from './pages';
import { app as locale } from '../locale';

const TRUNCATED_QUERY_NAME = '?T';

function NotFoundPage () {
    // TODO
    return 'not found (todo: fancy 404 page)';
}

function TODOPage () {
    return <center>ankoraŭ ne skribis ĉi tiun paĝon</center>;
}

// Parses a URL and state into a stack and task list. State is nullable.
function parseHistoryState (url, state) {
    // TODO: handle state

    url = new URL(url);

    if (url.search === TRUNCATED_QUERY_NAME) {
        if (state && state.href) url = new URL(state.href);
        else {
            // oh no we don’t have the full url
            // just discard state i guess
            url = new URL(url.pathname);
        }
    }

    // individual path fragments (also removing empty fragments like in ///////)
    const pathParts = url.pathname.split('/').filter(x => x);
    if (!pathParts.length) pathParts.push(''); // need at least one item to match top level page

    // page stack in which multiple subpaths can appear simultaneously
    // stack items have a source property which will be ==='d to identify if we should keep the
    // current state for pages where we don’t have the state encoded in the URL
    // stack items also have a state object into which state paths will be written
    const stack = [];
    // core tasks we should create
    const tasks = {};
    // current page object from the router
    let cursor;

    // match the first path part separately because it uses a different format
    const firstPathPart = pathParts.shift();
    for (const category of pages) {
        for (const page of category.contents) {
            if (page.path === firstPathPart) {
                cursor = page;
                stack.push({
                    source: page,
                    component: page.component || TODOPage,
                    state: {},
                });
            }
        }
    }

    if (!cursor) {
        // oh no there is no such page
        stack.push(cursor = {
            source: null,
            component: NotFoundPage,
            state: {},
        });
    }

    // traverse the rest of the path
    for (const part of pathParts) {
        let match;
        for (const subpage of (cursor.paths || [])) {
            if (subpage.match) match = part.match(subpage.match);
            else match = part === subpage.path ? [part] : null; // fake regex match

            if (match) {
                cursor = subpage;

                if (subpage.type === 'bottom') {
                    while (stack.length) stack.pop();
                    stack.push({
                        source: subpage,
                        component: subpage.component,
                        state: {},
                    });
                } else if (subpage.type === 'stack') {
                    stack.push({
                        source: subpage,
                        component: subpage.component,
                        state: {},
                    });
                } else if (subpage.type === 'state') {
                    Object.assign(stack[stack.length - 1].state, subpage.state);
                } else if (subpage.type === 'task') {
                    // TODO: maybe use a map fn for options instead?
                    tasks[subpage.task] = subpage.options || {};
                } else {
                    throw new Error(`unknown subpage type ${subpage.type}`);
                }

                break;
            }
        }

        if (!match) {
            // oh no there is no such page
            while (stack.length) stack.pop();
            stack.push(cursor = {
                source: null,
                component: NotFoundPage,
                state: {},
            });
        }
    }

    return {
        currentLocation: url.pathname + url.search + url.hash,
        stack,
        tasks,
        pathname: url.pathname,
        query: (url.search || '').substr(1),
    };
}

const SAVE_STATE_INTERVAL = 1000; // ms

/// Navigation controller sort of thing.
///
/// # Props
/// - onNavigate: emitted when the URL changes
export default class Navigation extends PureComponent {
    state = {
        // array of objects like
        // { data: { ... }, component: ..., source, state: { ... } }
        stack: [],
        // map from task names to Task objects
        tasks: {},
        // current url pathname
        pathname: '',
        // current url query (does not include the question mark)
        query: '',
    };

    currentLocation = null;

    /// Loads a URL and a history state object.
    loadURL (url, state) {
        const {
            currentLocation,
            stack,
            tasks,
            pathname,
            query,
        } = parseHistoryState(url, state);

        if (currentLocation !== this.currentLocation) {
            this.currentLocation = currentLocation;
            this.props.onNavigate && this.props.onNavigate(this.currentLocation);
        }

        this.setState({ stack, tasks, pathname, query });
    }

    onPopState = e => this.loadURL(document.location.href, e.state);

    /// Navigates with an href.
    navigate (href) {
        this.saveState();

        // instead of trying to replicate browser behavior, just push an empty state and read the
        // result, then save state again
        window.history.pushState(null, '', href);
        this.loadURL(document.location.href, window.history.state);
        this.saveState();
    }

    // - state saving
    #saveStateTimeout;

    scheduleSaveState () {
        clearTimeout(this.#saveStateTimeout);
        this.#saveStateTimeout = setTimeout(this.saveState, SAVE_STATE_INTERVAL);
    }

    saveState = () => {
        window.history.replaceState({
            stack: this.state.stack.map(item => item.data)
        }, '', this.currentLocation);

        this.scheduleSaveState();
    };

    componentDidMount () {
        this.loadURL(document.location.href, window.history.state);
        this.scheduleSaveState();
    }

    componentWillUnmount () {
        clearTimeout(this.#saveStateTimeout);
    }

    componentDidCatch (error, errorInfo) {
        // is it just me or does this method not actually work at all
        console.error('[Navigation] render error', error, errorInfo); // eslint-disable-line no-console
    }

    static getDerivedStateFromError (error) {
        return { error };
    }

    render () {
        if (this.state.error) {
            // instead i’m just going to log the error here
            if (this.state.error !== this._prevError) {
                console.error('[Navigation] render error', this.state.error); // eslint-disable-line no-console
                this._prevError = this.state.error;
            }
            return (
                <div class="navigation-view error">
                    {locale.genericError}
                    <br />
                    <br />
                    <Button onClick={() => window.location.reload()}>
                        {locale.genericErrorReload}
                    </Button>
                </div>
            );
        }

        let bottomPage = null;

        if (this.state.stack[0]) {
            const PageComponent = this.state.stack[0].component;
            bottomPage = (
                <Suspense fallback={
                    <div class="page-loading-indicator">
                        <CircularProgress indeterminate class="page-loading-indicator-inner" />
                    </div>
                }>
                    <PageComponent
                        query={this.state.query}
                        onQueryChange={query => {
                            this.navigate(this.state.pathname + (query ? '?' + query : ''));
                        }} />
                </Suspense>
            );
        }

        const stackItems = [];
        for (let i = 1; i < this.state.stack.length; i++) {
            // TODO
        }

        return (
            <div class="navigation-view">
                <EventProxy
                    dom target={window}
                    onpopstate={this.onPopState} />
                <CardStackProvider>
                    <div class="bottom-page-container">
                        {bottomPage}
                    </div>
                    {stackItems}
                    <CardStackRenderer />
                </CardStackProvider>
            </div>
        );
    }
}
