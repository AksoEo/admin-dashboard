import { h } from 'preact';
import { timestamp } from '../../../../components/data';
import TextArea from '../../../../components/text-area';
import DetailFields from '../../../../components/detail-fields';
import { membershipEntries as locale, codeholders as codeholdersLocale } from '../../../../locale';
import { fields as CODEHOLDER_FIELDS } from '../../codeholders/detail-fields';
import './fields.less';

const CODEHOLDER_DATA_FIELDS = Object.fromEntries([
    'address', 'feeCountry', 'email', 'name', 'birthdate', 'cellphone',
].map(id => ([id, CODEHOLDER_FIELDS[id]])));

export const FIELDS = {
    id: {
        component ({ value }) {
            return <span class="registration-entry-id">{value}</span>;
        },
    },
    year: {
        sortable: true,
        component ({ value }) {
            return value;
        },
    },
    status: {
        sortable: true,
        component ({ value, slot }) {
            if (!value) return null;
            if (slot === 'detail') {
                return (
                    <div class="registration-entry-status">
                        {locale.fields.statusTypes[value.status]}
                        {value.time && (
                            <span>
                                {' ('}
                                {locale.fields.timeSubmittedTime}
                                {': '}
                                <timestamp.renderer value={value.time * 1000} />
                                {')'}
                            </span>
                        )}
                    </div>
                );
            }
            return locale.fields.statusTypes[value.status];
        },
    },
    timeSubmitted: {
        sortable: true,
        weight: 2,
        component ({ value }) {
            return <timestamp.renderer value={value * 1000} />;
        },
    },
    internalNotes: {
        component ({ value, editing, onChange }) {
            if (editing) return <TextArea value={value} onChange={onChange} />;
            if (!value) return null;
            return <div>{value.split('\n').map((l, i) => <div key={i}>{l}</div>)}</div>;
        },
    },
    codeholderData: {
        component ({ value }) {
            return (
                <div class="registration-entry-codeholder-data">
                    <DetailFields
                        compact
                        data={value}
                        fields={CODEHOLDER_DATA_FIELDS}
                        locale={codeholdersLocale}
                        userData={{ useLocalAddress: true }} />
                </div>
            );
        },
    },
};
