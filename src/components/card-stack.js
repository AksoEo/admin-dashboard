import { h, Component } from 'preact';
import './card-stack.less';

const CONTEXT_KEY = 'akso-card-stack-provider';

/// Interface between CardStackRenderers and CardStackItems that provides the card stack context.
export class CardStackProvider extends Component {
    getChildContext () {
        return {
            [CONTEXT_KEY]: this.context[CONTEXT_KEY] || this,
        };
    }

    registeredItems = {};
    registeredConsumers = [];

    register (id, props) {
        this.registeredItems[id] = props;

        this.updateConsumers();
    }

    deregister (id) {
        if (id in this.registeredItems) {
            delete this.registeredItems[id];
            this.updateConsumers();
        }
    }

    buildStack () {
        return Object.values(this.registeredItems).sort((a, b) => a.depth - b.depth);
    }

    updateConsumers () {
        const stack = this.buildStack();
        for (const consumer of this.registeredConsumers) consumer.update(stack);
    }

    registerConsumer (consumer) {
        this.registeredConsumers.push(consumer);
        consumer.update(this.buildStack());
    }

    deregisterConsumer (consumer) {
        this.registeredConsumers.splice(this.registeredConsumers.indexOf(consumer), 1);
    }

    tryPop () {
        const stack = this.buildStack();
        if (stack.length) {
            const last = stack[stack.length - 1];
            if (last.onClose) last.onClose();
        }
    }

    render () {
        return this.props.children;
    }
}

// FIXME: sometimes this causes infinite loops because all stack items are rendered simultaneously
// even though they’re nested, and because every stack item will run register(..) and update the
// renderer, this will cause all stack items to be re-rendered and may cause an infinite loop
/// A card stack renderer.
export class CardStackRenderer extends Component {
    state = {
        stack: [],
        stackSize: 0,
    };

    update (stack) {
        // the answer to why the update mechanism is so convoluted is that when stack items are
        // removed, they still need to be animated out so they have to linger for a while

        const newStack = this.state.stack.slice();
        for (let i = 0; i < newStack.length && i < stack.length; i++) {
            newStack[i] = { item: stack[i], ageMarker: 0 };
        }
        for (let i = newStack.length; i < stack.length; i++) {
            newStack.push({ item: stack[i], ageMarker: 0 });
        }

        // all stack items that have technically been removed will instead be marked with an
        // age marker and then cleared after their animation finishes
        const ageMarker = Date.now();
        for (let i = stack.length; i < newStack.length; i++) {
            newStack[i].ageMarker = ageMarker;
        }
        setTimeout(() => this.cleanStack(ageMarker), 500);
        this.setState({ stack: newStack, stackSize: stack.length });
    }

    cleanStack (ageMarker) {
        if (!this.mayUpdate) return;
        const newStack = this.state.stack.filter(x => x.ageMarker !== ageMarker);
        this.setState({ stack: newStack });
    }

    componentDidMount () {
        this.mayUpdate = true;
        const provider = this.context[CONTEXT_KEY];
        if (provider) provider.registerConsumer(this);
    }

    componentWillUnmount () {
        this.mayUpdate = false;
        const provider = this.context[CONTEXT_KEY];
        if (provider) provider.deregisterConsumer(this);
    }

    onBackdropClick = () => {
        const provider = this.context[CONTEXT_KEY];
        if (provider) provider.tryPop();
    };

    render () {
        let className = (this.props.class || '') + ' card-stack-renderer';
        if (!this.state.stack.length) className += ' is-empty';
        return (
            <div class={className}>
                <div class="card-stack-items">
                    {this.state.stack.flatMap(({ item, ageMarker }, i) => {
                        const off = this.state.stackSize - 1 - i;
                        const dy = -12 * (4 - 4 * 2 ** (-off));
                        const s = 0.5 / Math.sqrt(off + 1) + 0.5;

                        const style = {
                            transform: `translateY(${dy}px) scale(${s})`,
                            transformOrigin: '50% 0',
                        };

                        let className = 'card-stack-item-contents';
                        if (item.class) className += ' ' + item.class;

                        return [
                            <div
                                class={'card-stack-backdrop' + (ageMarker ? ' is-phantom' : '')}
                                key={'b' + i}
                                onClick={this.onBackdropClick} />,
                            <div
                                class={'card-stack-item' + (ageMarker ? ' is-phantom' : '')}
                                style={style}
                                key={'a' + i}>
                                <div class={className} ref={item.scrollViewRef}>
                                    {item.children}
                                </div>
                            </div>,
                        ];
                    })}
                </div>
            </div>
        );
    }
}

/// A card stack item.
///
/// # Props
/// - `children`: children that will be proxied
/// - `depth`: stack depth
/// - `open`: open state
/// - `onClose`: onClose handler
/// - `scrollViewRef`: refs the card stack item’s scroll view
export class CardStackItem extends Component {
    id = Math.random().toString();

    componentDidMount () {
        if (this.props.open) this.updateProxied();
    }

    componentDidUpdate (prevProps) {
        let update = false;
        for (const k in prevProps) {
            if (prevProps[k] !== this.props[k]) {
                update = true;
            }
        }
        if (update) {
            if (this.props.open) this.updateProxied();
            else this.removeProxied();
        }
    }

    componentWillUnmount () {
        this.removeProxied();
    }

    updateProxied () {
        const provider = this.context[CONTEXT_KEY];
        const props = { ...this.props };
        if (provider) provider.register(this.id, props);
    }

    removeProxied () {
        const provider = this.context[CONTEXT_KEY];
        if (provider) provider.deregister(this.id);
    }

    render () {
        return null;
    }
}
