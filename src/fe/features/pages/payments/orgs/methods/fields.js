export const FIELDS = {
    type: {
        component ({ value }) {
            return value;
        },
        weight: 0.25,
    },
    stripeMethods: {
        component ({ value }) {
            return value.join(', ');
        },
        shouldHide: item => item.type !== 'stripe',
    },
    name: {
        component ({ value }) {
            return value;
        },
    },
    internalDescription: {
        component ({ value }) {
            return value;
        },
        weight: 2,
    },
    description: {
        component ({ value }) {
            return value;
        },
    },
    currencies: {
        component ({ value }) {
            return value.join(', ');
        },
    },
    paymentValidity: {
        component ({ value }) {
            return value;
        },
    },
    isRecommended: {
        component ({ value }) {
            return value.toString();
        },
    },
    stripePublishableKey: {
        component ({ value }) {
            return value;
        },
        shouldHide: item => item.type !== 'stripe',
    },
};
