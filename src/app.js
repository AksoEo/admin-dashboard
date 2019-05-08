import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { routerContext, ROUTES } from './router';
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
import pages from './pages';

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
const USE_HISTORY_API = 'pushState' in window.history;

/** @returns {string[]} the current page ID, and further path elements. */
function currentPageFromLocation () {
    let pagePath;
    if (USE_HISTORY_API) {
        pagePath = document.location.pathname;
    } else {
        pagePath = document.location.hash.substr(1);
    }

    const pathParts = pagePath.split('/').filter(x => x);
    const pageIDPart = '/' + (pathParts.shift() || '');

    for (const category of ROUTES) {
        for (const item of category.contents) {
            if (item.url === pageIDPart) {
                return [item.id, ...pathParts];
            }
        }
    }

    return [null];
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

    /** `routerContext` handler. */
    onNavigate = target => {
        if (USE_HISTORY_API) {
            window.history.pushState(null, '', target);
            this.setState({
                currentPage: currentPageFromLocation(),
                sidebarOpen: false,
            });
        } else {
            // hashchange will change the state
            document.location.hash = `!${target}`;
        }
    };

    /** `routerContext` handler. */
    onReplace = target => {
        if (USE_HISTORY_API) {
            window.history.replaceState(null, '', target);
            this.setState({
                currentPage: currentPageFromLocation(),
            });
        } else {
            document.location.hash = `!${target}`;
        }
    }

    onPopState = () => {
        const currentPage = currentPageFromLocation();
        this.setState({
            currentPage,
            sidebarOpen: false,
            showBackButton: currentPage[0] !== this.state.currentPage
                ? false // reset back button visibility if page changes
                : this.state.showBackButton,
        });
    };

    onHashChange = this.onPopState;

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
        if (USE_HISTORY_API) {
            window.addEventListener('popstate', this.onPopState);
        } else {
            window.addEventListener('hashchange', this.onHashChange);
        }
        this.updatePageTitle();
        activeRequestsEmitter.on('update', this.onActiveRequestsUpdate);
    }

    componentWillUnmount () {
        window.removeEventListener('resize', this.onResize);
        if (USE_HISTORY_API) {
            window.removeEventListener('popstate', this.onPopState);
        } else {
            window.removeEventListener('hashchange', this.onHashChange);
        }
        activeRequestsEmitter.removeListener('update', this.onActiveRequestsUpdate);
    }

    componentDidUpdate () {
        this.updatePageTitle();
    }

    /**
     * Updates the document title (shown in e.g. the tab bar) to reflect the current page.
     */
    updatePageTitle () {
        document.title = locale.documentTitleTemplate(locale.pages[this.state.currentPage[0]]);
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
                        {locale.pages[this.state.currentPage[0]]}
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
                currentPage={this.state.currentPage[0]}
                onLogout={this.props.onLogout} />
        );

        // TODO: remove Todo fallback
        const PageComponent = pages[this.state.currentPage[0]] || function Todo () {
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
        pageContents = (
            <Suspense fallback={
                <div className="app-page loading">
                    <CircularProgress className="page-loading-indicator" />
                </div>
            }>
                <PageComponent
                    path={this.state.currentPage.slice(1)}
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
                            <div className="page-container">
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
