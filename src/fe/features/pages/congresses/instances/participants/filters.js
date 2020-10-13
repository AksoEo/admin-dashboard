import { h } from 'preact';
import Segmented from '../../../../../components/segmented';
import { congressParticipants as locale } from '../../../../../locale';
import { currencyAmount, timestamp } from '../../../../../components/data';

export const FILTERS = {
    approval: {
        default: () => ({ enabled: false, value: null }),
        serialize: ({ value }) => value,
        deserialize: value => value === 'true'
            ? ({ enabled: true, value: true })
            : ({ enabled: true, value: false }),
        editor ({ value, onChange, onEnabledChange, hidden }) {
            return (
                <div class="approval-filter">
                    <Segmented
                        class="smaller"
                        disabled={hidden}
                        selected={value || 'none'}
                        onSelect={value => {
                            onChange(value === 'none' ? null : value);
                            onEnabledChange(value !== 'none');
                        }}>
                        {Object.keys(locale.search.filters.approvalTypes).map(type => ({
                            id: type,
                            label: locale.search.filters.approvalTypes[type],
                            class: type === 'none' ? 'bordered' : '',
                        }))}
                    </Segmented>
                </div>
            );
        },
    },
    createdTime: {
        needsSwitch: true,
        default: () => ({ enabled: false, value: [new Date(), new Date()] }),
        serialize: ({ value }) => `${value[0].toISOString()}$${value[1].toISOString()}`,
        deserialize: value => ({ enabled: true, value: value.split('$').map(date => new Date(date)) }),
        editor ({ value, onChange, onEnabledChange, hidden }) {
            return (
                <div class="created-time-filter">
                    <div>
                        <timestamp.editor outline label={locale.search.filters.timeRangeStart} disabled={hidden} value={+value[0] / 1000} onChange={v => {
                            onChange([new Date(v * 1000), value[1]]);
                            onEnabledChange(true);
                        }} />
                    </div>
                    <div>
                        <timestamp.editor outline label={locale.search.filters.timeRangeEnd} disabled={hidden} value={+value[1] / 1000} onChange={v => {
                            onChange([value[0], new Date(v * 1000)]);
                            onEnabledChange(true);
                        }} />
                    </div>
                </div>
            );
        },
    },
    amountPaid: {
        needsSwitch: true,
        default: () => ({ enabled: false, value: [0, 100] }),
        serialize: ({ value }) => value.join('-'),
        deserialize: value => ({ enabled: true, value: value.split('-').map(x => +x) }),
        editor ({ value, onChange, hidden, userData }) {
            const { currency } = userData;

            return (
                <div class="amount-paid-filter">
                    <div>
                        <currencyAmount.editor
                            outline
                            currency={currency}
                            disabled={hidden}
                            value={value[0]}
                            onChange={v => {
                                onChange([v | 0, value[1]]);
                            }} />
                    </div>
                    <div>
                        <currencyAmount.editor
                            outline
                            currency={currency}
                            disabled={hidden}
                            value={value[1]}
                            onChange={v => {
                                onChange([value[0], v | 0]);
                            }} />
                    </div>
                </div>
            );
        },
    },
    hasPaidMinimum: {
        default: () => ({ enabled: false, value: null }),
        serialize: ({ value }) => value,
        deserialize: value => value === 'true'
            ? ({ enabled: true, value: true })
            : ({ enabled: true, value: false }),
        editor ({ value, onChange, onEnabledChange, hidden }) {
            return (
                <div class="paid-minimum-filter">
                    <Segmented
                        class="smaller"
                        disabled={hidden}
                        selected={value || 'none'}
                        onSelect={value => {
                            onChange(value === 'none' ? null : value);
                            onEnabledChange(value !== 'none');
                        }}>
                        {Object.keys(locale.search.filters.paidMinimumTypes).map(type => ({
                            id: type,
                            label: locale.search.filters.paidMinimumTypes[type],
                            class: type === 'none' ? 'bordered' : '',
                        }))}
                    </Segmented>
                </div>
            );
        },
    },
    validity: {
        default: () => ({ enabled: false, value: null }),
        serialize: ({ value }) => value,
        deserialize: value => value === 'true'
            ? ({ enabled: true, value: true })
            : ({ enabled: true, value: false }),
        editor ({ value, onChange, onEnabledChange, hidden }) {
            return (
                <div class="validity-filter">
                    <Segmented
                        class="smaller"
                        disabled={hidden}
                        selected={value || 'none'}
                        onSelect={value => {
                            onChange(value === 'none' ? null : value);
                            onEnabledChange(value !== 'none');
                        }}>
                        {Object.keys(locale.search.filters.validityTypes).map(type => ({
                            id: type,
                            label: locale.search.filters.validityTypes[type],
                            class: type === 'none' ? 'bordered' : '',
                        }))}
                    </Segmented>
                </div>
            );
        },
    },
    data: {
        default: () => ({ enabled: false, value: null }),
        serialize: ({ value }) => value,
        deserialize: value => ({ enabled: true, value }),
        editor ({ value, onChange }) {
            return 'todo';
        },
    },
};
