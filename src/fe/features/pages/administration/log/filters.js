import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import CodeholderPicker from '../../../../components/codeholder-picker';

const MIN_TIME = new Date('2019-05-21T18:00:00Z');

function DateTimeEditor ({ value, onChange }) {
    const dateParts = value.toISOString().split('T');
    const timePart = dateParts[1].match(/^(\d{1,2}:\d{2})/)[1];

    return (
        <span class="date-time-editor">
            <input type="date" value={dateParts[0]} onChange={e => {
                const v = e.target.value;
                const date = new Date(v + 'T' + dateParts[1]);
                if (Number.isFinite(+date)) onChange(date);
            }} />
            <input type="time" value={timePart} onChange={e => {
                const v = e.target.value;
                const timePart = v.match(/^(\d{1,2}:\d{2})/)[1];
                const date = new Date(dateParts[0] + 'T' + timePart + ':00Z');
                if (Number.isFinite(+date)) onChange(date);
            }} />
        </span>
    );
}

export default {
    codeholders: {
        default: () => ({ enabled: false, value: [] }),
        serialize: value => value.join(','),
        deserialize: value => value.split(','),
        editor: CodeholderPicker,
    },
    time: {
        needsSwitch: true,
        default: () => ({ enabled: false, value: [MIN_TIME, new Date()] }),
        serialize: value => `${value[0].toISOString()}$${value[1].toISOString()}`,
        deserialize: value => value.split('$').map(date => new Date(date)),
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="time-filter">
                    <DateTimeEditor value={value[0]} onChange={v => {
                        onChange([v, value[1]]);
                        onEnabledChange(true);
                    }} />
                    <DateTimeEditor value={value[1]} onChange={v => {
                        onChange([value[0], v]);
                        onEnabledChange(true);
                    }} />
                </div>
            );
        },
    },
    apiKey: {
        default: () => ({ enabled: false, value: '' }),
        serialize: value => value,
        deserialize: value => value,
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
        serialize: value => value,
        deserialize: value => value,
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
        serialize: value => value,
        deserialize: value => value,
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="origin-filter">
                    <TextField value={value} onChange={e => {
                        onChange(e.target.value);
                        onEnabledChange(!!e.target.value);
                    }} />
                </div>
            );
        },
    },
    method: {
        default: () => ({ enabled: false, value: '' }),
        serialize: value => value,
        deserialize: value => value,
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="method-filter">
                    <TextField value={value} onChange={e => {
                        onChange(e.target.value);
                        onEnabledChange(!!e.target.value);
                    }} />
                </div>
            );
        },
    },
    path: {
        default: () => ({ enabled: false, value: '' }),
        serialize: value => value,
        deserialize: value => value,
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="path-filter">
                    <TextField value={value} onChange={e => {
                        onChange(e.target.value);
                        onEnabledChange(!!e.target.value);
                    }} />
                </div>
            );
        },
    },
    resStatus: {
        default: () => ({ enabled: false, value: '' }),
        serialize: value => value,
        deserialize: value => value,
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="res-status-filter">
                    <TextField value={value} onChange={e => {
                        onChange(e.target.value);
                        onEnabledChange(!!e.target.value);
                    }} />
                </div>
            );
        },
    },
    resTime: {
        default: () => ({ enabled: false, value: '' }),
        serialize: value => value,
        deserialize: value => value,
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="res-time-filter">
                    <TextField value={value} onChange={e => {
                        onChange(e.target.value);
                        onEnabledChange(!!e.target.value);
                    }} />
                </div>
            );
        },
    },
};
