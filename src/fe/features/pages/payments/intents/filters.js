import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import Select from '../../../../components/select';
import Segmented from '../../../../components/segmented';
import { paymentIntents as locale } from '../../../../locale';

export const FILTERS = {
    customerName: {
        default: () => ({ enabled: false, value: '' }),
        serialize: ({ value }) => value,
        deserialize: value => ({ enabled: true, value }),
        editor ({ value, onChange, onEnabledChange, hidden }) {
            return <TextField
                disabled={hidden}
                value={value}
                onChange={e => {
                    const v = e.target.value;
                    onEnabledChange(!!v);
                    onChange(v);
                }} />;
        },
    },
    customerEmail: {
        default: () => ({ enabled: false, value: '' }),
        serialize: ({ value }) => value,
        deserialize: value => ({ enabled: true, value }),
        editor ({ value, onChange, onEnabledChange, hidden }) {
            return <TextField
                type="email"
                disabled={hidden}
                value={value}
                onChange={e => {
                    const v = e.target.value;
                    onEnabledChange(!!v);
                    onChange(v);
                }} />;
        },
    },
    org: {
        default: () => ({ enabled: false, value: null }),
        serialize: ({ value }) => value,
        deserialize: value => ({ enabled: true, value }),
        editor ({ value, onChange, onEnabledChange, hidden }) {
            return (
                <Segmented
                    disabled={hidden}
                    selected={value || ''}
                    onSelect={value => {
                        onEnabledChange(!!value);
                        onChange(value || null);
                    }}>
                    {Object.keys(locale.filters.orgs).map(type => ({
                        id: type,
                        label: locale.filters.orgs[type],
                    }))}
                </Segmented>
            );
        },
    },
    status: {
        default: () => ({ enabled: false, value: null }),
        serialize: ({ value }) => value,
        deserialize: value => ({ enabled: true, value }),
        editor ({ value, onChange, onEnabledChange, hidden }) {
            return <Select
                disabled={hidden}
                value={value || ''}
                onChange={value => {
                    onEnabledChange(!!value);
                    onChange(value);
                }}
                items={Object.keys(locale.filters.statuses).map(id => ({
                    value: id,
                    label: locale.filters.statuses[id],
                }))} />;
        },
    },
};
