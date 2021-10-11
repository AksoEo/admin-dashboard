import { h } from 'preact';
import { TextField } from 'yamdl';
import Segmented from '../../../../components/segmented';
import TextArea from '../../../../components/text-area';
import OrgIcon from '../../../../components/org-icon';
import { delegationSubjects as locale } from '../../../../locale';

export const FIELDS = {
    org: {
        weight: 0.25,
        sortable: true,
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
    },
    name: {
        weight: 0.5,
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return (
                    <TextField
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
        component ({ value, editing, onChange }) {
            if (editing) return <TextArea value={value} onChange={onChange} />;
            if (!value) return null;
            return (
                <div class="delegation-subject-description">
                    {value.split('\n').map((x, i) => <div key={i}>{x}</div>)}
                </div>
            );
        },
    },
};