import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import i18naddress from 'google-i18n-address';
import NativeSelect from '@material-ui/core/NativeSelect';
import locale from '../../locale';
import { Validator } from '../form';
import countryField, { WithCountries } from './country';
import Required from './required';

const maxLengthMap = {
    countryArea: 50,
    city: 50,
    streetAddress: 100,
    postalCode: 20,
    sortingCode: 20,
};

function BasicAddressRenderer ({ value }) {
    if (!value) return null;

    const streetAddress = (value.streetAddress || '').split('\n');
    const city = value.city;
    const countryArea = value.countryArea;
    const country = value.country
        ? <WithCountries>{countries => countries[value.country].eo}</WithCountries>
        : null;

    const addressPseudolines = [
        ...streetAddress,
        [
            [value.postalCode, value.cityArea].filter(x => x).join(' '),
            city,
        ].filter(x => x).join(', '),
        countryArea,
        country,
    ].filter(x => x).map((x, i) =>
        (<span class="address-pseudoline" key={i}>{x}</span>));

    return (
        <div class="basic-address">
            {addressPseudolines}
        </div>
    );
}

function AddressEditor ({ value, onChange }) {
    if (!value) return null;
    const country = value.country;

    const onChangeField = (key, map = (x => x)) => v => onChange({ ...value, [key]: map(v) });

    const items = [
        <countryField.editor key="country" value={country} onChange={onChangeField('country')} />,
    ];

    const rules = i18naddress.getValidationRules({ countryCode: country });
    const requiredFields = rules.requiredFields || [];

    if (requiredFields.includes('countryArea')) {
        items.push(
            <Validator
                component={NativeSelect}
                validate={value => {
                    if (country && !value) throw { error: locale.data.requiredField };
                }}
                class="address-editor-line"
                key="countryArea"
                value={value.countryArea}
                onChange={onChangeField('countryArea', e => e.target.value || null)}>
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
                if (country && !value && isRequired) throw { error: locale.data.requiredField };
            }}
            class="address-editor-line"
            key={k}
            value={value[k]}
            maxLength={maxLengthMap[k]}
            label={isRequired
                ? <Required>{locale.data.addressFields[k]}</Required>
                : locale.data.addressFields[k]}
            onChange={onChangeField(k, e => e.target.value || null)} />);
    }

    return <div class="data address-editor">{items}</div>;
}

export default {
    renderer: BasicAddressRenderer,
    inlineRenderer: BasicAddressRenderer,
    editor: AddressEditor,
};
