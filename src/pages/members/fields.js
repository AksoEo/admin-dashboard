import { NumericRange } from './predicate-editor/range';

export const SEARCHABLE = 1;
export const FILTERABLE = 1 << 1;
export const NEEDS_SWITCH = 1 << 2;

/** Field descriptions */
export const FIELDS = {
    nameOrCode: {
        flags: SEARCHABLE,
    },
    email: {
        flags: SEARCHABLE,
    },
    landlinePhone: {
        flags: SEARCHABLE,
    },
    cellphone: {
        flags: SEARCHABLE,
    },
    officePhone: {
        flags: SEARCHABLE,
    },
    address: {
        flags: SEARCHABLE,
    },
    notes: {
        flags: SEARCHABLE,
    },
    codeholderType: {
        type: 'codeholderType',
        flags: FILTERABLE,
        default () {
            return { human: true, org: true };
        },
        isNone (value) {
            return value.human && value.org;
        },
    },
    feeCountry: {
        type: 'countries',
        flags: FILTERABLE,
        default () {
            return [];
        },
        isNone (value) {
            return !value.length;
        },
    },
    enabled: {
        type: 'boolean',
        flags: FILTERABLE | NEEDS_SWITCH,
        default () {
            return false;
        },
    },
    age: {
        type: 'age-range',
        flags: FILTERABLE | NEEDS_SWITCH,
        min: 0,
        max: 150,
        default () {
            return {
                range: new NumericRange(0, 35, true, true),
                atStartOfYear: false,
            };
        },
    },
    birthdate: {
        type: 'date-range',
        flags: FILTERABLE | NEEDS_SWITCH,
        default () {
            return 'todo';
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
    isDead: {
        type: 'boolean',
        flags: FILTERABLE | NEEDS_SWITCH,
        default () {
            return false;
        },
    },
};

export const SEARCHABLE_FIELDS = Object.keys(FIELDS)
    .filter(field => FIELDS[field].flags & SEARCHABLE);
