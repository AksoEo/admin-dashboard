import { h } from 'preact';
import { Fragment, useState } from 'preact/compat';
import { Checkbox, Slider, TextField, Button, Dialog } from '@cpsdqs/yamdl';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import CheckIcon from '@material-ui/icons/Check';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import moment from 'moment';
import Segmented from '../../../components/segmented';
import { connect } from '../../../core/connection';
import locale from '../../../locale';
import CountryPicker from './country-picker';
import MulticolList from '../../../components/multicol-list';

// TEMP: replace with actual multi-<select> when available
const MembershipCategoryPicker = connect('memberships/categories')(data => ({
    availableCategories: data,
}))(function MembershipCategoryPicker ({ value, onChange, availableCategories }) {
    if (!availableCategories) return null;
    const [open, setOpen] = useState(false);

    const items = [];
    for (const id in availableCategories) {
        const column = value.includes(id) ? 0 : 1;
        items.push({
            key: id,
            column,
            node: (
                <div style={{
                    display: 'flex',
                    height: '48px',
                    alignItems: 'center',
                    userSelect: 'none',
                }} onClick={() => {
                    const newValue = [...value];
                    if (newValue.includes(id)) newValue.splice(newValue.indexOf(id), 1);
                    else newValue.push(id);
                    onChange(newValue);
                }}>
                    <div style={{ marginLeft: '16px' }}>
                        {availableCategories[id].nameAbbrev}
                    </div>
                    <span>{'\u00a0'}</span>
                    <div style={{ flex: '1' }}>
                        {availableCategories[id].name}
                    </div>
                    <div style={{ marginRight: '16px' }}>
                        {value.includes(id)
                            ? <CheckIcon />
                            : null}
                    </div>
                </div>
            ),
        });
    }

    return (
        <div class="country-picker" style={{ width: 'auto', textAlign: 'left' }}>
            <div class="picked-countries" onClick={() => setOpen(true)}>
                {value.map(id => availableCategories[id].nameAbbrev).join(', ') || 'Elekti kategoriojn'}
            </div>
            <ExpandMoreIcon className="expand-icon" />

            <Dialog
                class="country-picker-dialog"
                backdrop
                open={open}
                onClose={() => setOpen(false)}
                title="Elekti kategoriojn">
                <MulticolList columns={2} itemHeight={48}>
                    {items}
                </MulticolList>
            </Dialog>
        </div>
    );
});

/// A text editor optimized for editing integer range bounds.
///
/// # Props
/// - `min`: the minimum value
/// - `max`: the maximum value
/// - `value`/`onChange`: the range bound value/change callback
/// - `minSoftBound`: the minimum value at which changes will be committed while typing a number.
///   Since numbers are typed digit-by-digit, their magnitude will usually increase from a very
///   small value. However, if the user is editing the upper bound with a lower bound set to K,
///   having the input *always* commit the values would be detrimental when the user starts typing
///   and the value is momentarily less than K, thus clamping the lower bound. Hence, minSoftBound
///   should be used on upper bounds to restrict the area in which they will live-update and thus
///   prevent modifying the lower bound unnecessarily.
function BoundEditor ({ min, max, minSoftBound, value, onChange }) {
    const [isFocused, setFocused] = useState(false);
    const [tmpValue, setTmpValue] = useState(value);

    const bindValue = v => Math.max(min, Math.min(v | 0, max));
    const softBindValue = v => {
        if (!v) return v;
        v = parseInt('' + v) | 0;
        if (min >= 0 && v < 0) v = -v;
        if (v > max) v = max;
        return v;
    };

    const commit = () => {
        onChange(bindValue(tmpValue));
    };

    const onFocus = () => {
        setTmpValue(value);
        setFocused(true);
    };
    const onBlur = () => {
        setFocused(false);
        commit();
    };
    const onInputChange = e => {
        if (isFocused) {
            const softBound = softBindValue(e.target.value);
            setTmpValue(softBound);
            const bound = bindValue(softBound);
            if (softBound === bound && bound > minSoftBound) onChange(bound);
        } else commit();
    };
    const onKeyDown = e => {
        if (e.key === 'Enter') e.target.blur();
    };

    return (
        <TextField
            type="number"
            class="bound-editor"
            center
            min={min}
            max={max}
            onFocus={onFocus}
            onBlur={onBlur}
            value={isFocused ? tmpValue : value}
            onKeyDown={onKeyDown}
            onChange={onInputChange} />
    );
}

