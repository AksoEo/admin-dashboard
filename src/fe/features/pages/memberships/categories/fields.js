import { h } from 'preact';
import { Checkbox, TextField } from '@cpsdqs/yamdl';
import CheckIcon from '@material-ui/icons/Check';
import { Validator } from '../../../../components/form';
import MdField from '../../../../components/md-field';
import { membershipCategories as locale } from '../../../../locale';

export const FIELDS = {
    nameAbbrev: {
        sortable: true,
        weight: 0.25,
        slot: 'title',
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return <Validator
                    component={TextField}
                    outline={slot === 'create'}
                    label={slot === 'create' ? locale.fields.nameAbbrev : null}
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
        skipLabel: true,
        component ({ value, editing, onChange, slot }) {
            return <MdField
                inline={slot !== 'detail'}
                editing={editing}
                rules={['emphasis', 'strikethrough', 'link']}
                value={value || ''}
                onChange={value => onChange(value || null)} />;
        },
        weight: 2,
    },
    givesMembership: {
        skipLabel: true,
        component ({ value, editing, onChange, slot }) {
            if (slot === 'body') {
                if (value) return locale.fields.givesMembership;
                return null;
            }
            if (!editing) return value ? <CheckIcon /> : null;
            return <Checkbox
                checked={value}
                onChange={onChange} />;
        },
    },
    lifetime: {
        component ({ value, editing, onChange }) {
            if (!editing) return value ? <CheckIcon /> : null;
            return <Checkbox
                checked={value}
                onChange={onChange} />;
        },
    },
    availableFrom: {
        component ({ value, editing, onChange }) {
            if (!editing) return '' + value;
            return <TextField
                value={value || ''}
                onChange={e => onChange(+e.target.value || null)} />;
        },
    },
    availableTo: {
        component ({ value, editing, onChange }) {
            if (!editing) return '' + value;
            return <TextField
                value={value || ''}
                onChange={e => onChange(+e.target.value || null)} />;
        },
    },
};
