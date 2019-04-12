import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import './style';

/** @jsx h */

/** Circle radius for the progress indicator. */
const CIRCLE_RADIUS = 16;

/** Circle radius for the small progress indicator. */
const CIRCLE_RADIUS_SMALL = 8;

/** Size of the circular progress indicator. */
const CIRCULAR_PROGRESS_SIZE = 48;

/** Size of the small circular progress indicator. */
const CIRCULAR_PROGRESS_SIZE_SMALL = 24;

/**
 * A material circular progress indicator. Can be determinate or indeterminate.
 *
 * This component is part of a series of lightweight material components that don’t depend on 40 kB
 * material-ui boilerplate.
 */
export class CircularProgressIndicator extends Component {
    static propTypes = {
        /** If true, the progress indicator will spin around instead of showing a definite value. */
        indeterminate: PropTypes.bool,
        /** The progress value. Ignored if `indeterminate` is true. */
        progress: PropTypes.number,
        /** If true, the progress indicator will be 24×24 instead of 48×48. */
        small: PropTypes.bool,
    };

    /**
     * Returns SVG path data for a clockwise arc that begins at sweepStart and ends at sweepEnd.
     * @param {number} sweepStart - start angle in radians
     * @param {number} sweepEnd   - end angle in radians
     * @returns {string} SVG `d` contents
     */
    getPathForArcAngles (sweepStart, sweepEnd) {
        const radius = this.props.small ? CIRCLE_RADIUS_SMALL : CIRCLE_RADIUS;
        const halfSize = (this.props.small
            ? CIRCULAR_PROGRESS_SIZE_SMALL : CIRCULAR_PROGRESS_SIZE) / 2;
        const startX = halfSize + Math.cos(sweepStart) * radius;
        const startY = halfSize + Math.sin(sweepStart) * radius;
        const endX = halfSize + Math.cos(sweepEnd) * radius;
        const endY = halfSize + Math.sin(sweepEnd) * radius;

        const largeArcFlag = sweepEnd > sweepStart + Math.PI ? '1' : '0';

        return [
            `M ${startX} ${startY}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        ].join(' ');
    }

    render () {
        const props = {...this.props};
        delete props.indeterminate;
        delete props.progress;
        delete props.small;

        props.class = (props.class || '') + ' paper-circular-progress-indicator';
        if (this.props.small) props.class += ' small';
        if (this.props.indeterminate) props.class += ' indeterminate';

        const size = this.props.small ? CIRCULAR_PROGRESS_SIZE_SMALL : CIRCULAR_PROGRESS_SIZE;
        const radius = this.props.small ? CIRCLE_RADIUS_SMALL : CIRCLE_RADIUS;

        return (
            <span {...props}>
                <svg class="p-inner">
                    {this.props.indeterminate ? (
                        <g class="p-rotation">
                            <g class="p-stage">
                                <circle
                                    class="p-indeterminate"
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius} />
                            </g>
                        </g>
                    ) : (
                        <path
                            class="p-path"
                            d={this.getPathForArcAngles(
                                -Math.PI / 2,
                                this.props.progress * Math.PI * 2 - Math.PI / 2
                            )} />
                    )}
                </svg>
            </span>
        );
    }
}
