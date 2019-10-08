import { h } from 'preact';
import { PureComponent } from 'preact/compat';

/// An event proxy---essentially just binds events for the lifetime of the preact node.
///
/// # Props
/// - target: target EventEmitter
/// - on(.*): binds the given function to (1)
export default class EventProxy extends PureComponent {
    #previousTarget;
    #eventHandlers = new Map();

    componentDidUpdate () {
        if (this.#previousTarget) this.#unbindEvents(this.#previousTarget);
        this.#bindEvents(this.props.target);
        this.#previousTarget = this.props.target;
    }

    #bindEvents = (target) => {
        for (const id in this.props) {
            if (id.startsWith('on')) {
                const eventName = id.substr(2);
                target.on(eventName, this.props[id]);
                this.#eventHandlers.set(eventName, this.props[id]);
            }
        }
    };

    #unbindEvents = (target) => {
        for (const [event, listener] of this.#eventHandlers) {
            target.removeListener(event, listener);
        }
    };

    render () {
        return null;
    }
}
