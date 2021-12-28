import { h } from 'preact';
import { Checkbox } from 'yamdl';
import CheckIcon from '@material-ui/icons/Check';
import LimitedTextField from '../../../../components/controls/limited-text-field';
import MdField from '../../../../components/controls/md-field';
import { date } from '../../../../components/data';
import { magazineEditions as locale } from '../../../../locale/magazines';
import MagazineSubscribers from '../magazine-subscribers';
import './fields.less';

export const FIELDS = {
    idHuman: {
        sortable: true,
        slot: 'title',
        weight: 1,
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return <LimitedTextField
                    class="magazine-edition-field-id-human"
                    outline
                    label={slot === 'create' && locale.fields.idHuman}
                    value={value}
                    maxLength={50}
                    onChange={e => onChange(e.target.value)} />;
            }
            if (slot === 'title') return <b class="edition-field-id-human">{value}</b>;
            return value;
        },
    },
    date: {
        sortable: true,
        slot: 'titleAlt',
        weight: 1.2,
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return <date.editor
                    class="magazine-edition-field-id-human"
                    label={slot === 'create' && locale.fields.date}
                    outline
                    value={value}
                    onChange={onChange} />;
            }
            return <date.renderer value={value} />;
        },
    },
    published: {
        slot: 'icon',
        weight: 0.5,
        component ({ value, editing, onChange }) {
            if (editing) {
                return <Checkbox checked={value} onChange={onChange} />;
            }
            if (value) return <CheckIcon value={{ verticalAlign: 'middle' }} />;
            return '—';
        },
        isEmpty: () => false,
    },
    description: {
        sortable: true,
        skipLabel: true,
        weight: 2,
        component ({ value, editing, onChange, slot }) {
            return <MdField
                inline={slot !== 'detail'}
                editing={editing}
                rules={['emphasis', 'strikethrough', 'link', 'list', 'table']}
                value={value || ''}
                maxLength={5000}
                onChange={value => onChange(value || null)} />;
        },
    },
    subscribers: {
        wantsCreationLabel: true,
        component ({ value, editing, onChange }) {
            const chkId = Math.random().toString(36);
            return (
                <div class="magazine-edition-subscribers">
                    {editing ? (
                        <div class="override-switch">
                            <Checkbox
                                id={chkId}
                                checked={value !== null}
                                onChange={v => {
                                    if (v === (value !== null)) return;
                                    if (v) onChange({ paper: false, access: false });
                                    else onChange(null);
                                }} />
                            {' '}
                            <label for={chkId}>
                                {locale.fields.subscribersOverride}
                            </label>
                        </div>
                    ) : null}
                    {(value !== null) ? (
                        <MagazineSubscribers value={value} editing={editing} onChange={onChange} />
                    ) : null}
                </div>
            );
        },
    },
};
