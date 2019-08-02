import React from 'react';
import { Checkbox, Slider, TextField, Button } from 'yamdl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import CheckIcon from '@material-ui/icons/Check';
import moment from 'moment';
import Segmented from '../../components/segmented';
import locale from '../../locale';
import CountryPicker from './country-picker';
import cache from '../../cache';

/* eslint-disable react/prop-types */

function RangeEditor ({ min, max, value, onChange, tickDistance, disabled }) {
    return (
        <div class={'range-editor' + (disabled ? ' disabled' : '')}>
            <TextField
                type="number"
                class="bound-editor"
                center
                min={min}
                max={max}
                value={value[0]}
                onChange={e => onChange([
                    +e.target.value,
                    Math.max(+e.target.value, value[1]),
                ])} />
            <Slider
                min={min}
                max={max}
                value={value}
                popout
                discrete
                tickDistance={tickDistance}
                class="editor-inner"
                onChange={value => onChange(value)} />
            <TextField
                type="number"
                class="bound-editor"
                center
                min={min}
                max={max}
                value={value[1]}
                onChange={e => onChange([
                    Math.min(+e.target.value, value[0]),
                    +e.target.value,
                ])} />
        </div>
    );
}

/**
 * Renders a segmented control with three options, [a] [b] [all].
 * @param {Object} labels - mapping of identifiers to labels
 * @param {Function} decode - function to decode a `value` into an identifier (a, b, or all)
 * @param {Function} onSelect - select handler; is passed the identifier and a bunch of props
 * @param {Function} isOptionDisabled - if true, the option will be disabled
 * @return {Function} a functional switch component
 */
function tripleSwitch (all, a, b, labels, decode, onSelect, isOptionDisabled) {
    return function TripleSwitch (props) {
        const { filterHeader, value, onChange, enabled, onEnabledChange } = props;

        const selected = decode(value, enabled);
        isOptionDisabled = isOptionDisabled || (() => false);

        return (
            <div className="left-right-editor">
                {filterHeader}
                <Segmented selected={selected} onSelect={selected => {
                    onSelect(selected, { value, onChange, enabled, onEnabledChange });
                }}>
                    {[
                        { id: a, label: labels[a], disabled: isOptionDisabled(a, value) },
                        { id: b, label: labels[b], disabled: isOptionDisabled(b, value) },
                        { id: all, label: labels[all], disabled: isOptionDisabled(all, value) },
                    ]}
                </Segmented>
            </div>
        );
    };
}

/** Like tripleSwitch but for simple boolean filters */
function tripleSwitchYesNo (labels) {
    return tripleSwitch(
        'all',
        'yes',
        'no',
        labels,
        (value, enabled) => !enabled ? 'all' : value ? 'yes' : 'no',
        (selected, { enabled, onEnabledChange, onChange }) => {
            if (selected === 'all') onEnabledChange(false);
            else {
                if (!enabled) onEnabledChange(true);
                onChange(selected === 'yes');
            }
        },
    );
}

