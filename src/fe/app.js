import { h, Component } from 'preact';
import { Suspense } from 'preact/compat';
import { AppBarProvider, AppBarConsumer, CircularProgress } from '@cpsdqs/yamdl';
import Sidebar from './features/sidebar';
import { routerContext } from './router';
import Navigation from './features/navigation';
import EventProxy from './components/event-proxy';
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
    };

    onResize = () => this.setState({ permaSidebar: window.innerWidth >= PERMA_SIDEBAR_WIDTH });

    // close the sidebar when the user navigates, especially when they select a sidebar item
    onNavigate = () => this.setState({ sidebarOpen: false });

    // navigation ref
    #navigation = null;

    onRouterNavigationRequest = (...args) => this.#navigation.navigate(...args);

    // TODO: remove this
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

    componentDidMount () {
        this.onResize();
    }

    render () {
        let className = 'akso-app';
        if (this.props.animateIn) className += ' animate-in';

        // TODO: remove this
        const compatPermissionsDummy = {
            memberFilter: {},
            hasPermission: () => true,
        };

        // TODO: remove this
        /*
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
        );*/

        return (
            <routerContext.Provider value={{
                navigate: this.onRouterNavigationRequest,
            }}>
                <div class={className}>
                    <EventProxy
                        dom target={window}
                        onresize={this.onResize} />
                    <Sidebar
                        permanent={this.state.permaSidebar}
                        open={this.state.sidebarOpen || this.state.permaSidebar}
                        onOpen={() => this.setState({ sidebarOpen: true })}
                        onClose={() => this.setState({ sidebarOpen: false })}
                        // TODO: this
                        currentPage={'todo'}
                        onDirectTransition={this.props.onDirectTransition}
                        onDoAnimateIn={() => this.setState({ animateIn: true })} />
                    <AppBarProvider>
                        <div class="app-contents">
                            <AppBarConsumer class="app-header" />
                            <Navigation
                                ref={view => this.#navigation = view}
                                onNavigate={this.onNavigate} />
                        </div>
                    </AppBarProvider>
                </div>
            </routerContext.Provider>
        );
    }
}
