import React from 'react';
import PropTypes from 'prop-types';
import { Spring, globalAnimator, lerp, clamp } from '../../animation';
import ResizeObserver from 'resize-observer-polyfill';

const DAMPING = 1;
const RESPONSE = 0.4;

/**
 * Renders a vertical array of animatable material paper.
 */
export default class PaperList extends React.PureComponent {
    static propTypes = {
        children: PropTypes.arrayOf(PropTypes.object).isRequired,
    };

    /** ResizeObserver that observes all children. */
    resizeObserver = new ResizeObserver(() => this.update(0));

    childNodes = [];
    childStates = [];

    update (deltaTime, setInitialState) {
        // sync childStates count with child count
        while (this.childStates.length < this.props.children.length) {
            const lastState = this.childStates[this.childStates.length - 1];
            const child = this.props.children[this.childStates.length];

            const y = new Spring(DAMPING, RESPONSE);
            y.value = y.target = lastState ? lastState.y.value : 0;
            const height = new Spring(DAMPING, RESPONSE);
            height.value = height.target = 0;
            const hidden = new Spring(DAMPING, RESPONSE);
            hidden.value = hidden.target = child.hidden ? 1 : 0;

            const forceUpdate = () => this.forceUpdate();
            y.on('update', forceUpdate);
            height.on('update', forceUpdate);
            hidden.on('update', forceUpdate);

            this.childStates.push({ y, height, hidden });
        }

        while (this.childStates.length > this.props.children.length) {
            this.childStates.pop();
        }

        let wantsUpdate = false;

        let yAccum = 0;
        let i = 0;
        for (const state of this.childStates) {
            const index = i++;
            const child = this.props.children[index];

            if (!this.childNodes[index]) {
                // FIXME: for some reason update is called even after the component was unmounted
                return;
            }

            state.hidden.target = child.hidden ? 1 : 0;

            const offsetHeight = this.childNodes[index].offsetHeight;

            state.y.target = lerp(yAccum, yAccum - offsetHeight / 2, state.hidden.value);
            state.height.target = offsetHeight;

            if (setInitialState) {
                state.y.value = state.y.target;
                state.height.value = state.height.target;
            }

            yAccum += offsetHeight * (1 - state.hidden.value);

            state.y.update(deltaTime);
            state.height.update(deltaTime);
            state.hidden.update(deltaTime);

            if (!wantsUpdate && (state.y.wantsUpdate() || state.height.wantsUpdate()
                || state.hidden.wantsUpdate())) {
                wantsUpdate = true;
            }
        }

        this.nodeHeight = yAccum;

        if (!wantsUpdate) {
            globalAnimator.deregister(this);
        }
    }

    /** Returns the style object for a child at the given index. */
    getChildStyle (index) {
        if (!this.childStates[index]) return;
        const state = this.childStates[index];
        const childHeight = this.childNodes[index].offsetHeight;
        const scaleY = this.props.children[index].staticHeight
            ? 1
            : state.height.value / childHeight;

        return {
            transform: `translateY(${state.y.value}px) scaleY(${scaleY})`,
            zIndex: Math.round(lerp(this.childStates.length - index, -1, state.hidden.value)),
            opacity: clamp(1 - state.hidden.value, 0, 1),
            pointerEvents: state.hidden.value > 0.5 ? 'none' : '',
        };
    }

    componentDidMount () {
        this.update(0, true);
    }

    componentDidUpdate (prevProps) {
        if (prevProps.children !== this.props.children) {
            globalAnimator.register(this);
        }
    }

    componentWillUnmount () {
        globalAnimator.deregister(this);
    }

    render () {
        const props = { ...this.props };
        delete props.layout;

        const items = [];
        for (let i = 0; i < this.props.children.length; i++) {
            const { node } = this.props.children[i];
            const hidden = this.childStates[i] ? !!this.childStates[i].hidden.target : true;
            const style = this.getChildStyle(i);
            const index = i;
            items.push(
                <div
                    key={i}
                    className="paper-list-item"
                    style={style}
                    aria-hidden={hidden}
                    ref={node => {
                        this.childNodes[index] = node;
                        if (node) {
                            this.resizeObserver.observe(node);
                        }
                    }}>
                    {node}
                </div>
            );
        }

        // GC node refs
        while (this.childNodes.length > this.props.children.length) {
            this.childNodes.pop();
        }

        return (
            <div {...props} style={{ height: this.nodeHeight }}>
                {items}
            </div>
        );
    }
}
