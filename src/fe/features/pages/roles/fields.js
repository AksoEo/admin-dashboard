import { h } from 'preact';
import { Checkbox, TextField } from '@cpsdqs/yamdl';
import CheckIcon from '@material-ui/icons/Check';
import { Validator } from '../../../components/form';
import TextArea from '../../../components/text-area';
import { roles as locale } from '../../../locale';

export const FIELDS = {
    name: {
        sortable: true,
        slot: 'title',
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return <Validator
                    component={TextField}
                    outline={slot === 'create'}
                    label={slot === 'create' ? locale.fields.name : null}
                    validate={value => {
                        if (!value) throw { error: locale.update.nameRequired };
                    }}
                    value={value}
                    onChange={e => onChange(e.target.value)} />;
            }
            if (slot === 'title') return <b>{value}</b>;
            return value;
        },
    },
    description: {
        component ({ value, editing, onChange }) {
            if (editing) {
                return (
                    <TextArea
                        onKeyDown={e => e.stopPropagation()}
                        value={value || ''}
                        onChange={value => onChange(value || null)} />
                );
            }
            return <div>{(value || '').split('\n').map((x, i) => <div key={i}>{x}</div>)}</div>;
        },
        weight: 2,
    },
    public: {
        component ({ value, editing, onChange }) {
            if (editing) return <Checkbox checked={value} onChange={onChange} />;
            if (value) return <CheckIcon />;
            return null;
        },
        weight: 0.5,
    },
};
