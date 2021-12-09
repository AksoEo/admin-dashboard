import { h } from 'preact';
import { TextField } from 'yamdl';
import { Validator } from '../../../components/form';
import MdField from '../../../components/controls/md-field';
import Segmented from '../../../components/controls/segmented';
import OrgIcon from '../../../components/org-icon';
import { magazines as locale, magazineSubs as subsLocale } from '../../../locale';
import './fields.less';
import { LinkButton } from '../../../router';

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
        shouldHide: () => true,
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
        shouldHide: (_, editing) => !editing,
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
        shouldHide: (_, editing) => !editing,
    },
};

export function Header ({ item, editing }) {
    if (editing) return null;
    return (
        <div class="magazine-header">
            <div class="inner-title">
                <OrgIcon org={item.org} />
                <h1 class="inner-title-text">{item.name}</h1>
            </div>
            <FIELDS.description.component value={item.description} slot="detail" />

            <div class="header-additional">
                <LinkButton raised class="subs-button" target={`/revuoj/${item.id}/simplaj-abonoj`}>
                    {subsLocale.title}
                </LinkButton>
            </div>
        </div>
    );
}
