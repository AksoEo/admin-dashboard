import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import Select from '../../../../components/select';
import CodeholderPicker from '../../../../components/codeholder-picker';
import RangeEditor from '../../../../components/range-editor';
import { httpLog as locale } from '../../../../locale';
import { timestamp } from '../../../../components/data';

const MIN_TIME = new Date('2019-05-21T18:00:00Z');

export default {
    codeholders: {
        default: () => ({ enabled: false, value: [] }),
        serialize: ({ value }) => value.join(','),
        deserialize: value => ({ enabled: true, value: value.split(',') }),
        editor ({ value, onChange, onEnabledChange }) {
            return <CodeholderPicker value={value} onChange={value => {
                onChange(value);
                onEnabledChange(!!value.length);
            }} />;
        },
    },
    time: {
        needsSwitch: true,
        default: () => ({ enabled: false, value: [MIN_TIME, new Date()] }),
        serialize: ({ value }) => `${value[0].toISOString()}$${value[1].toISOString()}`,
        deserialize: value => ({ enabled: true, value: value.split('$').map(date => new Date(date)) }),
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="time-filter">
                    <timestamp.editor value={+value[0] / 1000} onChange={v => {
                        onChange([new Date(v * 1000), value[1]]);
                        onEnabledChange(true);
                    }} />
                    <timestamp.editor value={+value[1] / 1000} onChange={v => {
                        onChange([value[0], new Date(v * 1000)]);
                        onEnabledChange(true);
                    }} />
                </div>
            );
        },
    },
    apiKey: {
        default: () => ({ enabled: false, value: '' }),
        serialize: ({ value }) => value,
        deserialize: value => ({ enabled: true, value }),
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="api-key-filter">
                    <TextField value={value} onChange={e => {
                        onChange(e.target.value);
                        onEnabledChange(!!e.target.value);
                    }} />
                </div>
            );
        },
    },
    ip: {
        default: () => ({ enabled: false, value: '' }),
        serialize: ({ value }) => value,
        deserialize: value => ({ enabled: true, value }),
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="ip-filter">
                    <TextField value={value} onChange={e => {
                        onChange(e.target.value);
                        onEnabledChange(!!e.target.value);
                    }} />
                </div>
            );
        },
    },
    origin: {
        default: () => ({ enabled: false, value: '' }),
        serialize: ({ value }) => value,
        deserialize: value => ({ enabled: true, value }),
        editor ({ value, onChange, onEnabledChange, hidden }) {
            return (
                <div class="origin-filter">
                    <TextField
                        disabled={hidden}
                        placeholder={locale.search.filters.originPlaceholder}
                        value={value}
                        onChange={e => {
                            onChange(e.target.value);
                            onEnabledChange(!!e.target.value);
                        }} />
                </div>
            );
        },
    },
    method: {
        needsSwitch: true,
        default: () => ({ enabled: false, value: '' }),
        serialize: ({ value }) => value,
        deserialize: value => ({ enabled: true, value }),
        editor ({ value, onChange, hidden }) {
            return (
                <div class="method-filter">
                    <Select
                        value={value}
                        disabled={hidden}
                        onChange={onChange}
                        items={[
                            'GET',
                            'POST',
                            'PUT',
                            'PATCH',
                            'DELETE',
                            'HEAD',
                            'CONNECT',
                            'OPTIONS',
                            'TRACE',
                        ].map(x => ({ value: x, label: x }))} />
                </div>
            );
        },
    },
    path: {
        default: () => ({ enabled: false, value: '' }),
        serialize: ({ value }) => (value.type === 'invert'
            ? '!'
            : value.type === 'prefix' ? '^' : '') + value.path,
        deserialize: value => ({
            enabled: true,
            value: value.startsWith('!')
                ? { type: 'invert', path: value.substr(1) }
                : value.startsWith('^')
                    ? { type: 'prefix', path: value.substr(1) }
                    : { type: 'eq', path: value },
        }),
        editor ({ value, onChange, onEnabledChange, hidden }) {
            return (
                <div class="path-filter">
                    <Select
                        class="path-filter-invert"
                        value={value.type}
                        onChange={type => onChange({ ...value, type })}
                        items={[
                            {
                                value: 'eq',
                                label: locale.search.filters.pathEq,
                            },
                            {
                                value: 'prefix',
                                label: locale.search.filters.pathStartsWith,
                            },
                            {
                                value: 'invert',
                                label: locale.search.filters.pathInverted,
                            },
                        ]} />
                    <TextField
                        class="path-filter-path"
                        value={value.path}
                        disabled={hidden}
                        placeholder={locale.search.filters.pathPlaceholder}
                        onChange={e => {
                            onChange({ ...value, path: e.target.value });
                            onEnabledChange(!!e.target.value);
                        }} />
                </div>
            );
        },
    },
    resStatus: {
        default: () => ({ enabled: false, value: '' }),
        serialize: ({ value }) => value,
        deserialize: value => ({ enabled: true, value }),
        editor ({ value, onChange, onEnabledChange, hidden }) {
            return (
                <div class="res-status-filter">
                    <TextField
                        value={value}
                        disabled={hidden}
                        placeholder={locale.search.filters.resStatusPlaceholder}
                        onChange={e => {
                            onChange(e.target.value);
                            onEnabledChange(!!e.target.value);
                        }} />
                </div>
            );
        },
    },
    resTime: {
        needsSwitch: true,
        default: () => ({ enabled: false, value: [0, 1000] }),
        serialize: ({ value }) => value.join('-'),
        deserialize: value => ({ enabled: true, value: value.split('-').map(x => +x) }),
        editor ({ value, onChange, enabled, onEnabledChange, hidden }) {
            return (
                <div class="res-time-filter">
                    <RangeEditor
                        min={0}
                        tickDistance={100}
                        max={10000}
                        value={value}
                        faded={!enabled}
                        disabled={hidden}
                        onChange={range => {
                            onChange(range);
                            onEnabledChange(true);
                        }} />
                </div>
            );
        },
    },
};
