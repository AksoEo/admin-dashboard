import { h } from 'preact';
import { useState } from 'preact/compat';
import { stdlib, currencies } from '@tejo/akso-script';
import { TextField } from '@cpsdqs/yamdl';
import { Validator } from '../form';
import { data as locale } from '../../locale';

/// - value: amount in smallest currecy unit
/// - currency: currency id
function CurrencyAmount ({ value, currency }) {
    return stdlib.currency_fmt.apply(null, [currency || '?', value | 0]);
}

/// - currency: currency id
function CurrencyEditor ({ value, onChange, currency, ...extra }) {
    const fractValue = currency ? (value | 0) / currencies[currency] : (value | 0);
    const minimumFractionDigits = Math.log10(currencies[currency]) | 0;
    const formattedValue = fractValue.toLocaleString('fr-FR', {
        minimumFractionDigits,
    });

    const [disp, setDisp] = useState(formattedValue);
    const [error, setError] = useState(false);

    const onInputChange = e => {
        setDisp(e.target.value);

        const v = parseFloat(e.target.value.replace(/,/g, '.'));
        if (Number.isNaN(v)) {
            setError(true);
        } else {
            setError(false);
            onChange(v * currencies[currency]);
        }
    };
    const canonicalize = () => {
        setDisp(formattedValue);
    };

    return (
        <Validator
            component={TextField}
            validate={() => {
                if (error) throw { error: locale.invalidCurrencyAmount };
            }}
            {...extra}
            value={disp}
            onChange={onInputChange}
            onBlur={canonicalize}
            onKeyDown={e => {
                if (e.ctrlKey || e.metaKey) return;
                if (e.key.length == 1 && !e.key.match(/[-\d,.]/)) e.preventDefault();
            }}
            inputMode="numeric"
            style={{ textAlign: 'right' }}
            trailing={currency} />
    );
}

export default {
    renderer: CurrencyAmount,
    inlineRenderer: CurrencyAmount,
    editor: CurrencyEditor,
};
