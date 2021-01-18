import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import CheckIcon from '@material-ui/icons/Check';
import TinyProgress from '../../../../components/tiny-progress';
import { connect } from '../../../../core/connection';

export const FIELDS = {
    year: {
        sortable: true,
        slot: 'title',
        component ({ value }) {
            return '' + value;
        },
    },
    enabled: {
        slot: 'icon',
        skipLabel: true,
        component ({ value }) {
            if (!value) return null;
            return <CheckIcon />;
        },
    },
    currency: {
        component ({ value }) {
            return value;
        },
    },
    paymentOrg: {
        virtual: ['paymentOrgId'],
        isEmpty: (_, item) => !item.paymentOrgId,
        component ({ item }) {
            const id = item.paymentOrgId;
            return <PaymentOrgLabel id={id} />;
        },
    },
    offers: {
        component ({ value }) {
            return null;
        },
    },
};

const PaymentOrgLabel = connect(({ id }) => (['payments/org', { id }]))(data => ({
    data,
}))(class PaymentOrgLabel extends PureComponent {
    render ({ data }) {
        if (!data) return <TinyProgress />;
        return data.name;
    }
});
