import React from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';
import { Spring, lerp, clamp } from '../../../animation';

/**
 * A numeric integer range.
 * Also carries information about whether or not the start and end are exclusive or inclusive.
 */
export class NumericRange {
    constructor (start, end, startInclusive, endInclusive) {
        this.start = start;
        this.end = end;
        this.startInclusive = startInclusive;
        this.endInclusive = endInclusive;
    }

    /** Clones the object. */
    clone () {
        return new NumericRange(this.start, this.end, this.startInclusive, this.endInclusive);
    }

    /**
     * Returns true if the range ends up only containing a single value.
     * @returns {boolean}
     */
    isCollapsed () {
        if (this.start >= this.end) return true;
        if (!this.startInclusive && this.start + 1 >= this.end) return true;
        if (!this.endInclusive && this.start + 1 >= this.end) return true;
        if (!this.startInclusive && !this.endInclusive && this.start + 2 >= this.end) return true;
        return false;
    }

    /**
     * The value to display for when the range is collapsed.
     * @returns {number}
     */
    collapsedValue () {
        return this.startInclusive ? this.start : this.start + 1;
    }

    /**
     * “Normalizes” a collapsed range, so e.g. `2 <= x < 3` turns into `2 <= x <= 2`.
     * @param {string} - the end to collapse towards. Technically, this shouldn’t matter, but since
     *                   dragging is implemented to simply set the value without checking if the
     *                   range is still valid, `start` might end up being greater than `end`. In
     *                   this case, it should collapse to the end the user is dragging.
     */
    normalizeCollapseAtEnd (end) {
        const collapsedValue = end === 'start'
            ? (this.startInclusive ? this.start : this.start + 1)
            : (this.endInclusive ? this.end : this.end - 1);
        this.startInclusive = true;
        this.endInclusive = true;
        this.start = this.end = collapsedValue;
    }
}

const TRACK_COLOR = '#979797';
/** Pin/selection background color. */
const PIN_COLOR = '#31a64f';
/** Pin/selection background color when the control is disabled. */
const DISABLED_PIN_COLOR = '#797979';
/** The color of the focus ring. */
const FOCUS_COLOR = 'rgba(0, 0, 0, 0.2)';
/** The width of the focus ring. */
const FOCUS_WIDTH = 2;
const TEXT_COLOR = '#fff';
/** Exclusion arrow background color. */
const EXCL_COLOR = '#ddd';
/** Text on the exclusion arrow. */
const EXCL_TEXT_COLOR = '#000';
const TRACK_WIDTH = 2;
/** Inset padding on the entire control. */
const PADDING_X = 24;
/** Pin/selection inner padding. */
const PIN_PADDING = 8;
/** The height of the arrow on the collapsed pin. */
const PIN_ARROW_HEIGHT = 4;
/** The width of the tip triangle of the exclusion arrow. */
const EXCL_ARROW_WIDTH = 6;
/** Extra outer padding for the canvas rendering context. */
const CTX_PADDING = 20;

/**
 * Numeric range editor: allows the user to select an integer range.
 *
 * ```
 * expanded range selection:
 *               .--------------.
 *      ---------| 23        59 |---------
 *               '--------------'
 *
 *    _.---.--------
 *   /      \
 *  |   35   >
 *   \      /
 *    ''---'--------
 *    |    <-> exclusion arrow width
 *    '- exclusion
 *
 * collapsed:
 *                     .--.
 *                    | 42 |
 *                     '\/'  <-- pin arrow
 *      ----------------------------------
 * ```
 */
export default class NumericRangeEditor extends React.PureComponent {
    static propTypes = {
        value: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        min: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
        disabled: PropTypes.bool
    };

    state = {
        width: 1,
        height: 1,
        scale: 1,
        focused: false,
        expanded: 0,
        startIncl: 0,
        endIncl: 0
    }

    /**
     * Container node.
     * @type {Node|null}
     */
    node = null;
    /**
     * Canvas node.
     * @type {HTMLCanvasElement|null}
     */
    canvas = null;
    /**
     * Canvas rendering context.
     * @type {CanvasRenderingContext2D|null}
     */
    ctx = null;
    /**
     * Resize observer on the canvas.
     * @type {ResizeObserver}
     */
    resizeObserver = null;

    /**
     * Contains all springs created by `setUpStateSpring`.
     * @type {Spring[]}
     */
    springs = [];

