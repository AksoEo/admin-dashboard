import { h } from 'preact';
import { TextField } from 'yamdl';
import MdField from '../../../components/controls/md-field';
import Segmented from '../../../components/controls/segmented';
import OrgIcon from '../../../components/org-icon';
import { newsletters as locale, data as dataLocale } from '../../../locale';

export const FIELDS = {
    org: {
        weight: 0.25,
        slot: 'title',
        component ({ value, editing, onChange, slot }) {
            if (slot === 'create' && editing) {
                return (
                    <Segmented
                        selected={value}
                        onSelect={onChange}>
                        {[
                            { id: 'uea', label: <OrgIcon org="uea" /> },
                            { id: 'tejo', label: <OrgIcon org="tejo" /> },
                        ]}
                    </Segmented>
                );
            }
            return <OrgIcon org={value} />;
        },
        validate: ({ value }) => {
            if (!value) return dataLocale.requiredField;
        },
    },
    name: {
        sortable: true,
        slot: 'title',
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return <TextField
                    class="newsletter-field-name"
                    outline
                    label={slot === 'create' ? locale.fields.name : null}
                    required
                    value={value}
                    onChange={onChange} />;
            }
            if (slot === 'title') return <b>{value}</b>;
            return value;
        },
    },
    description: {
        skipLabel: true,
        wantsCreationLabel: true,
        weight: 2,
        component ({ value, editing, onChange, slot }) {
            return <MdField
                ignoreLiveUpdates
                inline={slot !== 'detail'}
                editing={editing}
                rules={['emphasis', 'strikethrough', 'link']}
                value={value || ''}
                onChange={value => onChange(value || null)} />;
        },
    },
    numSubscribers: {
        weight: 0.5,
        component ({ value }) {
            return (+value).toLocaleString('fr-FR');
        },
        isEmpty: () => false,
        shouldHide: (_, editing) => editing,
    },
};

