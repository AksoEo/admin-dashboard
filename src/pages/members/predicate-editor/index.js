import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import RemoveIcon from '@material-ui/icons/Remove';
import locale from '../../../locale';
import StringEditor from './string';
import NumericRangeEditor, { NumericRange } from './range';

/** Field descriptions */
const FIELDS = {
    age: {
        type: 'range',
        min: 0,
        max: 150,
        default () {
            return new NumericRange(0, 35, true, true);
        }
    }
};

/**
 * A predicate editor: manages a list of editable predicates and an input to add more.
 */
export default class PredicateEditor extends React.PureComponent {
    static propTypes = {
        value: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired,
        placeholder: PropTypes.string.isRequired,
        addPlaceholder: PropTypes.string.isRequired
    };

    predicateRefs = [];

    /** If set, will focus the predicate with the given index. */
    itemToFocus = null;

    /** Downshift interface */
    downshift = null;

    /**
     * Adds a predicate for the given field.
     * @param {string} fieldName - the key in `FIELDS`
     */
    addPredicate = (fieldName) => {
        const field = FIELDS[fieldName];

        if (field) {
            const items = this.props.value.slice();
            items.push({
                field: fieldName,
                value: field.default()
            });
            this.props.onChange(items);
            this.downshift.clearSelection();
            this.itemToFocus = items.length - 1;
        }
    };

    componentDidUpdate () {
        if (this.itemToFocus !== null && this.predicateRefs[this.itemToFocus]) {
            this.predicateRefs[this.itemToFocus].focus();
            this.itemToFocus = null;
        }
    }

    render () {
        const predicates = [];
        const existingFields = [];
        let i = 0;
        for (const item of this.props.value) {
            existingFields.push(item.field);
            const index = i++;
            predicates.push(
                <Predicate
                    key={index}
                    ref={node => this.predicateRefs[index] = node}
                    value={item}
                    onChange={item => {
                        const items = this.props.value.slice();
                        items[index] = item;
                        this.props.onChange(items);
                    }}
                    onRemove={() => {
                        const items = this.props.value.slice();
                        items.splice(index, 1);
                        this.props.onChange(items);
                    }} />
            );
        }

        // GC predicate refs
        while (this.predicateRefs.length > this.props.value.length) {
            this.predicateRefs.pop();
        }

        const fieldsLeftToAdd = Object.keys(FIELDS)
            .filter(field => !existingFields.includes(field));

        const addPredicate = fieldsLeftToAdd.length ? (
            <div className="add-predicate">
                {fieldsLeftToAdd
                    .map(field => (
                        <button key={field} className="add-predicate-field" onClick={() => {
                            this.addPredicate(field);
                        }}>
                            {locale.members.search.fields[field]}
                        </button>
                    ))}
            </div>
        ) : null;

        return (
            <div className="predicate-editor">
                <div className="predicate-editor-title">
                    {locale.members.search.predicates}
                </div>
                {predicates}
                {addPredicate}
            </div>
        );
    }
}

/** A single predicate. */
class Predicate extends React.PureComponent {
    static propTypes = {
        value: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onRemove: PropTypes.func.isRequired
    };

    editorRef = null;

    focus () {
        this.editorRef.focus();
    }

    render () {
        let editor = 'error';

        const editorProps = {
            ref: node => this.editorRef = node,
            value: this.props.value.value,
            onChange: value => {
                const v = { ...this.props.value };
                v.value = value;
                this.props.onChange(v);
            }
        };

        const field = FIELDS[this.props.value.field];
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

        return (
            <div className="predicate">
                <IconButton className="predicate-remove" onClick={this.props.onRemove}>
                    <RemoveIcon />
                </IconButton>
                <div className="predicate-field">
                    {locale.members.search.fields[this.props.value.field]}:
                </div>
                {editor}
            </div>
        );
    }
}
