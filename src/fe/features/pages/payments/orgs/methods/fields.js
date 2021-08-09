import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Checkbox, TextField } from 'yamdl';
import CreditCardIcon from '@material-ui/icons/CreditCard';
import CheckIcon from '@material-ui/icons/Check';
import { Validator } from '../../../../../components/form';
import Segmented from '../../../../../components/segmented';
import Select from '../../../../../components/select';
import StripeIcon from '../../../../../components/stripe-icon';
import MdField from '../../../../../components/md-field';
import { currencyAmount, timespan } from '../../../../../components/data';
import { paymentMethods as locale, currencies } from '../../../../../locale';
import './fields.less';

export function PaymentMethodType ({ value }) {
    if (value === 'stripe') return <span class="payment-method-type is-stripe"><StripeIcon />™</span>;
    else if (value === 'manual') return <span class="payment-method-type">{locale.fields.types[value]}</span>;
    return null;
}

const STRIPE_METHOD_ICONS = {
    card: CreditCardIcon,
};
const STRIPE_METHOD_EXTRA = {
    card: () => {
        return (
            <span class="credit-card-types">
                <img draggable={0} src="/assets/payments/accept_visa.png" />
                <img draggable={0} src="/assets/payments/accept_mc.svg" />
                <img draggable={0} src="/assets/payments/accept_ms.svg" />
                <img draggable={0} src="/assets/payments/accept_axp.png" />
            </span>
        );
    },
};

export const FIELDS = {
    type: {
        sortable: true,
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
        sortable: true,
        slot: 'title',
        shouldHide: (_, editing) => !editing,
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
    internal: {
        wantsCreationLabel: true,
        component ({ value, editing, onChange }) {
            if (editing) {
                return <Checkbox checked={value} onChange={onChange} />;
            }

            return value ? <CheckIcon /> : null;
        },
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
        shouldHide: item => item.internal,
    },
    stripeMethods: {
        wantsCreationLabel: true,
        component ({ value, editing, onChange }) {
            const v = value || [];

            const items = [];
            for (const k in locale.fields.stripeMethodValues) {
                const name = locale.fields.stripeMethodValues[k];
                if (!editing && !v.includes(k)) continue;

                const Icon = STRIPE_METHOD_ICONS[k] || (() => null);
                const Extra = STRIPE_METHOD_EXTRA[k];

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
                            <Icon style={{ verticalAlign: 'middle' }} />
                            {' '}
                            {name}
                        </label>
                        {Extra ? (
                            <div class="stripe-method-extra">
                                <Extra />
                            </div>
                        ) : null}
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
                    <div class="payment-method-validity">
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
                        ) : (
                            <div class="validity-warning">
                                {locale.fields.paymentValidityWarning}
                            </div>
                        )}
                    </div>
                );
            }
            return value === null
                ? locale.fields.paymentValidityTypes.forever
                : <timespan.renderer value={value} />;
        },
    },
    isRecommended: {
        sortable: true,
        wantsCreationLabel: true,
        component ({ value, editing, onChange }) {
            if (editing) {
                return <Checkbox checked={value} onChange={onChange} />;
            }
            return value && value.toString();
        },
    },
    fee: {
        virtual: ['feePercent', 'feeFixed'],
        isEmpty: (_, item) => !item.feePercent && !item.feeFixed,
        component ({ item, editing, onItemChange }) {
            if (editing) {
                return (
                    <FeesEditor
                        value={{ feeFixed: item.feeFixed, feePercent: item.feePercent }}
                        onChange={value => {
                            onItemChange({
                                ...item,
                                feeFixed: value.feeFixed,
                                feePercent: value.feePercent,
                            });
                        }}/>
                );
            }
            let feePercent = null;
            let feeFixed = null;
            if (Number.isFinite(item.feePercent)) {
                const v = +(item.feePercent * 100).toFixed(2);
                feePercent =  `${v} %`;
            }
            if (item.feeFixed) {
                feeFixed = <currencyAmount.renderer
                    value={item.feeFixed.val}
                    currency={item.feeFixed.cur} />;
            }
            if (feePercent && feeFixed) {
                return <span>{feePercent}{' + '}{feeFixed}</span>;
            } else if (feePercent) return feePercent;
            else return feeFixed;
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

function FeesEditor ({ value, onChange }) {
    const onPercentChange = feePercent => onChange({ feePercent, feeFixed: value.feeFixed });
    const onFixedChange = feeFixed => onChange({ feePercent: value.feePercent, feeFixed });

    const hasFixed = !!value.feeFixed;
    const hasPercent = Number.isFinite(value.feePercent);
    const enableFixed = enabled => {
        if (enabled) onFixedChange({ val: 1, cur: 'USD' });
        else onFixedChange(null);
    };
    const enablePercent = enabled => {
        if (enabled) onPercentChange(0.1);
        else onPercentChange(null);
    };

    const percent = value.feePercent;
    const fixed = value.feeFixed;

    const fSwitchId = Math.random().toString(36);
    const pSwitchId = Math.random().toString(36);

    return (
        <div class="payment-method-fees-editor">
            <div class="fees-switch">
                <Checkbox
                    id={fSwitchId}
                    checked={hasFixed}
                    onChange={enableFixed} />
                {' '}
                <label for={fSwitchId}>{locale.fields.fees.fixed}</label>
            </div>
            {hasFixed && (
                <div class="fixed-fee-editor">
                    <currencyAmount.editor
                        outline
                        currency={fixed.cur}
                        value={fixed.val}
                        onChange={val => onFixedChange({ ...fixed, val })} />
                    <Select
                        outline
                        value={fixed.cur}
                        onChange={cur => onFixedChange({ ...fixed, cur })}
                        items={Object.keys(currencies).map(c => ({
                            value: c,
                            label: currencies[c],
                        }))} />
                </div>
            )}
            <div class="fees-switch">
                <Checkbox
                    id={pSwitchId}
                    checked={hasPercent}
                    onChange={enablePercent} />
                {' '}
                <label for={pSwitchId}>{locale.fields.fees.percent}</label>
            </div>
            {hasPercent && (
                <div class="fees-editor">
                    <PercentEditor
                        value={percent}
                        onChange={onPercentChange} />
                </div>
            )}
            {hasFixed && hasPercent && (
                <div class="fees-description">
                    {locale.fields.fees.description}
                </div>
            )}
        </div>
    );
}

class PercentEditor extends PureComponent {
    state = {
        editing: false,
        editingValue: '',
    };

    formatValue () {
        return +(this.props.value * 100).toFixed(2);
    }

    #onFocus = () => {
        this.setState({ editing: true, editingValue: this.formatValue() });
    };
    #onChange = e => {
        if (!this.state.editing) return;
        this.setState({ editingValue: e.target.value });
        this.commitValue(e.target.value);
    };
    #onBlur = () => {
        this.commitValue(this.state.editingValue);
        this.setState({ editing: false });
    };

    commitValue (value) {
        const parsed = Number.parseFloat(value);
        if (Number.isFinite(parsed)) {
            const fixedPrecision = +parsed.toFixed(2);
            this.props.onChange(Math.max(0, Math.min(fixedPrecision / 100, 1)));
        }
    }

    render (_, { editing, editingValue }) {
        return (
            <TextField
                outline
                type="number"
                step="0.01"
                trailing="%"
                value={editing ? editingValue : this.formatValue()}
                onChange={this.#onChange}
                onFocus={this.#onFocus}
                onBlur={this.#onBlur} />
        );
    }
}

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
