import React from 'react';
import PropTypes from 'prop-types';
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
        children: PropTypes.arrayOf(PropTypes.object).isRequired,

        /** The selected option’s id. */
        selected: PropTypes.string,

        /** Callback for when an option is selected. */
        onSelect: PropTypes.func.isRequired,
    };

    render () {
        const options = this.props.children.map(option => {
            let className = 'segmented-control-option';
            if (option.id === this.props.selected) className += ' selected';
            return (
                <button
                    key={option.id}
                    className={className}
                    role="radio"
                    aria-checked={option.id === this.props.selected}
                    onClick={() => this.props.onSelect(option.id)}>
                    {option.label}
                </button>
            );
        });

        return (
            <div className="segmented-control">
                {options}
            </div>
        );
    }
}
