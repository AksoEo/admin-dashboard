import { h } from 'preact';
import NativeSelect from '@material-ui/core/NativeSelect';
import Segmented from '../../../components/segmented';
import { timestamp } from '../../../components/data';
import { votes as locale } from '../../../locale';

export default {
    org: {
        default: () => ({ enabled: false, value: null }),
        serialize: ({ value }) => value || 'none',
        deserialize: value => value === 'none'
            ? ({ enabled: false, value: null })
            : ({ enabled: true, value }),
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="org-filter">
                    <Segmented
                        selected={value || 'none'}
                        onSelect={value => {
                            onChange(value === 'none' ? null : value);
                            onEnabledChange(value !== 'none');
                        }}>
                        {Object.keys(locale.filters.orgTypes).map(type => ({
                            id: type,
                            label: locale.filters.orgTypes[type],
                        }))}
                    </Segmented>
                </div>
            );
        },
    },
    state: {
        default: () => ({ enabled: false, value: null }),
        serialize: ({ value }) => value || 'none',
        deserialize: value => value === 'none'
            ? ({ enabled: false, value: null })
            : ({ enabled: true, value }),
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="state-filter">
                    <Segmented
                        selected={value || 'none'}
                        onSelect={value => {
                            onChange(value === 'none' ? null : value);
                            onEnabledChange(value !== 'none');
                        }}>
                        {Object.keys(locale.filters.stateTypes).map(type => ({
                            id: type,
                            label: locale.filters.stateTypes[type],
                        }))}
                    </Segmented>
                </div>
            );
        },
    },
    type: {
        default: () => ({ enabled: false, value: null }),
        serialize: ({ value }) => value || 'none',
        deserialize: value => value === 'none'
            ? ({ enabled: false, value: null })
            : ({ enabled: true, value }),
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="state-filter">
                    <NativeSelect
                        value={value || 'none'}
                        onChange={e => {
                            const value = e.target.value;
                            onChange(value === 'none' ? null : value);
                            onEnabledChange(value !== 'none');
                        }}>
                        {Object.keys(locale.types).concat(['none']).map(type => (
                            <option value={type} key={type}>
                                {type === 'none' ? locale.filters.noneType : locale.types[type]}
                            </option>
                        ))}
                    </NativeSelect>
                </div>
            );
        },
    },
    timeStart: {
        needsSwitch: true,
        default: () => ({ enabled: false, value: [+new Date() / 1000, +new Date() / 1000] }),
        serialize: ({ value }) => `${new Date(value[0] * 1000).toISOString()}$${new Date(value[1] * 1000).toISOString()}`,
        deserialize: value => value.split('$').map(t => Math.round(+new Date(t) / 1000)),
        editor ({ value, onChange }) {
            return (
                <div class="time-range-editor">
                    <timestamp.editor
                        value={value[0]}
                        onChange={v => onChange([v, value[1]])} />
                    <timestamp.editor
                        value={value[1]}
                        onChange={v => onChange([value[0], v])} />
                </div>
            );
        },
    },
    get timeEnd () {
        return this.timeStart;
    },
};
