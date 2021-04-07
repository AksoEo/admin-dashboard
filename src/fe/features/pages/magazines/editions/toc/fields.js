import { h } from 'preact';
import { Checkbox, TextField } from '@cpsdqs/yamdl';
import CheckIcon from '@material-ui/icons/Check';
import LimitedTextField from '../../../../../components/limited-text-field';
import MdField from '../../../../../components/md-field';

export const FIELDS = {
    page: {
        sortable: true,
        weight: 0.25,
        slot: 'titleAlt',
        component ({ value, editing, onChange, slot }) {
            if (editing && slot === 'create') {
                return (
                    <TextField
                        outline
                        type="number"
                        value={value}
                        onChange={e => onChange(e.target.value | 0)} />
                );
            }
            return '' + value;
        },
    },
    title: {
        sortable: true,
        slot: 'title',
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return <LimitedTextField
                    outline
                    value={value}
                    maxLength={500}
                    onChange={e => onChange(e.target.value)} />;
            }
            if (slot === 'title') return <b>{value}</b>;
            return value;
        },
    },
    author: {
        sortable: true,
        slot: 'body',
        component ({ value, editing, onChange }) {
            if (editing) {
                return <LimitedTextField
                    outline
                    value={value}
                    maxLength={100}
                    onChange={e => onChange(e.target.value)} />;
            }
            return value;
        },
    },
    recitationAuthor: {
        sortable: true,
        slot: 'body',
        component ({ value, editing, onChange }) {
            if (editing) {
                return <LimitedTextField
                    outline
                    value={value}
                    maxLength={100}
                    onChange={e => onChange(e.target.value)} />;
            }
            return value;
        },
    },
    highlighted: {
        sortable: true,
        component ({ value, editing, onChange }) {
            if (editing) return <Checkbox checked={value} onChange={onChange} />;
            return value ? <CheckIcon style={{ verticalAlign: 'middle' }} /> : null;
        },
    },
    text: {
        weight: 2,
        component ({ value, editing, onChange, slot }) {
            return <MdField
                inline={slot !== 'detail'}
                editing={editing}
                rules={['emphasis', 'strikethrough', 'link', 'list', 'table']}
                value={value || ''}
                maxLength={100000}
                onChange={value => onChange(value || null)} />;
        },
    },
};
