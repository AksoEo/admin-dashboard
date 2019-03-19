import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import { CircularProgressIndicator } from './progress';

/**
 * Wraps an app page that was imported as a promise to render synchronously.
 *
 * All props other than `lazyComponent` will be passed to the loaded component.
 */
export default class LazyPageWrapper extends Component {
    static propTypes = {
        /** The component promise. */
        lazyComponent: PropTypes.any.isRequired,
        children: PropTypes.any
    };

    state = {
        component: null,
        error: null
    };

    /** True if the component is not mounted and state should not be updated. */
    ignorePromiseResults = true;

    /** Loads the component from the promise. */
    loadComponent () {
        if (!this.props.lazyComponent) {
            this.setState({ component: null, error: 'no component' });
            return;
        }
        this.props.lazyComponent.then(({ default: component }) => {
            if (this.ignorePromiseResults) return;
            this.setState({ component });
        }).catch(err => {
            if (this.ignorePromiseResults) return;
            this.setState({ component: null, error: err });
        });
    }

    componentDidMount () {
        this.loadComponent();
        this.ignorePromiseResults = false;
    }

    componentWillUnmount () {
        this.ignorePromiseResults = true;
    }

    componentDidUpdate (prevProps) {
        if (prevProps.lazyComponent !== this.props.lazyComponent) {
            this.loadComponent();
        }
    }

    render () {
        if (this.state.component) {
            const props = { ...this.props };
            delete props.lazyComponent;

            return h(this.state.component, props, this.props.children);
        } else if (this.state.error) {
            return <span>Error: {this.state.error}</span>;
        } else {
            return (
                <div class="app-page loading">
                    <CircularProgressIndicator
                        class="page-loading-indicator"
                        indeterminate />
                </div>
            );
        }
    }
}
