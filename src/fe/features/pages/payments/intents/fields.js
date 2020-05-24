import { h } from 'preact';
import { currencyAmount, email, timestamp } from '../../../../components/data';

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
            void value;
            return 'todo';
        },
    },
    org: {
        component ({ value }) {
            void value;
            return 'todo';
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
            void value;
            return 'todo';
        },
    },
    events: {
        component ({ value }) {
            void value;
            return 'todo';
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
            void value;
            return 'todo';
        },
    },
    customerNotes: {
        component ({ value }) {
            void value;
            return 'todo';
        },
    },
    foreignId: {
        component ({ value }) {
            void value;
            return 'todo';
        },
    },
    purposes: {
        component ({ value }) {
            void value;
            return 'todo';
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
        component ({ value }) {
            void value;
            return 'todo';
        },
    },
};
