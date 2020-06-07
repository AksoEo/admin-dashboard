import { h } from 'preact';
import { Checkbox, TextField } from '@cpsdqs/yamdl';
import { Validator } from '../../../../../components/form';
import Segmented from '../../../../../components/segmented';
import Select from '../../../../../components/select';
import StripeIcon from '../../../../../components/stripe-icon';
import MdField from '../../../../../components/md-field';
import { timespan } from '../../../../../components/data';
import { paymentMethods as locale, currencies } from '../../../../../locale';
import './fields.less';

export function PaymentMethodType ({ value }) {
    if (value === 'stripe') return <span class="payment-method-type is-stripe"><StripeIcon />™</span>;
    else if (value === 'manual') return <span class="payment-method-type">{locale.fields.types[value]}</span>;
    return null;
}

export const FIELDS = {
    type: {
        slot: 'titleAlt',
        component ({ value, editing, onChange, isCreation }) {
            if (isCreation && editing) {
                if (!value) onChange(Object.keys(locale.fields.types)[0]);

                return (
                    <Segmented
                        selected={value}
                        onSelect={onChange}>
                        {Object.entries(locale.fields.types).map(([k, v]) => ({ id: k, label: v }))}
                    </Segmented>
                );
            }
            return <PaymentMethodType value={value} />;
        },
        weight: 0.5,
    },
    name: {
        slot: 'title',
        component ({ value, editing, onChange, isCreation, slot }) {
            if (editing) {
                return <Validator
                    component={TextField}
                    label={isCreation ? locale.fields.name : null}
                    validate={value => {
                        if (!value) throw { error: locale.update.nameRequired };
                    }}
                    value={value}
                    onChange={e => onChange(e.target.value)} />;
            }
            if (slot === 'title') return <b>{value}</b>;
            return value;
        },
    },
    internalDescription: {
        skipLabel: true,
        component ({ value, editing, onChange, isCreation }) {
            if (editing) {
                return <TextField
                    label={isCreation ? locale.fields.internalDescription : null}
                    value={value}
                    onChange={e => onChange(e.target.value)} />;
            }
            return value;
        },
        weight: 2,
    },
    description: {
        wantsCreationLabel: true,
        component ({ value, editing, onChange, isCreation, slot }) {
            return <MdField
                rules={['emphasis', 'strikethrough', 'link', 'list', 'table']}
                value={value}
                editing={editing}
                inline={slot !== 'detail' && !isCreation}
                onChange={onChange} />;
        },
    },
    stripeMethods: {
        wantsCreationLabel: true,
        component ({ value, editing, onChange }) {
            const v = value || [];

            const items = [];
            for (const k in locale.fields.stripeMethodValues) {
                const name = locale.fields.stripeMethodValues[k];
                if (!editing && !v.includes(k)) continue;
                items.push(
                    <li key={k}>
                        {editing ? (
                            <Checkbox
                                checked={v.includes(k)}
                                onChange={checked => {
                                    const s = new Set(v);
                                    if (checked) s.add(k);
                                    else s.delete(k);
                                    onChange([...s]);
                                }} />
                        ) : null}
                        {' '}
                        <label>
                            {name}
                        </label>
                    </li>
                );
            }

            return (
                <ul class="payment-method-stripe-methods">
                    {items}
                </ul>
            );
        },
        shouldHide: item => item.type !== 'stripe',
    },
    currencies: {
        wantsCreationLabel: true,
        component ({ value, editing, onChange }) {
            if (editing) {
                return (
                    <Select
                        multi value={value || []}
                        onChange={onChange}
                        emptyLabel={locale.fields.noCurrenciesSelected}
                        items={Object.entries(currencies).map(([k, v]) => ({
                            value: k,
                            shortLabel: k,
                            label: v,
                        }))} />
                );
            }

            // FIXME: prettify
            return value && value.join(', ');
        },
    },
    paymentValidity: {
        wantsCreationLabel: true,
        component ({ value, editing, onChange }) {
            if (editing) {
                return (
                    <div class="payment-validity">
                        <Select
                            value={typeof value !== 'number' ? 'forever' : 'limited'}
                            items={Object.entries(locale.fields.paymentValidityTypes)
                                .map(([k, v]) => ({ value: k, label: v }))}
                            onChange={value => {
                                if (value === 'limited') onChange(0);
                                else onChange(null);
                            }} />
                        {typeof value === 'number' ? (
                            <timespan.editor
                                value={value}
                                onChange={value => onChange(value)} />
                        ) : null}
                    </div>
                );
            }
            return value === null
                ? locale.fields.paymentValidityTypes.forever
                : <timespan.renderer value={value} />;
        },
    },
    isRecommended: {
        wantsCreationLabel: true,
        component ({ value, editing, onChange }) {
            if (editing) {
                return <Checkbox checked={value} onChange={onChange} />;
            }
            return value && value.toString();
        },
    },
    stripePublishableKey: {
        component ({ value, editing, onChange }) {
            if (editing) {
                return (
                    <TextField
                        label={locale.fields.stripePublishableKey}
                        value={value}
                        onChange={e => onChange(e.target.value)} />
                );
            }
            return value;
        },
        shouldHide: item => item.type !== 'stripe',
    },
};

export const CREATION_FIELDS = {
    ...FIELDS,
    stripeSecretKey: {
        component ({ value, onChange }) {
            return (
                <TextField
                    label={locale.fields.stripeSecretKey}
                    value={value}
                    onChange={e => onChange(e.target.value)} />
            );
        },
        shouldHide: item => item.type !== 'stripe',
    },
};
