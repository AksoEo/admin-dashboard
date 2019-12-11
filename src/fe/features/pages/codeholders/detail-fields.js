import { h, Component } from 'preact';
import NativeSelect from '@material-ui/core/NativeSelect';
import PersonIcon from '@material-ui/icons/Person';
import BusinessIcon from '@material-ui/icons/Business';
import { Button, Checkbox, TextField, Dialog } from '@cpsdqs/yamdl';
import { UEACode } from '@tejo/akso-client';
import { coreContext } from '../../../core/connection';
import { codeholders as locale, data as dataLocale } from '../../../locale';
import { Validator } from '../../../components/form';
import data, { Required } from '../../../components/data';
import SuggestionField from '../../../components/suggestion-field';
import Segmented from '../../../components/segmented';
import TinyProgress from '../../../components/tiny-progress';
import ProfilePictureEditor from './profile-picture';
import { MembershipInDetailView, RolesInDetailView } from './membership-roles';
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
                                        : (e.target.value || null),
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
        if (!value) throw { error: dataLocale.requiredField };
    },
};

function NameEditor ({ value, item, editing, onChange, noIcon, createHistoryLink }) {
    if (!value) return null;

    // use actual type or heuristics otherwise
    const itemType = item.type || (value && value.firstLegal ? 'human' : 'org');

    if (!editing) {
        let primaryName;
        let secondaryName;
        let IconType = () => {};
        if (itemType === 'human') {
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
                        {locale.nameSubfields.legal}: <span class="name-legal-inner">
                            {firstLegal || ''} {lastLegal || ''}
                        </span>
                    </div>
                );
            }
        } else if (itemType === 'org') {
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
                        {locale.nameSubfields.local}: <span
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
                    {!noIcon && <IconType className="type-icon" />}
                    {primaryName}
                    {!noIcon && createHistoryLink('name')}
                </div>
                {secondaryName}
            </div>
        );
    } else if (itemType === 'human') {
        return lotsOfTextFields([
            [
                {
                    component: SuggestionField,
                    key: 'honorific',
                    props: {
                        maxLength: 15,
                        suggestions: locale.honorificSuggestions,
                        label: locale.nameSubfields.honorific,
                    },
                },
            ],
            [
                {
                    key: 'firstLegal',
                    label: <Required>{locale.nameSubfields.firstLegal}</Required>,
                    props: { maxLength: 50 },
                    validate: validators.required(),
                },
                {
                    key: 'lastLegal',
                    label: locale.nameSubfields.lastLegal,
                    props: { maxLength: 50 },
                },
            ],
            [
                {
                    key: 'first',
                    label: locale.nameSubfields.first,
                    props: { maxLength: 50 },
                },
                {
                    key: 'last',
                    label: locale.nameSubfields.last,
                    props: { maxLength: 50 },
                },
            ],
        ], {
            value,
            onChange,
            class: 'member-name editing',
            key: 'human',
        });
    } else if (itemType === 'org') {
        return lotsOfTextFields([
            [
                {
                    key: 'full',
                    label: <Required>{locale.nameSubfields.full}</Required>,
                    props: {
                        maxLength: 100,
                        validatorProps: { class: 'full-name-editor' },
                    },
                    validate: validators.required(),
                },
            ],
            [
                {
                    key: 'local',
                    label: <Required>{locale.nameSubfields.local}</Required>,
                    props: {
                        maxLength: 100,
                        validatorProps: { class: 'full-name-editor' },
                    },
                },
            ],
            [
                {
                    key: 'abbrev',
                    label: locale.nameSubfields.abbrev,
                    props: { maxLength: 12 },
                },
            ],
        ], {
            value,
            onChange,
            class: 'member-name editing',
            key: 'org',
        });
    }
}

