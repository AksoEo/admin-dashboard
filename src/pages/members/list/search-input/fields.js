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
        toRequest (value) {
            return {
                codeholderType: value.human && value.org ? null : value.human ? 'human' : 'org',
            };
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
    country: {
        default () {
            return { countries: [], type: null };
        },
        isNone (value) {
            return !value.countries.length;
        },
        toRequest (value) {
            const countryGroups = [];
            const countries = [];
            for (const item of value) {
                if (item.startsWith('x')) countryGroups.push(item);
                else countries.push(item);
            }
            const filterItems = [];
            if (value.type === null || value.type === 'fee') {
                filterItems.push({ feeCountry: { $in: countries } });
                filterItems.push({ feeCountryGroups: { $hasAny: countryGroups } });
            }
            if (value.type === null || value.type === 'address') {
                filterItems.push({ 'addressLatin.country': { $in: countries } });
                filterItems.push({ 'addressCountryGroups': { $hasAny: countryGroups } });
            }
            return { $or: filterItems };
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
        codeholderType: 'human',
        toRequest (value) {
            const field = value.atStartOfYear ? 'agePrimo' : 'age';
            if (value.range.isCollapsed()) {
                return { [field]: { $eq: value.range.collapsedValue() } };
            }
            return {
                [field]: {
                    [value.range.startInclusive ? '$gte' : '$gt']: value.range.start,
                    [value.range.endInclusive ? '$lte' : '$lt']: value.range.end,
                },
            };
        },
    },
    hasOldCode: {
        needsSwitch: true,
        invisibleSwitch: true,
        default () {
            return false;
        },
        toRequest (value) {
            return { oldCode: value ? { $neq: null } : null };
        },
    },
    hasEmail: {
        needsSwitch: true,
        invisibleSwitch: true,
        default () {
            return false;
        },
        toRequest (value) {
            return { email: value ? { $neq: null } : null };
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
