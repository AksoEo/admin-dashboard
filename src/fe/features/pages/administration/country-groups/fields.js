import { h } from 'preact';

export const FIELDS = {
    code: {
        weight: 0.5,
        component ({ value }) {
            return <span class="country-group-code">{value}</span>;
        },
    },
    name: {
        component ({ value }) {
            return <span class="country-group-name">{value}</span>;
        },
    },
};
