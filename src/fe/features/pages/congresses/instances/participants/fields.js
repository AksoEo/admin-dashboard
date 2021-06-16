import { h } from 'preact';
import { lazy, Suspense } from 'preact/compat';
import { Button, CircularProgress, Checkbox, TextField } from '@cpsdqs/yamdl';
import CheckIcon from '@material-ui/icons/Check';
import CopyIcon from '../../../../../components/copy-icon';
import CodeholderPicker from '../../../../../components/codeholder-picker';
import TextArea from '../../../../../components/text-area';
import { IdUEACode } from '../../../../../components/data/uea-code';
import { LinkButton } from '../../../../../router';
import { currencyAmount, timestamp } from '../../../../../components/data';
import { congressParticipants as locale } from '../../../../../locale';
import './fields.less';

const FormEditor = lazy(() => import('../../../../../components/form-editor'));

export const FIELDS = {
    dataId: {
        weight: 2,
        component ({ value, slot }) {
            return (
                <span class="congress-participant-data-id">
                    <span class="inner-data-id">{value}</span>

                    {slot === 'detail' && navigator.clipboard && navigator.clipboard.writeText ? (
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
        stringify: v => v,
    },
    identity: {
        weight: 1.5,
        isEmpty: () => false,
        slot: 'title',
        component ({ value, editing, onChange, slot }) {
            if (!value && !editing) return;
            value = value || {};
            let codeholder = null;
            if (editing) {
                codeholder = (
                    <CodeholderPicker
                        limit={1}
                        value={value.codeholder ? [value.codeholder] : []}
                        onChange={v => {
                            if (v.length) onChange({ ...value, codeholder: +v[0] });
                            else onChange({ ...value, codeholder: null });
                        }} />
                );
            } else if (value.codeholder) {
                codeholder = (
                    <span class="identity-codeholder">
                        <IdUEACode id={value.codeholder} />
                        {slot === 'detail' && (
                            <LinkButton target={`/membroj/${value.codeholder}`}>
                                {locale.fields.codeholderIdViewCodeholder}
                            </LinkButton>
                        )}
                    </span>
                );
            }

            let formData = null;
            if (!editing && slot !== 'detail' && (value.name || value.email)) {
                formData = (
                    <span class="identity-form-data">
                        {value.name ? <span class="fd-name">{'' + value.name}</span> : null}
                        {value.email ? <span class="fd-email">{'' + value.email}</span> : null}
                    </span>
                );
            }

            return (
                <div class="congress-participant-identity">
                    {formData}
                    {codeholder}
                    {(!formData && !codeholder) ? '—' : ''}
                </div>
            );
        },
        stringify (value, item, fields, options, core) {
            if (!value) return '';

            let formData = value.name || '';
            if (value.email) {
                if (formData) formData += ' ';
                formData += '<' + value.email + '>';
            }
            if (!value.codeholder) return formData;

            return new Promise((resolve, reject) => {
                const view = core.createDataView('codeholders/codeholder', {
                    id: value.codeholder,
                    fields: ['code'],
                    lazyFetch: true,
                });
                view.on('update', data => {
                    if (data === null) return;
                    resolve([formData, data.code.new].filter(x => x).join(' '));
                    view.drop();
                });
                view.on('error', err => {
                    reject(err);
                    view.drop();
                });
            });
        },
    },
    approved: {
        sortable: true,
        weight: 0.5,
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
        stringify: v => locale.spreadsheet.bool['' + v],
    },
    isValid: {
        sortable: true,
        weight: 0.5,
        isEmpty: () => false,
        component ({ value }) {
            if (value) return <CheckIcon style={{ verticalAlign: 'middle' }} />;
            return '—';
        },
        stringify: v => locale.spreadsheet.bool['' + v],
    },
    notes: {
        weight: 2,
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
        stringify: v => v,
    },
    price: {
        weight: 0.5,
        component ({ value, userData }) {
            return <currencyAmount.renderer value={value} currency={userData.currency} />;
        },
        stringify: (v, item, fields, options) => currencyAmount.stringify(v, options.currency),
    },
    paid: {
        weight: 0.5,
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
        stringify: (v, item, fields, options) => {
            if (!v) return '';
            return currencyAmount.stringify(v.amount, options.currency)
                + (v.hasPaidMinimum ? ` (${locale.fields.hasPaidMinimumShort})` : '');
        },
    },
    sequenceId: {
        sortable: true,
        weight: 0.5,
        slot: 'titleAlt',
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
        stringify: v => v,
    },
    createdTime: {
        sortable: true,
        weight: 1.5,
        component ({ value }) {
            return <timestamp.renderer value={value} />;
        },
        stringify: v => timestamp.stringify(v),
    },
    editedTime: {
        sortable: true,
        weight: 1.5,
        component ({ value }) {
            if (!value) return '—';
            return <timestamp.renderer value={value} />;
        },
        stringify: v => timestamp.stringify(v),
    },
    cancelledTime: {
        sortable: true,
        weight: 1.5,
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
            return <timestamp.renderer value={value} />;
        },
        stringify: v => timestamp.stringify(v),
    },
    data: {
        component ({ value, editing, onChange, userData }) {
            return (
                <div class="participant-form-data">
                    <Suspense fallback={<CircularProgress indeterminate />}>
                        <FormEditor
                            skipSettings
                            skipNonInputs
                            value={userData.registrationForm}
                            formData={value}
                            editingFormData={editing}
                            onFormDataChange={onChange} />
                    </Suspense>
                </div>
            );
        },
    },
};
