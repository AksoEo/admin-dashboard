import React from 'react';
import PropTypes from 'prop-types';
import { Spring, lerp } from '../animation';
import './segmented.less';

/**
 * A segmented selection control (see iOS).
 * Apparently these are not part of Material Design but they’re too convenient not to be used.
 *
 * Pass an array of objects as its children like so:
 *
 * ```js
 * <Segmented>
 *     {[
 *         {
 *             id: 'option-1',
 *             label: 'Option 1',
 *         },
 *     ]}
 * </Segmented>
 * ```
 */
export default class Segmented extends React.PureComponent {
    static propTypes = {
        /**
         * A list of objects with the following properties:
         *
         * - `id`: a unique identifier that will be used for the `selected` prop
         * - `label`: a label string or component
         * - `disabled`: if true, will render it disabled
         */
        children: PropTypes.arrayOf(PropTypes.object).isRequired,

        /** The selected option’s id. */
        selected: PropTypes.string,

        /** Callback for when an option is selected. */
        onSelect: PropTypes.func.isRequired,
    };

    state = {
        backgroundPos: 0,
    }

    /** Animates the background rectangle while it’s moving. */
    backgroundPos = new Spring(0.85, 0.4);
    node = null;
    /** Child refs used to get rectangle sizes for the background animation. */
    childRefs = [];

    constructor (props) {
        super(props);

        this.backgroundPos.on('update', backgroundPos => this.setState({ backgroundPos }));
    }

    componentDidMount () {
        // set background value so it doesn’t glitch when pressed
        let targetPos = -1;
        for (let i = 0; i < this.props.children.length; i++) {
            if (this.props.children[i].id === this.props.selected) {
                targetPos = i;
                break;
            }
        }
        this.backgroundPos.value = this.backgroundPos.target = targetPos;
        this.setState({ backgroundPos: targetPos });
    }

    componentWillUpdate (newProps) {
        if (newProps.selected !== this.props.selected
            || newProps.children.length !== this.props.children.length) {
            // set new background target because either the selected item or the number of children
            // changed
            let targetPos = -1;
            for (let i = 0; i < newProps.children.length; i++) {
                if (newProps.children[i].id === newProps.selected) {
                    targetPos = i;
                    break;
                }
            }
            this.backgroundPos.target = targetPos;
            if (this.backgroundPos.wantsUpdate()) {
                this.backgroundPos.start();
            }
        }
    }

    componentWillUnmount () {
        this.backgroundPos.stop();
    }

    render () {
        const idleBackgroundPos = !(this.backgroundPos.wantsUpdate() && this.node);

        let animatedBackground = null;
        if (!idleBackgroundPos) {
            const nodeRect = this.node.getBoundingClientRect();
            let left = Math.floor(this.state.backgroundPos);
            let right = Math.ceil(this.state.backgroundPos);

            while (left < 0) {
                left++;
                right++;
            }
            while (right >= this.props.children.length) {
                left--;
                right--;
            }

            const p = this.state.backgroundPos - left;

            const leftRect = this.childRefs[left] && this.childRefs[left].getBoundingClientRect();
            const rightRect = this.childRefs[right] && this.childRefs[right].getBoundingClientRect();

            if (leftRect && rightRect) {
                const dx = lerp(leftRect.left, rightRect.left, p) - nodeRect.left;
                const dy = lerp(leftRect.top, rightRect.top, p) - nodeRect.top;
                const width = lerp(leftRect.width, rightRect.width, p);
                const height = lerp(leftRect.height, rightRect.height, p);
                const styleWidth = Math.round(width);
                const styleHeight = Math.round(height);
                const sx = styleWidth / width;
                const sy = styleHeight / height;
                const transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
                const style = { transform, width: styleWidth, height: styleHeight };
                animatedBackground = <div className="segmented-control-background" style={style} />;
            }
        }

        const options = this.props.children.map((option, index) => {
            let className = 'segmented-control-option';
            if (option.id === this.props.selected) {
                className += ' selected';
                if (!idleBackgroundPos) className += ' hidden-background';
            }
            return (
                <button
                    key={option.id}
                    className={className}
                    role="radio"
                    aria-checked={option.id === this.props.selected}
                    disabled={option.disabled}
                    onClick={() => !option.disabled && this.props.onSelect(option.id)}
                    ref={node => this.childRefs[index] = node}>
                    {option.label}
                </button>
            );
        });

        // drop excess child refs
        this.childRefs.splice(this.props.children.length);

        return (
            <div className="segmented-control" ref={node => this.node = node}>
                {animatedBackground}
                {options}
            </div>
        );
    }
}
