import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import locale from '../../../../locale';
import { FILTERABLE_FIELDS } from './fields';
import editors from './editors';

/** Creates a list of filterable fields with their default values. */
export function filterableFields () {
    return Object.keys(FILTERABLE_FIELDS)
        .map(field => ({
            field,
            enabled: false,
            value: FILTERABLE_FIELDS[field].default(),
        }));
}

/** A single predicate editor. */
export default class PredicateEditor extends React.PureComponent {
    static propTypes = {
        /** The field ID. */
        field: PropTypes.string.isRequired,
        enabled: PropTypes.bool.isRequired,
        value: PropTypes.any.isRequired,
        onChange: PropTypes.func.isRequired,
        onEnabledChange: PropTypes.func.isRequired,
        /** Should be set to true if the form was submitted and the checkboxes should be hidden. */
        submitted: PropTypes.bool.isRequired,
        /** Will show a down arrow if submitted and true. */
        isLast: PropTypes.bool.isRequired,
    };

    /**
     * The DOM node.
     * @type {Node|null}
     */
    node = null;

    render () {
        let editor = '?';

        const field = FILTERABLE_FIELDS[this.props.field];
        const userCanToggleEnabled = (field.needsSwitch && !field.invisibleSwitch)
            && !this.props.submitted;

        const fieldHeader = (
            <div className="predicate-field-header">
                {(field.needsSwitch && !field.invisibleSwitch && !this.props.submitted) ? (
                    <Checkbox
                        className="predicate-checkbox"
                        checked={this.props.enabled}
                        disabled={!userCanToggleEnabled}
                        onChange={(e, checked) => this.props.onEnabledChange(checked)} />
                ) : <div className="predicate-checkbox-placeholder" />}
                <div className="predicate-field" onClick={() => {
                    // also toggle enabled state when clicking on the label
                    if (userCanToggleEnabled) {
                        this.props.onEnabledChange(!this.props.enabled);
                    }
                }}>
                    {locale.members.search.fields[this.props.field]}
                </div>
            </div>
        );

        const editorProps = {
            field: field,
            fieldHeader,
            value: this.props.value,
            onChange: value => {
                this.props.onChange(value);
                if (!(field.needsSwitch)) {
                    this.props.onEnabledChange(!field.isNone(value));
                }
            },
            enabled: this.props.enabled,
            onEnabledChange: this.props.onEnabledChange,
            disabled: !!(field.needsSwitch) && !this.props.enabled,
        };

        const Editor = editors[this.props.field];
        if (Editor) {
            editor = <Editor {...editorProps} />;
        } else editor = fieldHeader;

        let className = 'predicate';
        if (!this.props.enabled) className += ' disabled';

        return (
            <div className={className} ref={node => this.node = node} onClick={e => {
                if (this.props.submitted) e.stopPropagation();
            }}>
                {editor}
            </div>
        );
    }
}
