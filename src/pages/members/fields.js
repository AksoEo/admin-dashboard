//! Common objects for detail and table fields.

import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import cache from '../../cache';
import { UEACode as AKSOUEACode } from 'akso-client';
import moment from 'moment';

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

/** Converts a letter to a regional indicator */
const toRI = v => String.fromCodePoint(v.toLowerCase().charCodeAt(0) - 0x60 + 0x1f1e5);
/** Converts a two-letter country code to its corresponding emoji */
const countryCodeToEmoji = code => toRI(code[0]) + toRI(code[1]);

/// Renders a country, flag given a country code.
export function CountryFlag ({ country }) {
    // TODO: use twemoji
    if (!country) return null;
    return (
        <span class="country-flag">{countryCodeToEmoji(country)}</span>
    );
}

CountryFlag.propTypes = {
    country: PropTypes.string,
};

export function UEACode ({ code, old }) {
    if (!code) return null;
    if (old) {
        const oldCodeCheckLetter = new AKSOUEACode(code).getCheckLetter();
        return <span class="old-uea-code">{code}-{oldCodeCheckLetter}</span>;
    } else {
        return <span class="uea-code">{code}</span>;
    }
}

UEACode.propTypes = {
    code: PropTypes.string,
    old: PropTypes.bool,
};

export function DateFmt ({ date }) {
    return date ? moment(date).format('D[-a de] MMMM Y') : '';
}

DateFmt.propTypes = {
    date: PropTypes.any,
};
