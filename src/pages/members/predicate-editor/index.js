import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import locale from '../../../locale';
import StringEditor from './string';
import NumericRangeEditor, { NumericRange } from './range';

/** Field descriptions */
const FIELDS = {
    name: {
        type: 'string',
        default () {
            return '';
        }
    },
    oldCode: {
        type: 'string',
        default () {
            return '';
        }
    },
    newCode: {
        type: 'string',
        default () {
            return '';
        }
    },
    age: {
        type: 'range',
        min: 0,
        max: 150,
        needsSwitch: true,
        default () {
            return new NumericRange(0, 35, true, true);
        }
    }
};

/** Returns the list of default fields. */
export function defaultFields () {
    return Object.keys(FIELDS)
        .map(field => ({
            field,
            enabled: false,
            value: FIELDS[field].default()
        }));
}

/** A single predicate editor. */
export default class PredicateEditor extends React.PureComponent {
    static propTypes = {
        field: PropTypes.string.isRequired,
        enabled: PropTypes.bool.isRequired,
        value: PropTypes.any.isRequired,
        onChange: PropTypes.func.isRequired,
        onEnabledChange: PropTypes.func.isRequired,
        submitted: PropTypes.bool.isRequired
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
        let editor = 'error';

        const field = FIELDS[this.props.field];

        const editorProps = {
            ref: node => this.editorRef = node,
            value: this.props.value,
            onChange: value => {
                this.props.onChange(value);
                if (!field.needsSwitch) {
                    this.props.onEnabledChange(!!value);
                }
            },
            disabled: field.needsSwitch && !this.props.enabled
        };

        switch (field.type) {
        case 'string':
            editor = <StringEditor {...editorProps} />;
            break;
        case 'range':
            editor = <NumericRangeEditor
                min={field.min}
                max={field.max}
                {...editorProps} />;
            break;
        }

        let className = 'predicate';
        if (!this.props.enabled) className += ' disabled';

        return (
            <div className={className} ref={node => this.node = node}>
                <Checkbox
                    className="predicate-checkbox"
                    checked={this.props.enabled}
                    disabled={!field.needsSwitch || this.props.submitted}
                    onChange={(e, checked) => this.props.onEnabledChange(checked)} />
                <div className="predicate-field">
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
