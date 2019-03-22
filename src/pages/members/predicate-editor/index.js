import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import RemoveIcon from '@material-ui/icons/Remove';
import SearchIcon from '@material-ui/icons/Search';
import Downshift from 'downshift';
import locale from '../../../locale';
import StringEditor from './string';
import NumericRangeEditor, { NumericRange } from './range';

/** @jsx React.createElement */

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
        default () {
            return new NumericRange(0, 35, true, true);
        }
    }
};

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

        const hasFieldsLeftToAdd = !!Object.keys(FIELDS)
            .filter(field => !existingFields.includes(field)).length;

        const addInput = (
            <Downshift
                onChange={item => item && this.addPredicate(item.id)}
                itemToString={item => item ? item.value : ''}>
                {downshift => {
                    this.downshift = downshift;

                    const {
                        getInputProps,
                        getItemProps,
                        getMenuProps,
                        isOpen,
                        inputValue,
                        highlightedIndex
                    } = downshift;

                    return (
                        <div className="autocomplete-input">
                            <input
                                className="add-predicate-input"
                                placeholder={this.props.value.length
                                    ? this.props.addPlaceholder
                                    : this.props.placeholder}
                                {...getInputProps()} />
                            <ul className="autocomplete-options" {...getMenuProps()}>
                                {isOpen && Object.keys(FIELDS)
                                    .map(field => ({
                                        id: field,
                                        value: locale.members.search.fields[field]
                                    }))
                                    .filter(field => field.value
                                        .toLowerCase()
                                        .includes(inputValue.toLowerCase()))
                                    .filter(field => !existingFields.includes(field.id))
                                    .map((item, index) => (
                                        // Downshift already adds a key prop
                                        /* eslint-disable react/jsx-key */
                                        <li
                                            {...getItemProps({
                                                key: item.id,
                                                index,
                                                item,
                                                className: highlightedIndex === index
                                                    ? 'highlighted'
                                                    : ''
                                            })}>
                                            {item.value}
                                        </li>
                                        /* eslint-enable react/jsx-key */
                                    ))
                                }
                            </ul>
                        </div>
                    );
                }}
            </Downshift>
        );

        return (
            <div className="predicate-editor">
                {predicates}
                {hasFieldsLeftToAdd && (
                    <div className="add-predicate">
                        <div className="search-icon-container">
                            <SearchIcon />
                        </div>
                        {addInput}
                    </div>
                )}
            </div>
        );
    }
}

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
