import { h } from 'preact';
import { PureComponent, Suspense } from 'preact/compat';
import { Button, CircularProgress, AppBarProxy, MenuIcon } from '@cpsdqs/yamdl';
import EventProxy from '../components/event-proxy';
import { CardStackProvider, CardStackRenderer, CardStackItem } from '../components/card-stack';
import pages from './pages';
import { MetaProvider } from './meta';
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
function parseHistoryState (url, state, mkPopStack) {
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
    // the subset of stack items that are views
    const viewStack = [];
    // core tasks we should create
    const tasks = {};
    // current page object from the router
    let cursor;

    // id for the sidebar
    let currentPageId;

    // match the first path part separately because it uses a different format
    const firstPathPart = pathParts.shift();
    for (const category of pages) {
        for (const page of category.contents) {
            if (page.path === firstPathPart) {
                cursor = page;
                const item = {
                    path: firstPathPart,
                    source: page,
                    component: page.component || TODOPage,
                    query: '',
                    state: {},
                };
                currentPageId = page.id;
                stack.push(item);
                viewStack.push(item);
            }
        }
    }

    if (!cursor) {
        // oh no there is no such page
        const item = cursor = {
            path: firstPathPart,
            source: null,
            component: NotFoundPage,
            state: {},
        };
        stack.push(item);
        viewStack.push(item);
        currentPageId = null;
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
                    const item = {
                        path: part,
                        source: subpage,
                        component: subpage.component,
                        pathMatch: match,
                        query: '',
                        state: {},
                    };
                    stack.push(item);
                    viewStack.push(item);
                } else if (subpage.type === 'stack') {
                    const item = {
                        path: part,
                        source: subpage,
                        component: subpage.component,
                        pathMatch: match,
                        query: '',
                        state: {},
                    };
                    stack.push(item);
                    viewStack.push(item);
                } else if (subpage.type === 'state') {
                    const stateKey = subpage.state;
                    viewStack[viewStack.length - 1].state[stateKey] = {
                        pop: mkPopStack(stack.length),
                    };
                    stack.push({
                        path: part,
                        source: subpage,
                    });
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
            viewStack.splice(0);
            const item = cursor = {
                path: notFoundParts,
                source: null,
                component: NotFoundPage,
                state: {},
            };
            stack.push(item);
            viewStack.push(item);
        }
    }

    // load saved state if available
    for (let i = 0; i < stackState.length; i++) {
        if (viewStack[i] && stackState[i]) {
            viewStack[i].data = stackState[i].data;
            viewStack[i].query = stackState[i].query;
        }
    }

    const urlQuery = (url.search || '').substr(1); // no question mark
    // top stack item gets the query from the URL
    if (viewStack.length) viewStack[viewStack.length - 1].query = urlQuery;

    const currentLocation = url.pathname + url.search + url.hash;

    return {
        currentLocation,
        currentPageId,
        urlLocation: currentLocation.length > MAX_LOCATION_LEN
            ? url.pathname + TRUNCATED_QUERY_NAME
            : currentLocation,
        stack,
        viewStack,
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
/// - permaSidebar: bool
/// - onOpenMenu: fires when the menu icon is pressed
/// - onCurrentPageChange: fired when the current page id changes
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
        // - meta: optional object { title, actions } for the app bar
        // - pathMatch: regex match of the path part
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
            currentPageId,
            stack,
            viewStack,
            tasks,
            pathname,
            query,
        } = parseHistoryState(url, state, index => replace => this.popStackAt(index, replace));

        this.props.onCurrentPageChange(currentPageId);

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
    navigate = (href, replace) => {
        // first, save the current state so it’s up to date when we go back
        this.saveState();
        const previousURLLocation = this.urlLocation;
        // resolve url
        // note that currentFullURL is not equal to document.location.href since the
        // document.location may be truncated
        const currentFullURL = document.location.protocol + '//' + document.location.host
            + this.currentLocation;
        const target = new URL(href, currentFullURL);
        // load & parse url. also, importantly, compute urlLocation
        this.loadURL(target.href, null);
        // then actually push it to history with the newly computed urlLocation
        if (previousURLLocation === this.urlLocation) replace = true;
        if (replace) window.history.replaceState(null, '', this.urlLocation);
        else window.history.pushState(null, '', this.urlLocation);
        // and finally, save state
        this.saveState();
    };

    /// Called when a page changes its query.
    onQueryChange (stackIndex, newQuery) {
        const stack = this.state.stack.slice();
        if (stack[stackIndex].query !== newQuery) {
            stack[stackIndex].query = newQuery;

            // check if this is the top view stack item
            let isTopView;
            for (let i = this.state.stack.length - 1; i >= 0; i--) {
                if (!stack[i].component) continue;
                isTopView = i === stackIndex;
                break;
            }

            if (isTopView) {
                // save to URL
                this.navigate(this.state.pathname + (newQuery ? '?' + newQuery : ''), true);
            } else {
                // just save to state
                this.setState({ stack }, this.saveState);
            }
        }
    }

    /// Removes all stack items at and above the given index.
    popStackAt (stackIndex, replace) {
        const stack = this.state.stack.slice();
        stack.splice(stackIndex);
        const pathname = '/' + stack.map(x => x.path).join('/');
        let query = '';
        // find topmost view item and use its query
        for (let i = stack.length - 1; i >= 0; i--) {
            if (stack[i].component) {
                query = stack[i].query;
                break;
            }
        }
        this.navigate(pathname + (query ? '?' + query : ''), replace);
    }

    // - state saving
    #saveStateTimeout;

    scheduleSaveState () {
        clearTimeout(this.#saveStateTimeout);
        this.#saveStateTimeout = setTimeout(this.saveState, SAVE_STATE_INTERVAL);
    }

    saveState = () => {
        if (!this.state.error) {
            // only save while we don’t have an error
            window.history.replaceState({
                stack: this.state.stack
                    // only save for views
                    .filter(item => item.component)
                    .map(item => ({ data: item.data, query: item.query })),
                href: this.currentLocation,
            }, '', this.currentLocation);
        }

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

        let currentTitle = locale.title;
        let currentActions = [];

        for (let i = 0; i < this.state.stack.length; i++) {
            const stackItem = this.state.stack[i];
            if (!stackItem.component) continue; // not a view component

            if (stackItem.meta) {
                currentTitle = stackItem.meta.title;
                currentActions = stackItem.meta.actions;
            }

            const isBottom = i === 0;
            const isTop = i === this.state.stack.length - 1;
            const PageComponent = stackItem.component;
            const itemContents = (
                <MetaProvider onUpdate={({ title, actions }) => {
                    const stack = this.state.stack.slice();
                    stack[i].meta = { title, actions };
                    this.setState({ stack });
                }}>
                    <Suspense fallback={
                        <div class="page-loading-indicator">
                            <CircularProgress indeterminate class="page-loading-indicator-inner" />
                        </div>
                    }>
                        <PageComponent
                            query={stackItem.query}
                            onQueryChange={query => this.onQueryChange(i, query)}
                            match={stackItem.pathMatch}
                            onNavigate={this.navigate}
                            {...stackItem.state} />
                    </Suspense>
                </MetaProvider>
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

        let appBarMenuType = null;
        if (!stackItems.length) {
            // bottom page; show menu button if applicable
            appBarMenuType = this.props.permaSidebar ? null : 'menu';
        } else {
            appBarMenuType = 'back';
        }

        const onAppBarMenuClick = () => {
            if (stackItems.length) {
                // note that we’re popping the last item; but since stackItems is one shorter than
                // the stack length; this *is* the last stack index
                this.popStackAt(stackItems.length);
            } else this.props.onOpenMenu();
        };

        const appBarMenu = appBarMenuType
            ? (
                <Button icon small onClick={onAppBarMenuClick}>
                    <MenuIcon type={appBarMenuType} />
                </Button>
            )
            : null;

        return (
            <div class="navigation-view">
                <EventProxy
                    dom target={window}
                    onpopstate={this.onPopState} />
                <AppBarProxy
                    priority={1}
                    menu={appBarMenu}
                    title={currentTitle}
                    actions={currentActions} />
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
