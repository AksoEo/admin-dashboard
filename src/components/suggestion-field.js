import { h } from 'preact';
import { useState, useEffect } from 'preact/compat';
import { TextField, Button } from 'yamdl';
import fuzzaldrin from 'fuzzaldrin';
import './suggestion-field.less';

/// A text field with suggestions that behaves like a typical browser address bar.
///
/// # Props
/// - `value`, `onChange`: as expected
/// - `suggestions`: array of strings
export default function SuggestionField ({ value, onChange, suggestions, outerClass, ...extraProps }) {
    suggestions = fuzzaldrin.filter(suggestions, value);

    const [isFocused, setFocused] = useState(false);
    const [highlight, setHighlight] = useState(-1);

    useEffect(() => {
        if (highlight > suggestions.length - 1) setHighlight(suggestions.length - 1);
    });

    const onFocus = () => {
        setFocused(true);
    };

    const onBlur = () => {
        setFocused(false);
        setHighlight(-1);
    };

    const onKeyDown = e => {
        switch (e.key) {
        case 'ArrowUp':
            if (highlight > -1) {
                setHighlight(highlight - 1);
                e.preventDefault();
            }
            break;
        case 'ArrowDown':
            if (highlight < suggestions.length - 1) {
                setHighlight(highlight + 1);
                e.preventDefault();
            }
            break;
        case 'Enter':
            if (highlight >= 0) {
                onChange(suggestions[highlight]);
                e.preventDefault();
            }
            break;
        }
    };

    const onSMouseDown = e => {
        // prevent blur
        e.preventDefault();
    };

    const onButtonClick = suggestion => e => {
        e.preventDefault(); // prevent form submit
        onChange(suggestion);
    };

    outerClass = ' ' + (outerClass || '');

    return (
        <div class={'suggestion-field-container' + (isFocused ? ' is-focused' : '') + outerClass}>
            <TextField
                value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                {...extraProps} />
            <div class="suggestions" onMouseDown={onSMouseDown}>
                {suggestions.map((suggestion, index) => (
                    <Button
                        class={'suggestion' + (index === highlight ? ' is-highlighted' : '')}
                        key={index}
                        onClick={onButtonClick(suggestion)}>
                        {highlightSuggestion(suggestion, value)}
                    </Button>
                ))}
            </div>
        </div>
    );
}

function highlightSuggestion (suggestion, value) {
    value = [...value];
    let bold = false;
    const result = [];
    for (const c of suggestion) {
        const newBold = (value[0] || '').toLowerCase() === c.toLowerCase();
        if (newBold !== bold || !result.length) {
            result.push({ content: '', bold: newBold });
        }
        bold = newBold;
        if (bold) value.shift();
        result[result.length - 1].content += c;
    }
    return result.map(({ content, bold }) => bold ? <b>{content}</b> : content);
}
