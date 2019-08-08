import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import PropTypes from 'prop-types';
import PersonIcon from '@material-ui/icons/Person';
import BusinessIcon from '@material-ui/icons/Business';
import NativeSelect from '@material-ui/core/NativeSelect';
import { Checkbox, TextField } from 'yamdl';
import locale from '../../locale';
import client from '../../client';
import cache from '../../cache';
import tableFields from './fields';

/* eslint-disable react/prop-types */

// Lots of text fields
function lotsOfTextFields (lines, { value, onChange, ...restProps }) {
    const getKeyedValue = (value, key) => {
        let v = value;
        for (const p of key.split('.')) {
            if (!(p in v)) return null;
            v = v[p];
        }
        return v;
    };
    const replaceKeyedValue = (value, key, newValue) => {
        value = { ...value };
        const keyPath = key.split('.');
        const last = keyPath.pop();
        let v = value;
        for (const p of keyPath) {
            if (!(p in v)) return null;
            v = v[p] = { ...v[p] };
        }
        v[last] = newValue;
        return value;
    };

    return (
        <div {...restProps}>
            {lines.map((line, i) => (
                <div class="editor-line" key={i + (restProps.key || '')}>
                    {line.map((editor, i) => editor.component ? (
                        h(editor.component, {
                            key: i,
                            value: editor.fromValue
                                ? editor.fromValue(getKeyedValue(value, editor.key))
                                : getKeyedValue(value, editor.key),
                            onChange: value => onChange(
                                replaceKeyedValue(
                                    value,
                                    editor.key,
                                    editor.intoValue ? editor.intoValue(value) : value,
                                )
                            ),
                            ...(editor.props || {}),
                        })
                    ) : (
                        <TextField
                            key={i}
                            label={editor.label}
                            value={editor.fromValue
                                ? editor.fromValue(getKeyedValue(value, editor.key))
                                : getKeyedValue(value, editor.key)}
                            onChange={e => onChange(
                                replaceKeyedValue(
                                    value,
                                    editor.key,
                                    editor.intoValue
                                        ? editor.intoValue(e.target.value)
                                        : e.target.value,
                                )
                            )}
                            {...(editor.props || {})} />
                    ))}
                </div>
            ))}
        </div>
    );
}

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
        return lotsOfTextFields([
            [
                {
                    key: 'honorific',
                    label: locale.members.detail.fields.honorific,
                    props: { maxLength: 15 },
                },
            ],
            [
                {
                    key: 'firstNameLegal',
                    label: locale.members.detail.fields.firstNameLegal + '*', // required
                    props: { maxLength: 50 },
                },
                {
                    key: 'lastNameLegal',
                    label: locale.members.detail.fields.lastNameLegal,
                    props: { maxLength: 50 },
                },
            ],
            [
                {
                    key: 'firstName',
                    label: locale.members.detail.fields.firstName,
                    props: { maxLength: 50 },
                },
                {
                    key: 'lastName',
                    label: locale.members.detail.fields.lastName,
                    props: { maxLength: 50 },
                },
            ],
        ], { value, onChange, class: 'member-name editing', key: 'human' });
    } else if (value.codeholderType === 'org') {
        return lotsOfTextFields([
            [
                {
                    key: 'fullName',
                    label: locale.members.detail.fields.fullName + '*', // required
                    props: { maxLength: 100, class: 'full-name-editor' },
                },
            ],
            [
                {
                    key: 'nameAbbrev',
                    label: locale.members.detail.fields.nameAbbrev,
                    props: { maxLength: 12 },
                },
            ],
        ], { value, onChange, class: 'member-name editing', key: 'org' });
    }
}

