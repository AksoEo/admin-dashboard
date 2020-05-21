import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';

export const FIELDS = {
    code: {
        slot: 'title',
        weight: 0.5,
        component ({ value }) {
            return <span class="country-group-code">{value}</span>;
        },
        stringify: v => v,
    },
    name: {
        slot: 'title',
        component ({ value, onChange, editing }) {
            if (editing) {
                return (
                    <TextField
                        value={value}
                        onChange={e => onChange(e.target.value)} />
                );
            }
            return <span class="country-group-name">{value}</span>;
        },
        stringify: v => v,
    },
};
