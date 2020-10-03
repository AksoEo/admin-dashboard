import { h, Component } from 'preact';
import { createContext, forwardRef } from 'preact/compat';

/// This context contains a reference to the core worker interface (see worker.js).
export const coreContext = createContext();

// TODO: handle errors?

/// Connects a component to a core view.
///
/// If viewArgs[0] is a function, it will be passed the component props and must return an array of
/// arguments. Then viewArgs[1] may also be an array of prop names which will be shallow-compared
/// and, if they were changed, will cause the view to reload.
export const connect = (...viewArgs) => (map = (id => id)) => Comp => {
    class InnerConnection extends Component {
        static contextType = coreContext;

        state = { data: null, error: null, loaded: false };

        componentDidMount () {
            if (typeof viewArgs[0] === 'function') {
                this.view = this.context.createDataView(...(viewArgs[0](this.props)));
            } else this.view = this.context.createDataView(...viewArgs);
            this.view.on('update', this.#onUpdate);
            this.view.on('error', this.#onError);
        }

        componentDidUpdate (prevProps) {
            if (typeof viewArgs[0] === 'function' && Array.isArray(viewArgs[1])) {
                let didChange = false;
                for (const key of viewArgs[1]) {
                    if (prevProps[key] !== this.props[key]) {
                        didChange = true;
                        break;
                    }
                }

                if (didChange) {
                    this.view.drop();
                    this.view = this.context.createDataView(...(viewArgs[0](this.props)));
                }
            }
        }

        #onUpdate = data => this.setState({ data, loaded: true, error: null });
        #onError = error => this.setState({ error });

        componentWillUnmount () {
            if (this.view) this.view.drop();
        }

        render () {
            const props = { ...this.props, ...map(this.state.data, this.context, this.state.error, this.state.loaded) };
            props.ref = props.coreConnForwardedRef;
            delete props.coreConnForwardedRef;
            return <Comp {...props} />;
        }
    }

    return forwardRef((props, ref) => <InnerConnection {...props} coreConnForwardedRef={ref} />);
};
