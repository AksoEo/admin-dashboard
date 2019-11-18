import { h } from 'preact';
import { PureComponent, createContext } from 'preact/compat';

export const metaContext = createContext();

export class MetaProvider extends PureComponent {
    update (data) {
        this.props.onUpdate && this.props.onUpdate(data);
    }

    render ({ children }) {
        return (
            <metaContext.Provider value={this}>
                {children}
            </metaContext.Provider>
        );
    }
}

/// Provides page metadata to the navigation controller.
///
/// # Props
/// - title: title string
/// - actions: list of app bar actions
export default class Meta extends PureComponent {
    static contextType = metaContext;

    componentDidMount () {
        this.context.update(this.props);
    }

    componentDidUpdate (prevProps) {
        if (prevProps.title !== this.props.title
            // FIXME: actions needs deep eq
            || prevProps.actions.length !== this.props.actions.length) {
            this.context.update(this.props);
        }
    }

    render () {
        return null;
    }
}
