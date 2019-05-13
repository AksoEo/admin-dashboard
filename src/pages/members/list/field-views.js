import React from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';
import PersonIcon from '@material-ui/icons/Person';
import BusinessIcon from '@material-ui/icons/Business';
import locale from '../../../locale';
import data from './data';

/** Renders a single member field. */
export default class MemberField extends React.PureComponent {
    static propTypes = {
        /** The field name. */
        field: PropTypes.string.isRequired,
        /** Its value (if it exists). */
        value: PropTypes.any,
        /** The member object. */
        member: PropTypes.object.isRequired,
        /** List of currently selected fields. */
        selectedFields: PropTypes.arrayOf(PropTypes.string).isRequired,
        /** Function for setting the transition title. */
        transitionTitleRef: PropTypes.func,
    };

    render () {
        const Field = FIELDS[this.props.field];
        if (Field) {
            return <Field {...this.props} />;
        } else {
            return <span>?</span>;
        }
    }
}

/* eslint-disable react/prop-types */ // props are kinda checked above anyway
/** Field renderers. */
const FIELDS = {
    codeholderType ({ value }) {
        let icon;
        if (value === 'human') icon = <PersonIcon />;
        else icon = <BusinessIcon />;
        return (
            <span
                className="codeholder-type"
                title={locale.members.fields.codeholderTypes[value]}>
                {icon}
            </span>
        );
    },
    name: class Name extends React.PureComponent {
        node = null;
        honorific = null;
        firstName = null;
        lastName = null;
        resizeObserver = null;

        componentDidMount () {
            if (this.props.member.codeholderType === 'human') {
                this.resizeObserver = new ResizeObserver(() => {
                    if (!this.node) return;
                    const containerWidth = this.node.offsetWidth;
                    const honorificWidth = this.honorific.offsetWidth;
                    const lastWidth = this.lastName.offsetWidth;
                    this.firstName.style.maxWidth = (containerWidth - lastWidth
                        - honorificWidth) + 'px';
                });
                this.resizeObserver.observe(this.node);
                this.resizeObserver.observe(this.lastName);
                this.resizeObserver.observe(this.honorific);
            }
        }

        render () {
            if (this.props.member.codeholderType === 'human') {
                const { firstName, firstNameLegal, lastName, lastNameLegal } = this.props.member;
                const honorific = this.props.member.honorific;
                const first = firstName || firstNameLegal;
                const last = lastName || lastNameLegal;
                return (
                    <span
                        className="name"
                        title={`${first} ${last}`}
                        ref={node => {
                            this.node = node;
                            this.props.transitionTitleRef && this.props.transitionTitleRef(node);
                        }}>
                        <span className="honorific" ref={node => this.honorific = node}>
                            {honorific ? honorific + '\u00a0' : ''}
                        </span>
                        <span className="first-name" ref={node => this.firstName = node}>
                            {first}
                        </span> <span className="last-name" ref={node => this.lastName = node}>
                            {last}
                        </span>
                    </span>
                );
            } else {
                return <span
                    className="name"
                    ref={node => {
                        this.node = node;
                        this.props.transitionTitleRef && this.props.transitionTitleRef(node);
                    }}>todo: org name</span>;
            }
        }
    },
    code ({ member }) {
        const { oldCode, newCode } = member;
        if (oldCode) {
            return (
                <span className="uea-codes">
                    <span className="uea-code">
                        {newCode}
                    </span> <span className="old-uea-code">
                        {oldCode}
                    </span>
                </span>
            );
        } else {
            return <span className="uea-code">{newCode}</span>;
        }
    },
    enabled ({ value }) {
        const label = value
            ? locale.members.fields.enabledStates.yes
            : locale.members.fields.enabledStates.no;
        return <span className="enabled-state">{label}</span>;
    },
    country: class Country extends React.PureComponent {
        state = {};

        componentDidMount () {
            data.getCountries().then(countries => this.setState({ countries }));
        }

        getCountryName (name) {
            if (this.state.countries) return this.state.countries[name];
            else return '';
        }

        render () {
            const { feeCountry, addressLatin } = this.props.member;
            const addressCountry = addressLatin ? addressLatin.country : null;

            if (!feeCountry || !addressCountry || feeCountry == addressCountry) {
                const country = addressCountry || feeCountry;
                if (!country) return '';

                // TEMP: render a flag using two regional indicator symbols to create the emoji
                const toRI = v => String.fromCodePoint(v.toLowerCase().charCodeAt(0) - 0x60 + 0x1f1e5);
                const flag = toRI(country[0]) + toRI(country[1]);
                const name = this.getCountryName(country);
                return <span>{flag} {name}</span>;
            } else {
                const feeCountryName = this.getCountryName(feeCountry);
                const countryName = this.getCountryName(addressCountry);
                return (
                    <span>
                        {locale.members.fields.disjunctCountry(feeCountryName, countryName)}
                    </span>
                );
            }
        }
    },
    age ({ value, member }) {
        if (!value) {
            return '';
        }
        const atStartOfYear = member.agePrimo;
        const label = locale.members.fields.ageFormat(value, atStartOfYear);
        return <span className="age">{label}</span>;
    },
    email ({ value }) {
        return <span className="email">{value}</span>;
    },
    addressLatin ({ value, selectedFields }) {
        if (!value) value = {};
        const streetAddress = (value.streetAddress || '').split('\n')
            .map((line, i) => (<span key={i} className="address-pseudoline">{line}</span>));

        const showCity = !selectedFields.includes('addressCity');
        const showCountryArea = !selectedFields.includes('addressCountryArea');
        const city = showCity ? value.city : '';
        const countryArea = showCountryArea ? value.countryArea : '';

        return (
            <div className="address">
                {streetAddress}
                <span className="address-pseudoline">
                    {value.postalCode} {value.cityArea}
                    {value.cityArea && city ? ', ' : ''}
                    {city}
                </span>
                {showCountryArea && <span className="address-pseudoline">
                    {countryArea}
                </span>}
            </div>
        );
    },
    addressCity ({ member }) {
        return <span className="address-city">{member.addressLatin.city}</span>;
    },
    addressCountryArea ({ member }) {
        return <span className="address-country-area">{member.addressLatin.countryArea}</span>;
    },
    birthdate ({ value }) {
        return <span className="birthdate">{value}</span>;
    },
};
/* eslint-enable react/prop-types */
