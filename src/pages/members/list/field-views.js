import React from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';
import PersonIcon from '@material-ui/icons/Person';
import BusinessIcon from '@material-ui/icons/Business';
import locale from '../../../locale';

/** Possible positions for a field. */
export const Position = {
    COLUMN: 0,
    LEFT: 1,
    NAME: 2,
    CENTER: 3,
    RIGHT: 4,
};

/** Column-like positions. */
const COL_POSITIONS = [Position.COLUMN, Position.LEFT, Position.RIGHT];

/** Renders a single member field. */
export default class MemberField extends React.PureComponent {
    static propTypes = {
        /** The field name. */
        field: PropTypes.string.isRequired,
        /** Its value (if it exists). */
        value: PropTypes.any,
        /** The member object. */
        member: PropTypes.object.isRequired,
        /** The field position (see “enum” above) */
        position: PropTypes.number.isRequired,
        /** List of currently selected fields. */
        templateFields: PropTypes.arrayOf(PropTypes.string).isRequired,
        /** Function for setting the transition title. */
        transitionTitleRef: PropTypes.func,
    };

    render () {
        const Field = FIELDS[this.props.field];
        if (Field) {
            return <Field {...this.props} />;
        } else {
            return <span>error</span>;
        }
    }
}

/* eslint-disable react/prop-types */ // props are kinda checked above anyway
/** Field renderers. */
const FIELDS = {
    codeholderType ({ value, position }) {
        if (COL_POSITIONS.includes(position)) {
            let icon;
            if (value === 'human') icon = <PersonIcon />;
            else icon = <BusinessIcon />;
            return (
                <div
                    className="codeholder-type"
                    title={locale.members.fields.codeholderTypes[value]}>
                    {icon}
                </div>
            );
        } else {
            return (
                <span className="inline-codeholder-type">
                    {locale.members.fields.codeholderTypes[value]}
                </span>
            );
        }
    },
    name: class Name extends React.PureComponent {
        node = null;
        firstName = null;
        lastName = null;
        resizeObserver = null;

        componentDidMount () {
            this.resizeObserver = new ResizeObserver(() => {
                if (!this.node) return;
                const containerWidth = this.node.offsetWidth;
                const lastWidth = this.lastName.offsetWidth;
                this.firstName.style.maxWidth = (containerWidth - lastWidth) + 'px';
            });
            this.resizeObserver.observe(this.node);
            this.resizeObserver.observe(this.lastName);
        }

        componentWillUnmount () {
            this.resizeObserver.unobserve(this.node);
            this.resizeObserver.unobserve(this.lastName);
        }

        render () {
            const { firstName, firstNameLegal, lastName, lastNameLegal } = this.props.value;
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
                    <span className="first-name" ref={node => this.firstName = node}>
                        {first}
                    </span> <span className="last-name" ref={node => this.lastName = node}>
                        {last}
                    </span>
                </span>
            );
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
    country ({ member, position }) {
        const { feeCountry, addressLatin: { country } } = member;

        if (feeCountry == country) {
            // TEMP: render a flag using two regional indicator symbols to create the emoji
            const toRI = v => String.fromCodePoint(v.toLowerCase().charCodeAt(0) - 0x60 + 0x1f1e5);
            const flag = toRI(feeCountry[0]) + toRI(feeCountry[1]);
            if (position === Position.LEFT || position === Position.RIGHT) {
                return flag;
            } else {
                return <span>{flag} (nomo)</span>;
            }
        } else {
            return <span>todo</span>;
        }
    },
    age ({ value, position }) {
        if (position === Position.CENTER) {
            return <div className="age">{locale.members.fields.age}: {value}</div>;
        }
        return <span className="age">{value}</span>;
    },
    email ({ value }) {
        return <span className="email">{value}</span>;
    },
    addressLatin ({ value, templateFields }) {
        const streetAddress = (value.streetAddress || '').split('\n')
            .map((line, i) => (<span key={i} className="address-pseudoline">{line}</span>));

        const showCity = !templateFields.includes('addressCity');
        const showCountryArea = !templateFields.includes('addressCountryArea');
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
};
/* eslint-enable react/prop-types */
