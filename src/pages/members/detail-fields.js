import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import PersonIcon from '@material-ui/icons/Person';
import BusinessIcon from '@material-ui/icons/Business';
import { Checkbox, TextField } from 'yamdl';
import locale from '../../locale';
import client from '../../client';
import { Validator } from '../../components/form';
import { UEACode as AKSOUEACode } from 'akso-client';
import {
    UEACode,
    WithCountries,
    CountryFlag,
    DateEditor,
    PhoneNumber,
    CountryEditor,
    AddressEditor,
    Email,
} from '../../components/data';

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
                            item: value,
                            onChange: newValue => onChange(
                                replaceKeyedValue(
                                    value,
                                    editor.key,
                                    editor.intoValue ? editor.intoValue(newValue) : newValue,
                                )
                            ),
                            ...(editor.props || {}),
                        })
                    ) : (
                        <Validator
                            component={TextField}
                            validate={editor.validate || (() => {})}
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

const validators = {
    required: (prev = (() => {})) => value => {
        prev(value);
        if (!value) throw { error: locale.data.requiredField };
    },
};

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

            primaryName = [value.fullName];
            if (value.nameAbbrev) {
                primaryName.push(' ');
                primaryName.push(
                    <span class="name-abbrev" key={0}>
                        ({value.nameAbbrev})
                    </span>
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
                    validate: validators.required(),
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
                    validate: validators.required(),
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
        return (
            <div class="uea-codes">
                <UEACode code={value.newCode} />
                {' '}
                {value.oldCode && <UEACode old code={value.oldCode} />}
            </div>
        );
    } else if (editing) {
        return lotsOfTextFields([[
            {
                key: 'newCode',
                label: locale.members.detail.fields.newCode + '*', // required
                props: { maxLength: 6 },
                validate: (prev => value => {
                    prev(value);

                    try {
                        const code = new AKSOUEACode(value);
                        if (code.type !== 'new') throw 0;
                    } catch (_) {
                        throw { error: locale.members.addMember.invalidUEACode };
                    }
                })(validators.required()),
            },
        ]], { value, onChange, class: 'uea-code-editor' });
    }
}

function Header ({ value, editing, onChange }) {
    return (
        <div class="member-header">
            <div class="member-picture-container">
                <img
                    class="member-picture"
                    src={`/codeholders/${value.id}/profile_picture/128px`} />
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
export class AddressRenderer extends Component {
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

function simpleField (key, Component) {
    return {
        component ({ value, editing, onChange }) {
            const onInputChange = v => onChange({ ...value, [key]: v });
            return <Component value={value[key]} editing={editing} onChange={onInputChange} />;
        },
        hasDiff (original, value) {
            // '' should still be considered the same as null
            if (!value[key] && !original[key]) return false;
            return value[key] !== original[key];
        },
        isEmpty: (value) => !value[key],
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
            if (!editing && !value.enabled) return '—';
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
        isEmpty: value => !value.isDead,
    },
    birthdate: {
        component ({ value, editing, onChange }) {
            return <DateEditor
                value={value.birthdate}
                editing={editing}
                onChange={v => onChange({ ...value, birthdate: v })} />;
        },
        hasDiff (original, value) {
            return original.birthdate !== value.birthdate;
        },
        isEmpty: value => !value.birthdate,
    },
    deathdate: {
        component ({ value, editing, onChange }) {
            return <DateEditor
                value={value.deathdate}
                editing={editing}
                onChange={v => onChange({ ...value, deathdate: v })} />;
        },
        hasDiff (original, value) {
            return original.deathdate !== value.deathdate;
        },
        isEmpty: value => !value.isDead,
    },
    address: {
        component ({ value, editing, onChange }) {
            if (!editing) {
                return <AddressRenderer id={value.id} />;
            } else {
                return <AddressEditor
                    value={value.address}
                    onChange={v => onChange({ ...value, address: v })} />;
            }
        },
        hasDiff (original, value) {
            return !(original.address === value.address
                || (value.address
                    && Object.keys(value.address)
                        .map(a => value.address[a] === original.address[a])
                        .reduce((a, b) => a && b)));
        },
        isEmpty: value => !value.address || !Object.values(value.address).filter(x => x).length,
        tall: true,
    },
    feeCountry: {
        component ({ value, editing, onChange }) {
            if (!editing) {
                return (
                    <WithCountries>
                        {countries => (
                            <span class="fee-country">
                                <CountryFlag country={value.feeCountry} />
                                {' '}
                                {countries[value.feeCountry]}
                            </span>
                        )}
                    </WithCountries>
                );
            } else {
                return <CountryEditor
                    value={value.feeCountry}
                    onChange={feeCountry => onChange({ ...value, feeCountry })} />;
            }
        },
        hasDiff (original, value) {
            return original.feeCountry !== value.feeCountry;
        },
        isEmpty: value => !value.feeCountry,
    },
    email: simpleField('email', Email),
    profession: simpleField('profession', function ({ value, editing, onChange }) {
        if (!editing) return value;
        return <TextField value={value} onChange={e => onChange(e.target.value)} maxLength={50} />;
    }),
    landlinePhone: simpleField('landlinePhone', PhoneNumber),
    officePhone: simpleField('officePhone', PhoneNumber),
    cellphone: simpleField('cellphone', PhoneNumber),
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
        isEmpty: value => !value.notes,
        tall: true,
    },
};

function Footer ({ editing }) {
    if (editing) return '';
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
