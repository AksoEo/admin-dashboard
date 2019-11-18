import { h, Component } from 'preact';
import NativeSelect from '@material-ui/core/NativeSelect';
import PersonIcon from '@material-ui/icons/Person';
import BusinessIcon from '@material-ui/icons/Business';
import { Button, Checkbox, TextField, Dialog } from '@cpsdqs/yamdl';
import { UEACode } from '@tejo/akso-client';
import { coreContext } from '../../../core/connection';
import locale from '../../../locale';
import { Validator } from '../../../components/form';
import data, { Required } from '../../../components/data';
import SuggestionField from '../../../components/suggestion-field';
import ProfilePictureEditor from './profile-picture';
import MembershipEditor from './membership';
import Files from './files';

const makeEditable = (Renderer, Editor) => function EditableField ({ value, onChange, editing }) {
    if (!editing) return <Renderer value={value} />;
    return <Editor value={value} onChange={onChange} />;
};

const makeDataEditable = data => makeEditable(data.renderer, data.editor);

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

function NameEditor ({ value, item, editing, onChange }) {
    if (!editing) {
        let primaryName;
        let secondaryName;
        let IconType = () => {};
        if (item.type === 'human') {
            const { honorific, first: firstName, firstLegal, last: lastName, lastLegal } = value;
            const first = firstName || firstLegal;
            const last = lastName || lastLegal;
            primaryName = '';
            primaryName += honorific || '';
            primaryName += (primaryName ? ' ' : '') + (first || '');
            primaryName += (primaryName ? ' ' : '') + (last || '');

            IconType = PersonIcon;

            if (first !== firstLegal || last !== lastLegal) {
                secondaryName = (
                    <div class="name-legal">
                        {locale.members.detail.fields.nameLegal}: <span class="name-legal-inner">
                            {firstLegal || ''} {lastLegal || ''}
                        </span>
                    </div>
                );
            }
        } else if (item.type === 'org') {
            IconType = BusinessIcon;

            primaryName = [value.full];
            if (value.abbrev) {
                primaryName.push(' ');
                primaryName.push(
                    <span class="name-abbrev" key={0}>
                        ({value.abbrev})
                    </span>
                );
            }

            if (value.local) {
                secondaryName = (
                    <div class="name-legal">
                        {locale.members.detail.fields.local}: <span
                            class="name-legal-inner">
                            {value.local}
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
                    component: SuggestionField,
                    key: 'honorific',
                    props: {
                        maxLength: 15,
                        suggestions: locale.members.detail.honorificSuggestions,
                        label: locale.members.detail.fields.honorific,
                    },
                },
            ],
            [
                {
                    key: 'firstNameLegal',
                    label: <Required>{locale.members.detail.fields.firstNameLegal}</Required>,
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
                    label: <Required>{locale.members.detail.fields.fullName}</Required>,
                    props: {
                        maxLength: 100,
                        validatorProps: { class: 'full-name-editor' },
                    },
                    validate: validators.required(),
                },
            ],
            [
                {
                    key: 'fullNameLocal',
                    label: <Required>{locale.members.detail.fields.fullNameLocal}</Required>,
                    props: {
                        maxLength: 100,
                        validatorProps: { class: 'full-name-editor' },
                    },
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

function CodeEditor ({ value, item, editing, onChange }) {
    if (!editing) return <data.ueaCode.renderer value={value.new} value2={value.old} />;

    const suggestions = UEACode.suggestCodes({
        type: item.type,
        firstNames: item.name ? [item.name.firstLegal, item.name.first].filter(x => x) : [],
        lastNames: item.name ? [item.name.lastLegal, item.name.last].filter(x => x) : [],
        fullName: item.name ? item.name.full : undefined,
        nameAbbrev: item.name ? item.name.abbrev : undefined,
    });

    return <data.ueaCode.editor
        value={value.new}
        onChange={v => onChange({ ...value, new: v })}
        id={item.id}
        suggestions={suggestions} />;
}

function todoGetPerms () {
    // TODO
    return true;
}

function Header ({ item, editing, onItemChange }) {
    return (
        <div class="member-header">
            <ProfilePictureEditor
                id={item.id}
                profilePictureHash={item.profilePictureHash}
                canEdit={todoGetPerms('codeholders.update')} />
            <div class="member-info">
                <NameEditor
                    value={item.name}
                    item={item}
                    editing={editing}
                    onChange={name => onItemChange({ ...item, name })} />
                <div class="member-code">
                    <CodeEditor
                        value={item.code}
                        item={item}
                        editing={editing}
                        onChange={code => onItemChange({ ...item, code })} />
                </div>
                <MembershipEditor
                    id={item.id}
                    canEdit={todoGetPerms('codeholders.update')} />
            </div>
        </div>
    );
}

export class CodeholderAddressRenderer extends Component {
    state = {
        address: null,
        postalOpen: false,
        postalLang: 'eo',
        postalAddress: null,
    };

    static contextType = coreContext;

    componentDidMount () {
        this.load();
    }
    componentDidUpdate (prevProps) {
        if (prevProps.id !== this.props.id) this.load();
    }
    componentWillUnmount () {
        clearTimeout(this.reloadTimeout);
        clearTimeout(this.reloadTimeout2);
    }

    load () {
        if (!this.props.id) return;
        const id = this.props.id;

        this.context.createTask('codeholders/address', { id: this.props.id }).runOnceAndDrop().then(res => {
            if (id !== this.props.id) return;
            this.setState({ address: res });
        }).catch(() => {
            this.reloadTimeout = setTimeout(() => this.load(), 1000);
        });
    }

    loadPostal () {
        if (!this.props.id) return;
        const id = this.props.id;
        const lang = this.state.postalLang;
        this.setState({ postalAddress: '' }, () => {
            this.context.createTask('codeholders/address', { id: this.props.id }, {
                lang,
                postal: true,
            }).then(res => {
                if (id !== this.props.id || lang !== this.state.postalLang) return;
                this.setState({ postalAddress: res });
            }).catch(() => {
                this.reloadTimeout2 = setTimeout(() => this.loadPostal(), 1000);
            });
        });
    }

    render () {
        if (!this.state.address) return;
        return (
            <div class="codeholder-address-rendered">
                {this.state.address
                    .split('\n')
                    .map((x, i) => (<div class="address-line" key={i}>{x}</div>))}
                <Button
                    class="address-postal-button"
                    onClick={() => {
                        this.setState({ postalOpen: true });
                        this.loadPostal();
                    }}>
                    {locale.members.detail.postalAddress}
                </Button>

                <Dialog
                    // FIXME: this is kind of a terrible hack
                    class="codeholder-postal-address-dialog"
                    backdrop
                    open={this.state.postalOpen}
                    onClose={() => this.setState({ postalOpen: false })}
                    title={locale.members.detail.postalAddress}>
                    {locale.members.detail.postalLocale}{' '}
                    <NativeSelect
                        value={this.state.postalLang}
                        onChange={e => {
                            this.setState({ postalLang: e.target.value }, () => this.loadPostal());
                        }}>
                        {Object.entries(locale.members.csvOptions.countryLocales)
                            .map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </NativeSelect>

                    <textarea
                        class="postal-address"
                        value={this.state.postalAddress}
                        spellCheck="false"
                        onFocus={e => e.target.select()}
                        onMouseUp={e => setImmediate(() => e.target.select())}
                        onChange={() => this.forceUpdate()} />
                </Dialog>
            </div>
        );
    }
}

function simpleField (component) {
    return {
        component,
        isEmpty: value => !value,
    };
}

const fields = {
    name: {
        // virtual for diffing
        shouldHide: () => true,
    },
    code: {
        // virtual for diffing
        shouldHide: () => true,
    },
    enabled: {
        component ({ value, editing, onChange }) {
            if (!editing && !value) return '—';
            return (
                <Checkbox
                    class={!editing ? 'fixed-checkbox' : ''}
                    checked={value}
                    onChange={enabled => editing && onChange(enabled)} />
            );
        },
    },
    isDead: {
        component ({ value, editing, onChange }) {
            return (
                <Checkbox
                    class={!editing ? 'fixed-checkbox' : ''}
                    checked={value}
                    onChange={isDead => editing && onChange(isDead)} />
            );
        },
        isEmpty: value => !value.isDead,
    },
    birthdate: {
        component: makeDataEditable(data.date),
        isEmpty: value => !value.birthdate,
    },
    deathdate: {
        component: makeDataEditable(data.date),
        hasDiff (original, value) {
            return original.deathdate !== value.deathdate;
        },
        isEmpty: value => !value.isDead,
    },
    address: {
        component ({ value, editing, onChange }) {
            if (!editing) {
                return <CodeholderAddressRenderer id={value.id} />;
            } else {
                return <data.address.editor
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
        component: makeDataEditable(data.country),
        hasDiff (original, value) {
            return original.feeCountry !== value.feeCountry;
        },
        isEmpty: value => !value.feeCountry,
    },
    email: simpleField(makeDataEditable(data.email)),
    profession: simpleField('profession', function ({ value, editing, onChange }) {
        if (!editing) return value;
        return <TextField value={value} onChange={e => onChange(e.target.value)} maxLength={50} />;
    }),
    landlinePhone: simpleField(makeDataEditable(data.phoneNumber)),
    officePhone: simpleField(makeDataEditable(data.phoneNumber)),
    cellphone: simpleField(makeDataEditable(data.phoneNumber)),
    notes: {
        component ({ value, editing, onChange }) {
            if (!editing) {
                if (!value) return null;
                return (
                    <div class="member-notes">
                        {value}
                    </div>
                );
            } else {
                return (
                    <div class="member-notes">
                        <textarea
                            value={value}
                            onChange={e => onChange(e.target.value)} />
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

function Footer ({ value, editing }) {
    if (editing) return '';
    return (
        <div class="member-footer">
            <Files id={value.id} />
        </div>
    );
}

export {
    Header,
    fields,
    Footer,
};
