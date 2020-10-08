import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Button, TextField } from '@cpsdqs/yamdl';
import SubjectIcon from '@material-ui/icons/Subject';
import InsertPhotoIcon from '@material-ui/icons/InsertPhoto';
import RemoveIcon from '@material-ui/icons/Remove';
import 'codemirror';
import { Controlled as RCodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/xml/xml';
import TextArea from '../../../components/text-area';
import SvgIcon from '../../../components/svg-icon';
import MdField from '../../../components/md-field';
import Select from '../../../components/select';
import TejoIcon from '../../../components/tejo-icon';
import UeaIcon from '../../../components/uea-icon';
import RearrangingList from '../../../components/rearranging-list';
import { connect } from '../../../core/connection';
import { notifTemplates as locale } from '../../../locale';
import './fields.less';

// TODO: edit templating

export const FIELDS = {
    base: {
        component ({ value }) {
            return <span class="notif-template-base">{locale.bases[value]}</span>;
        },
    },
    org: {
        weight: 0.25,
        slot: 'icon',
        component ({ value }) {
            if (value === 'tejo') return <TejoIcon />;
            if (value === 'uea') return <UeaIcon />;
            return null;
        },
    },
    intent: {
        component ({ value }) {
            return locale.intents[value];
        },
    },
    name: {
        slot: 'title',
        component ({ value, editing, onChange }) {
            if (editing) {
                return <TextField
                    class="template-name-editor"
                    label={locale.fields.name}
                    outline
                    maxLength={150}
                    value={value}
                    onChange={e => onChange(e.target.value)}/>;
            }
            return value;
        },
    },
    description: {
        component ({ value, editing, onChange }) {
            if (editing) {
                return <TextArea
                    outline
                    maxLength={2000}
                    value={value}
                    onChange={onChange} />;
            }
            return value;
        },
    },
    script: {
        // does not render
        component: () => null,
    },
    subject: {
        component ({ value, editing, onChange }) {
            if (editing) {
                return <TextField
                    class="template-subject-editor"
                    label={locale.fields.subject}
                    outline
                    value={value}
                    maxLength={255}
                    editing={editing}
                    onChange={e => onChange(e.target.value)} />;
            }
            return value;
        },
    },
    from: {
        component ({ value, editing, onChange, item }) {
            if (editing) {
                return <DomainEmailEditor
                    value={value}
                    onChange={onChange}
                    org={item.org} />;
            }
            return value;
        },
    },
    fromName: {
        component ({ value, editing, onChange }) {
            if (editing) {
                return <TextField
                    outline
                    class="template-from-name-editor"
                    label={locale.fields.fromName}
                    maxLength={50}
                    value={value}
                    editing={editing}
                    onChange={e => onChange(e.target.value)} />;
            }
            return value;
        },
    },
    replyTo: {
        component ({ value, editing, onChange, item }) {
            if (editing) {
                return <DomainEmailEditor
                    value={value}
                    onChange={onChange}
                    org={item.org} />;
            }
            return value;
        },
    },
    html: {
        shouldHide: item => item.base !== 'raw',
        component ({ value, editing, onChange }) {
            if (editing) {
                return <RCodeMirror
                    value={value}
                    options={{
                        mode: 'xml',
                        htmlMode: true,
                        theme: 'akso',
                        lineNumbers: true,
                        indentWithTabs: true,
                        indentUnit: 4,
                        matchBrackets: true,
                        lineWrapping: true,
                    }}
                    onBeforeChange={(editor, data, value) => onChange(value)} />;
            }

            if (!value) return <div class="mail-body-html is-empty">{locale.raw.noHtmlVersion}</div>;
            return (
                <div class="mail-body-html">
                    <pre class="inner-code">{value}</pre>
                </div>
            );
        },
    },
    text: {
        shouldHide: item => item.base !== 'raw',
        component ({ value, editing, onChange }) {
            if (editing) {
                return <RCodeMirror
                    value={value}
                    options={{
                        mode: 'text/plain',
                        theme: 'akso',
                        lineNumbers: true,
                        indentWithTabs: true,
                        indentUnit: 4,
                        matchBrackets: true,
                        lineWrapping: true,
                    }}
                    onBeforeChange={(editor, data, value) => onChange(value)} />;
            }
            if (!value) return <div class="mail-body-text is-empty">{locale.raw.noTextVersion}</div>;
            return (
                <div class="mail-body-text">
                    <pre class="inner-code">{value}</pre>
                </div>
            );
        },
    },
    modules: {
        shouldHide: item => item.base !== 'inherit',
        component ({ value, editing, onChange }) {
            return <ModulesEditor value={value} editing={editing} onChange={onChange} />;
        },
    },
};

const DomainEmailEditor = connect('notifTemplates/emailDomains')(domains => ({
    domains,
}))(class DomainEmailEditor extends PureComponent {
    state = {
        editing: false,
        address: '',
        domain: '',
    };

    _value = null;

    deriveState () {
        const value = this.props.value;
        if (!value) return;
        const parts = value.split('@');
        const address = parts[0];
        const domain = parts[1];
        this.setState({ address, domain });
    }

    postState () {
        if (this.state.address) {
            this._value = this.state.address + '@' + this.state.domain;
            this.props.onChange(this._value);
        } else {
            this.props.onChange(null);
        }
    }

    componentDidMount () {
        this.deriveState();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.value !== this.props.value && this.props.value !== this._value) {
            this.deriveState();
        }
    }

    onAddressKeyDown = e => {
        if (e.key === '@') e.preventDefault();
    };
    onAddressChange = e => {
        if (!e.target.value) {
            // cleared, clear domain too
            this.setState({ domain: '' });
        } else if (!this.state.domain) {
            // no domain selected, but typing an address
            if (this.props.domains) this.setState({
                domain: this.props.domains[this.props.org][0] || '',
            });
        }
        this.setState({ address: e.target.value }, () => this.postState());
    };
    onDomainChange = domain => {
        this.setState({ domain }, () => this.postState());
    };

    render ({ domains, org }, { address, domain }) {
        const domainOptions = [];
        if (domains && domains[org]) {
            for (const domain of domains[org]) {
                domainOptions.push({ value: domain, label: domain });
            }
            if (!domains[org].includes(domain)) {
                domainOptions.push({ value: domain, label: domain });
            }
        }

        return (
            <div class="notif-template-domain-email-editor">
                <input
                    class="domain-email-editor-address"
                    value={address}
                    onKeyDown={this.onAddressKeyDown}
                    onChange={this.onAddressChange} />
                <span class="domain-email-editor-at-sign">@</span>
                <Select
                    class="domain-email-editor-domain"
                    items={domainOptions}
                    value={domain}
                    onChange={this.onDomainChange} />
            </div>
        );
    }
});

