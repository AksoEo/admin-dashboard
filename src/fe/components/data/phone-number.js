import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import { parsePhoneNumber, AsYouType as AsYouTypePhoneFmt } from 'libphonenumber-js';
import { CountryFlag } from './country';

const phoneNumberRenderer = allowInteractive => function PhoneNumber ({ value }) {
    let number;
    try {
        if (value.formatted) number = value.formatted;
        else number = parsePhoneNumber(value.value).format('INTERNATIONAL');
    } catch (err) {
        number = value; // close enough, probably
    }

    return allowInteractive
        ? <a class="data phone-number" href={`tel:${value.value}`}>{number}</a>
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