    /**
     * Sets up a spring that controls a field in the `state` object.
     * @param {string} key - key in the state object
     * @param {number} damping - spring parameter
     * @param {number} period - spring parameter
     */
    setUpStateSpring = (key, damping, period) => {
        const spring = new Spring(damping, period);
        spring.on('update', value => {
            this.setState({ [key]: value });
        });
        this.springs.push(spring);
        return spring;
    };

    /**
     * Spring that animates between the pin and the selection.
     * @type {Spring}
     */
    expandedSpring = this.setUpStateSpring('expanded', 0.7, 0.4);
    /**
     * Spring that animates the left exclusion arrow.
     * @type {Spring}
     */
    startInclSpring = this.setUpStateSpring('startIncl', 0.7, 0.4);
    /**
     * Spring that animates the right exclusion arrow.
     * @type {Spring}
     */
    endInclSpring = this.setUpStateSpring('endIncl', 0.7, 0.4);

    // layout information for event handling
    /** Left and right pin frame bounds relative to the canvas node, in pixels. */
    pinBounds = [0, 0];
    /** Widths of the left and right pin labels, in pixels. */
    pinLabelWidths = [0, 0];

    focus () {
        this.node.focus();
    }

    /**
     * Resizes the canvas.
     * @param {number} width
     * @param {number} height
     */
    onResize (width, height) {
        const scale = window.devicePixelRatio || 1;
        this.setState({
            width: Math.round(width),
            height: Math.round(height),
            scale: Math.ceil(scale)
        });
    }

    /**
     * Projects a value from value space to screen space.
     * @param {number} x - value
     * @returns {number} - pixel offset
     */
    projectValue (x) {
        const trackWidth = this.state.width - 2 * PADDING_X;
        const range = this.props.max - this.props.min;
        return (x - this.props.min) * trackWidth / range + PADDING_X;
    }
    /**
     * Projects a value from screen space to value space.
     * @param {number} x - pixel offset
     * @returns {number} - value
     */
    unprojectValue (x) {
        const trackWidth = this.state.width - 2 * PADDING_X;
        const range = this.props.max - this.props.min;
        return Math.round((x - PADDING_X) * range / trackWidth) + this.props.min;
    }

    /**
     * Will be set to an object with drag information when dragging.
     * @type {Object|null}
     */
    drag = null;

    /**
     * Handler for any pointer-down events.
     * @param {number} clientX - pointer position in client coordinates
     * @returns {bool} - true if the event should be considered handled
     */
    onPointerDown (clientX) {
        const nodeRect = this.node.getBoundingClientRect();
        const posX = clientX - nodeRect.left;

        const [left, right] = this.pinBounds;
        if (posX >= left && posX < right) {
            const end = posX < (left + right) / 2 ? 'start' : 'end';
            const value = this.unprojectValue(posX);
            const offset = this.props.value[end] - value;
            this.drag = {
                end,
                offset,
                startPos: this.props.value[end],
                tappedOnLabel: end === 'start'
                    ? (posX - left) < PIN_PADDING + this.pinLabelWidths[0]
                    : (right - posX) < PIN_PADDING + this.pinLabelWidths[1],
                draggedAway: false
            };
            return true;
        }
    }

    /**
     * Handler for any pointer-move events.
     * @param {number} clientX - pointer position in client coordinates
     */
    onPointerMove (clientX) {
        const nodeRect = this.node.getBoundingClientRect();
        const posX = clientX - nodeRect.left;

        const { end, offset, startPos } = this.drag;

        const value = this.props.value.clone();
        value[end] = clamp(this.unprojectValue(posX) + offset, this.props.min, this.props.max);

        if (value[end] !== startPos) {
            this.drag.draggedAway = true;
        }

        if (value.isCollapsed()) value.normalizeCollapseAtEnd(end);

        this.props.onChange(value);
    }

    /** Handler for any pointer-up events. */
    onPointerUp () {
        if (!this.drag.draggedAway && this.drag.tappedOnLabel) {
            // toggle inclusive/exclusive if the user didn’t drag and tapped on one of the ends

            const value = this.props.value.clone();
            if (this.drag.end === 'start') {
                value.startInclusive = !value.startInclusive;
            } else {
                value.endInclusive = !value.endInclusive;
            }
            this.props.onChange(value);
        }
    }

