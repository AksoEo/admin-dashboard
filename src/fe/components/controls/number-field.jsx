import { h } from 'preact';
import { useState } from 'preact/compat';
import { TextField } from 'yamdl';

export default function NumberField ({ value, onChange, onBlur, onFocus, decimal, ...extra }) {
    const [editingValue, setEditingValue] = useState(null);

    return (
        <TextField
            {...extra}
            type="text"
            inputmode={decimal ? 'decimal' : 'numeric'}
            value={editingValue || value}
            onChange={e => setEditingValue(e.target.value)}
            onFocus={(e) => {
                if (onFocus) onFocus(e);
                if (e.defaultPrevented) return;
                setEditingValue((value || '').toString());
            }}
            onBlur={(e) => {
                if (onBlur) onBlur(e);
                if (e.defaultPrevented) return;
                let value = editingValue;
                value = value.replace(/,/g, '.');
                if (value.endsWith('.')) value += '0';
                if (!value) {
                    onChange(null);
                } else if (Number.isFinite(+value)) {
                    onChange(+value);
                }
                setEditingValue(null);
            }} />
    );
}
