import { h } from 'preact';
import LanguageIcon from '@material-ui/icons/Language';
import { WithCountries, CountryFlag } from './data/country';
import LargeMultiSelect from './large-multi-select';
import { data as locale } from '../locale';
import './country-picker.less';

/// Renders a country picker.
///
/// # Props
/// - value/onChange: array of strings
/// - hideGroups: if false, will hide country groups
/// - hidden: if true, will disable tab focusing
export default function CountryPicker (props) {
    return (
        <WithCountries>
            {(countries, countryGroups) => (
                <CountryPickerInnerComponent
                    {...props}
                    countries={countries}
                    countryGroups={countryGroups} />
            )}
        </WithCountries>
    );
}

function CountryPickerInnerComponent ({ countries, countryGroups, value, onChange, hideGroups, hidden }) {
    const items = (hideGroups ? [] : Object.keys(countryGroups)).concat(Object.keys(countries));
    const itemName = id => {
        if (id in countries) return countries[id].name_eo;
        return countryGroups[id].name;
    };
    const renderPreviewItem = ({ id }) => {
        if (id in this.props.countries) {
            return <CountryFlag country={id} />;
        } else if (this.props.countryGroups[id]) {
            return <span>{this.props.countryGroups[id].name}</span>;
        }
    };
    const renderItemContents = ({ id }) => (
        <div class="country-picker-inner-country-item">
            <div class="country-icon">
                {id in this.props.countries
                    ? <CountryFlag country={id} />
                    : <LanguageIcon />}
            </div>
            <div class="country-name">{itemName(id)}</div>
        </div>
    );

    return <LargeMultiSelect
        value={value}
        onChange={onChange}
        items={items}
        renderPreviewItem={renderPreviewItem}
        itemName={itemName}
        renderItemContents={renderItemContents}
        title={locale.countryPicker.dialogTitle}
        disabled={hidden} />;
}