    onMouseDown = e => {
        if (this.onPointerDown(e.clientX)) {
            e.preventDefault();
            window.addEventListener('mousemove', this.onMouseMove);
            window.addEventListener('mouseup', this.onMouseUp);
        }
    };
    onTouchStart = e => {
        if (this.onPointerDown(e.touches[0].clientX)) {
            e.preventDefault();
            window.addEventListener('touchmove', this.onTouchMove, { passive: false });
            window.addEventListener('touchend', this.onTouchEnd);
        }
    };

    onMouseMove = e => {
        e.preventDefault();
        this.onPointerMove(e.clientX);
    };
    onTouchMove = e => {
        e.preventDefault();
        this.onPointerMove(e.touches[0].clientX);
    };

    onMouseUp = () => {
        this.onPointerUp();
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
    };
    onTouchEnd = () => {
        this.onPointerUp();
        window.removeEventListener('touchmove', this.onTouchMove);
        window.removeEventListener('touchend', this.onTouchEnd);
    };

    /** The end that has keyboard focus. */
    focusedEnd = 'start';

    onKeyDown = e => {
        const value = this.props.value.clone();

        // end movement amount
        const amount = e.shiftKey ? 10 : 1;

        if (e.key === 'ArrowLeft') {
            value[this.focusedEnd] = Math.max(this.props.min, value[this.focusedEnd] - amount);
            if (value.isCollapsed()) value.normalizeCollapseAtEnd(this.focusedEnd);
            this.props.onChange(value);
        } else if (e.key === 'ArrowRight') {
            value[this.focusedEnd] = Math.min(value[this.focusedEnd] + amount, this.props.max);
            if (value.isCollapsed()) value.normalizeCollapseAtEnd(this.focusedEnd);
            this.props.onChange(value);
        } else if (e.key === ' ') {
            if (value.isCollapsed()) {
                value.start--;
                value.end++;
                if (value.start < this.props.min) {
                    value.start++;
                    value.end++;
                } else if (value.end > this.props.max) {
                    value.start--;
                    value.end--;
                }
            }
            if (this.focusedEnd === 'start') {
                value.startInclusive = !value.startInclusive;
            } else {
                value.endInclusive = !value.endInclusive;
            }
            this.props.onChange(value);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            this.focusedEnd = this.focusedEnd === 'start' ? 'end' : 'start';
            this.forceUpdate();
        }
    }

