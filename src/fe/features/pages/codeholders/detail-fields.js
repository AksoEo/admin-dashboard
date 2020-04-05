import { h, Component } from 'preact';
import { Fragment } from 'preact/compat';
import PersonIcon from '@material-ui/icons/Person';
import BusinessIcon from '@material-ui/icons/Business';
import { Button, Checkbox, TextField, Dialog } from '@cpsdqs/yamdl';
import { coreContext } from '../../../core/connection';
import { connectPerms } from '../../../perms';
import { LinkButton } from '../../../router';
import { codeholders as locale, data as dataLocale } from '../../../locale';
import { Validator } from '../../../components/form';
import {
    ueaCode,
    date,
    timestamp,
    address,
    country,
    email,
    phoneNumber,
    Required,
} from '../../../components/data';
import SuggestionField from '../../../components/suggestion-field';
import Select from '../../../components/select';
import TinyProgress from '../../../components/tiny-progress';
import ProfilePictureEditor from './profile-picture';
import { FileIcon } from './icons';
import Publicity from './publicity';
import { MembershipInDetailView, RolesInDetailView } from './membership-roles';

const makeEditable = (Renderer, Editor, History) => function EditableField ({
    value,
    onChange,
    editing,
    item,
    isHistory,
}) {
    if (isHistory && History) return <History value={value} item={item} />;
    if (!editing) return <Renderer value={value} />;
    return <Editor value={value} onChange={onChange} />;
};

const makeDataEditable = (data, history) => makeEditable(data.renderer, data.editor, history);

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
        v[last] = newValue || null;
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

