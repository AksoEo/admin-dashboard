import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import PersonIcon from '@material-ui/icons/Person';
import BusinessIcon from '@material-ui/icons/Business';
import { CodeholderDisabledIcon } from './icons';
import DomainDisabledIcon from '@material-ui/icons/DomainDisabled';
import { UEACode } from 'akso-client';
import moment from 'moment';
import locale from '../../../locale';
import cache from '../../../cache';

// TODO: order fields in some sensible order

/* eslint-disable react/prop-types */

/** List of all member fields. */
export default {
    codeholderType: {
        sortable: true,
        component ({ value, item }) {
            let icon;
            if (!value) return <span className="codeholder-type-placeholder" />;
            const { enabled, isDead } = item;
            if (value === 'human' && enabled) icon = <PersonIcon />;
            else if (enabled) icon = <BusinessIcon />;
            else if (value === 'human') icon = <CodeholderDisabledIcon />;
            else icon = <DomainDisabledIcon />;

            let title = locale.members.fields.codeholderTypes[value];
            if (!enabled && !isDead) title += ` (${locale.members.fields.codeholderDisabledTitle})`;
            else if (!enabled) title += ` (${locale.members.fields.codeholderDeadTitle})`;

            return (
                <span
                    className={'codeholder-type' + (!enabled ? ' disabled' : '')}
                    title={title}>
                    {icon}
                </span>
            );
        },
        stringify (value, item) {
            const { enabled, isDead } = item;

            let title = locale.members.fields.codeholderTypes[value];
            if (!enabled && !isDead) title += ` (${locale.members.fields.codeholderDisabledTitle})`;
            else if (!enabled) title += ` (${locale.members.fields.codeholderDeadTitle})`;

            return title;
        },
    },
    name: {
        sortable: true,
        component: class Name extends React.PureComponent {
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
                const { codeholderType, isDead } = this.props.item;

                if (codeholderType === 'human') {
                    const { firstName, firstNameLegal, lastName, lastNameLegal } = this.props.item;
                    const honorific = this.props.item.honorific;
                    const first = firstName || firstNameLegal;
                    const last = lastName || lastNameLegal;
                    return (
                        <span
                            className={'name' + (isDead ? ' is-dead' : '')}
                            title={`${honorific ? honorific + ' ' : ''}${first} ${last}`}
                            ref={node => {
                                this.node = node;
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
                    const { fullName, nameAbbrev } = this.props.item;

                    return (
                        <span
                            className={'name' + (isDead ? ' is-dead' : '')}
                            title={`${fullName} ${nameAbbrev}`}
                            ref={node => {
                                this.node = node;
                                if (node) this.resizeObserver.observe(node);
                            }}>
                            <span
                                className="org-full-name"
                                ref={node => this.truncatingName = node}>
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
        stringify (value, item) {
            const { codeholderType } = item;
            if (codeholderType === 'human') {
                const { firstName, firstNameLegal, lastName, lastNameLegal } = item;
                const honorific = item.honorific;
                const first = firstName || firstNameLegal;
                const last = lastName || lastNameLegal;
                return `${(honorific ? (honorific + ' ') : '')}${first} ${last}`;
            } else if (codeholderType === 'org') {
                return item.fullName;
            } else {
                throw new Error('unknown codeholder type');
            }
        },
    },
    code: {
        sortable: true,
        component ({ item }) {
            const { oldCode, newCode } = item;
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
        stringify (value, item) {
            const { oldCode, newCode } = item;
            if (oldCode) {
                const oldCodeCheckLetter = new UEACode(oldCode).getCheckLetter();
                return `${newCode} (${oldCode}-${oldCodeCheckLetter})`;
            } else return newCode;
        },
    },
    age: {
        sortable: true,
        component ({ value, item }) {
            if (!value) {
                return '';
            }
            const atStartOfYear = item.agePrimo;
            const label = locale.members.fields.ageFormat(value, atStartOfYear);
            return <span className="age">{label}</span>;
        },
        stringify (value) {
            if (value === null || value === undefined) return '';
            return value.toString();
        },
    },
    birthdate: {
        sortable: true,
        component ({ value }) {
            // FIXME: displays as “15-a de December 1859”
            const formatted = value ? moment(value).format('D[-a de] MMMM Y') : '';

            return <span className="birthdate-deathdate" title={value}>{formatted}</span>;
        },
        stringify (value) {
            return value ? moment(value).format('D[-a de] MMMM Y') : '';
        },
    },
    deathdate: {
        sortable: true,
        component ({ value }) {
            // FIXME: displays as “15-a de December 1859”
            // FIXME: duplicate code
            const formatted = value ? moment(value).format('D[-a de] MMMM Y') : '';

            return <span className="birthdate-deathdate" title={value}>{formatted}</span>;
        },
        stringify (value) {
            return value ? moment(value).format('D[-a de] MMMM Y') : '';
        },
    },
    email: {
        component ({ value }) {
            return <span className="email">{value}</span>;
        },
        stringify (value) {
            return value;
        },
    },
    addressLatin: {
        sortable: true,
        component: class AddressLatin extends React.PureComponent {
            state = {};
            componentDidMount () {
                cache.getCountries().then(countries => this.setState({ countries }));
            }
            render () {
                let { value } = this.props;
                const { fields: selectedFields } = this.props;
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
                ].filter(x => x).map((x, i) =>
                    (<span className="address-pseudoline" key={i}>{x}</span>));

                return (
                    <div className="address">
                        {addressPseudolines}
                    </div>
                );
            }
        },
        stringify: async (value = {}, item, fields) => {
            const streetAddress = (value.streetAddress || '').split('\n');
            const showCity = !fields.includes('addressCity');
            const showCountryArea = !fields.includes('addressCountryArea');
            const city = showCity ? value.city : '';
            const countryArea = showCountryArea ? value.countryArea : '';
            const showCountry = !fields.includes('country');
            const countries = await cache.getCountries();
            const country = showCountry ? countries[value.country] : '';

            const addressPseudolines = [
                ...streetAddress,
                [
                    [value.postalCode, value.cityArea].filter(x => x).join(' '),
                    city,
                ].filter(x => x).join(', '),
                countryArea,
                country,
            ].filter(x => x);

            return addressPseudolines.join(', ');
        },
    },
    addressCity: {
        sortable: true,
        component ({ item }) {
            return <span className="address-city">{item.addressLatin.city}</span>;
        },
        stringify (value, item) {
            return item.addressLatin.city;
        },
    },
    addressCountryArea: {
        sortable: true,
        component ({ item }) {
            return <span className="address-country-area">{item.addressLatin.countryArea}</span>;
        },
        stringify (value, item) {
            return item.addressLatin.countryArea;
        },
    },
    country: {
        sortable: true,
        component: class Country extends React.PureComponent {
            state = {};

            componentDidMount () {
                cache.getCountries().then(countries => this.setState({ countries }));
            }

            getCountryName (name) {
                if (this.state.countries) return this.state.countries[name];
                else return '';
            }

            render () {
                const { feeCountry, addressLatin } = this.props.item;
                const addressCountry = addressLatin ? addressLatin.country : null;

                if (!feeCountry || !addressCountry || feeCountry === addressCountry) {
                    const country = addressCountry || feeCountry;
                    if (!country) return '';

                    // TEMP: render a flag using two regional indicator symbols to create the emoji
                    const toRI = v => String.fromCodePoint(
                        v.toLowerCase().charCodeAt(0) - 0x60 + 0x1f1e5
                    );
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
        stringify: async (value, item) => {
            const { feeCountry, addressLatin } = item;
            const addressCountry = addressLatin ? addressLatin.country : null;
            const countries = await cache.getCountries();

            if (!feeCountry || !addressCountry || feeCountry === addressCountry) {
                return countries[addressCountry || feeCountry];
            } else {
                const feeCountryName = countries[feeCountry];
                const countryName = countries[addressCountry];
                return locale.members.fields.disjunctCountry(feeCountryName, countryName);
            }
        },
    },
    officePhone: {
        component ({ item }) {
            return <span className="office-phone">{item.officePhoneFormatted}</span>;
        },
        stringify (value, item) {
            return item.officePhoneFormatted;
        },
    },
    cellphone: {
        component ({ item }) {
            return <span className="cellphone">{item.cellphoneFormatted}</span>;
        },
        stringify (value, item) {
            return item.cellphoneFormatted;
        },
    },
    landlinePhone: {
        component ({ item }) {
            return <span className="landline-phone">{item.landlinePhoneFormatted}</span>;
        },
        stringify (value, item) {
            return item.landlinePhoneFormatted;
        },
    },
    profession: {
        component ({ value }) {
            return <span className="profession">{value}</span>;
        },
        stringify (value) {
            return value;
        },
    },
    notes: {
        hideColumn: true,
    },
    membership: {
        component ({ value }) {
            if (!value) return null;
            return (
                <span className="memberships">
                    {value.flatMap((item, i) => (i == 0 ? [] : [', ']).concat([(
                        <span
                            className="membership-item"
                            key={`${item.categoryId}-${item.year}`}
                            data-category-id={item.categoryId}>
                            <abbr className="membership-item-id" title={item.name}>
                                {item.nameAbbrev}
                            </abbr>
                            <span className="membership-year">{item.year}</span>
                        </span>
                    )]))}
                </span>
            );
        },
        stringify (value) {
            if (!value) return '';
            return value.map(item => `${item.nameAbbrev} ${item.year}`).join(', ');
        },
    },
};
