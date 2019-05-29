import React from 'react';
import Switch from '@material-ui/core/Switch';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import Select from '@material-ui/core/Select';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import moment from 'moment';
import NumericRangeEditor, { NumericRange } from '../../editors/numeric-range';
import Segmented from '../../../../components/segmented';
import locale from '../../../../locale';
import CountryPicker from './country-picker';
import cache from '../cache';

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
        const { fieldHeader, value, onChange, enabled, onEnabledChange } = props;

        const selected = decode(value, enabled);
        isOptionDisabled = isOptionDisabled || (() => false);

        return (
            <div className="left-right-editor">
                {fieldHeader}
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
            const { fieldHeader, value, onChange } = this.props;

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
                        {fieldHeader}
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
        const { field, value, onChange, fieldHeader, disabled } = props;
        const topValue = value;

        const ageToYear = age => value.atStartOfYear
            ? moment().startOf('year').subtract(age, 'years').year()
            : moment().subtract(age, 'years').year();

        let birthYearRange;
        if (value.range.isCollapsed()) {
            birthYearRange = ageToYear(value.range.collapsedValue());
        } else {
            const start = value.range.startInclusive ? value.range.start : value.range.start + 1;
            const end = value.range.endInclusive ? value.range.end : value.range.end - 1;
            // age is the inverse of birth date; so end comes first
            birthYearRange = `${ageToYear(end)}–${ageToYear(start)}`;
        }

        return (
            <div className={'age-editor' + (disabled ? ' disabled' : '')}>
                <div className="age-editor-top">
                    {fieldHeader}
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
                    min={field.min}
                    max={field.max}
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
            const { value, onChange, fieldHeader } = this.props;
            const { categories: availableCategories } = this.state;

            const items = value.map(({
                invert, lifetime, givesMembership, useRange, range, categories,
            }, index) => (
                <div
                    className="membership-item"
                    key={index}
                    data-is-first={index === 0}
                    data-conjunction-label={locale.members.search.membership.conjunction}>
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
                                <MenuItem key={id} value={id}>
                                    {availableCategories[id].name}
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
                    {fieldHeader}
                    {items}
                </div>
            );
        }
    },
};
