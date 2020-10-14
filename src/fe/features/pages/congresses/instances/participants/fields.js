import { h } from 'preact';
import { Button, Checkbox, TextField } from '@cpsdqs/yamdl';
import CheckIcon from '@material-ui/icons/Check';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import CopyIcon from '../../../../../components/copy-icon';
import CodeholderPicker from '../../../../../components/codeholder-picker';
import TextArea from '../../../../../components/text-area';
import FormEditor from '../../../../../components/form-editor';
import { IdUEACode } from '../../../../../components/data/uea-code';
import { LinkButton } from '../../../../../router';
import { currencyAmount, timestamp } from '../../../../../components/data';
import { congressParticipants as locale } from '../../../../../locale';
import './fields.less';

export const FIELDS = {
    dataId: {
        component ({ value }) {
            return (
                <span class="congress-participant-data-id">
                    <span class="inner-data-id">{value}</span>

                    {navigator.clipboard && navigator.clipboard.writeText ? (
                        <Button class="id-copy-button" icon small onClick={() => {
                            navigator.clipboard.writeText(value).catch(console.error); // eslint-disable-line no-console
                            // TODO: create toast
                        }}>
                            <CopyIcon style={{ verticalAlign: 'middle' }} />
                        </Button>
                    ) : null}
                </span>
            );
        },
    },
    codeholderId: {
        isEmpty: () => false,
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return (
                    <CodeholderPicker
                        limit={1}
                        value={value ? [value] : []}
                        onChange={value => {
                            if (value.length) onChange(+value[0]);
                            else onChange(null);
                        }} />
                );
            }

            if (!value) return '—';
            return (
                <span class="congress-participant-codeholder">
                    <IdUEACode id={value} />
                    {slot === 'detail' && (
                        <LinkButton target={`/membroj/${value}`}>
                            {locale.fields.codeholderIdViewCodeholder}
                        </LinkButton>
                    )}
                </span>
            );
        },
    },
    approved: {
        isEmpty: () => false,
        component ({ value, editing, onChange }) {
            if (editing) {
                return (
                    <Checkbox
                        checked={value}
                        onChange={onChange} />
                );
            }
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
        component ({ value, editing, onChange }) {
            if (editing) {
                return (
                    <TextArea value={value} onChange={onChange} />
                );
            }

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
                            {locale.fields.hasPaidMinimumShort}
                            {' '}
                            <CheckIcon className="check-icon" />
                        </span>
                    )}
                </span>
            );
        },
    },
    sequenceId: {
        component ({ value, editing, onChange }) {
            if (editing) {
                return (
                    <TextField
                        type="number"
                        outline
                        value={value}
                        onChange={e => {
                            if (e.target.value) onChange(+e.target.value);
                            else onChange(null);
                        }} />
                );
            }
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
        component ({ value, editing, onChange }) {
            if (editing) {
                return (
                    <timestamp.editor
                        outline
                        value={value}
                        onChange={onChange} />
                );
            }
            if (!value) return '—';
            return <timestamp.renderer value={value * 1000} />;
        },
    },
    data: {
        component ({ value, editing, onChange, userData }) {
            return (
                <div class="participant-form-data">
                    <FormEditor
                        skipSettings
                        skipNonInputs
                        value={userData.registrationForm}
                        formData={value}
                        editingFormData={editing}
                        onFormDataChange={onChange} />
                </div>
            );
        },
    },
};
