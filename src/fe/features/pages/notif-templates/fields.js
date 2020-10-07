import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { TextField } from '@cpsdqs/yamdl';
import TextArea from '../../../components/text-area';
import Select from '../../../components/select';
import TejoIcon from '../../../components/tejo-icon';
import UeaIcon from '../../../components/uea-icon';
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
            return 'todo';
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
