import { h } from 'preact';
import { TextField } from 'yamdl';
import OrgIcon from '../../../../components/org-icon';

export const FIELDS = {
    org: {
        sortable: true,
        slot: 'title',
        component ({ value }) {
            return <OrgIcon org={value} />;
        },
        stringify (value) {
            return value;
        },
        shouldHide: () => true,
        weight: 0.25,
    },
    name: {
        sortable: true,
        slot: 'title',
        component ({ value, editing, onChange }) {
            if (editing) {
                return <TextField
                    required
                    value={value}
                    onChange={e => onChange(e.target.value)} />;
            }
            return value;
        },
        stringify (value) {
            return value;
        },
        shouldHide: (_, editing) => !editing,
    },
    description: {
        skipLabel: true,
        component ({ value, editing, onChange }) {
            if (editing) return <TextField value={value || ''} onChange={e => onChange(e.target.value || null)} />;
            return value;
        },
        stringify (value) {
            return value;
        },
        shouldHide: (_, editing) => !editing,
        weight: 2,
    },
};