function NameEditor ({
    value,
    item,
    editing,
    onChange,
    noIcon,
    createHistoryLink,
    lastNamePublicity,
    onLastNamePublicityChange,
}) {
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
                    {(itemType === 'human') && (
                        <Publicity value={lastNamePublicity} style="icon" />
                    )}
                    {!noIcon && createHistoryLink('name')}
                </div>
                {secondaryName}
            </div>
        );
    } else if (itemType === 'human') {
        const lotf = lotsOfTextFields([
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

        return (
            <Fragment>
                {lotf}
                <div class="last-name-publicity-editor">
                    <label>{locale.fields.lastNamePublicity}</label>
                    <Publicity
                        value={lastNamePublicity}
                        onChange={onLastNamePublicityChange}
                        editing={true}
                        style="icon" />
                </div>
            </Fragment>
        );
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

function CodeEditor ({ value, item, originalItem, editing, onChange }) {
    if (!value) return null;
    if (!editing) {
        return <ueaCode.renderer value={value.new} value2={value.old} />;
    }

    // keep own code as a suggestion
    const keepSuggestions = [];
    if (originalItem && originalItem.code) keepSuggestions.push(originalItem.code.new);

    return <ueaCode.editor
        value={value.new}
        onChange={v => onChange({ ...value, new: v })}
        id={item.id}
        suggestionParameters={item}
        keepSuggestions={keepSuggestions} />;
}

class FileCounter extends Component {
    state = { count: NaN };

    static contextType = coreContext;

    #updateView;
    reinit () {
        if (this.#updateView) this.#updateView.drop();
        this.#updateView = this.context.createDataView('codeholders/codeholderSigFiles', {
            id: this.props.id,
        });
        this.#updateView.on('update', this.load);
        this.load();
    }
    load = () => {
        this.context.createTask('codeholders/listFiles', { id: this.props.id }, {
            offset: 0,
            limit: 1,
        }).runOnceAndDrop().then(({ total }) => {
            this.setState({ count: total });
        }).catch(console.error); // eslint-disable-line no-console
    };
    componentDidMount () {
        this.reinit();
    }
    componentDidUpdate (prevProps) {
        if (prevProps.id !== this.props.id) this.reinit();
    }

    render ({ children }, { count }) {
        return children(count);
    }
}

function FilesButton ({ id }) {
    return (
        <LinkButton class="member-files-button" target={`/membroj/${id}/dosieroj`} raised>
            <span class="file-icon-container">
                <FileIcon />
            </span>
            <FileCounter id={id}>
                {fileCount => locale.filesButton(fileCount)}
            </FileCounter>
        </LinkButton>
    );
}

const Header = connectPerms(function Header ({
    item,
    originalItem,
    editing,
    onItemChange,
    createHistoryLink,
    canReadHistory,
    perms,
    userData,
}) {
    // field callbacks for detail view
    if (userData && userData.onHasEmail) userData.onHasEmail(!!item.email);
    if (userData && userData.onHasPassword) userData.onHasPassword(!!item.hasPassword);

    return (
        <div class="member-header">
            <div class="member-picture">
                <ProfilePictureEditor
                    id={item.id}
                    editing={editing}
                    profilePictureHash={item.profilePictureHash}
                    canEdit={perms.hasPerm('codeholders.update')}
                    createHistoryLink={createHistoryLink} />
                {!editing && canReadHistory && <div class="picture-meta">
                    <Publicity value={item.profilePicturePublicity} style="icon" />
                    {createHistoryLink('profilePictureHash')}
                </div>}
                {editing && <Publicity
                    value={item.profilePicturePublicity}
                    editing={true}
                    onChange={v => onItemChange({ ...item, profilePicturePublicity: v })}
                    types={['members', 'public']}
                    style="icon" />}
            </div>
            <div class="member-info">
                <NameEditor
                    value={item.name}
                    item={item}
                    editing={editing}
                    onChange={name => onItemChange({ ...item, name })}
                    lastNamePublicity={item.lastNamePublicity}
                    onLastNamePublicityChange={v => onItemChange({ ...item, lastNamePublicity: v })}
                    createHistoryLink={createHistoryLink} />
                <div class="member-code">
                    <CodeEditor
                        value={item.code}
                        item={item}
                        originalItem={originalItem}
                        editing={editing}
                        onChange={code => onItemChange({ ...item, code })} />
                    {!editing && createHistoryLink('code')}
                </div>
                {!editing && perms.hasCodeholderField('membership', 'r') && (
                    <MembershipInDetailView
                        id={item.id}
                        canEdit={perms.hasPerm('codeholders.update')} />
                )}
                {!editing && perms.hasPerm('codeholder_roles.read') && (
                    <RolesInDetailView
                        id={item.id}
                        canEdit={perms.hasPerm('codeholder_roles.update')} />
                )}
                {!editing && perms.hasCodeholderField('files', 'r') && (
                    <FilesButton id={item.id} />
                )}
            </div>
            <div class="decorative-flourish" />
        </div>
    );
});

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
                    <Select
                        value={this.state.postalLang}
                        onChange={postalLang => {
                            this.setState({ postalLang }, () => this.loadPostal());
                        }}
                        items={Object.entries(locale.csvOptions.countryLocales)
                            .map(([k, v]) => ({ value: k, label: v }))} />

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

function makePhoneHistory (fieldName) {
    return ({ value, item }) => (
        <Fragment>
            <Publicity value={item[fieldName + 'Publicity']} style="icon" />
            {' '}
            <phoneNumber.renderer value={value} />
        </Fragment>
    );
}

const fields = {
    // for field history
    name: {
        component ({ value, item }) {
            if (!value) return null;
            return (
                <NameEditor
                    value={value}
                    lastNamePublicity={item.lastNamePublicity}
                    item={item}
                    noIcon />
            );
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
    profilePictureHash: {
        component ({ value, item }) {
            let formattedValue;
            let hash;
            if (value === null) {
                formattedValue = locale.profilePictureHashNone;
                hash = '';
            } else {
                formattedValue = locale.profilePictureHashSome;
                hash = Buffer.from(value).toString('hex');
            }

            return (
                <div class="profile-picture-hash" title={hash}>
                    {formattedValue}
                    {' '}
                    <Publicity value={item.profilePicturePublicity} style="icon" />
                </div>
            );
        },
        shouldHide: () => true,
        history: true,
    },
    // --
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
            if (editing) return <date.editor value={value} onChange={onChange} />;

            const age = item.age && item.age.now !== null
                ? locale.fields.ageFormat(item.age.now, item.age.atStartOfYear)
                : null;

            let additional = null;
            if (age) additional = ' · ' + locale.fields.age + ': ' + age;

            return (
                <span class="birth-date">
                    <date.renderer value={value} />
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
        component: makeDataEditable(date),
        history: true,
    },
    creationTime: {
        component ({ value }) {
            if (!value) return null;
            return <timestamp.renderer value={value * 1000} />;
        },
        shouldHide: (_, editing) => editing,
    },
    address: {
        component ({ value, item, editing, onChange, isHistory }) {
            if (isHistory) {
                return (
                    <Fragment>
                        <Publicity value={item.addressPublicity} style="icon" />
                        <address.renderer value={value} />
                    </Fragment>
                );
            }

            if (!editing) {
                return <CodeholderAddressRenderer id={item.id} />;
            } else {
                return <address.editor
                    value={value}
                    onChange={onChange} />;
            }
        },
        isEmpty: value => !value || !Object.values(value).filter(x => x).length,
        extra: ({ item, editing, onItemChange }) => (
            <Publicity
                value={item.addressPublicity}
                onChange={v => onItemChange({ ...item, addressPublicity: v })}
                editing={editing}
                style="icon" />
        ),
        history: true,
    },
    feeCountry: {
        component: makeDataEditable(country),
        history: true,
    },
    email: simpleField(makeDataEditable(email, ({ value, item }) => (
        <Fragment>
            <Publicity value={item.emailPublicity} style="icon" />
            {' '}
            <email.renderer value={value} />
        </Fragment>
    )), {
        extra: ({ item, editing, onItemChange }) => (
            <Publicity
                value={item.emailPublicity}
                onChange={v => onItemChange({ ...item, emailPublicity: v })}
                editing={editing}
                style="icon" />
        ),
        history: true,
    }),
    profession: simpleField(function ({ value, editing, onChange }) {
        if (!editing) return value;
        return <TextField value={value} onChange={e => onChange(e.target.value || null)} maxLength={50} />;
    }, {
        shouldHide: item => item.type !== 'human',
        extra: ({ editing }) => <Publicity value="public" editing={editing} style="icon" />,
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
        return <TextField
            value={value}
            onChange={e => onChange(e.target.value || null)}
            maxLength={50}
            onBlur={() => {
                // prepend protocol if it’s missing
                if (value && !value.includes('://')) {
                    onChange('https://' + value);
                }
            }} />;
    }, {
        extra: ({ editing }) => <Publicity value="public" editing={editing} style="icon" />,
        history: true,
    }),
    landlinePhone: simpleField(makeDataEditable(phoneNumber, makePhoneHistory('landlinePhone')), {
        isEmpty: value => !value.value,
        shouldHide: item => item.type !== 'human',
        extra: ({ item, editing, onItemChange }) => (
            <Publicity
                value={item.landlinePhonePublicity}
                onChange={v => onItemChange({ ...item, landlinePhonePublicity: v })}
                editing={editing}
                style="icon" />
        ),
        history: true,
    }),
    officePhone: simpleField(makeDataEditable(phoneNumber, makePhoneHistory('officePhone')), {
        isEmpty: value => !value.value,
        extra: ({ item, editing, onItemChange }) => (
            <Publicity
                value={item.officePhonePublicity}
                onChange={v => onItemChange({ ...item, officePhonePublicity: v })}
                editing={editing}
                style="icon" />
        ),
        history: true,
    }),
    cellphone: simpleField(makeDataEditable(phoneNumber, makePhoneHistory('cellphone')), {
        isEmpty: value => !value.value,
        shouldHide: item => item.type !== 'human',
        extra: ({ item, editing, onItemChange }) => (
            <Publicity
                value={item.cellphonePublicity}
                onChange={v => onItemChange({ ...item, cellphonePublicity: v })}
                editing={editing}
                style="icon" />
        ),
        history: true,
    }),
    hasPassword: simpleField(function ({ value }) {
        return <Checkbox class="fixed-checkbox" checked={value} />;
    }, {
        isEmpty: value => !value,
        shouldHide: (_, editing) => editing,
    }),
    biography: {
        component ({ value, editing, onChange }) {
            if (!editing) {
                if (!value) return null;
                return (
                    <div class="member-biography">
                        {value.split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}
                    </div>
                );
            } else {
                return (
                    <div class="member-biography">
                        <textarea
                            value={value}
                            onKeyDown={e => e.stopPropagation()}
                            onChange={e => onChange(e.target.value || null)} />
                    </div>
                );
            }
        },
        extra: ({ editing }) => <Publicity value="public" editing={editing} style="icon" />,
        history: true,
    },
    notes: {
        component ({ value, editing, onChange }) {
            if (!editing) {
                if (!value) return null;
                return (
                    <div class="member-notes">
                        {value.split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}
                    </div>
                );
            } else {
                return (
                    <div class="member-notes">
                        <textarea
                            value={value}
                            onKeyDown={e => e.stopPropagation()}
                            onChange={e => onChange(e.target.value || null)} />
                    </div>
                );
            }
        },
        history: true,
    },
    // for field history only
    password: {
        component: () => '••••••••',
        shouldHide: () => true,
    },
};

const Footer = () => null;

export {
    Header,
    fields,
    Footer,
};
