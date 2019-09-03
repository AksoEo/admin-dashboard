//! A bunch of data renderers, with value, editing, onChange props.
/* eslint-disable react/prop-types */

import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import { TextField } from 'yamdl';
import { parsePhoneNumber, AsYouType as AsYouTypePhoneFmt } from 'libphonenumber-js';
import cache from '../../cache';
import client from '../../client';
import { UEACode as AKSOUEACode } from 'akso-client';
import moment from 'moment';

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

// TODO: some way to pick language
export class AddressRenderer extends Component {
    static propTypes = {
        id: PropTypes.any,
    };

    state = {
        address: null,
    };

    componentDidMount () {
        this.load();
    }
    componentDidUpdate (prevProps) {
        if (prevProps.id !== this.props.id) this.load();
    }
    componentWillUnmount () {
        clearTimeout(this.reloadTimeout);
    }

    load () {
        if (!this.props.id) return;
        const id = this.props.id;
        client.get(`/codeholders/${this.props.id}/address/eo`, {
            formatAs: 'displayLatin',
        }).then(res => {
            if (id !== this.props.id) return;
            this.setState({ address: res.body[this.props.id] });
        }).catch(() => {
            this.reloadTimeout = setTimeout(() => this.load(), 1000);
        });
    }

    render () {
        if (!this.state.address) return;
        return (
            <div class="address-rendered">
                {this.state.address
                    .split('\n')
                    .map((x, i) => (<div class="address-line" key={i}>{x}</div>))}
            </div>
        );
    }
}
