import React from 'react';
import Segmented from '../../components/segmented';
import { TextField } from 'yamdl';
import locale from '../../locale';
import tableFields from './fields';

const Header = () => {};

/* eslint-disable react/prop-types */

const fields = {
    codeholderType: {
        component ({ value, onChange }) {
            return (
                <Segmented
                    selected={value.codeholderType}
                    onSelect={selected => onChange({ ...value, codeholderType: selected })}>
                    {[
                        {
                            id: 'human',
                            label: locale.members.search.codeholderTypes.human,
                        },
                        {
                            id: 'org',
                            label: locale.members.search.codeholderTypes.org,
                        },
                    ]}
                </Segmented>
            );
        },
        editingOnly: true,
        hasDiff (original, value) {
            return value.codeholderType !== original.codeholderType;
        },
    },
    code: {
        component ({ value, editing, onChange }) {
            if (!editing) {
                const Code = tableFields.code.component;
                return <Code item={value} />;
            } else if (editing) {
                return (
                    <div class="uea-code-editor">
                        <TextField
                            label={locale.members.detail.fields.newCode}
                            value={value.newCode}
                            maxLength={6}
                            onChange={e => onChange({ ...value, newCode: e.target.value })} />
                        <TextField
                            label={locale.members.detail.fields.oldCode}
                            value={value.oldCode}
                            maxLength={6}
                            onChange={e => onChange({ ...value, oldCode: e.target.value })} />
                    </div>
                );
            }
        },
        hasDiff (original, value) {
            return value.newCode !== original.newCode || value.oldCode !== original.oldCode;
        },
    },
    email: {
        component ({ value, editing, onChange }) {
            if (!editing) {
                const Email = tableFields.email.component;
                return <Email item={value} value={value.email} />;
            } else {
                return (
                    <TextField
                        value={value.email}
                        type="email"
                        onChange={e => onChange({ ...value, email: e.target.value })} />
                );
            }
        },
        hasDiff (original, value) {
            return value.email !== original.email;
        },
    },
};

const Footer = () => {};

export default {
    Header,
    fields,
    Footer,
};
