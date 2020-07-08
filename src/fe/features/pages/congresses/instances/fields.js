import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import { date } from '../../../../components/data';

const string100Editor = {
    component ({ value, editing, onChange }) {
        if (editing) {
            return <TextField
                value={value}
                maxLength={100}
                onChange={e => onChange(e.target.value)} />;
        }
        return value;
    },
};

const dateEditor = {
    component ({ value, editing, onChange }) {
        if (editing) return <date.editor value={value} onChange={onChange} />;
        return <date.renderer value={value} />;
    },
};

export const FIELDS = {
    humanId: {
        sortable: true,
        weight: 0.5,
        slot: 'title',
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return <TextField
                    value={value}
                    maxLength={20}
                    onChange={e => onChange(e.target.value)} />;
            }
            if (slot === 'title') return <b>{value}</b>;
            return value;
        },
    },
    name: { ...string100Editor, sortable: true, weight: 2, slot: 'title' },
    dateFrom: { ...dateEditor, sortable: true },
    dateTo: { ...dateEditor, sortable: true },
    locationName: string100Editor,
    locationNameLocal: string100Editor,
};
