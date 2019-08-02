import React from 'react';
import PropTypes from 'prop-types';
import Segmented from '../../components/segmented';
import PersonIcon from '@material-ui/icons/Person';
import BusinessIcon from '@material-ui/icons/Business';
import { TextField } from 'yamdl';
import locale from '../../locale';
import client from '../../client';
import tableFields from './fields';

/* eslint-disable react/prop-types */

function NameEditor ({ value, editing, onChange }) {
    if (!editing) {
        let primaryName;
        let secondaryName;
        let IconType = () => {};
        if (value.codeholderType === 'human') {
            const { honorific, firstName, firstNameLegal, lastName, lastNameLegal } = value;
            const first = firstName || firstNameLegal;
            const last = lastName || lastNameLegal;
            primaryName = '';
            primaryName += honorific || '';
            primaryName += (primaryName ? ' ' : '') + (first || '');
            primaryName += (primaryName ? ' ' : '') + (last || '');

            IconType = PersonIcon;

            if (first !== firstNameLegal || last !== lastNameLegal) {
                secondaryName = (
                    <div class="name-legal">
                        {locale.members.detail.fields.nameLegal}: <span class="name-legal-inner">
                            {firstNameLegal || ''} {lastNameLegal || ''}
                        </span>
                    </div>
                );
            }
        } else if (value.codeholderType === 'org') {
            IconType = BusinessIcon;

            primaryName = value.fullName;
            if (value.nameAbbrev) {
                secondaryName = (
                    <div class="name-abbrev">
                        {locale.members.detail.fields.nameAbbrev}: <span class="name-abbrev-inner">
                            {value.nameAbbrev}
                        </span>
                    </div>
                );
            }
        }

        return (
            <div class="member-name">
                <div class="name-primary">
                    <IconType class="type-icon" />
                    {primaryName}
                </div>
                {secondaryName}
            </div>
        );
    } else if (value.codeholderType === 'human') {
        return (
            <div class="member-name editing" key="human">
                <div class="name-editor-line">
                    <TextField
                        label={locale.members.detail.fields.honorific}
                        value={value.honorific}
                        maxLength={15}
                        onChange={e => onChange({ ...value, honorific: e.target.value })} />
                </div>
                <div class="name-editor-line">
                    <TextField
                        label={locale.members.detail.fields.firstNameLegal}
                        value={value.firstNameLegal}
                        maxLength={50}
                        onChange={e => onChange({ ...value, firstNameLegal: e.target.value })} />
                    <TextField
                        label={locale.members.detail.fields.lastNameLegal}
                        value={value.lastNameLegal}
                        maxLength={50}
                        onChange={e => onChange({ ...value, lastNameLegal: e.target.value })} />
                </div>
                <div class="name-editor-line">
                    <TextField
                        label={locale.members.detail.fields.firstName}
                        value={value.firstName}
                        maxLength={50}
                        onChange={e => onChange({ ...value, firstName: e.target.value })} />
                    <TextField
                        label={locale.members.detail.fields.lastName}
                        value={value.lastName}
                        maxLength={50}
                        onChange={e => onChange({ ...value, lastName: e.target.value })} />
                </div>
            </div>
        );
    } else if (value.codeholderType === 'org') {
        return (
            <div class="member-name editing" key="org">
                <div class="name-editor-line">
                    <TextField
                        class="full-name-editor"
                        label={locale.members.detail.fields.fullName}
                        value={value.fullName}
                        maxLength={100}
                        onChange={e => onChange({ ...value, fullName: e.target.value })} />
                </div>
                <div class="name-editor-line">
                    <TextField
                        label={locale.members.detail.fields.nameAbbrev}
                        value={value.nameAbbrev}
                        maxLength={12}
                        onChange={e => onChange({ ...value, nameAbbrev: e.target.value })} />
                </div>
            </div>
        );
    }
}

function CodeEditor ({ value, editing, onChange }) {
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
}

function Header ({ value, editing, onChange }) {
    return (
        <div class="member-header">
            <div class="member-picture-container">
                {value.hasProfilePicture ? (
                    <img
                        class="member-picture"
                        src={`/codeholders/${value.id}/profile_picture/128px`} />
                ) : null}
            </div>
            <div class="member-info">
                <NameEditor value={value} editing={editing} onChange={onChange} />
                <div class="member-code">
                    <CodeEditor value={value} editing={editing} onChange={onChange} />
                </div>
            </div>
        </div>
    );
}

class AddressRenderer extends React.PureComponent {
    static propTypes = {
        id: PropTypes.any,
    };

    state = {
        address: null,
    };

    componentDidMount () {
        this.load();
    }
    componentDidUpdate (prevProps) {
        if (prevProps.id !== this.props.id) this.load();
    }
    componentWillUnmount () {
        clearTimeout(this.reloadTimeout);
    }

    load () {
        if (!this.props.id) return;
        const id = this.props.id;
        client.get(`/codeholders/${this.props.id}/address/eo`).then(res => {
            if (id !== this.props.id) return;
            this.setState({ address: res.body[this.props.id] });
        }).catch(() => {
            this.reloadTimeout = setTimeout(() => this.load(), 1000);
        });
    }

    render () {
        if (!this.state.address) return;
        return (
            <div class="address-rendered">
                {this.state.address
                    .split('\n')
                    .map((x, i) => (<div class="address-line" key={i}>{x}</div>))}
            </div>
        );
    }
}

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
    address: {
        component ({ value, editing, onChange }) {
            if (!editing) {
                return <AddressRenderer id={value.id} />;
            } else {
                // TODO
            }
        },
        hasDiff (original, value) {
            // TODO
        },
        tall: true,
    },
    feeCountry: {
        component ({ value, editing, onChange }) {
            if (!editing) {
                // TODO: fancy country
                return value.feeCountry;
            } else {
                // TODO
            }
        },
        hasDiff (original, value) {
            return original.feeCountry !== value.feeCountry;
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
    header: Header,
    fields,
    footer: Footer,
};
