import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import OrgIcon from '../../../components/org-icon';

export const FIELDS = {
    org: {
        slot: 'titleAlt',
        weight: 0.25,
        sortable: true,
        component ({ value }) {
            return <OrgIcon org={value} />;
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
