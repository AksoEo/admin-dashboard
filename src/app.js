import { h } from 'preact';
import { PureComponent, Suspense } from 'preact/compat';
import PropTypes from 'prop-types';

import { routerContext } from './router';
import locale from './locale';
import { activeRequests, activeRequestsEmitter } from './client';
import './app.less';

import {
    AppBarProvider, AppBarConsumer, AppBarProxy, MenuIcon, Button, CircularProgress,
    LinearProgress,
} from 'yamdl';
import Sidebar from './features/sidebar';
import routes from './features/pages';
import client from './client';
import cache from './cache';

import moment from 'moment';
import 'moment-timezone';
import 'moment/locale/eo';
moment.locale('eo');
moment.tz.setDefault('UTC');

/** Minimum width for a perma-sidebar. */
const PERMA_SIDEBAR_WIDTH = 900;

/** @returns {Object} the current page descriptor. */
function currentPageFromLocation () {
    const pagePath = document.location.pathname;
    const queryString = document.location.search;

    const pathParts = pagePath.split('/').filter(x => x);

    if (!pathParts.length) pathParts.push('');

    // match routes against path, iteratively going deeper
    let items = routes.flatMap(category => category.contents);

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

/** The main app. */
export default class App extends PureComponent {
    static propTypes = {
        onDirectTransition: PropTypes.func.isRequired,
        onLogout: PropTypes.func.isRequired,
    };

    state = {
        sidebarOpen: false,
        permaSidebar: window.innerWidth >= PERMA_SIDEBAR_WIDTH,
        currentPage: currentPageFromLocation(),
        hasActiveRequest: false,
        overflowMenu: null,
        permissions: {
            // dummy defaults
            permissions: [],
            memberFields: null,
            memberFilter: {},
            hasPermission: () => false,
        },
    };

    /** The current page component. */
    currentPage = null;

    onResize = () => this.setState({ permaSidebar: window.innerWidth >= PERMA_SIDEBAR_WIDTH });

    currentPageNode () {
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
            scrollPosition: this.currentPageNode().scrollTop,
        }, '', current);
    }

    /** `routerContext` handler. */
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

    /** `routerContext` handler. */
    onReplace = target => {
        window.history.replaceState(null, '', target);
        this.setState({
            currentPage: currentPageFromLocation(),
        });
    }

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

    onActiveRequestsUpdate = () => {
        this.setState({
            hasActiveRequest: !!Object.keys(activeRequests).length,
        });
    };

    tryGetPerms () {
        client.refreshPerms().then(permissions => {
            this.setState({ permissions: { ...permissions, hasPermission: this.hasPermission } });
        }).catch(err => {
            /* eslint-disable no-console */
            console.error('Failed to get permissions, trying again in a second', err);
            /* eslint-enable no-console */
            this.tryGetPermsTimeout = setTimeout(() => this.tryGetPerms(), 1000);
        });
    }

    hasPermission = permission => client.hasPermSync(permission);

    componentDidMount () {
        this.onResize();
        window.addEventListener('resize', this.onResize);
        window.addEventListener('popstate', this.onPopState);
        this.updatePageTitle();
        activeRequestsEmitter.on('update', this.onActiveRequestsUpdate);
        this.tryGetPerms();
    }

    componentWillUnmount () {
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('popstate', this.onPopState);
        activeRequestsEmitter.removeListener('update', this.onActiveRequestsUpdate);
        clearTimeout(this.tryGetPermsTimeout);
    }

    componentDidUpdate () {
        this.updatePageTitle();
    }

    /**
     * Updates the document title (shown in e.g. the tab bar) to reflect the current page.
     */
    updatePageTitle () {
        document.title = locale.documentTitleTemplate(locale.pages[this.state.currentPage.id]);
    }

    getPageComponent () {
        if (this.state.currentPage.component) {
            return this.state.currentPage.component;
        }

        return class NullPage extends PureComponent {
            render () {
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
            }
        };
    }

    /**
     * Renders the app header bar.
     * @param {boolean} isLoading - if true, will show a progress indicator
     */
    renderAppHeader (isLoading) {
        return (
            <AppBarConsumer
                prependedProps={{
                    menu: !this.state.permaSidebar ? (
                        <Button
                            icon
                            small
                            class="menu-button"
                            aria-label={locale.header.menu}
                            onClick={() => this.setState({
                                sidebarOpen: !this.state.sidebarOpen,
                            })}>
                            <MenuIcon />
                        </Button>
                    ) : null,
                    title: locale.pages[this.state.currentPage.id],
                }}
                id="app-header">
                <LinearProgress
                    class="header-progress"
                    indeterminate={isLoading}
                    hideIfNone />
            </AppBarConsumer>
        );
    }

    render () {
        let className = '';
        if (this.state.permaSidebar) className += ' perma-sidebar';
        if (this.state.animateIn) className += ' animate-init';

        let appHeader = null;
        let appDrawer = null;
        let pageContents = null;

        const isLoading = this.state.hasActiveRequest;

        appHeader = this.renderAppHeader(isLoading);

        appDrawer = (
            <Sidebar
                permanent={this.state.permaSidebar}
                open={this.state.sidebarOpen || this.state.permaSidebar}
                onOpen={() => this.setState({ sidebarOpen: true })}
                onClose={() => this.setState({ sidebarOpen: false })}
                currentPage={this.state.currentPage.id}
                onDirectTransition={this.props.onDirectTransition}
                onDoAnimateIn={() => this.setState({ animateIn: true })}
                onLogout={this.props.onLogout}
                permissions={this.state.permissions} />
        );

        // TODO: remove Todo fallback
        const PageComponent = this.getPageComponent();
        pageContents = (
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
                    permissions={this.state.permissions} />
            </Suspense>
        );

        return (
            <div id="app" className={className}>
                <AppBarProvider>
                    <routerContext.Provider value={{
                        navigate: this.onNavigate,
                        replace: this.onReplace,
                    }}>
                        {appDrawer}
                        <div className="app-contents">
                            {appHeader}
                            <div
                                className="page-container"
                                ref={node => this.pageContainer = node}>
                                <AppBarProxy />
                                {pageContents}
                            </div>
                        </div>
                    </routerContext.Provider>
                </AppBarProvider>
            </div>
        );
    }
}
