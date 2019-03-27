import React from 'react';
import PropTypes from 'prop-types';
import PersonIcon from '@material-ui/icons/Person';
import BusinessIcon from '@material-ui/icons/Business';
import locale from '../../../locale';

export const Position = {
    COLUMN: 0,
    LEFT: 1,
    NAME: 2,
    CENTER: 3,
    RIGHT: 4
};

const COL_POSITIONS = [Position.COLUMN, Position.LEFT, Position.RIGHT];

export default class MemberField extends React.PureComponent {
    static propTypes = {
        field: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired,
        position: PropTypes.number.isRequired
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

/* eslint-disable react/prop-types */
const FIELDS = {
    codeholderType ({ value, position }) {
        if (COL_POSITIONS.includes(position)) {
            let icon;
            if (value === 'human') icon = <PersonIcon />;
            else icon = <BusinessIcon />;
            return <div className="codeholder-type">{icon}</div>;
        } else {
            return (
                <span className="inline-codeholder-type">
                    {locale.members.fields.codeholderType[value]}
                </span>
            );
        }
    },
    name ({ value }) {
        return value;
    },
    newCode ({ value }) {
        return <span className="uea-code">{value}</span>;
    },
    feeCountry ({ value, position }) {
        // TEMP: render a flag using two regional indicator symbols to create the emoji
        const toRI = v => String.fromCodePoint(v.toLowerCase().charCodeAt(0) - 0x60 + 0x1f1e5);
        const flag = toRI(value[0]) + toRI(value[1]);
        if (position === Position.LEFT || position === Position.RIGHT) {
            return flag;
        } else {
            return <span>{flag} todo: fetch name</span>;
        }
    }
};
/* eslint-enable react/prop-types */
