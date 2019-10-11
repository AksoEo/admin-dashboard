import { h, Component } from 'preact';
import { AppBarProvider, AppBarConsumer } from '@cpsdqs/yamdl';
import Sidebar from './features/sidebar';
import { routerContext } from './router';
import './app.less';

// set up moment
import moment from 'moment';
import 'moment-timezone';
import 'moment/locale/eo';
moment.locale('eo');
moment.tz.setDefault('UTC');

export default class App extends Component {
    state = {
        permaSidebar: true, // TODO
        sidebarOpen: true,
        currentPage: {},
    };

    /// `routerContext` handler.
    onNavigate = target => {
        const current = document.location.pathname
            + document.location.search
            + document.location.hash;

        if (target === current) return; // nothing to do

        this.saveCurrentScrollPosition();

        window.history.pushState(null, '', target);
        this.setState({
            // currentPage: currentPageFromLocation(),
            sidebarOpen: false,
        });
    };

    /// `routerContext` handler.
    onReplace = target => {
        window.history.replaceState(null, '', target);
        this.setState({
            // currentPage: currentPageFromLocation(),
        });
    }

    render () {
        let className = 'akso-app';
        if (this.props.animateIn) className += ' animate-in';

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
                        </div>
                    </div>
                </routerContext.Provider>
            </AppBarProvider>
        );
    }
}
