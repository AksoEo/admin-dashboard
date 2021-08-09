import { h } from 'preact';
import { Fragment, useState } from 'preact/compat';
import { Checkbox, Button, Dialog } from 'yamdl';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import CloseIcon from '@material-ui/icons/Close';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import moment from 'moment';
import Segmented from '../../../components/segmented';
import { connect } from '../../../core/connection';
import { codeholders as locale } from '../../../locale';
import CountryPicker from '../../../components/country-picker';
import LargeMultiSelect from '../../../components/large-multi-select';
import RangeEditor from '../../../components/range-editor';
import { date, ueaCode } from '../../../components/data';

function makeDialogMultiSelect (view, pickSome, render, itemName, itemPreview) {
    return connect(view)(data => ({
        available: data,
    }))(function CoreMultiSelect ({ value, onChange, available, style, disabled }) {
        if (!available) return null;

        const sortedAvailable = Object.keys(available).sort((a, b) => {
            const an = itemName(available[a]);
            const bn = itemName(available[b].name);
            return an > bn ? 1 : an < bn ? -1 : 0;
        });

        return <LargeMultiSelect
            value={value}
            items={sortedAvailable}
            onChange={onChange}
            renderPreviewItem={({ id }) => itemPreview(available[id])}
            renderItemContents={({ id }) => render(available[id])}
            itemName={id => itemName(available[id])}
            title={pickSome}
            disabled={disabled}
            style={style} />;
    });
}

const MembershipCategoryPicker = makeDialogMultiSelect(
    'memberships/categories',
    locale.search.membership.pickSome,
    item => (
        <div class="codeholder-filters-membership-category-picker-item">
            <div class="item-abbrev">
                {item.nameAbbrev}
            </div>
            <div class="item-name" title={item.name}>
                {item.name}
            </div>
        </div>
    ),
    item => item.name,
    item => item.nameAbbrev,
);
const RolePicker = makeDialogMultiSelect('roles/roles', locale.search.role.pickSome, item => (
    <div class="codeholder-filters-role-picker-item">
        {item.name}
    </div>
), item => item.name, item => item.name);

/**
 * Renders a segmented control with three options, [a] [b] [all].
 * @param {Object} labels - mapping of identifiers to labels
 * @param {Function} decode - function to decode a `value` into an identifier (a, b, or all)
 * @param {Function} onSelect - select handler; is passed the identifier and a bunch of props
 * @param {Function} isOptionDisabled - if true, the option will be disabled
 * @return {Function} a functional switch component
 */
