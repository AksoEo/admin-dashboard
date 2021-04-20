import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import LimitedTextField from '../../../../components/limited-text-field';
import MdField from '../../../../components/md-field';
import { date } from '../../../../components/data';
import { magazineEditions as locale } from '../../../../locale/magazines';

export const FIELDS = {
    id: {
        sortable: true,
        slot: 'title',
        weight: 0.3,
        component ({ value, editing, onChange, slot }) {
            if (editing && slot === 'create') {
                return (
                    <TextField
                        outline
                        label={locale.fields.id}
                        type="number"
                        value={Number.isFinite(value) ? `${value}` : ''}
                        onChange={e => onChange(e.target.value | 0)} />
                );
            }
            return '' + value;
        },
    },
    date: {
        sortable: true,
        slot: 'titleAlt',
        weight: 1.2,
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return <date.editor
                    class="magazine-edition-field-id-human"
                    label={slot === 'create' && locale.fields.date}
                    outline
                    value={value}
                    onChange={onChange} />;
            }
            return <date.renderer value={value} />;
        },
    },
    idHuman: {
        sortable: true,
        slot: 'title',
        weight: 0.5,
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return <LimitedTextField
                    class="magazine-edition-field-id-human"
                    outline
                    label={slot === 'create' && locale.fields.idHuman}
                    value={value}
                    maxLength={50}
                    onChange={e => onChange(e.target.value)} />;
            }
            if (slot === 'title') return <b>{value}</b>;
            return value;
        },
    },
    description: {
        sortable: true,
        skipLabel: true,
        weight: 2,
        component ({ value, editing, onChange, slot }) {
            return <MdField
                inline={slot !== 'detail'}
                editing={editing}
                rules={['emphasis', 'strikethrough', 'link', 'list', 'table']}
                value={value || ''}
                maxLength={5000}
                onChange={value => onChange(value || null)} />;
        },
    },
};
