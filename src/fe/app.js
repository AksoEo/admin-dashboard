import { h, Component } from 'preact';
import { AppBarProvider, AppBarConsumer } from '@cpsdqs/yamdl';
import Sidebar from './features/sidebar';
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
        permaSidebar: window.innerWidth >= PERMA_SIDEBAR_WIDTH,
        sidebarOpen: false,
        currentPage: null,
    };

    onResize = () => this.setState({ permaSidebar: window.innerWidth >= PERMA_SIDEBAR_WIDTH });

    // close the sidebar when the user navigates, especially when they select a sidebar item
    onNavigate = () => this.setState({ sidebarOpen: false });

    onCurrentPageChange = currentPage => this.setState({ currentPage });

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

        return (
            <div class={className}>
                <EventProxy dom target={window} onresize={this.onResize} />
                <Sidebar
                    permanent={this.state.permaSidebar}
                    open={this.state.sidebarOpen || this.state.permaSidebar}
                    onOpen={() => this.setState({ sidebarOpen: true })}
                    onClose={() => this.setState({ sidebarOpen: false })}
                    currentPage={this.state.currentPage}
                    onDirectTransition={this.props.onDirectTransition}
                    onDoAnimateIn={() => this.setState({ animateIn: true })} />
                <AppBarProvider>
                    <div class="app-contents">
                        <AppBarConsumer
                            // TODO: use this el for document.title
                            class="app-header" />
                        <Navigation
                            ref={view => this.#navigation = view}
                            permaSidebar={this.state.permaSidebar}
                            onOpenMenu={() => this.setState({ sidebarOpen: true })}
                            onCurrentPageChange={this.onCurrentPageChange}
                            onNavigate={this.onNavigate} />
                    </div>
                </AppBarProvider>
            </div>
        );
    }
}
