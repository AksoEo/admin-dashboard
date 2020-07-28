import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import TextArea from '../../../../components/text-area';
import { date } from '../../../../components/data';
import { congressInstances as locale } from '../../../../locale';

const string100Editor = label => ({
    component ({ value, editing, onChange }) {
        if (editing) {
            return <TextField
                outline
                label={label}
                value={value}
                maxLength={100}
                onChange={e => onChange(e.target.value || null)} />;
        }
        return value;
    },
});

const dateEditor = label => ({
    component ({ value, editing, onChange }) {
        if (editing) return <date.editor outline label={label} value={value} onChange={onChange} />;
        return <date.renderer value={value} />;
    },
});

export const FIELDS = {
    humanId: {
        sortable: true,
        weight: 0.5,
        slot: 'title',
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return <TextField
                    outline
                    label={locale.fields.humanId}
                    value={value}
                    maxLength={20}
                    onChange={e => onChange(e.target.value)} />;
            }
            if (slot === 'title') return <b>{value}</b>;
            return value;
        },
    },
    name: { ...string100Editor(locale.fields.name), sortable: true, weight: 2, slot: 'title' },
    dateFrom: { ...dateEditor(locale.fields.dateFrom), sortable: true },
    dateTo: { ...dateEditor(locale.fields.dateTo), sortable: true },
    locationName: string100Editor(locale.fields.locationName),
    locationNameLocal: string100Editor(locale.fields.locationNameLocal),
    locationAddress: {
        component ({ value, editing, onChange }) {
            if (editing) {
                return (
                    <TextArea
                        value={value}
                        onChange={onChange} />
                );
            }
            return <span>{value.split('\n').map((x, i) => <span key={i}>{x}</span>)}</span>;
        },
    },
};
