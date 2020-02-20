import { h } from 'preact';
import { Button, TextField } from '@cpsdqs/yamdl';
import EditIcon from '@material-ui/icons/Edit';
import DetailView from '../../../../components/detail';
import Page from '../../../../components/page';
import CopyIcon from '../../../../components/copy-icon';
import { apiKey, email } from '../../../../components/data';
import Meta from '../../../meta';
import { coreContext } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';
import { clients as locale } from '../../../../locale';
import './detail.less';

const FIELDS = {
    name: {
        component ({ value, onChange }) {
            return (
                <TextField
                    value={value}
                    onChange={e => onChange(e.target.value)} />
            );
        },
        shouldHide: (_, editing) => !editing,
    },
    apiKey: {
        component ({ value }) {
            return (
                <div class="api-key-container">
                    <apiKey.renderer value={value} />

                    {navigator.clipboard && navigator.clipboard.writeText ? (
                        <Button class="api-key-copy-button" icon small onClick={() => {
                            const valueString = Buffer.from(value).toString('hex');
                            navigator.clipboard.writeText(valueString).catch(console.error); // eslint-disable-line no-console
                            // TODO: create toast
                        }}>
                            <CopyIcon style={{ verticalAlign: 'middle' }} />
                        </Button>
                    ) : null}
                </div>
            );
        },
        shouldhide: (_, editing) => editing,
    },
    ownerName: {
        component ({ value, onChange, editing }) {
            if (!editing) return value;
            return (
                <TextField
                    value={value}
                    onChange={e => onChange(e.target.value)} />
            );
        },
    },
    ownerEmail: {
        component ({ value, onChange, editing }) {
            if (!editing) return <email.renderer value={value} />;
            return (
                <TextField
                    type="email"
                    value={value}
                    onChange={e => onChange(e.target.value)} />
            );
        },
    },
};

export default connectPerms(class ClientDetailPage extends Page {
    static contextType = coreContext;

    state = {
        edit: null,
    };

    onEndEdit = () => {
        this.props.editing && this.props.editing.pop(true);
        this.setState({ edit: null });
    };

    #commitTask = null;
    onCommit = changedFields => {
        if (!this.props.editing || this.#commitTask) return;
        if (!changedFields.length) {
            // nothing changed, so we can just pop the editing state
            this.props.editing.pop(true);
            return;
        }

        this.#commitTask = this.context.createTask('clients/update', {
            id: this.props.match[1],
            _changedFields: changedFields,
        }, this.state.edit);
        this.#commitTask.on('success', this.onEndEdit);
        this.#commitTask.on('drop', () => this.#commitTask = null);
    };

    componentWillUnmount () {
        if (this.#commitTask) this.#commitTask.drop();
    }

    render ({ match, perms, editing }, { edit }) {
        const id = match[1];

        const actions = [];

        if (perms.hasPerm('clients.perms.read')) {
            actions.push({
                label: locale.perms.title,
                action: () => this.props.onNavigate(`/administrado/klientoj/${id}/permesoj`),
                overflow: true,
            });
        }

        if (perms.hasPerm('clients.delete')) {
            actions.push({
                label: locale.delete,
                action: () => this.context.createTask('clients/delete', {}, { id }),
                overflow: true,
            });
        }

        if (perms.hasPerm('clients.update')) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update,
                action: () => this.props.onNavigate(`/administrado/klientoj/${id}/redakti`, true),
            });
        }

        return (
            <div class="client-detail-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />

                <DetailView
                    view="clients/client"
                    id={id}
                    header={Header}
                    fields={FIELDS}
                    locale={locale}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit} />
            </div>
        );
    }
});

function Header ({ item, editing }) {
    if (editing) return null;
    return (
        <div class="client-header">
            <h1>{item.name}</h1>
        </div>
    );
}
