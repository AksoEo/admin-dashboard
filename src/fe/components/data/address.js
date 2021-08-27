import { h, Component } from 'preact';
import { TextField } from 'yamdl';
import { getValidationRules } from '@cpsdqs/google-i18n-address';
import Select from '../select';
import { data as locale } from '../../locale';
import { Validator } from '../form';
import countryField, { WithCountries } from './country';
import Required from './required';
import './style';

/// Max char lengths for each of the fields.
const maxLengthMap = {
    countryArea: 50,
    city: 50,
    streetAddress: 100,
    postalCode: 20,
    sortingCode: 20,
};

/// Renders an address without regarding a specific locale’s format.
function BasicAddressRenderer ({ value }) {
    if (!value) return null;

    const streetAddress = (value.streetAddress || '').split('\n');
    const city = value.city;
    const countryArea = value.countryArea;
    const country = value.country
        ? <WithCountries>{countries => countries[value.country.toLowerCase()]?.name_eo}</WithCountries>
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

/// Edits an address. Also handles locale-based validation.
///
/// - readableMask/editableMask: array - if set, only allows viewing/editing the given fields
class AddressEditor extends Component {
    state = {
        validationRules: null,
    };

    #reloadTimeout;

    /// Loads validation rules for the current locale.
    loadValidationRules () {
        if (!this.props.value) return;
        this.setState({ validationRules: null });
        getValidationRules({ countryCode: this.props.value.country }).then(rules => {
            this.setState({ validationRules: rules });
        }).catch(err => {
            console.error(err); // eslint-disable-line no-console
            this.#reloadTimeout = setTimeout(() => this.loadValidationRules(), 1000);
        });
    }

    componentDidMount () {
        this.loadValidationRules();
    }

    componentDidUpdate (prevProps) {
        if (!prevProps.value || prevProps.value.country !== this.props.value.country) {
            this.loadValidationRules();
        }
    }

    componentWillUnmount () {
        clearTimeout(this.#reloadTimeout);
    }

    render ({ value, onChange, readableMask, editableMask }) {
        if (!value) return null;
        const rmask = field => readableMask ? readableMask.includes(field) : true;
        const wmask = field => editableMask ? editableMask.includes(field) : true;
        const country = value.country;

        const onChangeField = (key, map = (x => x)) => v => onChange({ ...value, [key]: map(v) });

        const items = [];
        if (rmask('country')) {
            items.push(
                <countryField.editor
                    key="country"
                    emptyLabel={locale.address.countryEmpty}
                    value={country && country.toLowerCase()}
                    onChange={onChangeField('country')}
                    disabled={!wmask('country')} />,
            );
        }

        const rules = this.state.validationRules || {};
        const requiredFields = rules.requiredFields || [];
        const allowedFields = rules.allowedFields || [];
        const upperFields = rules.upperFields || [];
        const postalCodeMatchers = rules.postalCodeMatchers || [];

        if (rmask('countryArea') && requiredFields.includes('countryArea')) {
            items.push(
                <Validator
                    component={Select}
                    disabled={!wmask('countryArea')}
                    validate={value => {
                        if (country && !value) throw { error: locale.requiredField };
                    }}
                    class="address-editor-line"
                    key="countryArea"
                    value={value.countryArea}
                    onChange={onChangeField('countryArea', value => value || null)}
                    items={[{ value: '', label: '—' }].concat(rules.countryAreaChoices
                        .sort((a, b) => a[1].localeCompare(b[1])) // sort by name
                        .map(([id, area]) => ({
                            value: id,
                            label: `${id} - ${area}`,
                        })))} />
            );
        }

        for (const k of ['streetAddress', 'city', 'cityArea', 'postalCode', 'sortingCode']) {
            if (!allowedFields.includes(k) || !rmask(k)) continue;
            const isRequired = requiredFields.includes(k);
            const isUpper = upperFields.includes(k);
            items.push(<Validator
                component={TextField}
                validate={value => {
                    if (country && !value && isRequired) throw { error: locale.requiredField };

                    if (k === 'postalCode' && postalCodeMatchers.length) {
                        for (const matcher of postalCodeMatchers) {
                            if (!value.match(matcher)) {
                                throw { error: locale.address.invalidPostalCode };
                            }
                        }
                    }
                }}
                disabled={!wmask(k)}
                class="address-editor-line"
                key={k}
                value={value[k]}
                maxLength={maxLengthMap[k]}
                label={isRequired
                    ? <Required>{locale.addressFields[k]}</Required>
                    : locale.addressFields[k]}
                onChange={onChangeField(k, e => {
                    const v = e.target.value || null;
                    if (isUpper) return v ? v.toUpperCase() : v;
                    else return v;
                })} />);
        }

        return <div class="data address-editor">{items}</div>;
    }
}

export default {
    renderer: BasicAddressRenderer,
    inlineRenderer: BasicAddressRenderer,
    editor: AddressEditor,
};