    /**
     * Draws a rounded rectangle in the canvas rendering context.
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {number} radius
     */
    drawRoundedRect (x, y, width, height, radius) {
        const ctx = this.ctx;
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x, y, x, y + radius, radius);
        ctx.lineTo(x, y + height - radius);
        ctx.arcTo(x, y + height, x + radius, y + height, radius);
        ctx.lineTo(x + width - radius, y + height);
        ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
        ctx.lineTo(x + width, y + radius);
        ctx.arcTo(x + width, y, x + width - radius, y, radius);
        ctx.closePath();
    }

    /** Renders the control contents in the canvas. */
    renderContents () {
        const { width, height, scale, focused, expanded, startIncl, endIncl } = this.state;
        const ctx = this.ctx;
        const value = this.props.value;
        const disabled = this.props.disabled;

        // IE 11 doesn’t support setTransform so the context needs to be saved and restored
        ctx.save();
        ctx.transform(scale, 0, 0, scale, 0, 0);
        ctx.translate(CTX_PADDING, CTX_PADDING);
        ctx.clearRect(
            -CTX_PADDING,
            -CTX_PADDING,
            width + 2 * CTX_PADDING,
            height + 2 * CTX_PADDING
        );

        // draw track
        ctx.strokeStyle = TRACK_COLOR;
        ctx.lineWidth = TRACK_WIDTH;
        ctx.lineCap = 'round';

        const trackY = lerp(height * 3 / 4, height / 2, expanded);

        ctx.beginPath();
        ctx.moveTo(PADDING_X, trackY);
        ctx.lineTo(width - PADDING_X, trackY);
        ctx.stroke();

        ctx.font = getComputedStyle(this.node).font;
        const fontSize = parseInt(getComputedStyle(this.node).fontSize);

        const collapsedLabel = value.collapsedValue();
        const startLabel = value.start;
        const endLabel = value.end;

        // draw pin
        const collapsedLabelWidth = ctx.measureText(collapsedLabel).width;
        const startLabelWidth = ctx.measureText(startLabel).width;
        const endLabelWidth = ctx.measureText(endLabel).width;

        const pinHeight = lerp(
            Math.max(fontSize, collapsedLabelWidth) + PIN_PADDING,
            fontSize + PIN_PADDING,
            expanded
        );

        const expandedPinWidth = this.projectValue(value.end)
            - this.projectValue(value.start)
            + startLabelWidth
            + endLabelWidth
            + 2 * PIN_PADDING;
        const pinWidth = lerp(
            Math.max(fontSize, collapsedLabelWidth) + PIN_PADDING,
            expandedPinWidth,
            expanded
        );
        const pinX = this.projectValue(value.start)
            + lerp(-pinWidth / 2, -startLabelWidth - PIN_PADDING, expanded);
        const pinY = lerp(trackY - pinHeight - PIN_ARROW_HEIGHT, trackY - pinHeight / 2, expanded);
        const pinRadius = pinHeight / 2;

        this.pinBounds = [pinX, pinX + pinWidth];
        this.pinLabelWidths = value.isCollapsed()
            ? [-Infinity, -Infinity]
            : [startLabelWidth, endLabelWidth];

        ctx.fillStyle = disabled ? DISABLED_PIN_COLOR : PIN_COLOR;
        ctx.save();
        ctx.beginPath();
        this.drawRoundedRect(pinX, pinY, pinWidth, pinHeight, pinRadius);
        ctx.clip();

        ctx.fillRect(pinX, pinY, pinWidth, pinHeight);

        // draw exclusion arrows
        ctx.fillStyle = EXCL_COLOR;
        ctx.beginPath();

        const startArrowTipX = pinX
            + (PIN_PADDING + startLabelWidth + EXCL_ARROW_WIDTH) * (1 - startIncl) * expanded;
        const endArrowTipX = pinX + pinWidth
            - (PIN_PADDING + endLabelWidth + EXCL_ARROW_WIDTH) * (1 - endIncl) * expanded;

        ctx.moveTo(pinX, pinY);
        ctx.lineTo(startArrowTipX - EXCL_ARROW_WIDTH, pinY);
        ctx.lineTo(startArrowTipX, pinY + pinHeight / 2);
        ctx.lineTo(startArrowTipX - EXCL_ARROW_WIDTH, pinY + pinHeight);
        ctx.lineTo(pinX, pinY + pinHeight);

        ctx.moveTo(pinX + pinWidth, pinY);
        ctx.lineTo(endArrowTipX + EXCL_ARROW_WIDTH, pinY);
        ctx.lineTo(endArrowTipX, pinY + pinHeight / 2);
        ctx.lineTo(endArrowTipX + EXCL_ARROW_WIDTH, pinY + pinHeight);
        ctx.lineTo(pinX + pinWidth, pinY + pinHeight);

        ctx.fill();

        ctx.restore();

        // pin arrow
        const arrowAngle = Math.atan((PIN_ARROW_HEIGHT + pinHeight / 2) / pinWidth * 2);
        const arrowDX = Math.sin(arrowAngle) * pinWidth / 2;
        const arrowDY = Math.cos(arrowAngle) * pinWidth / 2;

        if (arrowDY < pinHeight / 2) {
            ctx.beginPath();
            ctx.moveTo(pinX + pinWidth / 2 - arrowDX, pinY + pinHeight / 2 + arrowDY);
            ctx.lineTo(pinX + pinWidth / 2, pinY + pinHeight + PIN_ARROW_HEIGHT);
            ctx.lineTo(pinX + pinWidth / 2 + arrowDX, pinY + pinHeight / 2 + arrowDY);
            ctx.fill();
        }

        // draw focus
        if (focused) {
            ctx.strokeStyle = FOCUS_COLOR;
            ctx.lineWidth = FOCUS_WIDTH;
            const w = FOCUS_WIDTH / 2;

            ctx.globalAlpha = clamp(lerp(1, 0, expanded * 2.5), 0, 1);
            ctx.beginPath();
            this.drawRoundedRect(
                pinX + w,
                pinY + w,
                pinWidth - 2 * w,
                pinHeight - 2 * w,
                pinRadius - w
            );
            ctx.stroke();

            ctx.globalAlpha = clamp(lerp(1, 0, (1 - expanded) * 2.5), 0, 1);
            ctx.beginPath();
            if (this.focusedEnd === 'start') {
                this.drawRoundedRect(
                    pinX + w,
                    pinY + w,
                    2 * PIN_PADDING + startLabelWidth - 2 * w,
                    pinHeight - 2 * w,
                    pinRadius - w
                );
            } else {
                this.drawRoundedRect(
                    pinX + pinWidth - 2 * PIN_PADDING - endLabelWidth + w,
                    pinY + w,
                    2 * PIN_PADDING + endLabelWidth - 2 * w,
                    pinHeight - 2 * w,
                    pinRadius - w
                );
            }
            ctx.stroke();
        }

        // pin text (non-expanded)
        ctx.globalAlpha = clamp(lerp(1, 0, expanded * 2.5), 0, 1);
        ctx.fillStyle = TEXT_COLOR;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(collapsedLabel, pinX + pinWidth / 2, pinY + pinHeight / 2);

        // pin text (expanded)
        const expandedAlpha = clamp(lerp(1, 0, (1 - expanded) * 2.5), 0, 1);

        ctx.textAlign = 'left';
        ctx.fillStyle = TEXT_COLOR;
        ctx.globalAlpha = clamp(startIncl, 0, 1) * expandedAlpha;
        ctx.fillText(startLabel, pinX + PIN_PADDING, pinY + pinHeight / 2);
        ctx.fillStyle = EXCL_TEXT_COLOR;
        ctx.globalAlpha = (1 - clamp(startIncl, 0, 1)) * expandedAlpha;
        ctx.fillText(startLabel, pinX + PIN_PADDING, pinY + pinHeight / 2);

        ctx.textAlign = 'right';
        ctx.fillStyle = TEXT_COLOR;
        ctx.globalAlpha = clamp(endIncl, 0, 1) * expandedAlpha;
        ctx.fillText(endLabel, pinX + pinWidth - PIN_PADDING, pinY + pinHeight / 2);
        ctx.fillStyle = EXCL_TEXT_COLOR;
        ctx.globalAlpha = (1 - clamp(endIncl, 0, 1)) * expandedAlpha;
        ctx.fillText(endLabel, pinX + pinWidth - PIN_PADDING, pinY + pinHeight / 2);

        ctx.restore();
    }

    componentDidMount () {
        this.node.addEventListener('touchstart', this.onTouchStart, { passive: false });
        this.resizeObserver = new ResizeObserver(entries => {
            const entry = entries[0];
            this.onResize(entry.contentRect.width, entry.contentRect.height);
        });
        this.resizeObserver.observe(this.node);
        this.ctx = this.canvas.getContext('2d');
        this.updateStateSprings(true);
        const nodeRect = this.node.getBoundingClientRect();
        this.onResize(nodeRect.width, nodeRect.height);
        this.renderContents();
    }

    componentWillUnmount () {
        this.node.removeEventListener('touchstart', this.onTouchStart);
        this.resizeObserver.disconnect();
        for (const spring of this.springs) {
            spring.stop();
        }
    }

    /**
     * Updates the spring targets from the current component state.
     * @param {?boolean} skipAnimation - if true, will skip animating to the new state
     */
    updateStateSprings (skipAnimation) {
        this.expandedSpring.target = this.props.value.isCollapsed() ? 0 : 1;
        this.startInclSpring.target = this.props.value.startInclusive ? 1 : 0;
        this.endInclSpring.target = this.props.value.endInclusive ? 1 : 0;

        this.expandedSpring.start();
        this.startInclSpring.start();
        this.endInclSpring.start();

        if (skipAnimation) {
            this.expandedSpring.finish();
            this.startInclSpring.finish();
            this.endInclSpring.finish();
        }
    }

    componentDidUpdate (prevProps) {
        if (prevProps.value !== this.props.value) {
            this.updateStateSprings();
        }

        this.renderContents();
    }

    render () {
        return (
            <span className="numeric-range-editor"
                ref={node => this.node = node}
                tabIndex="0"
                onFocus={() => this.setState({ focused: true })}
                onBlur={() => this.setState({ focused: false })}
                onKeyDown={this.onKeyDown}
                onMouseDown={this.onMouseDown}>
                <canvas
                    style={{
                        pointerEvents: 'none',
                        marginTop: -CTX_PADDING,
                        marginLeft: -CTX_PADDING,
                        width: this.state.width + 2 * CTX_PADDING,
                        height: this.state.height + 2 * CTX_PADDING
                    }}
                    ref={node => this.canvas = node}
                    width={(this.state.width + 2 * CTX_PADDING) * this.state.scale}
                    height={(this.state.height + 2 * CTX_PADDING) * this.state.scale} />
            </span>
        );
    }
}