/// Renders a range editor with inputs on either side.
function RangeEditor ({ min, max, value, onChange, tickDistance, disabled }) {
    return (
        <div class={'range-editor' + (disabled ? ' disabled' : '')}>
            <BoundEditor
                min={min}
                max={max}
                minSoftBound={min}
                value={value[0]}
                onChange={val => onChange([val, Math.max(val, value[1])])}/>
            <Slider
                min={min}
                max={max}
                value={value}
                popout
                discrete
                tickDistance={tickDistance}
                class="editor-inner"
                onChange={value => onChange(value)} />
            <BoundEditor
                min={min}
                max={max}
                minSoftBound={value[0]}
                value={value[1]}
                onChange={val => onChange([Math.min(val, value[0]), val])}/>
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
    return function TripleSwitch ({ filter, onChange, onEnabledChange }) {
        const { value, enabled } = filter;

        const selected = decode(filter.value, filter.enabled);
        isOptionDisabled = isOptionDisabled || (() => false);

        return (
            <div class="left-right-editor">
                <Segmented selected={selected} onSelect={selected => {
                    onSelect(selected, { value, onChange, enabled, onEnabledChange, filter });
                }}>
                    {[
                        {
                            id: a,
                            label: labels[a],
                            disabled: isOptionDisabled(a, value, filter),
                        },
                        {
                            id: b,
                            label: labels[b],
                            disabled: isOptionDisabled(b, value, filter),
                        },
                        {
                            id: all,
                            label: labels[all],
                            disabled: isOptionDisabled(all, value, filter),
                        },
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
    type: {
        default () {
            return { enabled: false, value: 'human' };
        },
        serialize (filter) {
            return filter.value.substr(0, 1);
        },
        deserialize (value) {
            if (value === 'o') return { enabled: true, value: 'org' };
            else if (value === 'h') return { enabled: true, value: 'human' };
            return { enabled: false, value: 'human' };
        },
        editor: tripleSwitch(
            'all',
            'human',
            'org',
            locale.members.search.codeholderTypes,
            (value, enabled) => !enabled ? 'all' : value,
            (selected, { onChange, onEnabledChange }) => {
                onEnabledChange(selected !== 'all');
                if (selected !== 'all') onChange(selected);
            },
            (id, value, filter) => {
                if (filter._constrained) {
                    if (id === 'all') return true;
                    if (id === 'org' && value === 'human') return true;
                    if (id === 'human' && value === 'org') return true;
                }
                return false;
            },
        ),
        applyConstraints (filter, filters) {
            let humanOnly = false;
            if (filters.age && filters.age.enabled) humanOnly = true;
            if (filters.deathdate && filters.deathdate.enabled) humanOnly = true;

            if (humanOnly && !filter._constrained) {
                return { value: 'human', _constrained: true, enabled: filter.enabled };
            } else if (!humanOnly && filter._constrained) {
                return { value: 'human', enabled: filter.enabled };
            }
        },
    },
    country: {
        default () {
            return { enabled: false, value: { set: [], type: null } };
        },
        serialize (filter) {
            const type = filter.value.type === 'fee' ? 'f'
                : filter.value.type === 'address' ? 'a' : '*';
            return type + '$' + filter.value.set.join(',');
        },
        deserialize (value) {
            const type = value[0] === 'f' ? 'fee' : value[0] === 'a' ? 'address' : null;
            const set = value.substr(2).split(',');
            if (!set.length) return { enabled: false, value: { set: [], type: null } };
            return { enabled: true, value: { type, set } };
        },
        editor ({ value, onChange, onEnabledChange }) {
            const selectedType = value.type === null ? 'all' : value.type;

            return (
                <Fragment>
                    <div class="country-editor-type-selector">
                        <Segmented selected={selectedType} onSelect={type => {
                            if (type === 'all') type = null;
                            onChange({ ...value, type });
                        }}>
                            {[
                                { id: 'fee', label: locale.members.search.countries.fee },
                                { id: 'address', label: locale.members.search.countries.address },
                                { id: 'all', label: locale.members.search.countries.all },
                            ]}
                        </Segmented>
                    </div>
                    <CountryPicker
                        onChange={set => {
                            onChange({ ...value, set });
                            onEnabledChange(set.length);
                        }}
                        value={value.set} />
                </Fragment>
            );
        },
    },
    enabled: {
        default () {
            return { enabled: true, value: true };
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
        default () {
            return {
                enabled: false,
                value: {
                    range: [0, 35],
                    atStartOfYear: true,
                },
            };
        },
        serialize ({ value }) {
            return value.range[0] + '-' + value.range[1] + (value.atStartOfYear ? '^' : '');
        },
        deserialize (value) {
            const match = value.match(/^(\d+)-(\d+)(\^?)/);
            if (!match) throw new Error('value does not match pattern');
            const rangeStart = +match[1] | 0;
            const rangeEnd = +match[2] | 0;
            const atStartOfYear = match[3] === '^';

            return {
                enabled: true,
                value: {
                    range: [rangeStart, rangeEnd],
                    atStartOfYear,
                },
            };
        },
        editor ({ value, onChange, enabled, onEnabledChange }) {
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
                <Fragment>
                    <div class="age-editor-top">
                        <div class="age-prime-switch">
                            <span class="age-birth-year">
                                {locale.members.search.ageBirthYear(birthYearRange)}
                            </span>
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
                        min={0}
                        max={150}
                        value={value.range}
                        disabled={!enabled}
                        onChange={range => {
                            onChange({ ...topValue, range });
                            onEnabledChange(true);
                        }}
                        tickDistance={5} />
                </Fragment>
            );
        },
    },
    hasOldCode: {
        default () {
            return { enabled: false, value: false };
        },
        editor: tripleSwitchYesNo(locale.members.search.existence),
    },
    hasEmail: {
        default () {
            return { enabled: false, value: false };
        },
        editor: tripleSwitchYesNo(locale.members.search.existence),
    },
    hasPassword: {
        default () {
            return { enabled: false, value: false };
        },
        editor: tripleSwitchYesNo(locale.members.search.boolean),
    },
    isDead: {
        default () {
            return { enabled: false, value: false };
        },
        editor: tripleSwitchYesNo(locale.members.search.boolean),
    },
    membership: {
        default () {
            return { enabled: false, value: [] };
        },
        serialize ({ value }) {
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

            return {
                enabled: true,
                value: JSON.parse(value).map(({ i, l, g, r, c }) => ({
                    invert: i,
                    lifetime: l,
                    givesMembership: g,
                    useRange: r !== null,
                    range: r ? r : [thisYear, thisYear],
                    categories: c,
                })),
            };
        },
        editor: function MembershipFilter ({
            value,
            onChange,
            onEnabledChange,
        }) {
            // FIXME: this mess
            const items = value.map(({
                invert, lifetime, givesMembership, useRange, range, categories,
            }, index) => (
                <div
                    class="membership-item"
                    key={index}>
                    <Button icon small class="membership-remove" onClick={() => {
                        const newValue = [...value];
                        newValue.splice(index, 1);
                        onChange(newValue);
                        if (!newValue.length) onEnabledChange(false);
                    }}>
                        <RemoveIcon />
                    </Button>
                    <div class="membership-item-line">
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
                    <div class="membership-item-line">
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
                    <div class="membership-item-line">
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
                    <div class="membership-item-line">
                        <MembershipCategoryPicker
                            value={categories}
                            onChange={categories => {
                                const newValue = [...value];
                                newValue[index] = {
                                    ...newValue[index],
                                    categories,
                                };
                                onChange(newValue);
                            }} />
                    </div>
                    <div class="membership-item-line membership-range-line">
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
                <div class="membership-add-container" key={-1}>
                    <Button icon small class="membership-add-button" onClick={() => {
                        const thisYear = new Date().getFullYear();

                        onChange(value.concat([{
                            invert: false,
                            lifetime: null,
                            givesMembership: null,
                            useRange: true,
                            range: [thisYear, thisYear],
                            categories: [],
                        }]));
                        onEnabledChange(true);
                    }}>
                        <AddIcon />
                    </Button>
                </div>
            );

            return (
                <div class={'membership-editor' + (!value.length ? ' is-empty' : '')}>
                    {items}
                </div>
            );
        },
    },
    isActiveMember: {
        needsSwitch: true,
        default () {
            const thisYear = new Date().getFullYear();
            return { enabled: false, value: [thisYear, thisYear] };
        },
        serialize ({ value }) {
            return value.start + '-' + value.end;
        },
        deserialize (value) {
            const match = value.match(/^(\d+)-(\d+)/);
            if (!match) throw new Error('value does not match pattern');
            const rangeStart = +match[1] | 0;
            const rangeEnd = +match[2] | 0;
            return { enabled: true, value: [rangeStart, rangeEnd] };
        },
        editor ({ value, onChange, enabled, onEnabledChange }) {
            return (
                <div class="active-member-editor">
                    <RangeEditor
                        min={1887}
                        max={new Date().getFullYear() + 4}
                        value={value}
                        disabled={!enabled}
                        tickDistance={10}
                        onChange={value => {
                            onChange(value);
                            onEnabledChange(true);
                        }} />
                </div>
            );
        },
    },
    // FIXME: duplicate code
    deathdate: {
        needsSwitch: true,
        default () {
            const thisYear = new Date().getFullYear();
            return { enabled: false, value: [thisYear, thisYear] };
        },
        serialize (value) {
            return value.start + '-' + value.end;
        },
        deserialize (value) {
            const match = value.match(/^(\d+)-(\d+)/);
            if (!match) throw new Error('value does not match pattern');
            const rangeStart = +match[1] | 0;
            const rangeEnd = +match[2] | 0;
            return { enabled: true, value: [rangeStart, rangeEnd] };
        },
        editor ({ value, onChange, enabled, onEnabledChange }) {
            return (
                <div class="death-date-editor">
                    <RangeEditor
                        min={1887}
                        max={new Date().getFullYear()}
                        value={value}
                        disabled={!enabled}
                        tickDistance={10}
                        onChange={value => {
                            onChange(value);
                            onEnabledChange(true);
                        }} />
                </div>
            );
        },
    },
};
