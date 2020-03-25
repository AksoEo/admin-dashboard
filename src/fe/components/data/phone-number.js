import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import { parsePhoneNumber, AsYouType as AsYouTypePhoneFmt } from 'libphonenumber-js';
import { CountryFlag } from './country';
import './style';

const phoneNumberRenderer = allowInteractive => function PhoneNumber ({ value }) {
    let number, trailing;
    try {
        const parsed = parsePhoneNumber(value.value);

        if (value.formatted) number = value.formatted;
        else number = parsed.format('INTERNATIONAL');

        if (parsed.country) {
            trailing = <CountryFlag country={parsed.country.toLowerCase()} />;
        }
    } catch {
        number = value; // close enough, probably
    }

    return allowInteractive
        ? <a class="data phone-number" href={`tel:${value.value}`}>{number} {trailing}</a>
        : <span class="data phone-number not-interactive">{number}</span>;
};

function PhoneNumberEditor ({ value, onChange }) {
    if (!value || value.value === undefined) return null;
    const wholeValue = value;
    value = value.value;

    let trailing = '';
    try {
        const num = parsePhoneNumber(value);
        if (num.country) {
            trailing = <CountryFlag country={num.country.toLowerCase()} />;
        }
    } catch (_) {
        // this comment exists because eslint
    }

    if (value && !value.startsWith('+')) value = '+' + value;
    if (value) value = value.replace(/^[+]+/g, '+');
    value = new AsYouTypePhoneFmt().input(value);

    return <TextField
        class="data phone-number-editor"
        value={value}
        onChange={e => onChange({ ...wholeValue, value: e.target.value || null })}
        type="tel"
        placeholder="+"
        maxLength="50"
        trailing={trailing}
        onFocus={() => (!value && onChange({ ...wholeValue, value: '+' }))}
        onBlur={() => (value.trim() === '+' && onChange({ ...wholeValue, value: null }))} />;
}

export default {
    renderer: phoneNumberRenderer(true),
    inlineRenderer: phoneNumberRenderer(),
    editor: PhoneNumberEditor,
};
