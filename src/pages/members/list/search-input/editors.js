import React from 'react';
import Switch from '@material-ui/core/Switch';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import Select from '@material-ui/core/Select';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import CheckIcon from '@material-ui/icons/Check';
import moment from 'moment';
import NumericRangeEditor, { NumericRange } from '../../editors/numeric-range';
import Segmented from '../../../../components/segmented';
import locale from '../../../../locale';
import CountryPicker from './country-picker';
import cache from '../../../../cache';

/* eslint-disable react/prop-types */

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

/** Predicate editors. */
export default {
    codeholderType: tripleSwitch(
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
    country: class CountryEditor extends React.PureComponent {
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
    enabled: tripleSwitch(
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
    age (props) {
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

        const start = value.range.startInclusive ? value.range.start : value.range.start + 1;
        const end = value.range.endInclusive ? value.range.end : value.range.end - 1;
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
                        <Switch
                            checked={value.atStartOfYear}
                            onChange={e => {
                                onChange({ ...topValue, atStartOfYear: e.target.checked });
                            }} />
                    </div>
                </div>
                <NumericRangeEditor
                    min={filter.min}
                    max={filter.max}
                    value={value.range}
                    disabled={disabled}
                    onChange={value => onChange({ ...topValue, range: value })} />
            </div>
        );
    },
    hasOldCode: tripleSwitchYesNo(locale.members.search.existence),
    hasEmail: tripleSwitchYesNo(locale.members.search.existence),
    hasPassword: tripleSwitchYesNo(locale.members.search.boolean),
    isDead: tripleSwitchYesNo(locale.members.search.boolean),
    membership: class Membership extends React.PureComponent {
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
                    <IconButton className="membership-remove" onClick={() => {
                        const newValue = [...value];
                        newValue.splice(index, 1);
                        onChange(newValue);
                    }}>
                        <RemoveIcon />
                    </IconButton>
                    <div className="membership-item-line">
                        <Segmented selected={invert ? 'yes' : 'no'} onSelect={selected => {
                            const newValue = [...value];
                            newValue[index] = { ...newValue[index], invert: selected === 'yes' };
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
                            className="membership-range-checkbox"
                            checked={useRange}
                            onChange={e => {
                                const newValue = [...value];
                                newValue[index] = { ...newValue[index], useRange: e.target.checked };
                                onChange(newValue);
                            }} />
                        <NumericRangeEditor
                            min={1887}
                            max={new Date().getFullYear()}
                            value={range}
                            disabled={!useRange}
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
                    <IconButton className="membership-add-button" onClick={() => {
                        const thisYear = new Date().getFullYear();

                        onChange(value.concat([{
                            invert: false,
                            lifetime: null,
                            givesMembership: null,
                            useRange: true,
                            range: new NumericRange(thisYear, thisYear, true, true),
                            categories: [],
                        }]));
                    }}>
                        <AddIcon />
                    </IconButton>
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
    isActiveMember (props) {
        const { filter, value, onChange, fieldHeader, disabled } = props;

        return (
            <div className="active-member-editor">
                {fieldHeader}
                <NumericRangeEditor
                    min={filter.min}
                    max={filter.max}
                    value={value}
                    disabled={disabled}
                    onChange={onChange} />
            </div>
        );
    },
};
