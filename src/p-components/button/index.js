import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import Ripple from '../ripple';
import './style';

/** @jsx h */

function isButtonPressKey (key) {
    return key === ' ' || key === 'Enter';
}

/**
 * A material button.
 *
 * This component is part of a series of lightweight material components that don’t depend on 40 kB
 * material-ui boilerplate.
 *
 * - to render a raised button, add the class `raised`
 * - to render a floating action button, add the class `fab`
 * - to render an icon button, add the class `icon-button`
 */
export default class Button extends Component {
    static propTypes = {
        onMouseDown: PropTypes.func,
        onMouseMove: PropTypes.func,
        onTouchStart: PropTypes.func,
        onKeyDown: PropTypes.func,
        onKeyUp: PropTypes.func,
        children: PropTypes.any,
    };

    /**
     * The button node.
     * @type {Node|null}
     */
    button = null;

    /**
     * The ripple instance.
     * @type {Ripple|null}
     */
    ripple = null;

    onMouseDown = e => {
        if (this.props.onMouseDown) this.props.onMouseDown(e);
        if (!this.ignoreMouse) this.ripple.onMouseDown(e);
    };

    onMouseMove = e => {
        this.ignoreMouse = false;
        if (this.props.onMouseMove) this.props.onMouseMove(e);
    };

    onTouchStart = e => {
        if (this.props.onTouchStart) this.props.onTouchStart(e);
        this.ripple.onTouchStart(e);
        this.ignoreMouse = true;
    };

    onKeyDown = e => {
        if (e.target !== this.button) return;
        if (this.props.onKeyDown) this.props.onKeyDown(e);
        if (!e.defaultPrevented && isButtonPressKey(e.key)) this.ripple.onAnonymousDown();
    };

    onKeyUp = e => {
        if (e.target !== this.button) return;
        if (this.props.onKeyUp) this.props.onKeyUp(e);
        if (!e.defaultPrevented) this.ripple.onAnonymousUp();
    };

    render () {
        const props = { ...this.props };
        props.class = (props.class || '') + ' paper-button';

        return (
            <button
                {...props}
                ref={node => this.button = node}
                onMouseDown={this.onMouseDown}
                onMouseMove={this.onMouseMove}
                onTouchStart={this.onTouchStart}
                onTouchEnd={this.onTouchEnd}
                onKeyDown={this.onKeyDown}
                onKeyUp={this.onKeyUp}>
                <Ripple ref={ripple => this.ripple = ripple} />
                {this.props.children}
            </button>
        );
    }
}
