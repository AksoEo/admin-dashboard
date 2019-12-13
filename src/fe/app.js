import { h, Component } from 'preact';
import { AppBarProvider, AppBarConsumer } from '@cpsdqs/yamdl';
import { Perms } from '@tejo/akso-client';
import Sidebar from './features/sidebar';
import Navigation from './features/navigation';
import EventProxy from './components/event-proxy';
import { connect } from './core/connection';
import permsContext from './perms';
import './app.less';

// set up moment
import moment from 'moment';
import 'moment-timezone';
import 'moment/locale/eo';
moment.locale('eo');
moment.tz.setDefault('UTC');

const PERMA_SIDEBAR_WIDTH = 900;

export default connect('perms/perms')(perms => ({ perms }))(class App extends Component {
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

    perms = new Perms();

    componentDidMount () {
        this.onResize();

        if (this.props.perms) {
            // this is a silly requirement for the react context to update properly:
            // the two perms objects must not be identical
            this.perms = new Perms();
            this.perms.load(this.props.perms);
        }
    }

    componentDidUpdate (prevProps) {
        if (prevProps.perms !== this.props.perms) {
            // this is a silly requirement for the react context to update properly:
            // the two perms objects must not be identical
            this.perms = new Perms();
            this.perms.load(this.props.perms);
        }
    }

    render () {
        let className = 'akso-app';
        if (this.props.animateIn) className += ' animate-in';

        return (
            <permsContext.Provider value={this.perms}>
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
            </permsContext.Provider>
        );
    }
});
