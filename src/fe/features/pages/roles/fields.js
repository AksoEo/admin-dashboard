import { h } from 'preact';
import { Validator } from '../../../components/form';
import { TextField } from '@cpsdqs/yamdl';
import { roles as locale } from '../../../locale';

export const FIELDS = {
    name: {
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
        skipLabel: true,
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return (
                    <TextField
                        outline={slot === 'create'}
                        label={slot === 'create' ? locale.fields.description : null}
                        value={value || ''}
                        onChange={e => onChange(e.target.value || null)} />
                );
            }
            return value;
        },
        weight: 2,
    },
};