export default {
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
        editor: tripleSwitch(
            'all',
            'human',
            'org',
            locale.members.search.codeholderTypes,
            value => value.human && value.org ? 'all' : value.human ? 'human' : 'org',
            (selected, { onChange }) => {
                const newValue = { human: false, org: false };
                if (selected === 'all' || selected === 'human') newValue.human = true;
                if (selected === 'all' || selected === 'org') newValue.org = true;
                onChange(newValue);
            },
            (id, value) => {
                if (value._restricted) {
                    if (id === 'all') return true;
                    if (id === 'org' && value.human) return true;
                    if (id === 'human' && value.org) return true;
                }
                return false;
            },
        ),
        applyConstraints (value, filters) {
            let humanOnly = false;
            if (filters.age && filters.age.enabled) humanOnly = true;
            if (filters.deathdate && filters.deathdate.enabled) humanOnly = true;

            if (humanOnly && !value._restricted) {
                return { value: { human: true, org: false, _restricted: true } };
            } else if (!humanOnly && value._restricted) {
                return { value: { human: value.human, org: value.org } };
            }
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
        serialize (value) {
            const type = value.type === 'fee' ? 'f' : value.type === 'address' ? 'a' : '*';
            return type + '$' + value.countries.join(',');
        },
        deserialize (value) {
            const type = value[0] === 'f' ? 'fee' : value[0] === 'a' ? 'address' : null;
            const countries = value.substr(2).split(',');
            return { type, countries };
        },
        editor: class CountryEditor extends React.PureComponent {
            state = { countries: null, countryGroups: null };

            componentDidMount () {
                Promise.all([
                    cache.getCountries(),
                    cache.getCountryGroups(),
                ])
                    .then(([countries, countryGroups]) => this.setState({ countries, countryGroups }));
            }

            render () {
                const { filterHeader, value, onChange } = this.props;

                const countryGroups = [];
                const countries = [];

                if (this.state.countryGroups && this.state.countries) {
                    for (const id in this.state.countryGroups) {
                        const group = this.state.countryGroups[id];
                        countryGroups.push(
                            <MenuItem key={id} value={id}>{group.name}</MenuItem>
                        );
                    }

                    for (const id in this.state.countries) {
                        countries.push(
                            <MenuItem key={id} value={id}>{this.state.countries[id]}</MenuItem>
                        );
                    }
                }

                const selectedType = value.type === null ? 'all' : value.type;

                return (
                    <div className="country-editor">
                        <div className="country-editor-top">
                            {filterHeader}
                            <Segmented selected={selectedType} onSelect={selected => {
                                if (selected === 'all') selected = null;
                                onChange({ ...value, type: selected });
                            }}>
                                {[
                                    { id: 'fee', label: locale.members.search.countries.fee },
                                    { id: 'address', label: locale.members.search.countries.address },
                                    { id: 'all', label: locale.members.search.countries.all },
                                ]}
                            </Segmented>
                        </div>
                        <CountryPicker
                            onChange={countries => onChange({ ...value, countries })}
                            value={value.countries} />
                    </div>
                );
            }
        },
    },
    enabled: {
        needsSwitch: true,
        autoSwitch: true,
        default () {
            return false;
        },
        editor: tripleSwitch(
            'all',
            'enabled',
            'disabled',
            locale.members.search.enabledStates,
            (value, enabled) => !enabled ? 'all' : value ? 'enabled' : 'disabled',
            (selected, { enabled, onEnabledChange, onChange }) => {
                if (selected === 'all') onEnabledChange(false);
                else {
                    if (!enabled) onEnabledChange(true);
                    onChange(selected === 'enabled');
                }
            },
        ),
    },
    age: {
        needsSwitch: true,
        min: 0,
        max: 150,
        default () {
            return {
                range: [0, 35],
                atStartOfYear: true,
            };
        },
        serialize (value) {
            return value.range[0] + '-' + value.range[1] + (value.atStartOfYear ? '^' : '');
        },
        deserialize (value) {
            const match = value.match(/^(\d+)-(\d+)(\^?)/);
            if (!match) throw new Error('value does not match pattern');
            const rangeStart = +match[1] | 0;
            const rangeEnd = +match[2] | 0;
            const atStartOfYear = match[3] === '^';

            return {
                range: [rangeStart, rangeEnd],
                atStartOfYear,
            };
        },
        toRequest (value) {
            const field = value.atStartOfYear ? 'agePrimo' : 'age';
            if (value.range[0] === value.range[1]) {
                return { [field]: { $eq: value.range[0] } };
            }
            return {
                [field]: { $gte: value.range[0], $lte: value.range[1] },
            };
        },
        editor (props) {
            const { filter, value, onChange, filterHeader, disabled } = props;
            const topValue = value;

            const ageToBirthYearRange = age => {
                // date at which age is zero
                const zeroDate = (value.atStartOfYear
                    // subtract one second to only include people who were age years old *before*
                    // midnight Jan 1. While this is technically mathematically incorrect it’s kind
                    // of confusing to show e.g. 2018–2019 instead of 2019 on a collapsed range because
                    // of one measly second
                    ? moment().startOf('year').subtract(1, 'seconds')
                    : moment())
                    .subtract(age, 'years');

                // zeroDate could be one day before [1 year after their birthday]
                const lowerBound = zeroDate.clone().subtract(1, 'years').add(1, 'days').year();
                // or it could be their birthday
                const upperBound = zeroDate.year();
                return { lowerBound, upperBound };
            };

            const [start, end] = value.range;
            // age is the inverse of birth date; so end comes first
            const lowerBound = ageToBirthYearRange(end).lowerBound;
            const upperBound = ageToBirthYearRange(start).upperBound;
            const birthYearRange = lowerBound === upperBound
                ? lowerBound
                : lowerBound + '–' + upperBound;

            return (
                <div className={'age-editor' + (disabled ? ' disabled' : '')}>
                    <div className="age-editor-top">
                        {filterHeader}
                        <span className="age-birth-year">
                            {/* FIXME: why does this break when I put it in .age-prime-switch? */}
                            {locale.members.search.ageBirthYear(birthYearRange)}
                        </span>
                        <div className="age-prime-switch">
                            <label>{locale.members.search.agePrime}</label>
                            <Checkbox
                                class="inner-switch"
                                switch
                                checked={value.atStartOfYear}
                                onChange={checked => {
                                    onChange({ ...topValue, atStartOfYear: checked });
                                }} />
                        </div>
                    </div>
                    <RangeEditor
                        min={filter.min}
                        max={filter.max}
                        value={value.range}
                        disabled={disabled}
                        onChange={range => onChange({ ...topValue, range })}
                        tickDistance={5} />
                </div>
            );
        },
    },
    hasOldCode: {
        needsSwitch: true,
        autoSwitch: true,
        default () {
            return false;
        },
        toRequest (value) {
            return { oldCode: value ? { $neq: null } : null };
        },
        editor: tripleSwitchYesNo(locale.members.search.existence),
    },
    hasEmail: {
        needsSwitch: true,
        autoSwitch: true,
        default () {
            return false;
        },
        toRequest (value) {
            return { email: value ? { $neq: null } : null };
        },
        editor: tripleSwitchYesNo(locale.members.search.existence),
    },
    hasPassword: {
        needsSwitch: true,
        autoSwitch: true,
        default () {
            return false;
        },
        editor: tripleSwitchYesNo(locale.members.search.boolean),
    },
    isDead: {
        needsSwitch: true,
        autoSwitch: true,
        default () {
            return false;
        },
        editor: tripleSwitchYesNo(locale.members.search.boolean),
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
                    if (range[0] === range[1]) {
                        filter.year = invert ? { $neq: range[0] } : range[0];
                    } else {
                        const rangeMin = range[0];
                        const rangeMax = range[1];
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
            return JSON.stringify(value.map(({
                invert, lifetime, givesMembership, useRange, range, categories,
            }) => ({
                i: invert,
                l: lifetime,
                g: givesMembership,
                r: useRange ? range : null,
                c: categories,
            })));
        },
        deserialize (value) {
            const thisYear = new Date().getFullYear();

            return JSON.parse(value).map(({ i, l, g, r, c }) => ({
                invert: i,
                lifetime: l,
                givesMembership: g,
                useRange: r !== null,
                range: r ? r : [thisYear, thisYear],
                categories: c,
            }));
        },
        editor: class Membership extends React.PureComponent {
            state = {
                categories: [],
            }

            componentDidMount () {
                cache.getMembershipCategories().then(categories => this.setState({ categories }));
            }

            render () {
                const { value, onChange, filterHeader } = this.props;
                const { categories: availableCategories } = this.state;

                const items = value.map(({
                    invert, lifetime, givesMembership, useRange, range, categories,
                }, index) => (
                    <div
                        className="membership-item"
                        key={index}>
                        <Button icon class="membership-remove" onClick={() => {
                            const newValue = [...value];
                            newValue.splice(index, 1);
                            onChange(newValue);
                        }}>
                            <RemoveIcon />
                        </Button>
                        <div className="membership-item-line">
                            <Segmented selected={invert ? 'yes' : 'no'} onSelect={selected => {
                                const newValue = [...value];
                                newValue[index] = {
                                    ...newValue[index],
                                    invert: selected === 'yes',
                                };
                                onChange(newValue);
                            }}>
                                {[
                                    {
                                        id: 'yes',
                                        label: locale.members.search.membership.invert.yes,
                                    },
                                    {
                                        id: 'no',
                                        label: locale.members.search.membership.invert.no,
                                    },
                                ]}
                            </Segmented>
                        </div>
                        <div className="membership-item-line">
                            <Segmented
                                selected={lifetime ? 'yes' : lifetime === false ? 'no' : 'all'}
                                onSelect={selected => {
                                    const newValue = [...value];
                                    newValue[index] = {
                                        ...newValue[index],
                                        lifetime: selected === 'yes'
                                            ? true : selected === 'no' ? false : null,
                                    };
                                    onChange(newValue);
                                }}>
                                {[
                                    {
                                        id: 'yes',
                                        label: locale.members.search.membership.lifetime.yes,
                                    },
                                    {
                                        id: 'no',
                                        label: locale.members.search.membership.lifetime.no,
                                    },
                                    {
                                        id: 'all',
                                        label: locale.members.search.membership.lifetime.all,
                                    },
                                ]}
                            </Segmented>
                        </div>
                        <div className="membership-item-line">
                            <Segmented
                                selected={givesMembership
                                    ? 'yes' : givesMembership === false ? 'no' : 'all'}
                                onSelect={selected => {
                                    const newValue = [...value];
                                    newValue[index] = {
                                        ...newValue[index],
                                        givesMembership: selected === 'yes'
                                            ? true : selected === 'no' ? false : null,
                                    };
                                    onChange(newValue);
                                }}>
                                {[
                                    {
                                        id: 'yes',
                                        label: locale.members.search.membership.givesMembership.yes,
                                    },
                                    {
                                        id: 'no',
                                        label: locale.members.search.membership.givesMembership.no,
                                    },
                                    {
                                        id: 'all',
                                        label: locale.members.search.membership.givesMembership.all,
                                    },
                                ]}
                            </Segmented>
                        </div>
                        <div className="membership-item-line">
                            <Select
                                className="membership-categories"
                                multiple
                                value={categories}
                                onChange={e => {
                                    const newValue = [...value];
                                    newValue[index] = {
                                        ...newValue[index],
                                        categories: e.target.value,
                                    };
                                    onChange(newValue);
                                }}
                                renderValue={value => value
                                    .map(id => availableCategories[id].nameAbbrev)
                                    .join(', ') || locale.members.search.membership.placeholder}
                                displayEmpty={true}>
                                {Object.keys(availableCategories).map(id => (
                                    <MenuItem
                                        key={id}
                                        value={id}
                                        className="members-list-membership-category">
                                        <div className="membership-category-id">
                                            {availableCategories[id].nameAbbrev}
                                        </div>
                                        <div className="membership-category-name">
                                            {availableCategories[id].name}
                                        </div>
                                        <div className="membership-category-check">
                                            {categories.includes(id)
                                                ? <CheckIcon />
                                                : null}
                                        </div>
                                    </MenuItem>
                                ))}
                            </Select>
                        </div>
                        <div className="membership-item-line membership-range-line">
                            <Checkbox
                                class="membership-range-checkbox"
                                checked={useRange}
                                onChange={checked => {
                                    const newValue = [...value];
                                    newValue[index] = {
                                        ...newValue[index],
                                        useRange: checked,
                                    };
                                    onChange(newValue);
                                }} />
                            <RangeEditor
                                min={1887}
                                max={new Date().getFullYear() + 4}
                                value={range}
                                disabled={!useRange}
                                tickDistance={10}
                                onChange={range => {
                                    const newValue = [...value];
                                    newValue[index] = { ...newValue[index], range, useRange: true };
                                    onChange(newValue);
                                }} />
                        </div>
                    </div>
                ));

                // intersperse items with conjunctions
                for (let i = items.length - 1; i > 0; i--) {
                    items.splice(i, 0, (
                        <div class="membership-conjunction-separator" key={`conj-${i}`}>
                            {locale.members.search.membership.conjunction}
                        </div>
                    ));
                }

                items.push(
                    <div className="membership-add-container" key={-1}>
                        <Button icon class="membership-add-button" onClick={() => {
                            const thisYear = new Date().getFullYear();

                            onChange(value.concat([{
                                invert: false,
                                lifetime: null,
                                givesMembership: null,
                                useRange: true,
                                range: [thisYear, thisYear],
                                categories: [],
                            }]));
                        }}>
                            <AddIcon />
                        </Button>
                    </div>
                );

                return (
                    <div className={'membership-editor' + (!value.length ? ' is-empty' : '')}>
                        {filterHeader}
                        {items}
                    </div>
                );
            }
        },
    },
    isActiveMember: {
        needsSwitch: true,
        min: 1887,
        max: new Date().getFullYear() + 4,
        default () {
            const thisYear = new Date().getFullYear();
            return [thisYear, thisYear];
        },
        serialize (value) {
            return value.start + '-' + value.end;
        },
        deserialize (value) {
            const match = value.match(/^(\d+)-(\d+)/);
            if (!match) throw new Error('value does not match pattern');
            const rangeStart = +match[1] | 0;
            const rangeEnd = +match[2] | 0;
            return [rangeStart, rangeEnd];
        },
        toRequest (value) {
            const range = {};
            if (value[0] === value[1]) {
                range.$eq = value[0];
            } else {
                range.$gte = value[0];
                range.$lte = value[1];
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
                            year: { $lte: value[0] },
                        },
                    ],
                },
            };
        },
        editor (props) {
            const { filter, value, onChange, filterHeader, disabled } = props;

            return (
                <div className="active-member-editor">
                    {filterHeader}
                    <RangeEditor
                        min={filter.min}
                        max={filter.max}
                        value={value}
                        disabled={disabled}
                        tickDistance={10}
                        onChange={onChange} />
                </div>
            );
        },
    },
    // FIXME: duplicate code
    deathdate: {
        needsSwitch: true,
        min: 1887,
        max: new Date().getFullYear(),
        default () {
            const thisYear = new Date().getFullYear();
            return [thisYear, thisYear];
        },
        serialize (value) {
            return value.start + '-' + value.end;
        },
        deserialize (value) {
            const match = value.match(/^(\d+)-(\d+)/);
            if (!match) throw new Error('value does not match pattern');
            const rangeStart = +match[1] | 0;
            const rangeEnd = +match[2] | 0;
            return [rangeStart, rangeEnd];
        },
        toRequest (value) {
            const lowerYear = value[0];
            const upperYear = value[1];

            const lowerDate = new Date(`${lowerYear}-01-01T00:00Z`);
            const upperDate = new Date(`${upperYear + 1}-01-01T00:00Z`);

            return { deathdate: { $gte: +lowerDate, $lt: +upperDate } };
        },
        editor (props) {
            const { filter, value, onChange, filterHeader, disabled } = props;

            return (
                <div className="death-date-editor">
                    {filterHeader}
                    <RangeEditor
                        min={filter.min}
                        max={filter.max}
                        value={value}
                        disabled={disabled}
                        tickDistance={10}
                        onChange={onChange} />
                </div>
            );
        },
    },
};
