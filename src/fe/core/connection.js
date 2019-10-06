import { h, Component } from 'preact';
import { createContext, forwardRef } from 'preact/compat';

export const coreContext = createContext();

// TODO: handle errors?

/// Connects a component to a view.
export const connect = (...viewArgs) => (map = (id => id)) => Comp => {
    class InnerConnection extends Component {
        static contextType = coreContext;

        state = { data: null };

        componentDidMount () {
            this.view = this.context.createDataView(...viewArgs);
            this.view.on('update', this.#onUpdate);
        }

        #onUpdate = data => this.setState({ data });

        componentWillUnmount () {
            this.view.drop();
        }

        render () {
            const props = { ...this.props, ...map(this.state.data, this.context) };
            props.ref = props.coreConnForwardedRef;
            delete props.coreConnForwardedRef;
            return <Comp {...props} />;
        }
    }

    return forwardRef((props, ref) => <InnerConnection {...props} coreConnForwardedRef={ref} />);
};
