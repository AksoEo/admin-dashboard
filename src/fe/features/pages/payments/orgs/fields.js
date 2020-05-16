import { h } from 'preact';
import TejoIcon from '../../../../components/tejo-icon';
import UeaIcon from '../../../../components/uea-icon';

export const FIELDS = {
    org: {
        component ({ value }) {
            return value === 'tejo' ? <TejoIcon /> : value === 'uea' ? <UeaIcon /> : null;
        },
        stringify (value) {
            return value;
        },
        shouldHide: () => true,
        weight: 0.25,
    },
    name: {
        component ({ value }) {
            return value;
        },
        stringify (value) {
            return value;
        },
        shouldHide: (_, editing) => !editing,
    },
    description: {
        component ({ value }) {
            return value;
        },
        stringify (value) {
            return value;
        },
        shouldHide: (_, editing) => !editing,
        weight: 2,
    },
};
