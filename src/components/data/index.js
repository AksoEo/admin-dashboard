//! A bunch of data renderers, with value, editing, onChange props.
/* eslint-disable react/prop-types */

import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import { TextField } from 'yamdl';
import { parsePhoneNumber, AsYouType as AsYouTypePhoneFmt } from 'libphonenumber-js';
import NativeSelect from '@material-ui/core/NativeSelect';
import { UEACode as AKSOUEACode } from 'akso-client';
import moment from 'moment';
import i18naddress from 'google-i18n-address';
import { Validator } from '../../components/form';
import cache from '../../cache';
import locale from '../../locale';

/// Creates a simple field renderer.
function simpleField (extraProps = (() => {}), mapValue = (ident => ident)) {
    return function GenericFieldRenderer ({ value, editing, onChange }) {
        if (!editing) return mapValue(value);
        else return <TextField
            value={value}
            onChange={e => onChange(mapValue(e.target.value, true))}
            {...extraProps(value, v => onChange(mapValue(v, true)))} />;
    };
}

// Renders a phone number. Editable.
export const PhoneNumber = simpleField((value, onChange) => {
    let trailing = '';
    try {
        const num = parsePhoneNumber(value);
        if (num.country) {
            trailing = <CountryFlag country={num.country.toLowerCase()} />;
        }
    } catch (_) {
        // this comment exists because eslint
    }

    return {
        type: 'tel',
        maxLength: 50,
        placeholder: '+',
        trailing,
        onFocus () {
            if (!value) onChange('+');
        },
        onBlur () {
            if (value.trim() === '+') onChange('');
        },
    };
}, (value, editing) => {
    if (!editing) {
        let number;
        try {
            number = parsePhoneNumber(value).format('INTERNATIONAL');
        } catch (err) {
            number = value; // close enough, probably
        }
        return <a class="phone-number" href={`tel:${value}`}>{number}</a>;
    }
    if (value && !value.startsWith('+')) value = '+' + value;
    return new AsYouTypePhoneFmt().input(value);
});

/// Renders an email address with a mailto: link. Editable.
export function Email ({ value, editing, onChange }) {
    if (editing) {
        return (
            <TextField
                value={value}
                class="email"
                type="email"
                onChange={e => (onChange && onChange(e.target.value))} />
        );
    } else {
        return <a class="email" href={`mailto:${value}`}>{value}</a>;
    }
}

/// Converts a letter to a regional indicator.
const toRI = v => String.fromCodePoint(v.toLowerCase().charCodeAt(0) - 0x60 + 0x1f1e5);
/// Converts a two-letter country code to its corresponding emoji.
const countryCodeToEmoji = code => toRI(code[0]) + toRI(code[1]);

/// Renders its inner function with countries and country groups as parameters.
export class WithCountries extends Component {
    static propTypes = {
        children: PropTypes.func.isRequired,
    }

    state = {
        countries: {},
        countryGroups: {},
    }

    componentDidMount () {
        cache.getCountries().then(countries => this.setState({ countries }));
        cache.getCountryGroups().then(countryGroups => this.setState({ countryGroups }));
    }

    render () {
        if (this.state.countries && this.state.countryGroups) {
            return this.props.children(this.state.countries, this.state.countryGroups);
        } else return null;
    }
}

/// Renders a country, flag given a country code.
export function CountryFlag ({ country }) {
    // TODO: use twemoji
    if (!country) return null;
    return <span class="country-flag">{countryCodeToEmoji(country)}</span>;
}

/// Renders a UEA code (not editable). Use props `code` and `old` (bool flag).
export function UEACode ({ code, old }) {
    if (!code) return null;
    if (old) {
        const oldCodeCheckLetter = new AKSOUEACode(code).getCheckLetter();
        return <span class="old-uea-code">{code}-{oldCodeCheckLetter}</span>;
    } else {
        return <span class="uea-code">{code}</span>;
    }
}

/// Renders a formatted date (not editable). Use prop `date`.
export function DateFmt ({ date }) {
    return date ? moment(date).format('D[-a de] MMMM Y') : '';
}

/// Renders an editable date.
export function DateEditor ({ value, editing }) {
    if (!editing) return <DateFmt date={value} />;
    // TODO: date editor
    return 'unimplemented!';
}

/// Renders a countries dropdown.
export function CountryEditor ({ value, onChange }) {
    return (
        <div class="country-editor">
            <WithCountries>
                {countries => (
                    <NativeSelect
                        value={value}
                        onChange={e => onChange(e.target.value)}>
                        <option value={''}>—</option>
                        {Object.entries(countries).map(([id, name]) => (
                            <option value={id} key={id}>
                                {name}
                            </option>
                        ))}
                    </NativeSelect>
                )}
            </WithCountries>
        </div>
    );
}

export class AddressEditor extends Component {
    render () {
        const { value, onChange } = this.props;
        const country = value.country;

        const onChangeField = (key, map = (x => x)) => v => onChange({ ...value, [key]: map(v) });

        const items = [
            <CountryEditor key="country" value={country} onChange={onChangeField('country')} />,
        ];

        const rules = i18naddress.getValidationRules({ countryCode: country });
        const requiredFields = rules.requiredFields || [];

        if (requiredFields.includes('countryArea')) {
            items.push(
                <Validator
                    component={NativeSelect}
                    validate={value => {
                        if (!value) throw { error: locale.data.requiredField };
                    }}
                    class="address-editor-line"
                    key="countryArea"
                    value={value.countryArea}
                    onChange={onChangeField('countryArea', e => e.target.value)}>
                    <option value="">—</option>
                    {rules.countryAreaChoices.map(([id, area]) => (
                        <option key={id} value={id}>{area}</option>
                    ))}
                </Validator>
            );
        }

        for (const k of ['city', 'cityArea', 'streetAddress', 'postalCode', 'sortingCode']) {
            const isRequired = requiredFields.includes(k);
            items.push(<Validator
                component={TextField}
                validate={value => {
                    if (!value && isRequired) throw { error: locale.data.requiredField };
                }}
                class="address-editor-line"
                key={k}
                value={value[k]}
                label={locale.data.addressFields[k] + (isRequired ? '*' : '')}
                onChange={onChangeField(k, e => e.target.value)} />);
        }

        return <div class="address-editor">{items}</div>;
    }
}
