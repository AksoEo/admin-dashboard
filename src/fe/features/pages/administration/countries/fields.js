import { h } from 'preact';
import CheckIcon from '@material-ui/icons/Check';
import { Checkbox, TextField } from '@cpsdqs/yamdl';
import { countries as locale } from '../../../../locale';

const nameField = {
    component ({ value, onChange, editing }) {
        if (editing) {
            return (
                <TextField
                    class="country-name-editor"
                    value={value}
                    onChange={e => onChange(e.target.value)} />
            );
        }
        return <span class="country-name">{value}</span>;
    },
    stringify: v => v,
};

export const FIELDS = {
    code: {
        weight: 0.5,
        component ({ value }) {
            return <span class="country-code">{value}</span>;
        },
        stringify: v => v,
    },
    enabled: {
        weight: 0.5,
        component ({ value, onChange, editing }) {
            if (editing) {
                return (
                    <Checkbox
                        checked={value}
                        onChange={onChange} />
                );
            }
            return value ? <CheckIcon /> : null;
        },
        stringify: v => locale.enabled[v.toString()],
    },
    name_eo: nameField,
    name_en: nameField,
    name_fr: nameField,
    name_es: nameField,
    name_nl: nameField,
    name_pt: nameField,
    name_sk: nameField,
    name_zh: nameField,
    name_de: nameField,
};
