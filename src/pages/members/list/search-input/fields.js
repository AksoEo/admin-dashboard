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
