import { h, Component } from 'preact';
import { forwardRef, createContext } from 'preact/compat';

/// The contextual action context (confusingly worded)
///
/// This context is for adding global contextual actions (e.g. tasks) that add a mode to the app
/// instead of being e.g. a dialog.
/// This exists purely because this would be easier to implement than componentizing the codeholders
/// page.
///
/// Contextual actions should probably be added by task views in conjunction with a UI element.
export const actionContext = createContext({
    /// current task; interface unknown but guaranteed to be a non-null object if active
    task: null,
    /// function to begin a contextual action
    beginTask: null,
    /// function to update the contextual action
    updateTask: null,
    /// ends a contextual action
    endTask: null,
});

export function connectContextualActions (Comp) {
    class InnerConnection extends Component {
        static contextType = actionContext;

        render () {
            const props = { ...this.props };
            delete props.contextActionConnRef;

            return (
                <Comp
                    {...props}
                    contextualAction={this.context.task}
                    ref={this.props.contextActionConnRef} />
            );
        }
    }

    return forwardRef((props, ref) => <InnerConnection {...props} contextActionConnRef={ref} />);
}

/// A component that registers itself as a contextual action.
/// If there is already a contextual action active, it will run onClose.
///
/// # Props
/// - onClose: should drop the task with no side-effects and should delete this node
/// - task: task object that will be passed to the actionContext
export class ContextualAction extends Component {
    static contextType = actionContext;

    componentDidMount () {
        if (this.context.task) {
            // there’s already a task here
            this.props.onClose();
        }
        this.context.beginTask(this.props.task);
    }

    componentDidUpdate (prevProps) {
        if (prevProps.task !== this.props.task) {
            this.context.updateTask(this.props.task);
        }
    }

    componentWillUnmount () {
        this.context.endTask();
    }

    render () {
        return null;
    }
}
