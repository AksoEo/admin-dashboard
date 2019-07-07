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
            for (const item of value.countries) {
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
    membership: {
        default () {
            return [];
        },
        isNone (value) {
            return !value.length;
        },
        toRequest (value) {
            const items = value.map(({
                invert, lifetime, givesMembership, useRange, range, categories,
            }) => {
                const filter = {};
                if (givesMembership !== null) {
                    filter.givesMembership = invert ? !givesMembership : givesMembership;
                }
                if (lifetime !== null) {
                    filter.lifetime = invert ? !lifetime : lifetime;
                }
                if (useRange) {
                    if (range.isCollapsed()) {
                        const value = range.collapsedValue();
                        filter.year = invert ? { $neq: value } : value;
                    } else {
                        const rangeMin = range.startInclusive ? range.start : range.start + 1;
                        const rangeMax = range.endInclusive ? range.end : range.end - 1;
                        if (invert) {
                            filter.$or = [
                                { year: { $gt: rangeMax } },
                                { year: { $lt: rangeMin } },
                            ];
                        } else {
                            filter.year = { $gte: rangeMin, $lte: rangeMax };
                        }
                    }
                }
                if (categories.length) {
                    filter.categoryId = invert ? { $nin: categories } : { $in: categories };
                }
                return filter;
            });

            return { $membership: { $and: items } };
        },
        serialize (value) {
            return value.map(({
                invert, lifetime, givesMembership, useRange, range, categories,
            }) => ({
                i: invert,
                l: lifetime,
                g: givesMembership,
                r: useRange ? {
                    si: range.startInclusive,
                    s: range.start,
                    ei: range.endInclusive,
                    e: range.end,
                } : null,
                c: categories,
            }));
        },
        deserialize (value) {
            const thisYear = new Date().getFullYear();

            return value.map(({ i, l, g, r, c }) => ({
                invert: i,
                lifetime: l,
                givesMembership: g,
                useRange: r !== null,
                range: r
                    ? new NumericRange(r.s, r.e, r.si, r.ei)
                    : new NumericRange(thisYear, thisYear, true, true),
                categories: c,
            }));
        },
    },
    isActiveMember: {
        needsSwitch: true,
        min: 1887,
        max: new Date().getFullYear(),
        default () {
            return new NumericRange(1887, new Date().getFullYear(), true, true);
        },
        serialize (value) {
            return [value.start, value.end, value.startInclusive, value.endInclusive];
        },
        deserialize (value) {
            return new NumericRange(...value);
        },
        toRequest (value) {
            const range = {};
            if (value.isCollapsed()) {
                range.$eq = value.collapsedValue();
            } else {
                if (value.startInclusive) range.$gte = value.start;
                else range.$gt = value.start;
                if (value.endInclusive) range.$lte = value.end;
                else range.$lt = value.end;
            }

            return {
                $membership: {
                    givesMembership: true,
                    $or: [
                        {
                            lifetime: false,
                            year: range,
                        },
                        {
                            lifetime: true,
                            year: { $leq: range.start },
                        },
                    ],
                },
            };
        },
    },
};
