import React from 'react';
import PropTypes from 'prop-types';
import Switch from '@material-ui/core/Switch';
import locale from '../../../locale';

/**
 * A simple boolean existence editor input.
 *
 * Will display a material switch and text beside it (one of “has it” or “does not have it” to
 * indicate the current state.
 */
export default class ExistenceEditor extends React.PureComponent {
    static propTypes = {
        value: PropTypes.bool.isRequired,
        onChange: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
    };

    inputRef = null;

    focus () {
        this.inputRef.focus();
    }

    render () {
        let className = 'existence-editor';
        if (this.props.disabled) className += ' disabled';

        return (
            <div className={className}>
                <Switch
                    inputRef={node => this.inputRef = node}
                    checked={this.props.value}
                    onChange={e => this.props.onChange(e.target.checked)} />
                <label>
                    {this.props.value
                        ? locale.members.search.existence.yes
                        : locale.members.search.existence.no}
                </label>
            </div>
        );
    }
}