function CodeEditor ({ value, item, editing, onChange }) {
    if (!value) return null;
    if (!editing) {
        return <data.ueaCode.renderer value={value.new} value2={value.old} />;
    }

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

function Header ({ item, editing, onItemChange, createHistoryLink }) {
    return (
        <div class="member-header">
            <div class="member-picture">
                <ProfilePictureEditor
                    id={item.id}
                    editing={editing}
                    profilePictureHash={item.profilePictureHash}
                    canEdit={todoGetPerms('codeholders.update')}
                    createHistoryLink={createHistoryLink} />
                {!editing && <div class="picture-history-link">
                    {createHistoryLink('profilePictureHash')}
                </div>}
            </div>
            <div class="member-info">
                <NameEditor
                    value={item.name}
                    item={item}
                    editing={editing}
                    onChange={name => onItemChange({ ...item, name })}
                    createHistoryLink={createHistoryLink} />
                <div class="member-code">
                    <CodeEditor
                        value={item.code}
                        item={item}
                        editing={editing}
                        onChange={code => onItemChange({ ...item, code })} />
                    {!editing && createHistoryLink('code')}
                </div>
                {!editing && <MembershipInDetailView
                    id={item.id}
                    canEdit={todoGetPerms('codeholders.update')} />}
                {!editing && <RolesInDetailView
                    id={item.id}
                    canEdit={todoGetPerms('codeholders.update')} />}
            </div>
            <div class="decorative-flourish" />
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
            }).runOnceAndDrop().then(res => {
                if (id !== this.props.id || lang !== this.state.postalLang) return;
                this.setState({ postalAddress: res });
            }).catch(() => {
                this.reloadTimeout2 = setTimeout(() => this.loadPostal(), 1000);
            });
        });
    }

    render () {
        if (!this.state.address) return <TinyProgress />;
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
                    {locale.postalAddress}
                </Button>

                <Dialog
                    // FIXME: this is kind of a terrible hack
                    class="codeholder-postal-address-dialog"
                    backdrop
                    open={this.state.postalOpen}
                    onClose={() => this.setState({ postalOpen: false })}
                    title={locale.postalAddress}>
                    {locale.postalLocale}{' '}
                    <NativeSelect
                        value={this.state.postalLang}
                        onChange={e => {
                            this.setState({ postalLang: e.target.value }, () => this.loadPostal());
                        }}>
                        {Object.entries(locale.csvOptions.countryLocales)
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

function simpleField (component, extra) {
    return {
        component,
        ...extra,
    };
}

function makePublicityField (shouldHide) {
    return {
        component ({ value, editing, onChange }) {
            if (editing) {
                return (
                    <Segmented
                        selected={value}
                        onSelect={selected => onChange(selected)}>
                        {[
                            {
                                id: 'private',
                                label: locale.publicity.private,
                            },
                            {
                                id: 'members',
                                label: locale.publicity.members,
                            },
                            {
                                id: 'public',
                                label: locale.publicity.public,
                            },
                        ]}
                    </Segmented>
                );
            }
            if (!value) return null;
            return locale.publicity[value];
        },
        shouldHide,
        history: true,
    };
}

const fields = {
    // for field history
    name: {
        component ({ value, item }) {
            if (!value) return null;
            return <NameEditor value={value} item={item} noIcon />;
        },
        shouldHide: () => true,
        history: true,
    },
    code: {
        component ({ value, item }) {
            if (!value) return null;
            return <CodeEditor value={value} item={item} />;
        },
        shouldHide: () => true,
        history: true,
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
        history: true,
    },
    profilePicturePublicity: makePublicityField((item, editing) => !editing && !item.profilePictureHash),
    lastNamePublicity: makePublicityField((item, editing) => item.type !== 'human' || !editing && (!item.name || (!item.name.lastLegal && !item.name.last))),
    isDead: {
        component ({ value, editing, onChange }) {
            return (
                <Checkbox
                    class={!editing ? 'fixed-checkbox' : ''}
                    checked={value}
                    onChange={isDead => editing && onChange(isDead)} />
            );
        },
        history: true,
    },
    birthdate: {
        component ({ value, editing, onChange, item }) {
            if (editing) return <data.date.editor value={value} onChange={onChange} />;

            const age = item.age && item.age.now !== null
                ? locale.fields.ageFormat(item.age.now, item.age.atStartOfYear)
                : null;

            let additional = null;
            if (age) additional = ' · ' + locale.fields.age + ': ' + age;

            return (
                <span class="birth-date">
                    <data.date.renderer value={value} />
                    {additional}
                </span>
            );
        },
        shouldHide: item => item.type !== 'human',
        history: true,
    },
    careOf: simpleField(function ({ value, editing, onChange }) {
        if (!editing) return value;
        return <TextField value={value} onChange={e => onChange(e.target.value || null)} maxLength={50} />;
    }, {
        shouldHide: item => item.type !== 'org',
        history: true,
    }),
    deathdate: {
        component: makeDataEditable(data.date),
        history: true,
    },
    creationTime: {
        component ({ value }) {
            if (!value) return null;
            return <data.timestamp.renderer value={value * 1000} />;
        },
        shouldHide: (_, editing) => editing,
    },
    address: {
        component ({ value, item, editing, onChange, isHistory }) {
            if (isHistory) {
                return <data.address.renderer value={value} />;
            }

            if (!editing) {
                return <CodeholderAddressRenderer id={item.id} />;
            } else {
                return <data.address.editor
                    value={value}
                    onChange={onChange} />;
            }
        },
        isEmpty: value => !value || !Object.values(value).filter(x => x).length,
        history: true,
    },
    addressPublicity: makePublicityField((item, editing) => !editing && (!item.address || !Object.values(item.address).filter(x => x).length)),
    feeCountry: {
        component: makeDataEditable(data.country),
        history: true,
    },
    email: simpleField(makeDataEditable(data.email), {
        history: true,
    }),
    emailPublicity: makePublicityField((item, editing) => !editing && !item.email),
    profession: simpleField(function ({ value, editing, onChange }) {
        if (!editing) return value;
        return <TextField value={value} onChange={e => onChange(e.target.value || null)} maxLength={50} />;
    }, {
        shouldHide: item => item.type !== 'human',
        history: true,
    }),
    website: simpleField(function ({ value, editing, onChange }) {
        if (!editing) {
            return (
                <a
                    class="codeholder-website-link"
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer">
                    {value}
                </a>
            );
        }
        return <TextField value={value} onChange={e => onChange(e.target.value || null)} maxLength={50} />;
    }, {
        history: true,
    }),
    biography: simpleField(function ({ value, editing, onChange }) {
        if (!editing) return value;
        return <TextField value={value} onChange={e => onChange(e.target.value || null)} maxLength={50} />;
    }, {
        history: true,
    }),
    landlinePhone: simpleField(makeDataEditable(data.phoneNumber), {
        isEmpty: value => !value.value,
        shouldHide: item => item.type !== 'human',
        history: true,
    }),
    landlinePhonePublicity: makePublicityField((item, editing) => item.type !== 'human' || !editing && (!item.landlinePhone || !item.landlinePhone.value)),
    officePhone: simpleField(makeDataEditable(data.phoneNumber), {
        isEmpty: value => !value.value,
        shouldHide: item => item.type !== 'human',
        history: true,
    }),
    officePhonePublicity: makePublicityField((item, editing) => !editing && (!item.officePhone || !item.officePhone.value)),
    cellphone: simpleField(makeDataEditable(data.phoneNumber), {
        isEmpty: value => !value.value,
        shouldHide: item => item.type !== 'human',
        history: true,
    }),
    cellphonePublicity: makePublicityField((item, editing) => item.type !== 'human' || !editing && (!item.cellphone || !item.cellphone.value)),
    hasPassword: simpleField(function ({ value }) {
        return <Checkbox class="fixed-checkbox" checked={value} />;
    }, {
        isEmpty: value => !value,
        shouldHide: (_, editing) => editing,
    }),
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
        history: true,
    },
};

function Footer ({ item, editing }) {
    if (editing) return '';
    return (
        <div class="member-footer">
            <Files id={item.id} />
        </div>
    );
}

export {
    Header,
    fields,
    Footer,
};
