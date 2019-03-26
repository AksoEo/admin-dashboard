import { NumericRange } from './predicate-editor/range';

export const SEARCHABLE = 1;
export const FILTERABLE = 1 << 1;

/** Field descriptions */
export const FIELDS = {
    name: {
        type: 'string',
        flags: SEARCHABLE | FILTERABLE,
        default () {
            return '';
        }
    },
    oldCode: {
        type: 'string',
        flags: FILTERABLE,
        default () {
            return '';
        }
    },
    newCode: {
        type: 'string',
        flags: FILTERABLE,
        default () {
            return '';
        }
    },
    age: {
        type: 'range',
        flags: FILTERABLE,
        min: 0,
        max: 150,
        needsSwitch: true,
        default () {
            return new NumericRange(0, 35, true, true);
        }
    },
    email: {
        type: 'string',
        flags: SEARCHABLE | FILTERABLE,
        default () {
            return '';
        }
    },
    notes: {
        type: 'string',
        flags: SEARCHABLE,
        default () {
            return '';
        }
    }
};

export const SEARCHABLE_FIELDS = Object.keys(FIELDS)
    .filter(field => FIELDS[field].flags & SEARCHABLE);
