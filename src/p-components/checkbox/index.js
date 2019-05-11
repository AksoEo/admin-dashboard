import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import Ripple from '../ripple';
import './style';

/** @jsx h */

function isCheckboxCheckKey (key) {
    return key === ' ' || key === 'Enter';
}

/** Renders a material checkbox. */
export default class Checkbox extends Component {
    static propTypes = {
        checked: PropTypes.bool.isRequired,
        disabled: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
        onMouseDown: PropTypes.func,
        onMouseMove: PropTypes.func,
        onTouchStart: PropTypes.func,
        onKeyDown: PropTypes.func,
        onKeyUp: PropTypes.func,
        id: PropTypes.string,
    };

    /** The DOM node */
    node = null;

    /** The ripple instance */
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
        if (!e.defaultPrevented && isCheckboxCheckKey(e.key)) this.ripple.onAnonymousDown();
    };

    onKeyUp = e => {
        if (e.target !== this.button) return;
        if (this.props.onKeyUp) this.props.onKeyUp(e);
        if (!e.defaultPrevented) this.ripple.onAnonymousUp();
    };

    render () {
        const props = { ...this.props };

        delete props.id;
        delete props.onChange;
        props.className = (props.className || '') + ' paper-checkbox';
        if (props.checked) props.className += ' is-checked';
        if (props.disabled) props.className += ' is-disabled';

        return (
            <span
                {...props}
                ref={node => this.node = node}
                onMouseDown={this.onMouseDown}
                onMouseMove={this.onMouseMove}
                onTouchStart={this.onTouchStart}
                onTouchEnd={this.onTouchEnd}
                onKeyDown={this.onKeyDown}
                onKeyUp={this.onKeyUp}>
                <span className="p-background"></span>
                <span className="p-inner-background"></span>
                <input
                    className="p-input"
                    type="checkbox"
                    id={this.props.id}
                    checked={this.props.checked}
                    onChange={e => this.props.onChange(e.target.checked)}
                    disabled={!!this.props.disabled} />
                <span className="p-ripple-container">
                    <Ripple ref={ripple => this.ripple = ripple} />
                </span>
                <span className="p-check"></span>
            </span>
        );
    }
}
