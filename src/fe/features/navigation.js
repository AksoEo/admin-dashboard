import { h } from 'preact';
import { PureComponent, Suspense } from 'preact/compat';
import { Button, CircularProgress } from '@cpsdqs/yamdl';
import EventProxy from '../components/event-proxy';
import { CardStackProvider, CardStackRenderer, CardStackItem } from '../components/card-stack';
import pages from './pages';
import { app as locale } from '../locale';

const TRUNCATED_QUERY_NAME = '?T';
const MAX_LOCATION_LEN = 1887; // you think im joking but this is actually a reasonable limit

function NotFoundPage () {
    // TODO
    return 'not found (todo: fancy 404 page)';
}

function TODOPage () {
    return <center>ankoraŭ ne skribis ĉi tiun paĝon</center>;
}

// Parses a URL and state into a stack and task list. State is nullable.
function parseHistoryState (url, state) {
    const stackState = state && Array.isArray(state.stack) ? state.stack : [];

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
                    path: firstPathPart,
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
            path: firstPathPart,
            source: null,
            component: NotFoundPage,
            state: {},
        });
    }

    // traverse the rest of the path
    let notFoundParts = '';
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
                        path: part,
                        source: subpage,
                        component: subpage.component,
                        state: {},
                    });
                } else if (subpage.type === 'stack') {
                    stack.push({
                        path: part,
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
        notFoundParts += (notFoundParts ? '/' : '') + part;

        if (!match) {
            // oh no there is no such page
            stack.splice(0);
            stack.push(cursor = {
                path: notFoundParts,
                source: null,
                component: NotFoundPage,
                state: {},
            });
        }
    }

    // load saved state if available
    for (let i = 0; i < stackState.length; i++) {
        if (stack[i] && stackState[i]) {
            stack[i].data = stackState[i].data;
            stack[i].query = stackState[i].query;
        }
    }

    const urlQuery = (url.search || '').substr(1); // no question mark
    // top stack item gets the query from the URL
    if (stack.length) stack[stack.length - 1].query = urlQuery;

    const currentLocation = url.pathname + url.search + url.hash;

    return {
        currentLocation,
        urlLocation: currentLocation.length > MAX_LOCATION_LEN
            ? url.pathname + TRUNCATED_QUERY_NAME
            : currentLocation,
        stack,
        tasks,
        pathname: url.pathname,
        query: urlQuery,
    };
}

const SAVE_STATE_INTERVAL = 1000; // ms

/// Navigation controller sort of thing.
///
/// # Props
/// - onNavigate: emitted when the URL changes
export default class Navigation extends PureComponent {
    state = {
        // array of objects with properties
        //
        // - path: the path components of this stack item (may contain /)
        // - data: arbitrary data managed by the page
        // - component: component ref
        // - source: source ref
        // - state: additional state given by the url
        // - query: current query string
        stack: [],
        // map from task names to Task objects
        tasks: {},
        // current url pathname
        pathname: '',
        // current url query (does not include the question mark)
        query: '',
    };

    /// Full current location.
    currentLocation = null;
    /// Url current location; may be truncated.
    urlLocation = null;

    /// Loads a URL and a history state object.
    loadURL (url, state) {
        const {
            urlLocation,
            currentLocation,
            stack,
            tasks,
            pathname,
            query,
        } = parseHistoryState(url, state);

        if (currentLocation !== this.currentLocation) {
            this.currentLocation = currentLocation;
            this.urlLocation = urlLocation;
            this.props.onNavigate && this.props.onNavigate(this.currentLocation);
        }

        // compute the new stack
        const newStack = this.state.stack.slice(0, stack.length);
        for (let i = 0; i < stack.length; i++) {
            // check if the stack item is still the same thing
            if (newStack[i] && stack[i].source === newStack[i].source) {
                if (stack[i].data) {
                    // if data was decoded; load it
                    // (otherwise just keep current state)
                    newStack[i].data = stack[i].data;
                    newStack[i].query = stack[i].query;
                }
                newStack[i].state = stack[i].state;
            } else newStack[i] = stack[i];
        }

        this.setState({ stack: newStack, tasks, pathname, query });
    }

    onPopState = e => this.loadURL(document.location.href, e.state);

    /// Navigates with an href.
    navigate (href) {
        // first, save the current state so it’s up to date when we go back
        this.saveState();
        // resolve url
        // note that currentFullURL is not equal to document.location.href since the
        // document.location may be truncated
        const currentFullURL = document.location.protocol + '//' + document.location.host
            + this.currentLocation;
        const target = new URL(href, currentFullURL);
        // load & parse url. also, importantly, compute urlLocation
        this.loadURL(target.href, null);
        // then actually push it to history with the newly computed urlLocation
        window.history.pushState(null, '', this.urlLocation);
        // and finally, save state
        this.saveState();
    }

    /// Called when a page changes its query.
    onQueryChange (stackIndex, newQuery) {
        const stack = this.state.stack.slice();
        stack[stackIndex].query = newQuery;
        if (stackIndex === this.state.stack.length - 1) {
            // save to URL
            this.navigate(this.state.pathname + (newQuery ? '?' + newQuery : ''));
        } else {
            // just save to state
            this.setState({ stack }, this.saveState);
        }
    }

    /// Removes all stack items at and above the given index.
    popStackAt (stackIndex) {
        const stack = this.state.stack.slice();
        stack.splice(stackIndex);
        const pathname = '/' + stack.map(x => x.path).join('/');
        const query = stack.length ? stack[stack.length - 1].query : '';
        this.navigate(pathname + (query ? '?' + query : ''));
    }

    // - state saving
    #saveStateTimeout;

    scheduleSaveState () {
        clearTimeout(this.#saveStateTimeout);
        this.#saveStateTimeout = setTimeout(this.saveState, SAVE_STATE_INTERVAL);
    }

    saveState = () => {
        window.history.replaceState({
            stack: this.state.stack.map(item => ({ data: item.data, query: item.query })),
            href: this.currentLocation,
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

        let bottomPage;
        const stackItems = [];

        for (let i = 0; i < this.state.stack.length; i++) {
            const stackItem = this.state.stack[i];
            const isBottom = i === 0;
            const isTop = i === this.state.stack.length - 1;
            const PageComponent = stackItem.component;
            const itemContents = (
                <Suspense fallback={
                    <div class="page-loading-indicator">
                        <CircularProgress indeterminate class="page-loading-indicator-inner" />
                    </div>
                }>
                    <PageComponent
                        query={stackItem.query}
                        onQueryChange={query => this.onQueryChange(i, query)} />
                </Suspense>
            );

            if (isBottom) {
                bottomPage = itemContents;
            } else {
                const itemIndex = i;
                stackItems.push(
                    <CardStackItem open onClose={() => this.popStackAt(i)}>
                        {itemContents}
                    </CardStackItem>
                );
            }
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
