import { h } from 'preact';
import { Validator } from '../../../../../components/form';
import MdField from '../../../../../components/md-field';
import { TextField } from '@cpsdqs/yamdl';
import { paymentAddons as locale } from '../../../../../locale';

export const FIELDS = {
    name: {
        slot: 'title',
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return <Validator
                    component={TextField}
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
            return <MdField
                value={value || ''}
                rules={['emphasis', 'strikethrough', 'link', 'list', 'table']}
                editing={editing}
                onChange={value => onChange(value || null)}
                inline={slot !== 'detail'} />;
        },
        weight: 2,
    },
};