const MAX_MODULE_COUNT = 16;
class ModulesEditor extends PureComponent {
    #itemKeys = new WeakMap();
    getItemKey (item) {
        if (!this.#itemKeys.has(item)) this.#itemKeys.set(item, Math.random().toString(36));
        return this.#itemKeys.get(item);
    }

    onMoveItem = (fromPos, toPos) => {
        const value = this.props.value.slice();
        value.splice(toPos, 0, value.splice(fromPos, 1)[0]);
        this.props.onChange(value);
    };

    addTextItem = () => {
        const value = this.props.value.slice();
        value.push({ type: 'text', button: null, columns: null });
        this.props.onChange(value);
    };
    addImageItem = () => {
        const value = this.props.value.slice();
        value.push({ type: 'image', url: '', alt: null });
        this.props.onChange(value);
    };

    render ({ value, editing, onChange }) {
        if (!value) return null;
        const items = [];

        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            const key = this.getItemKey(item);
            const index = i;
            const onModuleChange = module => {
                const newValue = value.slice();
                newValue[index] = module;
                this.#itemKeys.set(module, key);
                onChange(newValue);
            };
            const onRemoveModule = (value.length > 1) && (() => {
                const newValue = value.slice();
                newValue.splice(index, 1);
                onChange(newValue);
            });
            items.push(
                <div class="template-module" key={key}>
                    <Module
                        value={item}
                        editing={editing}
                        onChange={onModuleChange}
                        onRemove={onRemoveModule} />
                </div>
            );
        }

        if (editing && value.length < MAX_MODULE_COUNT) {
            items.push(
                <div key="~add" class="add-template-module">
                    <Button icon onClick={this.addTextItem}>
                        <SubjectIcon style={{ verticalAlign: 'middle' }} />
                    </Button>
                    <Button icon onClick={this.addImageItem}>
                        <InsertPhotoIcon style={{ verticalAlign: 'middle' }} />
                    </Button>
                </div>
            );
        }

        return (
            <RearrangingList
                class="notif-template-modules-editor"
                isItemDraggable={index => editing && index < value.length}
                canMove={(toPos) => toPos < value.length}
                onMove={this.onMoveItem}>
                {items}
            </RearrangingList>
        );
    }
}

function Module (props) {
    const { value } = props;
    if (!value) return null;
    if (value.type === 'image') return <ImageModule {...props} />;
    if (value.type === 'text') return <TextModule {...props} />;
    return '?';
}

function ColumnsDoubleIcon (props) {
    return (
        <SvgIcon {...props}>
            <g fill="currentColor" fillRule="evenodd"><path d="M21 20h-4v-2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-4v2h4v2h-2a2 2 0 00-2 2v4h6v-2z"/><path d="M3 21h8v-2H3v2zm0-4h8v-2H3v2zm0-4h8v-2H3v2zm0-4h8V7H3v2zm0-6v2h8V3H3zM13 9h8V7h-8v2zm0-6v2h8V3h-8z" fillRule="nonzero"/></g>
        </SvgIcon>
    );
}

