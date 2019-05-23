import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { routerContext } from './router';
import locale from './locale';
import { activeRequests, activeRequestsEmitter } from './client';
import './app.less';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import MenuIcon from '@material-ui/icons/Menu';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Sidebar from './features/sidebar';
import routes from './pages';

const theme = createMuiTheme({
    palette: {
        primary: { main: '#31a64f' },
        secondary: { main: '#31a64f' },
    },
    typography: {
        useNextVariants: true,
    },
});

/** Minimum width for a perma-sidebar. */
const PERMA_SIDEBAR_WIDTH = 900;

/** @returns {Object} the current page descriptor. */
function currentPageFromLocation () {
    const pagePath = document.location.pathname;
    const queryString = document.location.search;

    const pathParts = pagePath.split('/').filter(x => x);

    if (!pathParts.length) pathParts.push('');

    let items = routes.flatMap(category => category.contents);
    const page = { id: null, component: null, query: queryString, match: null };

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
export default class App extends React.PureComponent {
    static propTypes = {
        shouldPlayLoginAnimation: PropTypes.bool.isRequired,
        onLogout: PropTypes.func.isRequired,
    };

    state = {
        sidebarOpen: false,
        permaSidebar: window.innerWidth >= PERMA_SIDEBAR_WIDTH,
        currentPage: currentPageFromLocation(),
        showBackButton: false,
        hasActiveRequest: false,
    };

    /** The current page component. */
    currentPage = null;

    /** If true, will play the logged-in animation. */
    shouldPlayLoginAnimation = this.props.shouldPlayLoginAnimation;

    onResize = () => {
        this.setState({ permaSidebar: window.innerWidth >= PERMA_SIDEBAR_WIDTH });
    }

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

    onPopState = (e) => {
        const currentPage = currentPageFromLocation();
        this.setState({
            currentPage,
            sidebarOpen: false,
            showBackButton: currentPage.component !== this.state.currentPage.component
                ? false // reset back button visibility if page changes
                : this.state.showBackButton,
        }, () => {
            // restore scroll position if it was saved
            if (e.state && e.state.scrollPosition) {
                this.currentPageNode().scrollTop = e.state.scrollPosition;
            }
        });
    };

    setBackButtonVisible = visible => {
        this.setState({ showBackButton: visible });
    };

    goBack = () => {
        window.history.back();
    };

    onActiveRequestsUpdate = () => {
        this.setState({
            hasActiveRequest: !!Object.keys(activeRequests).length,
        });
    };

    componentDidMount () {
        this.onResize();
        window.addEventListener('resize', this.onResize);
        window.addEventListener('popstate', this.onPopState);
        this.updatePageTitle();
        activeRequestsEmitter.on('update', this.onActiveRequestsUpdate);
    }

    componentWillUnmount () {
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('popstate', this.onPopState);
        activeRequestsEmitter.removeListener('update', this.onActiveRequestsUpdate);
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

        return class NullPage extends React.PureComponent {
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
            <AppBar position="sticky" id="app-header">
                <Toolbar>
                    {this.state.permaSidebar ? (
                        <div className="header-logo">
                            <img
                                className="logo"
                                src="/assets/logo.svg"
                                draggable={0}
                                aria-hidden="true"
                                role="presentation" />
                            <img
                                className="logo-label"
                                src="/assets/logo-label.svg"
                                draggable={0}
                                aria-label="AKSO"
                                alt="AKSO" />
                        </div>
                    ) : this.state.showBackButton ? null : (
                        <IconButton
                            className="menu-button"
                            color="inherit"
                            aria-label={locale.header.menu}
                            onClick={() => this.setState({
                                sidebarOpen: !this.state.sidebarOpen,
                            })}>
                            <MenuIcon />
                        </IconButton>
                    )}
                    {this.state.showBackButton ? (
                        <IconButton
                            className="back-button"
                            color="inherit"
                            aria-label={locale.header.back}
                            onClick={this.goBack}>
                            <ArrowBackIcon />
                        </IconButton>
                    ) : null}
                    <Typography
                        className="header-title"
                        color="inherit"
                        variant="h6">
                        {locale.pages[this.state.currentPage.id]}
                    </Typography>
                    <div style={{ flexGrow: 1 }} />
                    <IconButton aria-label={locale.header.overflow} color="inherit">
                        <MoreVertIcon />
                    </IconButton>
                </Toolbar>
                {isLoading ? (
                    <LinearProgress className="header-progress" />
                ) : null}
            </AppBar>
        );
    }

    render () {
        let className = '';
        if (this.state.permaSidebar) className += ' perma-sidebar';
        if (this.shouldPlayLoginAnimation) className += ' animate-init';

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
                animateIn={this.shouldPlayLoginAnimation}
                currentPage={this.state.currentPage.id}
                onLogout={this.props.onLogout} />
        );

        // TODO: remove Todo fallback
        const PageComponent = this.getPageComponent();
        pageContents = (
            <Suspense fallback={
                <div className="app-page loading">
                    <CircularProgress className="page-loading-indicator" />
                </div>
            }>
                <PageComponent
                    match={this.state.currentPage.match}
                    query={this.state.currentPage.query}
                    setBackButtonVisible={this.setBackButtonVisible}
                    ref={page => this.currentPage = page} />
            </Suspense>
        );

        return (
            <div id="app" className={className}>
                <MuiThemeProvider theme={theme}>
                    <routerContext.Provider value={{
                        navigate: this.onNavigate,
                        replace: this.onReplace,
                    }}>
                        {appHeader}
                        <div className="app-contents">
                            {appDrawer}
                            <div className="page-container" ref={node => this.pageContainer = node}>
                                {pageContents}
                            </div>
                        </div>
                    </routerContext.Provider>
                </MuiThemeProvider>
            </div>
        );
    }
}

/**
 * Initializes the app.
 * @param {boolean} shouldPlayLoginAnimation - if true, will play the “logged in” animation
 * @param {Function} onLogout - logout callback
 */
export function init (shouldPlayLoginAnimation, onLogout) {
    const root = document.createElement('div');
    root.id = 'react-root';
    root.className = 'root-container';
    document.body.appendChild(root);
    ReactDOM.render(
        <App
            shouldPlayLoginAnimation={shouldPlayLoginAnimation}
            onLogout={onLogout} />,
        root
    );
    return root;
}
