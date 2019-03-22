import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import RemoveIcon from '@material-ui/icons/Remove';
import SearchIcon from '@material-ui/icons/Search';
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
    age: {
        type: 'range',
        min: 6,
        max: 120,
        default () {
            return new NumericRange(35, 35, true, true);
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

    state = {
        add: ''
    };

    predicateRefs = [];

    /** If set, will focus the predicate with the given index. */
    itemToFocus = null;

    addPredicate = () => {
        if (!this.state.add) return;
        // find a field that matches the current input
        let field = null;
        for (const f in FIELDS) {
            // TODO: better comparison method (fuzzy matching?)
            if (locale.members.search.fields[f].toLowerCase() === this.state.add.toLowerCase()) {
                field = f;
                break;
            }
        }

        if (field != null) {
            const items = this.props.value.slice();
            items.push({
                field,
                value: FIELDS[field].default()
            });
            this.props.onChange(items);
            this.setState({ add: '' });
            this.itemToFocus = items.length - 1;
        }
    };

    componentDidUpdate () {
        if (this.itemToFocus !== null) {
            this.predicateRefs[this.itemToFocus].focus();
            this.itemToFocus = null;
        }
    }

    render () {
        const predicates = [];
        let i = 0;
        for (const item of this.props.value) {
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

        return (
            <div className="predicate-editor">
                {predicates}
                <div className="add-predicate">
                    <div className="search-icon-container">
                        <SearchIcon />
                    </div>
                    <input
                        className="add-predicate-input"
                        value={this.state.add}
                        onChange={e => this.setState({ add: e.target.value })}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                this.addPredicate();
                            }
                        }}
                        placeholder={this.props.value.length
                            ? this.props.addPlaceholder
                            : this.props.placeholder} />
                </div>
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
