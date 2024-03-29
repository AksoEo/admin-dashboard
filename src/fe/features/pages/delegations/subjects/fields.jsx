import { h } from 'preact';
import { TextField } from 'yamdl';
import Segmented from '../../../../components/controls/segmented';
import TextArea from '../../../../components/controls/text-area';
import OrgIcon from '../../../../components/org-icon';
import { delegationSubjects as locale, data as dataLocale } from '../../../../locale';

export const FIELDS = {
    org: {
        weight: 0.25,
        sortable: true,
        slot: 'icon',
        component ({ value, editing, onChange, slot }) {
            if (slot === 'create' && editing) {
                return (
                    <Segmented selected={value} onSelect={onChange}>
                        {['uea'].map(org => ({
                            id: org,
                            label: <OrgIcon org={org} />,
                        }))}
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
        weight: 0.5,
        slot: 'title',
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return (
                    <TextField
                        required
                        label={slot === 'create' ? locale.fields.name : null}
                        outline
                        value={value}
                        onChange={e => onChange(e.target.value)} />
                );
            }
            return value;
        },
    },
    description: {
        skipLabel: true,
        component ({ value, editing, onChange }) {
            if (editing) return <TextArea value={value} onChange={v => {
                onChange(v || null);
            }} />;
            if (!value) return null;
            return (
                <div class="delegation-subject-description">
                    {value.split('\n').map((x, i) => <div key={i}>{x}</div>)}
                </div>
            );
        },
    },
};
