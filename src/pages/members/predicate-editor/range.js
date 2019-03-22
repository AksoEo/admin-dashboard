import React from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';
import { Spring, lerp, clamp } from '../../../animation';

/** @jsx React.createElement */

export class NumericRange {
    constructor (start, end, startInclusive, endInclusive) {
        this.start = start;
        this.end = end;
        this.startInclusive = startInclusive;
        this.endInclusive = endInclusive;
    }

    clone () {
        return new NumericRange(this.start, this.end, this.startInclusive, this.endInclusive);
    }

    isCollapsed () {
        if (this.start >= this.end) return true;
        if (!this.startInclusive && this.start + 1 >= this.end) return true;
        if (!this.endInclusive && this.start + 1 >= this.end) return true;
        if (!this.startInclusive && !this.endInclusive && this.start + 2 >= this.end) return true;
        return false;
    }

    collapsedValue () {
        return this.startInclusive ? this.start : this.start + 1;
    }

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
const PIN_COLOR = '#31a64f';
const FOCUS_COLOR = 'rgba(0, 0, 0, 0.2)';
const FOCUS_WIDTH = 2;
const TEXT_COLOR = '#fff';
const EXCL_COLOR = '#ddd';
const EXCL_TEXT_COLOR = '#000';
const TRACK_WIDTH = 2;
const PADDING_X = 24;
const PIN_PADDING = 8;
const PIN_ARROW_HEIGHT = 4;
const EXCL_ARROW_WIDTH = 6;

/**
 * Numeric range editor: allows the user to select an integer range.
 *
 * ```
 * expanded:
 *               .--------------.
 *      ---------| 23        59 |---------
 *               '--------------'
 *
 * collapsed:
 *                     .--.
 *                    | 42 |
 *                     '\/'
 *      ----------------------------------
 * ```
 */
export default class NumericRangeEditor extends React.PureComponent {
    static propTypes = {
        value: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        min: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired
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

    node = null;
    ctx = null;
    resizeObserver = null;

    springs = [];

    setUpStateSpring = (key, damping, period) => {
        const spring = new Spring(damping, period);
        spring.on('update', value => {
            this.setState({ [key]: value });
        });
        this.springs.push(spring);
        return spring;
    };

    expandedSpring = this.setUpStateSpring('expanded', 0.7, 0.4);
    startInclSpring = this.setUpStateSpring('startIncl', 0.7, 0.4);
    endInclSpring = this.setUpStateSpring('endIncl', 0.7, 0.4);

    // layout information for event handling
    /** Left and right pin bounds. */
    pinBounds = [0, 0];
    /** Widths of the left and right pin labels. */
    pinLabelWidths = [0, 0];

    focus () {
        this.node.focus();
    }

    onResize (width, height) {
        const scale = window.devicePixelRatio || 1;
        this.setState({
            width: Math.round(width),
            height: Math.round(height),
            scale: Math.ceil(scale)
        });
    }

    /** Projects a value from value space to screen space. */
    projectValue (x) {
        const trackWidth = this.state.width - 2 * PADDING_X;
        const range = this.props.max - this.props.min;
        return (x - this.props.min) * trackWidth / range + PADDING_X;
    }
    /** Projects a value from screen space to value space. */
    unprojectValue (x) {
        const trackWidth = this.state.width - 2 * PADDING_X;
        const range = this.props.max - this.props.min;
        return Math.round((x - PADDING_X) * range / trackWidth) + this.props.min;
    }

    /** Will be set to an object with drag information when dragging. */
    drag = null;

    /**
     * Handler for any pointer events.
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

    onPointerUp () {
        if (!this.drag.draggedAway && this.drag.tappedOnLabel) {
            // toggle inclusive/exclusive

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
            window.addEventListener('touchmove', this.onTouchMove);
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
    onTouchUp = () => {
        this.onPointerUp();
        window.removeEventListener('touchmove', this.onTouchMove);
        window.removeEventListener('touchend', this.onTouchEnd);
    };

    /** The end that has keyboard focus. */
    focusedEnd = 'start';

    onKeyDown = e => {
        const value = this.props.value.clone();

        if (e.key === 'ArrowLeft') {
            value[this.focusedEnd] = Math.max(this.props.min, value[this.focusedEnd] - 1);
            if (value.isCollapsed()) value.normalizeCollapseAtEnd(this.focusedEnd);
            this.props.onChange(value);
        } else if (e.key === 'ArrowRight') {
            value[this.focusedEnd] = Math.min(value[this.focusedEnd] + 1, this.props.max);
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

    renderContents () {
        const { width, height, scale, focused, expanded, startIncl, endIncl } = this.state;
        const ctx = this.ctx;
        const value = this.props.value;

        // IE 11 doesn’t support setTransform so the context needs to be saved and restored
        ctx.save();
        ctx.transform(scale, 0, 0, scale, 0, 0);
        ctx.clearRect(0, 0, width, height);

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

        // draw pin
        const collapsedLabelWidth = ctx.measureText(value.collapsedValue()).width;
        const startLabelWidth = ctx.measureText(value.start).width;
        const endLabelWidth = ctx.measureText(value.end).width;

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

        ctx.fillStyle = PIN_COLOR;
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
        ctx.fillText(value.collapsedValue(), pinX + pinWidth / 2, pinY + pinHeight / 2);

        // pin text (expanded)
        const expandedAlpha = clamp(lerp(1, 0, (1 - expanded) * 2.5), 0, 1);

        ctx.textAlign = 'left';
        ctx.fillStyle = TEXT_COLOR;
        ctx.globalAlpha = clamp(startIncl, 0, 1) * expandedAlpha;
        ctx.fillText(value.start, pinX + PIN_PADDING, pinY + pinHeight / 2);
        ctx.fillStyle = EXCL_TEXT_COLOR;
        ctx.globalAlpha = (1 - clamp(startIncl, 0, 1)) * expandedAlpha;
        ctx.fillText(value.start, pinX + PIN_PADDING, pinY + pinHeight / 2);

        ctx.textAlign = 'right';
        ctx.fillStyle = TEXT_COLOR;
        ctx.globalAlpha = clamp(endIncl, 0, 1) * expandedAlpha;
        ctx.fillText(value.end, pinX + pinWidth - PIN_PADDING, pinY + pinHeight / 2);
        ctx.fillStyle = EXCL_TEXT_COLOR;
        ctx.globalAlpha = (1 - clamp(endIncl, 0, 1)) * expandedAlpha;
        ctx.fillText(value.end, pinX + pinWidth - PIN_PADDING, pinY + pinHeight / 2);

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    componentDidMount () {
        this.resizeObserver = new ResizeObserver(entries => {
            const entry = entries[0];
            this.onResize(entry.contentRect.width, entry.contentRect.height);
        });
        this.resizeObserver.observe(this.node);
        this.ctx = this.node.getContext('2d');
        this.renderContents();
    }

    componentWillUnmount () {
        this.resizeObserver.disconnect();
        for (const spring of this.springs) {
            spring.stop();
        }
    }

    componentDidUpdate (prevProps) {
        if (prevProps.value !== this.props.value) {
            this.expandedSpring.target = this.props.value.isCollapsed() ? 0 : 1;
            this.startInclSpring.target = this.props.value.startInclusive ? 1 : 0;
            this.endInclSpring.target = this.props.value.endInclusive ? 1 : 0;

            this.expandedSpring.start();
            this.startInclSpring.start();
            this.endInclSpring.start();
        }

        this.renderContents();
    }

    render () {
        return (
            <canvas
                className="numeric-range-editor"
                ref={node => this.node = node}
                tabIndex="0"
                width={this.state.width * this.state.scale}
                height={this.state.height * this.state.scale}
                onFocus={() => this.setState({ focused: true })}
                onBlur={() => this.setState({ focused: false })}
                onKeyDown={this.onKeyDown}
                onMouseDown={this.onMouseDown}
                onTouchStart={this.onTouchStart}>
            </canvas>
        );
    }
}
