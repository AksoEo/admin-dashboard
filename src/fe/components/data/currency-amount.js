import { h } from 'preact';
import { useRef, useEffect } from 'preact/compat';
import { stdlib } from '@tejo/akso-script';
import { TextField } from '@cpsdqs/yamdl';

/// - value: amount in smallest currecy unit
/// - currency: currency id
function CurrencyAmount ({ value, currency }) {
    return stdlib.currency_fmt.apply(null, [currency || '?', value | 0]);
}

/// - currency: currency id
function CurrencyEditor ({ value, onChange, currency, max, ...extra }) {
    const node = useRef(null);
    const formattedValue = stdlib.currency_fmt.apply(null, [currency || '?', value | 0])
        .replace('\u202f', '\u00a0');
    const caretPos = formattedValue.split('').findIndex(x => !x.match(/[0-9.,\u00a0]/)) - 1;

    const setCaret = () => {
        if (!node.current) return;
        if (document.activeElement !== node.current.inputNode) return;
        node.current.inputNode.setSelectionRange(caretPos, caretPos);
    };

    useEffect(() => {
        setCaret();
    });

    const maxValue = max || 2147483647;

    return (
        <TextField
            {...extra}
            value={formattedValue}
            ref={node}
            style={{ textAlign: 'right' }}
            onFocus={setCaret}
            onClick={setCaret}
            onKeyDown={e => {
                if (e.key !== 'Tab' && !e.ctrlKey && !e.metaKey) e.preventDefault();
                else setCaret();
                if (e.key === 'Backspace') {
                    const v = value.toString().split('');
                    v.pop();
                    onChange(Math.min(maxValue, +v.join('')));
                } else if (e.key.match(/^[0-9]$/)) {
                    onChange(Math.min(maxValue, +(value.toString() + e.key)));
                }
            }} />
    );
}

export default {
    renderer: CurrencyAmount,
    inlineRenderer: CurrencyAmount,
    editor: CurrencyEditor,
};
