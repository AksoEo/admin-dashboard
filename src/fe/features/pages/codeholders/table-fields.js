import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import ResizeObserver from 'resize-observer-polyfill';
import PersonIcon from '@material-ui/icons/Person';
import BusinessIcon from '@material-ui/icons/Business';
import { CodeholderDisabledIcon } from './icons';
import DomainDisabledIcon from '@material-ui/icons/DomainDisabled';
import { UEACode as AKSOUEACode } from '@tejo/akso-client';
import moment from 'moment';
import locale from '../../../locale';
import data from '../../../components/data';
import { WithCountries, CountryFlag } from '../../../components/data/country';

function getCountries (core) {
    return new Promise((resolve, reject) => {
        const dv = core.createDataView('countries/countries');
        dv.on('update', data => {
            if (data !== null) {
                dv.drop();
                resolve(data);
            }
        });
        dv.on('error', () => {
            dv.drop();
            reject();
        });
    });
}

// TODO: order fields in some sensible order
// TODO: update these for the new API

/** List of all member fields. */
export default {
    type: {
        sortable: true,
        weight: 0.5,
        component ({ value, item }) {
            let icon;
            if (!value) return <span class="codeholder-type-placeholder" />;
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
                    class={'codeholder-type' + (!enabled ? ' disabled' : '')}
                    title={title}>
                    <span class="codeholder-type-icon">{icon}</span>
                    <span class="codeholder-type-label">{title}</span>
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
    code: {
        sortable: true,
        component ({ value }) {
            if (!value) return null;
            const { old: oldCode, new: newCode } = value;
            return <data.ueaCode.inlineRenderer value={newCode} value2={oldCode} />;
        },
        stringify (value, item) {
            const { old: oldCode, new: newCode } = value;
            if (oldCode) {
                const oldCodeCheckLetter = new AKSOUEACode(oldCode).getCheckLetter();
                return `${newCode} (${oldCode}-${oldCodeCheckLetter})`;
            } else return newCode;
        },
    },
    name: {
        sortable: true,
        weight: 2,
        component: class Name extends PureComponent {
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

            render ({ value, item }) {
                if (!value) return null;
                const { type, isDead } = item;

                if (type === 'human') {
                    const { honorific, first: f, firstLegal, last: l, lastLegal } = value;
                    const first = f || firstLegal;
                    const last = l || lastLegal;
                    return (
                        <span
                            class={'name' + (isDead ? ' is-dead' : '')}
                            title={`${honorific ? honorific + ' ' : ''}${first} ${last}`}
                            ref={node => {
                                this.node = node;
                                if (node) this.resizeObserver.observe(node);
                            }}>
                            <span class="honorific" ref={node => {
                                this.prefixName = node;
                                if (node) this.resizeObserver.observe(node);
                            }}>
                                {honorific ? honorific + '\u00a0' : ''}
                            </span>
                            <span class="first-name" ref={node => this.truncatingName = node}>
                                {first}
                            </span> <span class="last-name" ref={node => {
                                this.fixedName = node;
                                if (node) this.resizeObserver.observe(node);
                            }}>
                                {last}
                            </span>
                        </span>
                    );
                } else if (type === 'org') {
                    const { full, abbrev } = value;

                    return (
                        <span
                            class={'name' + (isDead ? ' is-dead' : '')}
                            title={`${full} ${abbrev}`}
                            ref={node => {
                                this.node = node;
                                if (node) this.resizeObserver.observe(node);
                            }}>
                            <span
                                class="org-full-name"
                                ref={node => this.truncatingName = node}>
                                {full}
                            </span> <span className="org-abbrev" ref={node => {
                                this.fixedName = node;
                                if (node) this.resizeObserver.observe(node);
                            }}>
                                {abbrev ? `(${abbrev})` : ''}
                            </span>
                        </span>
                    );
                } else {
                    return <span class="name"></span>;
                }
            }
        },
        stringify (value, item) {
            const { type } = item;
            if (type === 'human') {
                const { first, firstLegal, last, lastLegal, honorific } = value;
                const f = first || firstLegal;
                const l = last || lastLegal;
                return `${(honorific ? (honorific + ' ') : '')}${f} ${l}`;
            } else if (type === 'org') {
                return value.full + (value.abbrev ? ` (${value.abbrev})` : '');
            } else {
                throw new Error('unknown codeholder type');
            }
        },
    },
    age: {
        sortable: true,
        component ({ value }) {
            if (!value) return null;
            const { now, atStartOfYear } = value;
            if (!now) return null;
            const label = locale.members.fields.ageFormat(now, atStartOfYear);
            return <span class="age">{label}</span>;
        },
        stringify (value) {
            if (!value) return '';
            const { now, atStartOfYear } = value;
            if (!now) return null;
            return locale.members.fields.ageFormat(now, atStartOfYear);
        },
    },
    membership: {
        weight: 2,
        component ({ value }) {
            if (!value) return null;
            return (
                <span class="memberships">
                    {value.flatMap((item, i) => {
                        let className = 'membership-item';
                        if (item.lifetime) className += ' is-lifetime';
                        if (item.givesMembership) className += ' gives-membership';

                        return (i == 0 ? [] : [', ']).concat([(
                            <span
                                class={className}
                                key={`${item.categoryId}-${item.year}`}
                                data-category-id={item.categoryId}>
                                <abbr class="membership-item-id" title={item.name}>
                                    {item.nameAbbrev}
                                </abbr>
                                <span class="membership-year">{item.year}</span>
                            </span>
                        )]);
                    })}
                </span>
            );
        },
        stringify (value) {
            if (!value) return '';
            return value.map(item => `${item.nameAbbrev}${item.year}`).join(', ');
        },
    },
    country: {
        weight: 1.5,
        sortable: true,
        component ({ item }) {
            const { feeCountry, address } = item;
            const addressCountry = address ? address.countryLatin : null;

            if (!feeCountry || !addressCountry || feeCountry === addressCountry) {
                const country = addressCountry || feeCountry;
                if (!country) return '';

                return (
                    <WithCountries>
                        {countries => {
                            const name = countries[country].eo;
                            return <span><CountryFlag country={country} /> {name}</span>;
                        }}
                    </WithCountries>
                );
            } else {
                return (
                    <WithCountries>
                        {countries => {
                            const feeCountryName = countries[feeCountry].eo;
                            const countryName = countries[addressCountry].eo;
                            return (
                                <span>
                                    {locale.members.fields
                                        .disjunctCountry(feeCountryName, countryName)}
                                </span>
                            );
                        }}
                    </WithCountries>
                );
            }
        },
        stringify: async (value, item, fields, options, core) => {
            const { feeCountry, address } = item;
            const addressCountry = address ? address.countryLatin : null;
            const countries = await getCountries(core);

            const cl = options.countryLocale;

            if (!feeCountry || !addressCountry || feeCountry === addressCountry) {
                const country = addressCountry || feeCountry;
                if (!country) return '';
                return country.toUpperCase() + ' ' + countries[country][cl];
            } else {
                const feeCountryName = feeCountry.toUpperCase() + ' ' + countries[feeCountry][cl];
                const countryName = addressCountry.toUpperCase() + ' ' + countries[addressCountry][cl];
                return locale.members.fields.disjunctCountryCSV(feeCountryName, countryName);
            }
        },
    },
    birthdate: {
        sortable: true,
        component: data.date.inlineRenderer,
        stringify (value) {
            return value ? moment(value).format('YYYY-MM-DD') : '';
        },
    },
    deathdate: {
        sortable: true,
        component: data.date.inlineRenderer,
        stringify (value) {
            return value ? moment(value).format('YYYY-MM-DD') : '';
        },
    },
    email: {
        weight: 2,
        component: data.email.inlineRenderer,
        stringify (value) {
            return value;
        },
    },
    address: {
        weight: 2,
        sortable: true,
        component ({ value, fields: selectedFields }) {
            if (!value) value = {};

            const streetAddress = (value.streetAddressLatin || '').split('\n');
            const showCity = !selectedFields.includes('addressCity');
            const showCountryArea = !selectedFields.includes('addressCountryArea');
            const city = showCity ? value.cityLatin : '';
            const countryArea = showCountryArea ? value.countryAreaLatin : '';
            const showCountry = !selectedFields.includes('country');
            const country = showCountry
                ? (<WithCountries>{countries => countries[value.country]}</WithCountries>)
                : '';

            const addressPseudolines = [
                ...streetAddress,
                [
                    [value.postalCodeLatin, value.cityAreaLatin].filter(x => x).join(' '),
                    city,
                ].filter(x => x).join(', '),
                countryArea,
                country,
            ].filter(x => x).map((x, i) =>
                (<span class="address-pseudoline" key={i}>{x}</span>));

            return (
                <div class="codeholder-address">
                    {addressPseudolines}
                </div>
            );
        },
        stringify: async (value = {}, item, fields, options, core) => {
            const streetAddress = (value.streetAddressLatin || '').split('\n');
            const showCity = !fields.includes('addressCity');
            const showCountryArea = !fields.includes('addressCountryArea');
            const city = showCity ? value.cityLatin : '';
            const countryArea = showCountryArea ? value.countryAreaLatin : '';
            const showCountry = !fields.includes('country');
            const countries = await getCountries(core);
            const country = showCountry ? countries[value.country] : '';

            const addressPseudolines = [
                ...streetAddress,
                [
                    [value.postalCodeLatin, value.cityAreaLatin].filter(x => x).join(' '),
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
            return <span class="address-city">{item.address.cityLatin}</span>;
        },
        stringify (value, item) {
            return item.address.cityLatin;
        },
    },
    addressCountryArea: {
        sortable: true,
        component ({ item }) {
            return <span class="address-country-area">{item.address.countryAreaLAtin}</span>;
        },
        stringify (value, item) {
            return item.address.countryAreaLatin;
        },
    },
    officePhone: {
        component: data.phoneNumber.inlineRenderer,
        stringify (value, item) {
            if (!value) return '';
            return value.formatted;
        },
    },
    cellphone: {
        component: data.phoneNumber.inlineRenderer,
        stringify (value, item) {
            if (!value) return '';
            return value.formatted;
        },
    },
    landlinePhone: {
        component: data.phoneNumber.inlineRenderer,
        stringify (value, item) {
            if (!value) return '';
            return value.formatted;
        },
    },
    profession: {
        component ({ value }) {
            return <span class="profession">{value}</span>;
        },
        stringify (value) {
            return value;
        },
    },
    notes: {
        hideColumn: true,
    },
};
