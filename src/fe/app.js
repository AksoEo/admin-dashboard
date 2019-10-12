import { h, Component } from 'preact';
import { Suspense } from 'preact/compat';
import { AppBarProvider, AppBarConsumer, CircularProgress } from '@cpsdqs/yamdl';
import Sidebar from './features/sidebar';
import { routerContext } from './router';
import pages from './features/pages';
import './app.less';

// set up moment
import moment from 'moment';
import 'moment-timezone';
import 'moment/locale/eo';
moment.locale('eo');
moment.tz.setDefault('UTC');

const PERMA_SIDEBAR_WIDTH = 900;

export default class App extends Component {
    state = {
        permaSidebar: false,
        sidebarOpen: false,
        currentPage: currentPageFromLocation(),
    };

    getCurrentPageNode () {
        return this.pageContainer ? this.pageContainer.children[0] : {};
    }

    saveCurrentScrollPosition () {
        // FIXME: this is hacky
        // TODO: maybe also save periodically after a scroll interaction?
        // when popstate fires there’s no opportunity to save state first before navigating away
        const current = document.location.pathname
            + document.location.search
            + document.location.hash;
        window.history.replaceState({
            scrollPosition: this.getCurrentPageNode().scrollTop,
        }, '', current);
    }

    onResize = () => this.setState({ permaSidebar: window.innerWidth >= PERMA_SIDEBAR_WIDTH });

    /// `routerContext` handler.
    onNavigate = target => {
        const current = document.location.pathname
            + document.location.search
            + document.location.hash;

        if (target === current) return; // nothing to do

        this.saveCurrentScrollPosition();

        window.history.pushState(null, '', target);
        this.setState({
            currentPage: currentPageFromLocation(),
            sidebarOpen: false,
        });
    };

    /// `routerContext` handler.
    onReplace = target => {
        window.history.replaceState(null, '', target);
        this.setState({
            currentPage: currentPageFromLocation(),
        });
    };

    onPopState = e => {
        const currentPage = currentPageFromLocation();

        this.setState({
            currentPage,
            sidebarOpen: false,
        }, () => {
            // restore scroll position if it was saved
            if (e.state && e.state.scrollPosition) {
                this.currentPageNode().scrollTop = e.state.scrollPosition;
            }
        });
    };

    componentDidMount () {
        this.onResize();
        window.addEventListener('resize', this.onResize);
        window.addEventListener('popstate', this.onPopState);
    }

    componentWillUnmount () {
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('popstate', this.onPopState);
    }

    getPageComponent () {
        if (this.state.currentPage.component) {
            return this.state.currentPage.component;
        }

        // TODO: remove null fallback
        return function NullPage () {
            return (
                <div style={{
                    fontSize: '1.5em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                }}>
                    ...
                </div>
            );
        };
    }

    render () {
        let className = 'akso-app';
        if (this.props.animateIn) className += ' animate-in';

        // TODO: remove this
        const compatPermissionsDummy = {
            memberFilter: {},
            hasPermission: () => true,
        };

        const PageComponent = this.getPageComponent();
        const pageContents = (
            <Suspense fallback={
                <div className="app-page loading">
                    <CircularProgress class="page-loading-indicator" indeterminate />
                </div>
            }>
                <PageComponent
                    path={this.state.currentPage.path}
                    match={this.state.currentPage.match}
                    query={this.state.currentPage.query}
                    ref={page => this.currentPage = page}
                    permissions={compatPermissionsDummy} />
            </Suspense>
        );

        return (
            <AppBarProvider>
                <routerContext.Provider value={{
                    navigate: this.onNavigate,
                    replace: this.onReplace,
                }}>
                    <div class={className}>
                        <Sidebar
                            permanent={this.state.permaSidebar}
                            open={this.state.sidebarOpen || this.state.permaSidebar}
                            onOpen={() => this.setState({ sidebarOpen: true })}
                            onClose={() => this.setState({ sidebarOpen: false })}
                            currentPage={this.state.currentPage.id}
                            onDirectTransition={this.props.onDirectTransition}
                            onDoAnimateIn={() => this.setState({ animateIn: true })} />
                        <div class="app-contents">
                            <AppBarConsumer class="app-header" />
                            <div class="page-container">
                                {pageContents}
                            </div>
                        </div>
                    </div>
                </routerContext.Provider>
            </AppBarProvider>
        );
    }
}

/// Returns an object with the current page descriptor.
function currentPageFromLocation () {
    const pagePath = document.location.pathname;
    const queryString = document.location.search;

    const pathParts = pagePath.split('/').filter(x => x);

    if (!pathParts.length) pathParts.push('');

    // match routes against path, iteratively going deeper
    let items = pages.flatMap(category => category.contents);

    // default null page
    const page = {
        id: null,
        component: null,
        path: pagePath,
        query: queryString,
        match: null,
    };

    for (const part of pathParts) {
        for (const item of items) {
            let urlMatch = false;
            if (item.url instanceof RegExp) urlMatch = part.match(item.url);
            else urlMatch = item.url === part;

            if (urlMatch) {
                items = item.routes || [];
                if (item.id) page.id = item.id; // inherit IDs
                page.component = item.component;
                page.match = urlMatch;
                break;
            }
        }
    }

    return page;
}