function ColumnsSingleIcon (props) {
    return (
        <SvgIcon {...props}>
            <g fill="currentColor" fillRule="evenodd"><path d="M3 21h12v-2H3v2zm0-4h12v-2H3v2zm0-4h12v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z" fillRule="nonzero"/><path d="M19 22h2V12h-4v2h2z"/></g>
        </SvgIcon>
    );
}

function AddButtonIcon (props) {
    return (
        <SvgIcon {...props}>
            <path d="M15 11v3h3v2h-3v3h-2v-3h-3v-2h3v-3h2zm5-5c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2h-1v-2h1V8H4v6h5v2H4c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h16z" fill="currentColor" fillRule="nonzero"/>
        </SvgIcon>
    );
}

class TextModule extends PureComponent {
    render ({ value, editing, onChange, onRemove }) {
        const columns = [];
        const valueColumns = value.columns || [''];
        for (let i = 0; i < valueColumns.length; i++) {
            const index = i;
            columns.push(
                <MdField
                    key={index}
                    rules={['blockquote', 'heading', 'emphasis', 'strikethrough', 'link', 'list', 'table', 'image']}
                    value={valueColumns[index]}
                    editing={editing}
                    onChange={v => {
                        const newColumns = valueColumns.slice();
                        newColumns[index] = v;
                        onChange({ ...value, columns: newColumns });
                    }}/>
            );
        }

        const switchColumnCount = () => {
            if (valueColumns.length === 2) {
                onChange({ ...value, columns: valueColumns.slice(0, 1) });
            } else {
                onChange({ ...value, columns: [valueColumns[0], ''] });
            }
        };

        const ColumnsIcon = valueColumns.length === 2
            ? ColumnsSingleIcon
            : ColumnsDoubleIcon;

        const addButton = () => {
            onChange({ ...value, button: { href: '', text: '' } });
        };
        const removeButton = () => {
            onChange({ ...value, button: null });
        };

        return (
            <div class="text-module">
                {editing && (
                    <div class="module-bar">
                        {onRemove ? (
                            <Button icon small onClick={onRemove}>
                                <RemoveIcon style={{ verticalAlign: 'middle' }} />
                            </Button>
                        ) : <span />}
                        <div class="module-settings">
                            {!value.button && (
                                <Button icon small onClick={addButton}>
                                    <AddButtonIcon style={{ verticalAlign: 'middle' }} />
                                </Button>
                            )}
                            <Button icon small onClick={switchColumnCount}>
                                <ColumnsIcon style={{ verticalAlign: 'middle' }} />
                            </Button>
                        </div>
                    </div>
                )}
                <div class="text-columns">
                    {columns}
                </div>
                {value.button && (
                    editing ? (
                        <div class="text-button">
                            <div class="button-bar">
                                <Button icon small onClick={removeButton}>
                                    <RemoveIcon style={{ verticalAlign: 'middle' }} />
                                </Button>
                                <span class="button-title">
                                    {locale.modules.textButton}
                                </span>
                            </div>
                            <TextField
                                class="button-field"
                                outline
                                label={locale.modules.textButtonHref}
                                type="url"
                                maxLength={200}
                                value={value.button.href}
                                onChange={e => {
                                    onChange({ ...value, button: { ...value.button, href: e.target.value } });
                                }}/>
                            <TextField
                                class="button-field"
                                outline
                                label={locale.modules.textButtonLabel}
                                value={value.button.text}
                                maxLength={200}
                                onChange={e => {
                                    onChange({ ...value, button: { ...value.button, text: e.target.value } });
                                }}/>
                        </div>
                    ) : (
                        <div class="text-button">
                            <div class="button-title">
                                {locale.modules.textButton}
                            </div>
                            <div class="button-prototype">
                                <div class="prototype-inner">
                                    {value.button.text}
                                </div>
                                <div class="prototype-link">
                                    {value.button.href}
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>
        );
    }
}

class ImageModule extends PureComponent {
    render ({ value, editing, onChange, onRemove }) {
        if (editing) {
            return (
                <div class="image-module">
                    <div class="module-bar">
                        {onRemove ? (
                            <Button icon small onClick={onRemove}>
                                <RemoveIcon style={{ verticalAlign: 'middle' }} />
                            </Button>
                        ) : <span />}
                        <InsertPhotoIcon style={{ verticalAlign: 'middle' }} />
                    </div>
                    <TextField
                        class="image-field"
                        outline
                        label={locale.modules.imageUrl}
                        value={value.url}
                        onChange={e => onChange({ ...value, url: e.target.value })} />
                    <TextField
                        class="image-field"
                        outline
                        label={locale.modules.imageAlt}
                        value={value.alt}
                        onChange={e => onChange({ ...value, alt: e.target.value })} />
                </div>
            );
        }

        return (
            <div class="image-module">
                <div class="image-details">
                    <InsertPhotoIcon style={{ verticalAlign: 'middle' }} />
                    <span class="image-alt">{value.alt}</span>
                </div>
                <div class="image-source">
                    {value.url}
                </div>
            </div>
        );
    }
}
