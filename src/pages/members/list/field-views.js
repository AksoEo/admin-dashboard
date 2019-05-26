import React from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';
import PersonIcon from '@material-ui/icons/Person';
import BusinessIcon from '@material-ui/icons/Business';
import { CodeholderDisabledIcon } from './icons';
import DomainDisabledIcon from '@material-ui/icons/DomainDisabled';
import { UEACode } from 'akso-client';
import moment from 'moment';
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
    codeholderType ({ value, member }) {
        let icon;
        if (!value) return <span className="codeholder-type-placeholder" />;
        const { enabled } = member;
        if (value === 'human' && enabled) icon = <PersonIcon />;
        else if (enabled) icon = <BusinessIcon />;
        else if (value === 'human') icon = <CodeholderDisabledIcon />;
        else icon = <DomainDisabledIcon />;

        let title = locale.members.fields.codeholderTypes[value];
        if (!enabled) title += ` (${locale.members.fields.codeholderDisabledTitle})`;

        return (
            <span
                className={'codeholder-type' + (!enabled ? ' disabled' : '')}
                title={title}>
                {icon}
            </span>
        );
    },
    name: class Name extends React.PureComponent {
        node = null;
        prefixName = null;
        truncatingName = null;
        fixedName = null;

        resizeObserver = new ResizeObserver(() => {
            if (!this.node) return;
            const containerWidth = this.node.offsetWidth;
            const prefixWidth = this.prefixName ? this.prefixName.offsetWidth : 0;
            const fixedWidth = this.fixedName.offsetWidth;
            this.truncatingName.style.maxWidth = (containerWidth - fixedWidth
                - prefixWidth) + 'px';
        });

        render () {
            const { codeholderType, isDead } = this.props.member;

            if (codeholderType === 'human') {
                const { firstName, firstNameLegal, lastName, lastNameLegal } = this.props.member;
                const honorific = this.props.member.honorific;
                const first = firstName || firstNameLegal;
                const last = lastName || lastNameLegal;
                return (
                    <span
                        className={'name' + (isDead ? ' is-dead' : '')}
                        title={`${honorific ? honorific + ' ' : ''}${first} ${last}`}
                        ref={node => {
                            this.node = node;
                            this.props.transitionTitleRef && this.props.transitionTitleRef(node);
                            if (node) this.resizeObserver.observe(node);
                        }}>
                        <span className="honorific" ref={node => {
                            this.prefixName = node;
                            if (node) this.resizeObserver.observe(node);
                        }}>
                            {honorific ? honorific + '\u00a0' : ''}
                        </span>
                        <span className="first-name" ref={node => this.truncatingName = node}>
                            {first}
                        </span> <span className="last-name" ref={node => {
                            this.fixedName = node;
                            if (node) this.resizeObserver.observe(node);
                        }}>
                            {last}
                        </span>
                    </span>
                );
            } else if (codeholderType === 'org') {
                const { fullName, nameAbbrev } = this.props.member;

                return (
                    <span
                        className={'name' + (isDead ? ' is-dead' : '')}
                        title={`${fullName} ${nameAbbrev}`}
                        ref={node => {
                            this.node = node;
                            this.props.transitionTitleRef && this.props.transitionTitleRef(node);
                            if (node) this.resizeObserver.observe(node);
                        }}>
                        <span className="org-full-name" ref={node => this.truncatingName = node}>
                            {fullName}
                        </span> <span className="org-abbrev" ref={node => {
                            this.fixedName = node;
                            if (node) this.resizeObserver.observe(node);
                        }}>
                            {nameAbbrev ? `(${nameAbbrev})` : ''}
                        </span>
                    </span>
                );
            } else {
                return <span className="name"></span>;
            }
        }
    },
    code ({ member }) {
        const { oldCode, newCode } = member;
        if (oldCode) {
            const oldCodeCheckLetter = new UEACode(oldCode).getCheckLetter();
            return (
                <span className="uea-codes">
                    <span className="uea-code">
                        {newCode}
                    </span> <span className="old-uea-code">
                        {oldCode}-{oldCodeCheckLetter}
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
    addressLatin: class AddressLatin extends React.PureComponent {
        state = {};
        componentDidMount () {
            data.getCountries().then(countries => this.setState({ countries }));
        }
        render () {
            let { value } = this.props;
            const { selectedFields } = this.props;
            if (!value) value = {};

            const streetAddress = (value.streetAddress || '').split('\n');
            const showCity = !selectedFields.includes('addressCity');
            const showCountryArea = !selectedFields.includes('addressCountryArea');
            const city = showCity ? value.city : '';
            const countryArea = showCountryArea ? value.countryArea : '';
            const showCountry = !selectedFields.includes('country');
            const country = showCountry
                ? this.state.countries ? this.state.countries[value.country] : '' : '';

            const addressPseudolines = [
                ...streetAddress,
                [
                    [value.postalCode, value.cityArea].filter(x => x).join(' '),
                    city,
                ].filter(x => x).join(', '),
                countryArea,
                country,
            ].filter(x => x).map((x, i) => (<span className="address-pseudoline" key={i}>{x}</span>));

            return (
                <div className="address">
                    {addressPseudolines}
                </div>
            );
        }
    },
    addressCity ({ member }) {
        return <span className="address-city">{member.addressLatin.city}</span>;
    },
    addressCountryArea ({ member }) {
        return <span className="address-country-area">{member.addressLatin.countryArea}</span>;
    },
    birthdate ({ value }) {
        // FIXME: displays as “15-a de December 1859”
        const formatted = value ? moment(value).format('D[-a de] MMMM Y') : '';

        return <span className="birthdate-deathdate" title={value}>{formatted}</span>;
    },
    get deathdate () {
        return this.birthdate;
    },
    officePhone ({ member }) {
        return <span className="office-phone">{member.officePhoneFormatted}</span>;
    },
    landlinePhone ({ member }) {
        return <span className="landline-phone">{member.landlinePhoneFormatted}</span>;
    },
    cellphone ({ member }) {
        return <span className="cellphone">{member.cellphoneFormatted}</span>;
    },
    profession ({ value }) {
        return <span className="profession">{value}</span>;
    },
};
/* eslint-enable react/prop-types */