function tripleSwitch (all, a, b, labels, decode, onSelect, isOptionDisabled) {
    return function TripleSwitch ({ filter, onChange, onEnabledChange, hidden }) {
        const { value, enabled } = filter;

        const selected = decode(filter.value, filter.enabled);
        isOptionDisabled = isOptionDisabled || (() => false);

        return (
            <div class="left-right-editor">
                <Segmented class="smaller" selected={selected} onSelect={selected => {
                    onSelect(selected, { value, onChange, enabled, onEnabledChange, filter });
                }} disabled={hidden}>
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
                            class: 'bordered',
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
            locale.search.types,
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
        editor ({ value, onChange, enabled, onEnabledChange, hidden }) {
            const selectedType = value.type === null ? 'all' : value.type;

            return (
                <Fragment>
                    <CountryPicker
                        hidden={hidden}
                        onChange={set => {
                            onChange({ ...value, set });
                            onEnabledChange(set.length);
                        }}
                        value={value.set} />
                    {enabled ? (
                        <div class="country-editor-type-selector">
                            <Segmented class="smaller" selected={selectedType} onSelect={type => {
                                if (type === 'all') type = null;
                                onChange({ ...value, type });
                            }} disabled={hidden}>
                                {[
                                    { id: 'fee', label: locale.search.countryFilter.fee },
                                    { id: 'address', label: locale.search.countryFilter.address },
                                    { id: 'all', label: locale.search.countryFilter.all, class: 'bordered' },
                                ]}
                            </Segmented>
                        </div>
                    ) : null}
                </Fragment>
            );
        },
    },
    enabled: {
        default () {
            return { enabled: false, value: true };
        },
        editor: tripleSwitch(
            'all',
            'enabled',
            'disabled',
            locale.search.enabledStates,
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
        editor ({ value, onChange, enabled, onEnabledChange, hidden }) {
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
                    <RangeEditor
                        min={0}
                        max={150}
                        value={value.range}
                        faded={!enabled}
                        disabled={hidden}
                        onChange={range => {
                            onChange({ ...topValue, range });
                            onEnabledChange(true);
                        }}
                        tickDistance={5} />
                    {enabled ? (
                        <div class="age-editor-extra">
                            <span class="age-birth-year">
                                {locale.search.ageBirthYear(birthYearRange)}
                            </span>
                            <div class="age-prime-switch">
                                <label>{locale.search.agePrime}</label>
                                <Checkbox
                                    class="inner-switch"
                                    switch
                                    disabled={hidden}
                                    checked={value.atStartOfYear}
                                    onChange={checked => {
                                        onChange({ ...topValue, atStartOfYear: checked });
                                    }} />
                            </div>
                        </div>
                    ) : null}
                </Fragment>
            );
        },
    },
    hasOldCode: {
        default () {
            return { enabled: false, value: false };
        },
        editor: tripleSwitchYesNo(locale.search.existence),
    },
    hasEmail: {
        default () {
            return { enabled: false, value: false };
        },
        editor: tripleSwitchYesNo(locale.search.existence),
    },
    hasPassword: {
        default () {
            return { enabled: false, value: false };
        },
        editor: tripleSwitchYesNo(locale.search.boolean),
    },
    isDead: {
        default () {
            return { enabled: false, value: false };
        },
        editor: tripleSwitchYesNo(locale.search.boolean),
    },
    membership: {
        default () {
            return { enabled: false, value: [] };
        },
        serialize ({ value }) {
            return value.map(({
                invert, lifetime, givesMembership, useRange, range, categories,
            }) => {
                let s = '';
                if (invert) s += 'i';
                if (lifetime !== null) s += lifetime ? 'l' : 'u';
                if (givesMembership !== null) s += givesMembership ? 'm' : 'n';
                if (useRange) s += 'r' + range[0] + '-' + range[1];
                if (categories.length) s += 'c' + categories.join(',');
                return s;
            }).join('$');
        },
        deserialize (value) {
            const thisYear = new Date().getFullYear();

            const items = [];
            for (const serialized of value.split('$')) {
                const item = {
                    invert: false,
                    lifetime: null,
                    givesMembership: null,
                    useRange: false,
                    range: [thisYear, thisYear],
                    categories: [],
                };

                const c = [...serialized];

                if (c[0] === 'i') {
                    c.shift();
                    item.invert = true;
                }
                if (c[0] === 'l' || c[0] === 'u') item.lifetime = c.shift() === 'l';
                if (c[0] === 'm' || c[0] === 'n') item.givesMembership = c.shift() === 'm';
                if (c[0] === 'r') {
                    c.shift();
                    let d = '';
                    while (c.length && c[0] !== 'c') d += c.shift();
                    item.range = d.split('-').slice(0, 2).map(x => +x);
                    item.useRange = true;
                }
                if (c[0] === 'c') {
                    c.shift();
                    let d = '';
                    while (c.length) d += c.shift();
                    item.categories = d.split(',');
                }

                items.push(item);
            }

            return {
                enabled: true,
                value: items,
            };
        },
        editor: function MembershipFilter ({
            value,
            onChange,
            onEnabledChange,
            hidden,
        }) {
            // FIXME: this mess
            const items = value.map(({
                invert, lifetime, givesMembership, useRange, range, categories,
            }, index) => (
                <div
                    class="membership-item"
                    key={index}>
                    <Button icon small class="membership-remove" disabled={hidden} onClick={() => {
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
                        }} disabled={hidden} class="smaller">
                            {[
                                {
                                    id: 'yes',
                                    label: locale.search.membership.invert.yes,
                                },
                                {
                                    id: 'no',
                                    label: locale.search.membership.invert.no,
                                },
                            ]}
                        </Segmented>
                    </div>
                    <div class="membership-item-line">
                        <Segmented
                            class="smaller"
                            selected={lifetime ? 'yes' : lifetime === false ? 'no' : 'all'}
                            onSelect={selected => {
                                const newValue = [...value];
                                newValue[index] = {
                                    ...newValue[index],
                                    lifetime: selected === 'yes'
                                        ? true : selected === 'no' ? false : null,
                                };
                                onChange(newValue);
                            }} disabled={hidden}>
                            {[
                                {
                                    id: 'yes',
                                    label: locale.search.membership.lifetime.yes,
                                },
                                {
                                    id: 'no',
                                    label: locale.search.membership.lifetime.no,
                                },
                                {
                                    id: 'all',
                                    label: locale.search.membership.lifetime.all,
                                    class: 'bordered',
                                },
                            ]}
                        </Segmented>
                    </div>
                    <div class="membership-item-line">
                        <Segmented
                            class="smaller"
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
                            }} disabled={hidden}>
                            {[
                                {
                                    id: 'yes',
                                    label: locale.search.membership.givesMembership.yes,
                                },
                                {
                                    id: 'no',
                                    label: locale.search.membership.givesMembership.no,
                                },
                                {
                                    id: 'all',
                                    label: locale.search.membership.givesMembership.all,
                                    class: 'bordered',
                                },
                            ]}
                        </Segmented>
                    </div>
                    <div class="membership-item-line">
                        <MembershipCategoryPicker
                            value={categories}
                            disabled={hidden}
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
                            disabled={hidden}
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
                            faded={!useRange}
                            disabled={hidden}
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
                        {locale.search.membership.conjunction}
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
                    }} disabled={hidden}>
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
    roles: {
        default () {
            return {
                enabled: false,
                value: {
                    roles: [],
                    date: moment().format('YYYY-MM-DD'),
                },
            };
        },
        serialize ({ value }) {
            return value.roles.join(',') + '$' + value.date;
        },
        deserialize (value) {
            const parts = value.split('$');
            return { enabled: true, value: { roles: parts[0].split(','), date: parts[1] } };
        },
        editor ({ value, onChange, enabled, onEnabledChange, hidden }) {
            return (
                <Fragment>
                    <RolePicker
                        style={{ width: '100%' }}
                        disabled={hidden}
                        value={value.roles}
                        onChange={roles => {
                            onChange({ ...value, roles });
                            onEnabledChange(!!roles.length);
                        }} />
                    {enabled ? (
                        <div class="role-editor-date">
                            <label>
                                {locale.search.role.activeAtTime}
                            </label>
                            <date.editor
                                outline
                                class="role-date-editor"
                                placeholder={locale.search.role.anyTime}
                                value={value.date}
                                onChange={date => onChange({ ...value, date: date })}
                                disabled={hidden}
                                trailing={value.date ? (
                                    <span
                                        class="date-editor-clear"
                                        onClick={() => onChange({ ...value, date: '' })}>
                                        <CloseIcon />
                                    </span>
                                ) : null}
                                tabIndex={hidden ? -1 : undefined} />
                        </div>
                    ) : null}
                </Fragment>
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
            return value[0] + '-' + value[1];
        },
        deserialize (value) {
            const match = value.match(/^(\d+)-(\d+)/);
            if (!match) throw new Error('value does not match pattern');
            const rangeStart = +match[1] | 0;
            const rangeEnd = +match[2] | 0;
            return { enabled: true, value: [rangeStart, rangeEnd] };
        },
        editor ({ value, onChange, enabled, onEnabledChange, hidden }) {
            return (
                <div class="active-member-editor">
                    <RangeEditor
                        min={1887}
                        max={new Date().getFullYear() + 4}
                        value={value}
                        faded={!enabled}
                        disabled={hidden}
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
        serialize ({ value }) {
            return value[0] + '-' + value[1];
        },
        deserialize (value) {
            const match = value.match(/^(\d+)-(\d+)/);
            if (!match) throw new Error('value does not match pattern');
            const rangeStart = +match[1] | 0;
            const rangeEnd = +match[2] | 0;
            return { enabled: true, value: [rangeStart, rangeEnd] };
        },
        editor ({ value, onChange, enabled, onEnabledChange, hidden }) {
            return (
                <div class="death-date-editor">
                    <RangeEditor
                        min={1887}
                        max={new Date().getFullYear()}
                        value={value}
                        faded={!enabled}
                        disabled={hidden}
                        tickDistance={10}
                        onChange={value => {
                            onChange(value);
                            onEnabledChange(true);
                        }} />
                </div>
            );
        },
    },
    codeList: {
        default () {
            return { enabled: false, value: [] };
        },
        serialize ({ value }) {
            return value.join(',');
        },
        deserialize (value) {
            return { enabled: true, value: value.split(',') };
        },
        editor ({ value, onChange, enabled, onEnabledChange }) {
            const [pickerOpen, setPickerOpen] = useState(false);

            let pickedCodes = (
                <span class="picker-placeholder">
                    {locale.search.codeList.pickCodes}
                </span>
            );

            if (enabled) {
                pickedCodes = [];
                for (const code of value) {
                    if (pickedCodes.length) pickedCodes.push(' ');
                    pickedCodes.push(<ueaCode.inlineRenderer key={code} value={code} />);
                }
            }

            return (
                <div class="code-list-editor">
                    <div class="code-picker" onClick={() => setPickerOpen(true)}>
                        <span class="picked-codes">
                            {pickedCodes}
                        </span>
                        <ExpandMoreIcon className="expand-icon" />
                    </div>

                    <Dialog
                        class="codeholders-code-list-picker"
                        title={locale.search.codeList.pickCodes}
                        backdrop
                        fullScreen={width => width < 600}
                        open={pickerOpen}
                        onClose={() => setPickerOpen(false)}
                        actions={[
                            {
                                label: locale.search.codeList.ok,
                                action: () => setPickerOpen(false),
                            },
                        ]}>
                        <p>
                            {locale.search.codeList.description}
                        </p>
                        <textarea
                            class="picker-text-box"
                            value={value.join('\n')}
                            spellCheck="false"
                            onChange={e => {
                                const value = e.target.value;
                                onChange(value.split('\n'));
                                onEnabledChange(!!value.trim());
                            }} />
                    </Dialog>
                </div>
            );
        },
    },
};
