import { h } from 'preact';
import { TextField } from 'yamdl';
import { Validator } from '../../../components/form';
import MdField from '../../../components/controls/md-field';
import Segmented from '../../../components/controls/segmented';
import OrgIcon from '../../../components/org-icon';
import { magazines as locale } from '../../../locale';
import './fields.less';

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
    },
    name: {
        sortable: true,
        slot: 'title',
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return <Validator
                    class="magazine-field-name"
                    component={TextField}
                    outline
                    label={slot === 'create' ? locale.fields.name : null}
                    validate={value => {
                        if (!value) throw { error: locale.update.nameRequired };
                    }}
                    value={value}
                    onChange={e => onChange(e.target.value)} />;
            }
            if (slot === 'title') return <b>{value}</b>;
            return value;
        },
    },
    description: {
        sortable: true,
        skipLabel: true,
        wantsCreationLabel: true,
        weight: 2,
        component ({ value, editing, onChange, slot }) {
            return <MdField
                inline={slot !== 'detail'}
                editing={editing}
                rules={['emphasis', 'strikethrough', 'link', 'list', 'table']}
                value={value || ''}
                onChange={value => onChange(value || null)} />;
        },
    },
};
