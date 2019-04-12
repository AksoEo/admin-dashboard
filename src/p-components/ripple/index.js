import { h, Component } from 'preact';
import { Spring } from '../../animation';
import './style';

/** @jsx h */

/** Duration of a single ripple effect. */
const RIPPLE_DURATION = 0.5;

/** Duration of a single ripple effect while the pointer is held down. */
const RIPPLE_HOLD_DURATION = 3;

/**
 * Draws a material ripple in the parent container.
 *
 * Methods `onMouseDown`, `onTouchStart`, `onAnonymousDown`, `onAnonymousUp` should be called by
 * the enclosing component when appropriate.
 */
export default class Ripple extends Component {
    state = {
        /** List of current ripples. */
        ripples: [],

        /**
         * The ID of the current ripple. Used to identify which ripple to modify when the
         * pointer is released.
         */
        currentRippleID: null,
    };

    /** The DOM node. */
    node = null;

    componentWillUnmount () {
        for (const ripple of this.state.ripples) {
            ripple.sizeSpring.stop();
            ripple.opacitySpring.stop();
        }
    }

    /** @param {MouseEvent} e */
    onMouseDown = e => {
        if (e.defaultPrevented) return;
        this.onPointerDown(e.clientX, e.clientY);
        window.addEventListener('mouseup', this.onMouseUp);
    };

    /** Will be bound automatically—should not be called directly. */
    onMouseUp = () => {
        this.onPointerUp();
        window.removeEventListener('mouseup', this.onMouseUp);
    }

    /** @param {TouchEvent} e */
    onTouchStart = e => {
        if (e.defaultPrevented) return;
        this.onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
        window.addEventListener('touchcancel', this.onTouchEnd);
        window.addEventListener('touchend', this.onTouchEnd);
    }

    /** Will be bound automatically—should not be called directly. */
    onTouchEnd = () => {
        this.onPointerUp();
        window.removeEventListener('touchcancel', this.onTouchEnd);
        window.removeEventListener('touchend', this.onTouchEnd);
    }

    anonDown = false;

    /** Anonymous down event—will render a centered ripple. */
    onAnonymousDown = () => {
        if (!this.anonDown) {
            this.onPointerDown();
            this.anonDown = true;
        }
    }

    /**
     * Anonymous up event—will stop holding the ripple previously created by an `onAnonymousDown`
     * call.
     */
    onAnonymousUp = () => {
        if (this.anonDown) {
            this.onPointerUp();
            this.anonDown = false;
        }
    }

    onPointerDown (clientX, clientY) {
        const nodeRect = this.node.getBoundingClientRect();

        const offsetX = clientX !== undefined ? clientX - nodeRect.left : nodeRect.width / 2;
        const offsetY = clientY !== undefined ? clientY - nodeRect.top : nodeRect.height / 2;

        const ripples = this.state.ripples.slice();
        const ripple = {
            id: Math.random(),
            x: offsetX,
            y: offsetY,
            sizeSpring: new Spring(1, RIPPLE_HOLD_DURATION),
            opacitySpring: new Spring(1, RIPPLE_HOLD_DURATION),
        };

        ripple.sizeSpring.target = 1;
        ripple.opacitySpring.value = 1;
        ripple.opacitySpring.target = 0.3;
        ripple.sizeSpring.on('update', () => this.forceUpdate());
        ripple.sizeSpring.start();
        ripple.opacitySpring.start();

        ripples.push(ripple);
        this.setState({
            currentRippleID: ripple.id,
            ripples,
        });
    }

    onPointerUp = () => {
        let currentRippleIndex = null;
        for (let i = 0; i < this.state.ripples.length; i++) {
            if (this.state.ripples[i].id === this.state.currentRippleID) {
                currentRippleIndex = i;
            }
        }

        if (currentRippleIndex != null) {
            const ripples = this.state.ripples.slice();
            ripples[currentRippleIndex].sizeSpring.setPeriod(RIPPLE_DURATION);
            ripples[currentRippleIndex].opacitySpring.target = 0;
            ripples[currentRippleIndex].opacitySpring.setPeriod(RIPPLE_DURATION);

            this.setState({
                currentRippleID: null,
                ripples,
            });
        } else {
            this.setState({ currentRippleID: null });
        }
    }

    componentDidUpdate () {
        const indicesToRemove = [];
        for (let i = 0; i < this.state.ripples.length; i++) {
            if (!this.state.ripples[i].sizeSpring.wantsUpdate()) {
                indicesToRemove.push(i);
            }
        }

        if (indicesToRemove.length) {
            const ripples = this.state.ripples.slice();
            let offset = 0;
            for (const index of indicesToRemove) {
                ripples.splice(index + offset, 1);
                offset--;
            }
            this.setState({ ripples });
        }
    }

    render () {
        let highlight = null;
        const ripples = [];

        const nodeRect = this.node ? this.node.getBoundingClientRect() : null;
        const centerX = nodeRect ? nodeRect.width / 2 : 0;
        const centerY = nodeRect ? nodeRect.height / 2 : 0;
        const targetScale = nodeRect ? Math.hypot(nodeRect.width, nodeRect.height) : 0;

        let maxHighlight = 0;

        for (const ripple of this.state.ripples) {
            const sizeProgress = ripple.sizeSpring.value;
            const posX = sizeProgress * (centerX - ripple.x) + ripple.x;
            const posY = sizeProgress * (centerY - ripple.y) + ripple.y;
            const scale = sizeProgress;
            const opacity = ripple.opacitySpring.value;

            const rippleHighlight = 1 - 4 * Math.abs(sizeProgress - 0.5) ** 2;
            maxHighlight = Math.max(rippleHighlight, maxHighlight);

            ripples.push(
                <div
                    key={ripple.id}
                    className="ink-single-ripple"
                    style={{
                        transform: `translate(${posX}px, ${posY}px) scale(${scale})`,
                        opacity,
                        width: `${targetScale}px`,
                        height: `${targetScale}px`,
                        marginLeft: `${-targetScale / 2}px`,
                        marginTop: `${-targetScale / 2}px`,
                    }}>
                </div>
            );
        }

        if (maxHighlight) {
            highlight = <div
                className="ink-ripple-highlight"
                style={{ opacity: maxHighlight }} />;
        }

        return (
            <div className="ink-ripple" ref={node => this.node = node}>
                {ripples}
                {highlight}
            </div>
        );
    }
}
