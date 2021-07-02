import { h } from 'preact';

export const FIELDS = {
    name: {
        sortable: true,
        slot: 'title',
        weight: 0.5,
        component ({ value }) {
            return <span class="country-org-list-name">{value}</span>;
        },
    },
    list: {
        slot: 'body',
        weight: 1,
        component ({ value }) {
            // TODO
            return null;
        },
    },
};
