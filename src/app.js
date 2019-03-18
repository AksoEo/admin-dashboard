import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

/** @jsx React.createElement */

import { routerContext } from './router';
import locale from './locale';
import './app.less';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import Sidebar from './features/sidebar';

const theme = createMuiTheme({
    palette: {
        primary: { main: '#31a64f' }
    },
    typography: {
        useNextVariants: true
    }
});

/** Minimum width for a perma-sidebar. */
const PERMA_SIDEBAR_WIDTH = 900;
const USE_HISTORY_API = 'pushState' in window.history;

/** @returns {string} the current page path. */
function currentPageFromLocation () {
    if (USE_HISTORY_API) {
        return document.location.pathname;
    } else {
        return document.location.hash.substr(1);
    }
}

/** The main app. */
export default class App extends React.PureComponent {
    static propTypes = {
        shouldPlayLoginAnimation: PropTypes.bool.isRequired,
        onLogout: PropTypes.func.isRequired
    };

    state = {
        sidebarOpen: false,
        permaSidebar: window.innerWidth >= PERMA_SIDEBAR_WIDTH,
        currentPage: currentPageFromLocation()
    };

    /** If true, will play the logged-in animation. */
    shouldPlayLoginAnimation = this.props.shouldPlayLoginAnimation;

    onResize = () => {
        this.setState({ permaSidebar: window.innerWidth >= PERMA_SIDEBAR_WIDTH });
    }

    /** `routerContext` handler. */
    onNavigate = target => {
        if (USE_HISTORY_API) {
            window.history.pushState(null, '', target);
            this.setState({ currentPage: target });
        } else {
            document.location.hash = `!${target}`;
        }
    };

    /** `routerContext` handler. */
    onLoginStateChanged = () => {
        const loggedIn = window.localStorage.demoLoggedIn;
        this.setState({ loggedIn });
        if (!loggedIn) {
            this.shouldPlayLoginAnimation = true;
        }
    }

    onPopState = () => {
        this.setState({
            currentPage: currentPageFromLocation()
        });
    };

    onHashChange = () => {
        this.setState({
            currentPage: currentPageFromLocation()
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
    }

    componentWillUnmount () {
        window.removeEventListener('resize', this.onResize);
        if (USE_HISTORY_API) {
            window.removeEventListener('popstate', this.onPopState);
        } else {
            window.removeEventListener('hashchange', this.onHashChange);
        }
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
                    ) : (
                        <IconButton
                            className="menu-button"
                            color="inherit"
                            aria-label={locale.header.menu}
                            onClick={() => this.setState({
                                sidebarOpen: !this.state.sidebarOpen
                            })}>
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography
                        className="header-title"
                        color="inherit"
                        variant="title">
                        page title goes here
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

        const isLoading = false; // TODO: set to true when something is happening

        appHeader = this.renderAppHeader(isLoading);

        appDrawer = (
            <Sidebar
                permanent={this.state.permaSidebar}
                open={this.state.sidebarOpen || this.state.permaSidebar}
                onOpen={() => this.setState({ sidebarOpen: true })}
                onClose={() => this.setState({ sidebarOpen: false })}
                animateIn={this.shouldPlayLoginAnimation}
                currentPage={this.state.currentPage} />
        );

        // TODO: load page contents
        pageContents = this.state.currentPage === '/' ? (
            <div>
                <button onClick={this.props.onLogout} style={{
                    fontSize: 24,
                    color: '#fff',
                    background: '#ed9b50',
                    borderRadius: 4,
                    border: 0
                }}>
                    tap here to log out
                </button>
            </div>
        ) : null;

        return (
            <div id="app" className={className}>
                <MuiThemeProvider theme={theme}>
                    <routerContext.Provider value={{
                        navigate: this.onNavigate,
                        loginStateChanged: this.onLoginStateChanged
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
