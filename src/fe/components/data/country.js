//! Country utilities.

import { h, Component } from 'preact';
import NativeSelect from '@material-ui/core/NativeSelect';
import { connect } from '../../core/connection';

/// Converts a letter to a regional indicator.
const toRI = v => String.fromCodePoint(v.toLowerCase().charCodeAt(0) - 0x60 + 0x1f1e5);
/// Converts a two-letter country code to its corresponding emoji.
const countryCodeToEmoji = code => toRI(code[0]) + toRI(code[1]);

/// Renders a country, flag given a country code. Use prop `country`.
export function CountryFlag ({ country }) {
    // TODO: use twemoji
    if (!country) return null;
    return <span class="data country-flag">{countryCodeToEmoji(country)}</span>;
}

/// Renders its inner function (children) with countries and country groups as parameters.
export const WithCountries = connect('countries/countryGroups')(data => ({
    countryGroups: data,
}))(connect('countries/countries')(data => ({
    countries: data,
}))(function WithCountries ({ countries, countryGroups, children }) {
    if (countries && countryGroups) return children(countries, countryGroups);
    return null;
}));

function CountryRenderer ({ value }) {
    if (!value) return null;
    return (
        <WithCountries>{countries => (
            <span class="data country"><CountryFlag country={value} /> {countries[value].eo}</span>
        )}</WithCountries>
    );
}

/// Renders a countries dropdown.
export function CountryEditor ({ value, onChange }) {
    return (
        <div class="data country-editor">
            <WithCountries>
                {countries => (
                    <NativeSelect
                        value={value}
                        onChange={e => onChange(e.target.value || null)}>
                        <option value={''}>—</option>
                        {Object.entries(countries).map(([id, names]) => (
                            <option value={id} key={id}>
                                {names.eo}
                            </option>
                        ))}
                    </NativeSelect>
                )}
            </WithCountries>
        </div>
    );
}

export default {
    renderer: CountryRenderer,
    inlineRenderer: CountryRenderer,
    editor: CountryEditor,
};
