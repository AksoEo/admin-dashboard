import { h } from 'preact';
import { Checkbox, TextField } from 'yamdl';
import CheckIcon from '@material-ui/icons/Check';
import LimitedTextField from '../../../../../components/controls/limited-text-field';
import MdField from '../../../../../components/controls/md-field';
import { magazineToc as locale } from '../../../../../locale';
import './fields.less';

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
                        label={locale.fields.page}
                        value={Number.isFinite(value) ? `${value}` : ''}
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
                    label={slot === 'create' && locale.fields.title}
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
                    onChange={e => onChange(e.target.value || null)} />;
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
                    onChange={e => onChange(e.target.value || null)} />;
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
                class={'magazine-toc-entry-text' + (!editing ? ' is-preview' : '')}
                inline={slot !== 'detail'}
                editing={editing}
                rules={['emphasis', 'strikethrough', 'link', 'list', 'table']}
                value={value || ''}
                maxLength={100000}
                onChange={value => onChange(value || null)} />;
        },
    },
};
