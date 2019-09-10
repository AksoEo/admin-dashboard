//! Country utilities.

import { h, Component } from 'preact';
import NativeSelect from '@material-ui/core/NativeSelect';
import cache from '../../cache';

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
export class WithCountries extends Component {
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

function CountryRenderer ({ value }) {
    return (
        <WithCountries>{countries => (
            <span class="data country"><CountryFlag country={value} /> {countries[value]}</span>
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

export default {
    renderer: CountryRenderer,
    inlineRenderer: CountryRenderer,
    editor: CountryEditor,
};
