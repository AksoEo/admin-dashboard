import { NumericRange } from '../../editors/numeric-range';

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
        default () {
            return { human: true, org: true };
        },
        isNone (value) {
            return value.human && value.org;
        },
        serialize (value) {
            return value.human && value.org ? '*' : value.human ? 'h' : 'o';
        },
        deserialize (value) {
            if (value === 'o') return { human: false, org: true };
            else if (value === 'h') return { human: true, org: false };
            else return { human: true, org: true };
        },
    },
    feeCountry: {
        default () {
            return [];
        },
        isNone (value) {
            return !value.length;
        },
    },
    enabled: {
        needsSwitch: true,
        invisibleSwitch: true,
        default () {
            return false;
        },
    },
    age: {
        needsSwitch: true,
        min: 0,
        max: 150,
        default () {
            return {
                range: new NumericRange(0, 35, true, true),
                atStartOfYear: true,
            };
        },
        serialize (value) {
            return {
                rs: value.range.start,
                re: value.range.end,
                rsi: value.range.startInclusive,
                rei: value.range.endInclusive,
                asoy: value.atStartOfYear,
            };
        },
        deserialize (value) {
            return {
                range: new NumericRange(value.rs, value.re, value.rsi, value.rei),
                atStartOfYear: value.asoy,
            };
        },
    },
    hasOldCode: {
        needsSwitch: true,
        invisibleSwitch: true,
        default () {
            return false;
        },
    },
    hasEmail: {
        needsSwitch: true,
        invisibleSwitch: true,
        default () {
            return false;
        },
    },
    hasPassword: {
        needsSwitch: true,
        invisibleSwitch: true,
        default () {
            return false;
        },
    },
    isDead: {
        needsSwitch: true,
        invisibleSwitch: true,
        default () {
            return false;
        },
    },
};
