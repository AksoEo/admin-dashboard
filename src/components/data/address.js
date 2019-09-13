import { h } from 'preact';
import { TextField } from 'yamdl';
import i18naddress from 'google-i18n-address';
import NativeSelect from '@material-ui/core/NativeSelect';
import locale from '../../locale';
import { Validator } from '../form';
import countryField from './country';

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

    return <div class="data address-editor">{items}</div>;
}

export default {
    editor: AddressEditor,
};
