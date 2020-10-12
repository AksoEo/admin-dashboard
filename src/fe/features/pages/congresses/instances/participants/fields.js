import { h } from 'preact';
import CheckIcon from '@material-ui/icons/Check';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { IdUEACode } from '../../../../../components/data/uea-code';
import { LinkButton } from '../../../../../router';
import { currencyAmount, timestamp } from '../../../../../components/data';
import { congressParticipants as locale } from '../../../../../locale';
import './fields.less';

export const FIELDS = {
    dataId: {
        component ({ value }) {
            return <span class="congress-participant-data-id">{value}</span>;
        },
    },
    codeholderId: {
        isEmpty: () => false,
        component ({ value }) {
            if (!value) return '—';
            return (
                <span class="congress-participant-codeholder">
                    <IdUEACode id={value} />
                    <LinkButton target={`/membroj/${value}`}>
                        {locale.fields.codeholderIdViewCodeholder}
                    </LinkButton>
                </span>
            );
        },
    },
    approved: {
        isEmpty: () => false,
        component ({ value }) {
            if (value) return <CheckIcon style={{ verticalAlign: 'middle' }} />;
            return '—';
        },
    },
    isValid: {
        isEmpty: () => false,
        component ({ value }) {
            if (value) return <CheckIcon style={{ verticalAlign: 'middle' }} />;
            return '—';
        },
    },
    notes: {
        component ({ value }) {
            if (!value) return;
            return (
                <div>
                    {value.split('\n').map((x, i) => <div key={i}>{x}</div>)}
                </div>
            );
        },
    },
    price: {
        component ({ value, userData }) {
            return <currencyAmount.renderer value={value} currency={userData.currency} />;
        },
    },
    paid: {
        component ({ value, userData }) {
            if (!value) return null;
            return (
                <span class="congress-participant-paid">
                    <currencyAmount.renderer value={value.amount} currency={userData.currency} />
                    {value.hasPaidMinimum && (
                        <span class="has-paid-minimum" title={locale.fields.hasPaidMinimumDescription}>
                            <CheckCircleOutlineIcon style={{ verticalAlign: 'middle' }} />
                        </span>
                    )}
                </span>
            );
        },
    },
    sequenceId: {
        component ({ value }) {
            return value;
        },
    },
    createdTime: {
        component ({ value }) {
            return <timestamp.renderer value={value * 1000} />;
        },
    },
    editedTime: {
        component ({ value }) {
            if (!value) return '—';
            return <timestamp.renderer value={value * 1000} />;
        },
    },
    cancelledTime: {
        component ({ value }) {
            if (!value) return '—';
            return <timestamp.renderer value={value * 1000} />;
        },
    },
};
