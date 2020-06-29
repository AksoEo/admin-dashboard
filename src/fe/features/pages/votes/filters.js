import { h } from 'preact';
import Select from '../../../components/select';
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
                        class="smaller"
                        selected={value || 'none'}
                        onSelect={value => {
                            onChange(value === 'none' ? null : value);
                            onEnabledChange(value !== 'none');
                        }}>
                        {Object.keys(locale.filters.orgTypes).map(type => ({
                            id: type,
                            label: locale.filters.orgTypes[type],
                            class: type === 'none' ? 'bordered' : '',
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
                    <Select
                        value={value || 'none'}
                        onChange={value => {
                            onChange(value === 'none' ? null : value);
                            onEnabledChange(value !== 'none');
                        }}
                        items={Object.keys(locale.filters.stateTypes).map(type => ({
                            value: type,
                            label: locale.filters.stateTypes[type],
                        }))} />
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
                    <Select
                        value={value || 'none'}
                        onChange={value => {
                            onChange(value === 'none' ? null : value);
                            onEnabledChange(value !== 'none');
                        }}
                        items={Object.keys(locale.types).concat(['none']).map(type => ({
                            value: type,
                            label: type === 'none' ? locale.filters.noneType : locale.types[type],
                        }))} />
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
                    <div>
                        <timestamp.editor
                            label={locale.filters.timeRangeStart}
                            value={value[0]}
                            onChange={v => onChange([v, value[1]])} />
                    </div>
                    <div>
                        <timestamp.editor
                            label={locale.filters.timeRangeEnd}
                            value={value[1]}
                            onChange={v => onChange([value[0], v])} />
                    </div>
                </div>
            );
        },
    },
    get timeEnd () {
        return this.timeStart;
    },
};
