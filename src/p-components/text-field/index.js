import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import { Spring, lerp } from '../../animation';
import './style';

/** @jsx h */

/** Scaling factor that will be applied to the label when it floats. */
const FLOATING_LABEL_SCALE = 0.75;

let inputIDCounter = 0;

/** A material text field. */
export default class TextField extends Component {
    static propTypes = {
        /** Floating text field label. */
        label: PropTypes.any,
        class: PropTypes.string,
        id: PropTypes.string,
        /**
         * If true, will render the text field using the outline style.
         * If false, will use the normal underline style.
         */
        outline: PropTypes.bool,
        center: PropTypes.bool,
        disabled: PropTypes.bool,
        value: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        /** A placeholder shown when the label is floating and the input is empty. */
        placeholder: PropTypes.string,
        /** A helper label shown below the control. */
        helperLabel: PropTypes.any,
        /** Error label. Will replace the helper label if not empty. */
        error: PropTypes.any,
        /** A prefix that will be positioned before the input. */
        prefix: PropTypes.any,
    };

    state = {
        isFocused: false,
    };

    floatingSpring = new Spring(1, 0.3);

    constructor (props) {
        super(props);

        this.floatingSpring.tolerance = 1 / 60;
    }

    /** Input ID, used for the `for` attribute on the `<label>` if `id` is not given. */
    inputID = `text-field-${inputIDCounter++}`;

    /**
     * The `<input>` node.
     * @type {Node|null}
     */
    inputNode = null;

    /**
     * The prefix container node.
     * @type {Node|null}
     */
    prefixNode = null;

    onFocus = () => {
        this.setState({ isFocused: true });
    };

    onBlur = () => {
        this.setState({ isFocused: false });
    };

    /** Calls `focus()` on the input node. */
    focus () {
        this.inputNode.focus();
    }

    /** Sets the target of the floating spring according to the current state. */
    updateFloatingSpring () {
        this.floatingSpring.target = (this.state.isFocused || this.props.value) ? 1 : 0;
        if (this.floatingSpring.wantsUpdate()) this.floatingSpring.start();
    }

    componentDidMount () {
        this.updateFloatingSpring();
        this.forceUpdate();
    }

    componentDidUpdate () {
        this.updateFloatingSpring();
    }

    render () {
        let className = (this.props.class || '') + ' paper-text-field';
        if (this.state.isFocused) className += ' is-focused';
        if (this.props.error) className += ' has-error';
        if (this.props.disabled) className += ' is-disabled';
        if (this.props.center) className += ' centered';
        if (this.state.isFocused || this.props.value) className += ' floating';
        if (!this.props.label) className += ' no-label';
        if (this.props.prefix) className += ' has-prefix';

        const props = { ...this.props };
        delete props.class;
        delete props.outline;
        delete props.label;
        delete props.value;

        const outline = !!this.props.outline;

        if (!outline) className += ' filled-style';

        return (
            <span class={className}>
                <span class="p-contents">
                    <span class="p-prefix" ref={node => this.prefixNode = node}>
                        {this.props.prefix}
                    </span>
                    <input
                        {...props}
                        id={this.props.id || this.inputID}
                        class="p-input"
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        ref={node => this.inputNode = node}
                        value={this.props.value}
                        placeholder={this.props.placeholder}
                        onInput={e => this.props.onChange(e)} />
                </span>
                <TextFieldDecoration
                    floatingSpring={this.floatingSpring}
                    id={this.props.id || this.inputID}
                    label={this.props.label}
                    inputNode={this.inputNode}
                    prefixNode={this.prefixNode}
                    outline={outline}
                    center={this.props.center} />
                <label class="p-error-label">{this.props.error}</label>
                <label class="p-helper-label">{this.props.helperLabel}</label>
            </span>
        );
    }
}

/**
 * Renders text field decoration.
 * This is a separate component to avoid frequent re-rendering of the main TextField component.
 */
class TextFieldDecoration extends Component {
    static propTypes = {
        label: PropTypes.any.isRequired,
        id: PropTypes.string.isRequired,
        inputNode: PropTypes.any.isRequired,
        prefixNode: PropTypes.any.isRequired,
        floatingSpring: PropTypes.any.isRequired,
        outline: PropTypes.bool.isRequired,
        center: PropTypes.bool.isRequired,
    };

    state = {
        float: 0,
    };

    /**
     * The `<label>` node.
     * @type {Node|null}
     */
    labelNode = null;

    /** Returns the styles for the label node and layout info for the outline break. */
    getLabelStyleAndBreakStyle () {
        // return dummy value if refs haven’t been populated yet
        if (!this.labelNode) return [{}, {}];

        const labelWidth = this.labelNode.offsetWidth;
        const labelHeight = this.labelNode.offsetHeight;
        const inputStyle = getComputedStyle(this.props.inputNode);

        const floatingY = this.props.outline ? -labelHeight * FLOATING_LABEL_SCALE / 2 : 0;
        const fixedY = (parseInt(inputStyle.paddingTop) + parseInt(inputStyle.paddingBottom)) / 2;

        let x = this.props.center
            ? (this.props.inputNode.offsetWidth
                - lerp(labelWidth, labelWidth * FLOATING_LABEL_SCALE, this.state.float)) / 2
            : parseInt(inputStyle.paddingLeft);
        x += this.props.prefixNode.offsetWidth;
        const y = lerp(fixedY, floatingY, this.state.float);
        const scale = lerp(1, FLOATING_LABEL_SCALE, this.state.float);

        const breakX = this.props.center
            ? (this.props.inputNode.offsetWidth - labelWidth * FLOATING_LABEL_SCALE) / 2 - 2
            : x - 2;
        const breakWidth = labelWidth * FLOATING_LABEL_SCALE + 4;

        return [
            {
                transform: `translate(${x}px, ${y}px) scale(${scale})`,
            },
            {
                //           scale (of the two border lines, indicated by +++ here)
                //          v------
                // .------- ++++      ++++ --------
                // |        ·            ·
                // | left   ·   break    ·   right
                // |        ·            ·
                // '------- -------------- --------
                //          |------------|
                //          |    width
                //          x
                x: breakX,
                width: breakWidth,
                scale: 1 - this.state.float,
            },
        ];
    }

    componentDidMount () {
        this.props.floatingSpring.on('update', this.onUpdate);
    }

    componentWillUnmount () {
        this.props.floatingSpring.removeListener('update', this.onUpdate);
    }

    onUpdate = float => this.setState({ float });

    render () {
        const [labelStyle, breakStyle] = this.getLabelStyleAndBreakStyle();

        return (
            <span class="p-decoration">
                <label
                    class="p-label"
                    for={this.props.id}
                    style={labelStyle}
                    ref={node => this.labelNode = node}>
                    {this.props.label}
                </label>
                {this.props.outline ? (
                    <div class="p-outline">
                        <div class="outline-left" style={{ width: breakStyle.x }}></div>
                        <div class="outline-break" style={{ width: breakStyle.width }}>
                            <div
                                class="break-left"
                                style={{ transform: `scaleX(${breakStyle.scale})` }} />
                            <div
                                class="break-right"
                                style={{ transform: `scaleX(${breakStyle.scale})` }} />
                            <div class="break-bottom" />
                        </div>
                        <div class="outline-right"></div>
                    </div>
                ) : (
                    <div class="p-underline">
                        <div class="p-underline-inner" />
                    </div>
                )}
            </span>
        );
    }
}
