import React from 'react';
import PropTypes from 'prop-types';
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

export function defaultFields () {
    return Object.keys(FIELDS)
        .map(field => ({
            field,
            value: FIELDS[field].default()
        }));
}

/**
 * A predicate editor: manages a list of editable predicates and an input to add more.
 */
export default class PredicateEditor extends React.PureComponent {
    static propTypes = {
        value: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired,
        placeholder: PropTypes.string.isRequired,
        isOpen: PropTypes.bool.isRequired
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

    predicateRects = [];

    componentWillUpdate (newProps) {
        if (newProps.isOpen !== this.props.isOpen) {
            this.predicateRects = [];
            for (const predicate of this.predicateRefs) {
                this.predicateRects.push(predicate.node.getBoundingClientRect());
            }
        }
    }

    componentDidUpdate (prevProps) {
        if (this.itemToFocus !== null && this.predicateRefs[this.itemToFocus]) {
            this.predicateRefs[this.itemToFocus].focus();
            this.itemToFocus = null;
        }

        if (prevProps.isOpen !== this.props.isOpen) {
            // animate predicates expanding/collapsing using FLIP

            const targetRects = [];
            for (const predicate of this.predicateRefs) {
                targetRects.push(predicate.node.getBoundingClientRect());
                predicate.node.classList.remove('animated');
            }

            for (let i = 0; i < this.predicateRefs.length; i++) {
                const node = this.predicateRefs[i].node;
                const startRect = this.predicateRects[i];
                const targetRect = targetRects[i];
                const dx = startRect.left - targetRect.left;
                const dy = startRect.top - targetRect.top;
                const dsx = startRect.width / targetRect.width;
                const dsy = startRect.height / targetRect.height;
                node.style.transform = `translate(${dx}px, ${dy}px) scale(${dsx}, ${dsy})`;
                node.style.opacity = 1;
            }

            window.requestAnimationFrame(() => {
                for (const predicate of this.predicateRefs) {
                    predicate.node.classList.add('animated');
                }

                window.requestAnimationFrame(() => {
                    for (const predicate of this.predicateRefs) {
                        predicate.node.style.transform = '';
                        predicate.node.style.opacity = '';
                    }
                });
            });
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

        let className = 'predicate-editor';
        if (this.props.isOpen) className += ' open';

        return (
            <div className={className}>
                {predicates}
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
            <div className="predicate" ref={node => this.node = node}>
                <div className="predicate-field">
                    {locale.members.search.fields[this.props.value.field]}:
                </div>
                {editor}
            </div>
        );
    }
}
