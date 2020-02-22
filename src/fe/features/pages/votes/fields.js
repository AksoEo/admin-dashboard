import { h } from 'preact';
import TejoIcon from '../../../components/tejo-icon';
import UeaIcon from '../../../components/uea-icon';

export default {
    org: {
        sortable: true,
        weight: 0.5,
        component ({ value }) {
            if (value === 'tejo') {
                return <TejoIcon />;
            } else if (value === 'uea') {
                return <UeaIcon />;
            }
            return null;
        },
        stringify (value) {
            return value;
        },
    },
    name: {
        sortable: true,
        component ({ value }) {
            return value;
        },
        stringify (value) {
            return value;
        },
    },
    description: {
        sortable: true,
        component ({ value }) {
            return value;
        },
        stringify (value) {
            return value;
        },
    },
    timespan: {
        sortable: true,
        component ({ value }) {
            return `${value.start}–${value.end}`;
        },
        stringify (value) {
            return `${value.start}–${value.end}`;
        },
    },
};
