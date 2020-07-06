import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import TejoIcon from '../../../components/tejo-icon';
import UeaIcon from '../../../components/uea-icon';

export const FIELDS = {
    org: {
        slot: 'titleAlt',
        weight: 0.25,
        sortable: true,
        component ({ value }) {
            if (value === 'tejo') return <TejoIcon />;
            if (value === 'uea') return <UeaIcon />;
            return null;
        },
    },
    abbrev: {
        slot: 'title',
        weight: 0.25,
        sortable: true,
        component ({ value, editing, onChange }) {
            if (editing) {
                return <TextField
                    value={value}
                    onChange={e => onChange(e.target.value)} />;
            }
            return  value;
        },
    },
    name: {
        slot: 'title',
        sortable: true,
        component ({ value, editing, onChange }) {
            if (editing) {
                return <TextField
                    value={value}
                    onChange={e => onChange(e.target.value)} />;
            }
            return value;
        },
    },
};
