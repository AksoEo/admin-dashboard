import { h } from 'preact';
import { currencyAmount, email, timestamp } from '../../../../components/data';
import TejoIcon from '../../../../components/tejo-icon';
import UeaIcon from '../../../../components/uea-icon';
import { paymentIntents as locale } from '../../../../locale';
import { PaymentMethodType } from '../orgs/methods/fields';
import './fields.less';

export const FIELDS = {
    customer: {
        sortable: true,
        component ({ value, inline }) {
            if (!value) return null;
            return (
                <span class="intent-customer">
                    <span class="customer-name">
                        {value.name}
                    </span>
                    {' <'}
                    {inline ? (
                        <email.inlineRenderer value={value.email} />
                    ) : (
                        <email.renderer value={value.email} />
                    )}
                    {'>'}
                </span>
            );
        },
    },
    method: {
        sortable: true,
        component ({ value }) {
            if (!value) return;
            return <PaymentMethodType value={value.type} />;
        },
    },
    org: {
        component ({ value }) {
            if (value === 'tejo') return <TejoIcon />;
            if (value === 'uea') return <UeaIcon />;
        },
    },
    currency: {
        sortable: true,
        component ({ value }) {
            return value;
        },
    },
    status: {
        sortable: true,
        component ({ value }) {
            return locale.fields.statuses[value];
        },
    },
    timeCreated: {
        sortable: true,
        component ({ value }) {
            if (!value) return null;
            return <timestamp.renderer value={value * 1000} maybeRelative />;
        },
    },
    statusTime: {
        sortable: true,
        component ({ value }) {
            if (!value) return null;
            return <timestamp.renderer value={value * 1000} maybeRelative />;
        },
    },
    internalNotes: {
        component ({ value }) {
            return value;
        },
    },
    customerNotes: {
        component ({ value }) {
            // TODO: format properly
            return value;
        },
    },
    foreignId: {
        component ({ value }) {
            return <code class="payment-intent-foreign-id">{value}</code>;
        },
    },
    totalAmount: {
        sortable: true,
        component ({ value, item }) {
            return <currencyAmount.renderer value={value} currency={item.currency} />;
        },
    },
    amountRefunded: {
        sortable: true,
        component ({ value, item }) {
            return <currencyAmount.renderer value={value} currency={item.currency} />;
        },
    },
};
