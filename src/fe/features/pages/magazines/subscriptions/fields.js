import { h } from 'preact';
import { TextField } from 'yamdl';
import { timestamp } from '../../../../components/data';
import { IdUEACode } from '../../../../components/data/uea-code';
import CodeholderPicker from '../../../../components/pickers/codeholder-picker';
import { Link } from '../../../../router';
import TextArea from '../../../../components/controls/text-area';

export const FIELDS = {
    codeholderId: {
        sortable: true,
        component ({ value, onChange, slot }) {
            if (slot === 'create') {
                return (
                    <CodeholderPicker
                        value={value ? [value] : []}
                        onChange={v => onChange(+v[0] || null)}
                        limit={1} />
                );
            }

            if (slot === 'detail') {
                return (
                    <Link outOfTree target={`/membroj/${value}`}>
                        <IdUEACode id={value} />
                    </Link>
                );
            }
            return <IdUEACode id={value} />;
        },
    },
    createdTime: {
        sortable: true,
        component ({ value }) {
            return <timestamp.renderer value={value} />;
        },
    },
    year: {
        sortable: true,
        component ({ value, editing, onChange }) {
            if (editing) {
                return (
                    <TextField
                        outline
                        type="number"
                        value={value}
                        onFocus={e => {
                            if (!e.target.value) onChange(new Date().getFullYear());
                        }}
                        onChange={e => {
                            const v = e.target.value;
                            if (Number.isFinite(+v)) onChange(+v);
                        }} />
                );
            }
            return '' + value;
        },
    },
    internalNotes: {
        component ({ value, editing, onChange }) {
            if (editing) {
                return <TextArea value={value} onChange={onChange} />;
            }
            if (!value) return '—';
            return (
                <div>
                    {(value || '').split('\n').map((ln, i) => (
                        <div key={i}>{ln}</div>
                    ))}
                </div>
            );
        },
    },
};
