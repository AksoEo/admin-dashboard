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
}

const TRACK_COLOR = '#979797';
const PIN_COLOR = '#31a64f';
const TEXT_COLOR = '#fff';
const EXCL_COLOR = '#ddd';
const EXCL_TEXT_COLOR = '#000';
const TRACK_WIDTH = 2;
const PADDING_X = 4;
const PIN_PADDING = 8;
const PIN_ARROW_HEIGHT = 4;
const EXCL_ARROW_WIDTH = 6;

export default class NumericRangeEditor extends React.PureComponent {
    static propTypes = {
        value: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired
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

    projectValue (x) {
        return x;
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
        const startLabelWidth = ctx.measureText(value.start).width;
        const endLabelWidth = ctx.measureText(value.end).width;

        const pinHeight = lerp(startLabelWidth + PIN_PADDING, fontSize + PIN_PADDING, expanded);

        const expandedPinWidth = this.projectValue(value.end)
            - this.projectValue(value.start)
            + startLabelWidth
            + endLabelWidth
            + 4 * PIN_PADDING;
        const pinWidth = lerp(startLabelWidth + PIN_PADDING, expandedPinWidth, expanded);
        const pinX = this.projectValue(value.start) + lerp(0, -startLabelWidth, expanded);
        const pinY = lerp(trackY - pinHeight - PIN_ARROW_HEIGHT, trackY - pinHeight / 2, expanded);
        const pinRadius = pinHeight / 2;

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

        // pin text (non-expanded)
        ctx.globalAlpha = clamp(lerp(1, 0, expanded * 2.5), 0, 1);
        ctx.fillStyle = TEXT_COLOR;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value.start, pinX + pinWidth / 2, pinY + pinHeight / 2);

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
                onKeyDown={e => {
                    // for debugging
                    // TODO: remove this
                    const value = this.props.value.clone();
                    if (e.key === 'j') {
                        value.end--;
                        this.props.onChange(value);
                    } else if (e.key === 'k') {
                        value.end++;
                        this.props.onChange(value);
                    } else if (e.key === 's') {
                        value.start--;
                        this.props.onChange(value);
                    } else if (e.key === 'd') {
                        value.start++;
                        this.props.onChange(value);
                    } else if (e.key === 'a') {
                        value.startInclusive = !value.startInclusive;
                        this.props.onChange(value);
                    } else if (e.key === 'l') {
                        value.endInclusive = !value.endInclusive;
                        this.props.onChange(value);
                    }
                }}>
            </canvas>
        );
    }
}
