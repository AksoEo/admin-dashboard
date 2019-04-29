import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import locale from '../../../../locale';
import { FILTERABLE_FIELDS } from './fields';
import StringEditor from './string';
import NumericRangeEditor from './range';
import BooleanEditor from './boolean';

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
    editorRef = null;

    focus () {
        this.editorRef.focus();
    }

    render () {
        let editor = '?';

        const field = FILTERABLE_FIELDS[this.props.field];

        const editorProps = {
            ref: node => this.editorRef = node,
            value: this.props.value,
            onChange: value => {
                this.props.onChange(value);
                if (!(field.needsSwitch)) {
                    this.props.onEnabledChange(!field.isNone(value));
                }
            },
            disabled: !!(field.needsSwitch) && !this.props.enabled,
        };

        switch (field.type) {
        case 'string':
            editor = <StringEditor
                placeholder={locale.members.search.fieldPlaceholders[this.props.field]}
                {...editorProps} />;
            break;
        case 'range':
            editor = <NumericRangeEditor
                min={field.min}
                max={field.max}
                {...editorProps} />;
            break;
        case 'age-range':
            editor = (
                <div className="age-range">
                    <NumericRangeEditor
                        min={field.min}
                        max={field.max}
                        {...editorProps}
                        value={this.props.value.range}
                        onChange={value => {
                            editorProps.onChange({ ...this.props.value, range: value });
                        }} />
                    <BooleanEditor
                        labelKey="agePrime"
                        {...editorProps}
                        value={this.props.value.atStartOfYear}
                        onChange={value => {
                            editorProps.onChange({ ...this.props.value, atStartOfYear: value });
                        }} />
                </div>
            );
            break;
        case 'existence':
            editor = <BooleanEditor labelKey="existence" {...editorProps} />;
            break;
        case 'boolean':
            editor = <BooleanEditor labelKey="boolean" {...editorProps} />;
            break;
        case 'codeholderType':
            editor = (
                <div className="codeholder-type">
                    <BooleanEditor
                        labelKey="codeholderTypeHuman"
                        {...editorProps}
                        value={this.props.value.human}
                        onChange={human => editorProps.onChange({ ...this.props.value, human })} />
                    <BooleanEditor
                        labelKey="codeholderTypeOrg"
                        {...editorProps}
                        value={this.props.value.org}
                        onChange={org => editorProps.onChange({ ...this.props.value, org })} />
                </div>
            );
            break;
        }

        let className = 'predicate';
        if (!this.props.enabled) className += ' disabled';

        const userCanToggleEnabled = (field.needsSwitch) && !this.props.submitted;

        return (
            <div className={className} ref={node => this.node = node}>
                {this.props.submitted ? (
                    this.props.isLast ? (
                        // seemingly useless button as a fake target for the container click
                        // event in the search input
                        <IconButton
                            className="predicate-expand"
                            aria-label={locale.members.search.expand}>
                            <KeyboardArrowDownIcon />
                        </IconButton>
                    ) : <div className="predicate-checkbox-placeholder" />
                ) : (
                    <Checkbox
                        className="predicate-checkbox"
                        checked={this.props.enabled}
                        disabled={!userCanToggleEnabled}
                        onChange={(e, checked) => this.props.onEnabledChange(checked)} />
                )}
                <div className="predicate-field" onClick={() => {
                    // also toggle enabled state when clicking on the label
                    if (userCanToggleEnabled) {
                        this.props.onEnabledChange(!this.props.enabled);
                    }
                }}>
                    {locale.members.search.fields[this.props.field]}:
                </div>
                <div className="predicate-editor" onClick={e => {
                    if (this.props.submitted) e.stopPropagation();
                }}>
                    {editor}
                </div>
            </div>
        );
    }
}
