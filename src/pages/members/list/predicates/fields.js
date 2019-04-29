import { NumericRange } from './range';

export const SEARCHABLE_FIELDS = [
    'nameOrCode',
    'email',
    'landlinePhone',
    'cellphone',
    'officePhone',
    'address',
    'notes',
];

export const FILTERABLE_FIELDS = {
    codeholderType: {
        type: 'codeholderType',
        default () {
            return { human: true, org: true };
        },
        isNone (value) {
            return value.human && value.org;
        },
    },
    feeCountry: {
        type: 'countries',
        default () {
            return [];
        },
        isNone (value) {
            return !value.length;
        },
    },
    enabled: {
        type: 'boolean',
        needsSwitch: true,
        default () {
            return false;
        },
    },
    age: {
        type: 'age-range',
        needsSwitch: true,
        min: 0,
        max: 150,
        default () {
            return {
                range: new NumericRange(0, 35, true, true),
                atStartOfYear: true,
            };
        },
    },
    birthdate: {
        type: 'date-range',
        needsSwitch: true,
        default () {
            return 'todo';
        },
    },
    hasOldCode: {
        type: 'existence',
        needsSwitch: true,
        default () {
            return false;
        },
    },
    hasEmail: {
        type: 'existence',
        needsSwitch: true,
        default () {
            return false;
        },
    },
    isDead: {
        type: 'boolean',
        needsSwitch: true,
        default () {
            return false;
        },
    },
};
