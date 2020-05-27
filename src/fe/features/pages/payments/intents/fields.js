import { h } from 'preact';
import moment from 'moment';
import { currencyAmount, email, timestamp } from '../../../../components/data';
import TejoIcon from '../../../../components/tejo-icon';
import UeaIcon from '../../../../components/uea-icon';
import { paymentIntents as locale, timestampFormat } from '../../../../locale';
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
        stringify (value) {
            if (!value) return '';
            return `${value.name} <${value.email}>`;
        },
    },
    method: {
        sortable: true,
        component ({ value }) {
            if (!value) return;
            return <PaymentMethodType value={value.type} />;
        },
        stringify (value) {
            return value;
        },
    },
    org: {
        component ({ value }) {
            if (value === 'tejo') return <TejoIcon />;
            if (value === 'uea') return <UeaIcon />;
        },
        stringify (value) {
            return value;
        },
    },
    currency: {
        sortable: true,
        component ({ value }) {
            return value;
        },
        stringify (value) {
            return value;
        },
    },
    status: {
        sortable: true,
        component ({ value }) {
            return locale.fields.statuses[value];
        },
        stringify (value) {
            return locale.fields.statuses[value];
        },
    },
    timeCreated: {
        sortable: true,
        component ({ value }) {
            if (!value) return null;
            return <timestamp.renderer value={value * 1000} maybeRelative />;
        },
        stringify (value) {
            if (!value) return '';
            return moment(value * 1000).format(timestampFormat);
        },
    },
    statusTime: {
        sortable: true,
        component ({ value }) {
            if (!value) return null;
            return <timestamp.renderer value={value * 1000} maybeRelative />;
        },
        stringify (value) {
            if (!value) return '';
            return moment(value * 1000).format(timestampFormat);
        },
    },
    internalNotes: {
        component ({ value }) {
            return value;
        },
        stringify (value) {
            return value;
        },
    },
    customerNotes: {
        component ({ value }) {
            // TODO: format properly
            return value;
        },
        stringify (value) {
            return value;
        },
    },
    foreignId: {
        component ({ value }) {
            return <code class="payment-intent-foreign-id">{value}</code>;
        },
        stringify (value) {
            return value;
        },
    },
    totalAmount: {
        sortable: true,
        component ({ value, item }) {
            return <currencyAmount.renderer value={value} currency={item.currency} />;
        },
        stringify (value) {
            return '' + value;
        },
    },
    amountRefunded: {
        sortable: true,
        component ({ value, item }) {
            return <currencyAmount.renderer value={value} currency={item.currency} />;
        },
        stringify (value) {
            return '' + value;
        },
    },
};
