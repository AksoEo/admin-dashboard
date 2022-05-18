import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import DetailView from '../../../../components/detail/detail';
import Page from '../../../../components/page';
import Meta from '../../../meta';
import { coreContext } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';
import { LinkButton } from '../../../../router';
import { clients as locale } from '../../../../locale';
import { FIELDS } from './fields';
import './detail.less';

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
        if (!this.props.editing || this.#commitTask) return Promise.resolve();
        if (!changedFields.length) {
            // nothing changed, so we can just pop the editing state
            this.props.editing.pop(true);
            return Promise.resolve();
        }

        return new Promise(resolve => {
            this.#commitTask = this.context.createTask('clients/update', {
                id: this.props.match[1],
                _changedFields: changedFields,
            }, this.state.edit);
            this.#commitTask.on('success', this.onEndEdit);
            this.#commitTask.on('drop', () => {
                this.#commitTask = null;
                resolve();
            });
        });
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
                label: locale.delete.menuItem,
                action: () => this.context.createTask('clients/delete', {}, { id }),
                overflow: true,
            });
        }

        if (perms.hasPerm('clients.update')) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
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
                    onCommit={this.onCommit}
                    onDelete={() => this.props.pop()}
                    userData={{ perms }} />
            </div>
        );
    }
});

function Header ({ item, editing, userData: { perms } }) {
    if (editing) return null;

    const canReadPerms = perms.hasPerm('clients.perms.read');

    return (
        <div class="client-header">
            <h1>{item.name}</h1>
            {canReadPerms ? (
                <LinkButton target={`/administrado/klientoj/${item.id}/permesoj`}>
                    {locale.perms.linkButton}
                </LinkButton>
            ) : null}
        </div>
    );
}
