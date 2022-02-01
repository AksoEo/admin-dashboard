import { h } from 'preact';
import MdField from '../../../../components/controls/md-field';
import { country } from '../../../../components/data';
import CodeholderPicker from '../../../../components/pickers/codeholder-picker';
import { IdUEACode } from '../../../../components/data/uea-code';
import { Link } from '../../../../router';
import './fields.less';

export const FIELDS = {
    countryCode: {
        sortable: true,
        slot: 'title',
        weight: 0.5,
        wantsCreationLabel: true,
        component ({ value, onChange, slot }) {
            if (slot === 'create') {
                return <country.editor value={value} onChange={onChange} />;
            }
            return <country.renderer value={value} />;
        },
    },
    codeholderId: {
        sortable: true,
        slot: 'title',
        weight: 0.5,
        wantsCreationLabel: true,
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return (
                    <CodeholderPicker
                        value={value ? [value] : []}
                        onChange={value => onChange(value.length ? +value[0] : null)}
                        limit={1} />
                );
            }
            if (slot === 'detail') {
                return (
                    <Link class="intermediary-field-codeholder" outOfTree target={`/membroj/${value}`}>
                        <IdUEACode id={value} />
                    </Link>
                );
            }
            return <IdUEACode id={value} />;
        },
    },
    paymentDescription: {
        slot: 'body',
        weight: 1,
        wantsCreationLabel: true,
        component ({ value, editing, onChange }) {
            return (
                <MdField
                    rules={['emphasis', 'strikethrough', 'link', 'list', 'table']}
                    value={value}
                    editing={editing}
                    onChange={onChange} />
            );
        },
    },
};
