import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import NativeSelect from '@material-ui/core/NativeSelect';
import CodeholderPicker from '../../../../components/codeholder-picker';
import RangeEditor from '../../../../components/range-editor';
import { httpLog as locale } from '../../../../locale';

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
                    <NativeSelect
                        value={value}
                        disabled={hidden}
                        onChange={e => onChange(e.target.value)}>
                        {[
                            'GET',
                            'POST',
                            'PUT',
                            'PATCH',
                            'DELETE',
                            'HEAD',
                            'CONNECT',
                            'OPTIONS',
                            'TRACE',
                        ].map(x => <option key={x} value={x}>{x}</option>)}
                    </NativeSelect>
                </div>
            );
        },
    },
    path: {
        default: () => ({ enabled: false, value: '' }),
        serialize: ({ value }) => (value.invert ? '^' : '') + value.path,
        deserialize: value => ({
            enabled: true,
            value: value.startsWith('^')
                ? { invert: true, path: value.substr(1) }
                : { invert: false, path: value },
        }),
        editor ({ value, onChange, onEnabledChange, hidden }) {
            return (
                <div class="path-filter">
                    <NativeSelect
                        className="path-filter-invert"
                        value={value.invert ? 'inverted' : ''}
                        onChange={e => {
                            onChange({ ...value, invert: e.target.value === 'inverted' });
                        }}>
                        <option value="">{locale.search.filters.pathStartsWith}</option>
                        <option value="inverted">{locale.search.filters.pathInverted}</option>
                    </NativeSelect>
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