function CodeEditor ({ value, editing, onChange }) {
    if (!editing) {
        const Code = tableFields.code.component;
        return <Code item={value} />;
    } else if (editing) {
        return lotsOfTextFields([[
            {
                key: 'newCode',
                label: locale.members.detail.fields.newCode + '*', // required
                props: { maxLength: 6 },
            },
            {
                key: 'oldCode',
                label: locale.members.detail.fields.oldCode,
                props: { maxLength: 4, disabled: true },
            },
        ]], { value, onChange, class: 'uea-code-editor' });
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

// TODO: some way to pick language
class AddressRenderer extends PureComponent {
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
        client.get(`/codeholders/${this.props.id}/address/eo`, {
            formatAs: 'displayLatin',
        }).then(res => {
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

class CountryEditor extends PureComponent {
    state = {
        countries: {},
    };

    componentDidMount () {
        cache.getCountries().then(countries => this.setState({ countries }));
    }

    render () {
        return (
            <div class="country-editor">
                <NativeSelect
                    value={this.props.value}
                    onChange={e => this.props.onChange(e.target.value)}>
                    <option value={''}>—</option>
                    {Object.entries(this.state.countries).map(([id, name]) => (
                        <option value={id} key={id}>
                            {name}
                        </option>
                    ))}
                </NativeSelect>
            </div>
        );
    }
}

function simpleField (key, extraProps = {}) {
    return {
        component ({ value, editing, onChange }) {
            if (!editing) return value[key];
            else return <TextField
                value={value[key]}
                onChange={e => onChange({ ...value, [key]: e.target.value })}
                {...extraProps} />;
        },
        hasDiff (original, value) {
            return value[key] !== original[key];
        },
    };
}

const fields = {
    name: {
        // virtual for diffing
        shouldHide: () => true,
        hasDiff (original, value) {
            const fields = [
                'honorific',
                'fullName',
                'nameAbbrev',
                'firstNameLegal',
                'lastNameLegal',
                'firstName',
                'lastName',
            ];
            for (const f of fields) if (original[f] !== value[f]) return true;
        },
    },
    code: {
        // virtual for diffing
        shouldHide: () => true,
        hasDiff (original, value) {
            return original.newCode !== value.newCode || original.oldCode !== value.oldCode;
        },
    },
    enabled: {
        component ({ value, editing, onChange }) {
            return (
                <Checkbox
                    class={!editing ? 'fixed-checkbox' : ''}
                    checked={value.enabled}
                    onChange={enabled => editing && onChange({ ...value, enabled })} />
            );
        },
        hasDiff (original, value) {
            return original.enabled !== value.enabled;
        },
    },
    isDead: {
        component ({ value, editing, onChange }) {
            return (
                <Checkbox
                    class={!editing ? 'fixed-checkbox' : ''}
                    checked={value.isDead}
                    onChange={isDead => editing && onChange({ ...value, isDead })} />
            );
        },
        hasDiff (original, value) {
            return original.isDead !== value.isDead;
        },
    },
    birthdate: {
        component ({ value, editing, onChange }) {
            if (!editing) {
                const Component = tableFields.birthdate.component;
                return <Component value={value.birthdate} />;
            } else {
                // TODO
            }
        },
        hasDiff (original, value) {
            return original.birthdate !== value.birthdate;
        },
    },
    deathdate: {
        component ({ value, editing, onChange }) {
            if (!editing) {
                const Component = tableFields.deathdate.component;
                return <Component value={value.deathdate} />;
            } else {
                // TODO
            }
        },
        hasDiff (original, value) {
            return original.deathdate !== value.deathdate;
        },
        shouldHide (value) {
            return !value.isDead;
        },
    },
    address: {
        component ({ value, editing, onChange }) {
            if (!editing) {
                return <AddressRenderer id={value.id} />;
            } else {
                const fields = [
                    ['country'],
                    ['countryArea'],
                    ['city', 'cityArea'],
                    ['streetAddress', 'postalCode', 'sortingCode'],
                ];

                return lotsOfTextFields(fields.map(items => items.map(item => ({
                    key: `address.${item}`,
                    label: locale.members.detail.fields.addressFields[item],
                    component: item === 'country' ? CountryEditor : null,
                }))), { value, onChange });
            }
        },
        hasDiff (original, value) {
            return !(original.address === value.address
                || (value.address
                    && Object.keys(value.address)
                        .map(a => value.address[a] === original.address[a])
                        .reduce((a, b) => a && b)));
        },
        tall: true,
    },
    feeCountry: {
        component ({ value, editing, onChange }) {
            if (!editing) {
                // TODO: fancy country
                return value.feeCountry;
            } else {
                return <CountryEditor
                    value={value.feeCountry}
                    onChange={feeCountry => onChange({ ...value, feeCountry })} />;
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
    profession: simpleField('profession', { maxLength: 50 }),
    landlinePhone: simpleField('landlinePhone', { type: 'tel', maxLength: 50 }),
    officePhone: simpleField('officePhone', { type: 'tel', maxLength: 50 }),
    cellphone: simpleField('cellphone', { type: 'tel', maxLength: 50 }),
    notes: {
        component ({ value, editing, onChange }) {
            if (!editing) {
                if (!value.notes) return null;
                return (
                    <div class="member-notes">
                        {value.notes}
                    </div>
                );
            } else {
                return (
                    <div class="member-notes">
                        <textarea
                            value={value.notes}
                            onChange={e => onChange({ ...value, notes: e.target.value })} />
                    </div>
                );
            }
        },
        hasDiff (original, value) {
            return original.notes !== value.notes;
        },
        tall: true,
    },
};

function Footer () {
    return (
        <div class="member-footer">
            todo: files
        </div>
    );
}

export default {
    header: Header,
    fields,
    footer: Footer,
};
