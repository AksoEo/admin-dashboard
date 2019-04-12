import { NumericRange } from './predicate-editor/range';

export const SEARCHABLE = 1;
export const FILTERABLE = 1 << 1;
export const NEEDS_SWITCH = 1 << 2;

/** Field descriptions */
export const FIELDS = {
    nameOrCode: {
        type: 'string',
        flags: SEARCHABLE,
        default () {
            return '';
        },
    },
    email: {
        type: 'string',
        flags: SEARCHABLE,
        default () {
            return '';
        },
    },
    notes: {
        type: 'string',
        flags: SEARCHABLE,
        default () {
            return '';
        },
    },
    age: {
        type: 'range',
        flags: FILTERABLE | NEEDS_SWITCH,
        min: 0,
        max: 150,
        default () {
            return new NumericRange(0, 35, true, true);
        },
    },
    hasOldCode: {
        type: 'existence',
        flags: FILTERABLE | NEEDS_SWITCH,
        default () {
            return false;
        },
    },
    hasEmail: {
        type: 'existence',
        flags: FILTERABLE | NEEDS_SWITCH,
        default () {
            return false;
        },
    },
};

export const SEARCHABLE_FIELDS = Object.keys(FIELDS)
    .filter(field => FIELDS[field].flags & SEARCHABLE);
