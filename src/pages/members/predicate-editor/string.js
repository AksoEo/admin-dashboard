import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';

/** @jsx React.createElement */

/** A simple string editor input. */
export default class StringEditor extends React.PureComponent {
    static propTypes = {
        value: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired
    };

    inputRef = null;

    focus () {
        this.inputRef.focus();
    }

    render () {
        return (
            <TextField
                className="string-editor"
                inputRef={node => this.inputRef = node}
                value={this.props.value}
                onChange={e => this.props.onChange(e.target.value)} />
        );
    }
}
