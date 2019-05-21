import React from 'react';
import Switch from '@material-ui/core/Switch';
import NumericRangeEditor from '../../editors/numeric-range';
import Segmented from '../../../../components/segmented';
import locale from '../../../../locale';

/* eslint-disable react/prop-types */

function tripleSwitch (all, a, b, labels, decode, onSelect) {
    return function TripleSwitch (props) {
        const { fieldHeader, value, onChange, enabled, onEnabledChange } = props;

        const selected = decode(value, enabled);

        return (
            <div className="left-right-editor">
                {fieldHeader}
                <Segmented selected={selected} onSelect={selected => {
                    onSelect(selected, { value, onChange, enabled, onEnabledChange });
                }}>
                    {[
                        { id: all, label: labels[all] },
                        { id: a, label: labels[a] },
                        { id: b, label: labels[b] },
                    ]}
                </Segmented>
            </div>
        );
    };
}

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
    ),
    feeCountry (props) {
        const { fieldHeader } = props;

        return (
            <div className="fee-country-editor left-right-editor">
                {fieldHeader}
                <span>todo: select</span>
            </div>
        );
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

        return (
            <div className={'age-editor' + (disabled ? ' disabled' : '')}>
                <div className="age-editor-top">
                    {fieldHeader}
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
};
