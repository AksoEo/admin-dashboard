import { h, Component } from 'preact';

/// A task view container.
///
/// # Props
/// - id: task id
/// - core: core ref
/// - view: task view
/// - isDead: whether or not this task is dead
export default class TaskView extends Component {
    constructor (props) {
        super(props);

        this.task = props.core.getTask(props.id);
    }

    state = {
        mayBeOpen: false,
    };

    #onClose = () => {
        if (this.viewRef && this.viewRef.onClose) this.viewRef.onClose();
        else this.task.drop();
    };

    componentDidMount () {
        setImmediate(() => this.setState({ mayBeOpen: true }));
    }

    render ({ id, core, view: View, isDead }, { mayBeOpen }) {
        return (
            <View
                ref={view => this.viewRef = view}
                open={!isDead && mayBeOpen}
                id={id}
                core={core}
                task={this.task} />
        );
    }
}
