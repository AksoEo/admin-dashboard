import { h } from 'preact';
import { TextField } from 'yamdl';
import Select from '../../../../components/controls/select';
import Segmented from '../../../../components/controls/segmented';
import { paymentIntents as locale } from '../../../../locale';

export const FILTERS = {
    customerName: {
        default: () => ({ enabled: false, value: '' }),
        serialize: ({ value }) => value,
        deserialize: value => ({ enabled: true, value }),
        editor ({ value, onChange, onEnabledChange, hidden }) {
            return <TextField
                outline
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
                outline
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
                    class="smaller"
                    disabled={hidden}
                    selected={value || ''}
                    onSelect={value => {
                        onEnabledChange(!!value);
                        onChange(value || null);
                    }}>
                    {Object.keys(locale.filters.orgs).map(type => ({
                        id: type,
                        label: locale.filters.orgs[type],
                        class: !type ? 'bordered' : '',
                    }))}
                </Segmented>
            );
        },
    },
    status: {
        default: () => ({ enabled: false, value: [] }),
        serialize: ({ value }) => value.join(','),
        deserialize: value => ({ enabled: true, value: value.split(',') }),
        editor ({ value, onChange, onEnabledChange, hidden }) {
            return <Select
                disabled={hidden}
                multi
                value={value || []}
                onChange={value => {
                    onEnabledChange(!!value.length);
                    onChange(value);
                }}
                emptyLabel={locale.filters.statuses['']}
                items={Object.keys(locale.filters.statuses).filter(id => id).map(id => ({
                    value: id,
                    label: locale.filters.statuses[id],
                    shortLabel: locale.filters.shortStatuses[id],
                }))} />;
        },
    },
    purposeType: {
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
                items={[{
                    value: '',
                    label: locale.filters.optionNone,
                }].concat(Object.keys(locale.fields.purposeTypes).map(id => ({
                    value: id,
                    label: locale.fields.purposeTypes[id],
                })))} />;
        },
    },
    purposeInvalid: {
        default: () => ({ enabled: false, value: null }),
        serialize: ({ value }) => value ? 'j' : 'n',
        deserialize: value => ({ enabled: true, value: value === 'j' }),
        editor ({ value, onChange, onEnabledChange, hidden }) {
            return <Select
                disabled={hidden}
                value={value === null ? '' : value ? 'yes' : 'no'}
                onChange={value => {
                    onEnabledChange(!!value);
                    onChange(value ? value === 'yes' : null);
                }}
                items={[{
                    value: '',
                    label: locale.filters.optionNone,
                }, {
                    value: 'no',
                    label: locale.filters.purposeInvalidNo,
                }, {
                    value: 'yes',
                    label: locale.filters.purposeInvalidYes,
                }]} />;
        },
    },
    purposeTrigger: {
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
                items={[{
                    value: '',
                    label: locale.filters.optionNone,
                }].concat(Object.keys(locale.triggers).map(id => ({
                    value: id,
                    label: locale.triggers[id],
                })))} />;
        },
    },
    purposeTriggerStatus: {
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
                items={[{
                    value: '',
                    label: locale.filters.optionNone,
                }].concat(Object.keys(locale.fields.purpose.triggerStatuses).map(id => ({
                    value: id,
                    label: locale.fields.purpose.triggerStatuses[id],
                })))} />;
        },
    },
    purposeDataId: {
        default: () => ({ enabled: false, value: null }),
        serialize: ({ value }) => value,
        deserialize: value => ({ enabled: true, value }),
        editor ({ value, onChange, onEnabledChange, hidden }) {
            return <TextField
                outline
                disabled={hidden}
                value={value || ''}
                onChange={e => {
                    const value = e.target.value;
                    onEnabledChange(!!value);
                    onChange(value);
                }} />;
        },
    },
};
