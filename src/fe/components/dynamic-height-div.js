import { h } from 'preact';
import { PureComponent, createContext } from 'preact/compat';
import { Spring, globalAnimator } from 'yamdl';
import EventProxy from './event-proxy';

export const layoutContext = createContext();

/// Animates changes in height to fit children.
///
/// # Caveats
/// Assumes all children will be laid out vertically without overlapping.
/// Does not support children with margins.
/// Does not always detect children resizing (especially 2nd-order children). Use the layoutContext
/// to signal changes if necessary.
///
/// # Props
/// - useCooldown: bool
///    - lastChangeTime: number
///    - cooldown: cooldown time
/// - useFirstHeight: bool
/// - lazy: bool - if true, will not add a `height` style if no animation is happening
export default class DynamicHeightDiv extends PureComponent {
    static contextType = layoutContext;

    #height = new Spring(1, 0.5);
    #node = null;

    updateHeight = () => {
        if (!this.#node) return;
        this.#height.target = [...this.#node.children]
            .map(child => child.offsetHeight)
            .reduce((a, b) => a + b, 0);

        if (!this._usedFirstHeight && this.props.useFirstHeight) {
            this._usedFirstHeight = true;
            this.#height.value = this.#height.target;
        }

        if (this.#height.wantsUpdate()) globalAnimator.register(this);
    };

    #scheduledUpdate;
    #ffScheduledUpdate;
    scheduleUpdate = () => {
        clearTimeout(this.#scheduledUpdate);
        clearTimeout(this.#ffScheduledUpdate);
        this.#scheduledUpdate = setTimeout(this.updateHeight, 1);
        // also a schedule update further in the future
        // because sometimes layout may be just a tad off
        this.#ffScheduledUpdate = setTimeout(this.updateHeight, 1000);
    };
    // because sometimes layout may be just a tad off

    update (dt) {
        if (!this.props.useCooldown
            || this.props.lastChangeTime < Date.now() - this.props.cooldown) {
            this.#height.update(dt);
            if (this.context) this.context();
        }
        if (!this.#height.wantsUpdate()) globalAnimator.deregister(this);
        this.forceUpdate();
    }

    componentDidMount () {
        globalAnimator.register(this);
        this.updateHeight();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.children !== this.props.children) this.updateHeight();
    }

    componentWillUnmount () {
        globalAnimator.deregister(this);
        clearTimeout(this.#scheduledUpdate);
        clearTimeout(this.#ffScheduledUpdate);
    }

    render (props) {
        const style = {};
        if (this.#height.wantsUpdate() || !this.props.lazy) style.height = this.#height.value;

        return (
            <div {...props} ref={node => this.#node = node} style={style}>
                <EventProxy dom target={window} onresize={this.updateHeight} />
                <layoutContext.Provider value={this.scheduleUpdate}>
                    {props.children}
                </layoutContext.Provider>
            </div>
        );
    }
}
