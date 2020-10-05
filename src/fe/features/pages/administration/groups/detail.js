import { h } from 'preact';
import { useState, PureComponent } from 'preact/compat';
import EditIcon from '@material-ui/icons/Edit';
import { LinearProgress, TextField } from '@cpsdqs/yamdl';
import Tabs from '../../../../components/tabs';
import Page from '../../../../components/page';
import CODEHOLDER_FIELDS from '../../codeholders/table-fields';
import { FIELDS as CLIENT_FIELDS } from '../clients/index';
import DetailView from '../../../../components/detail';
import OverviewList from '../../../../components/overview-list';
import GlobalFilterNotice from '../../codeholders/global-filter-notice';
import Meta from '../../../meta';
import { coreContext } from '../../../../core/connection';
import { LinkButton } from '../../../../router';
import { adminGroups as locale, clients as clientsLocale, codeholders as codeholdersLocale } from '../../../../locale';
import { connectPerms } from '../../../../perms';
import './detail.less';

export default connectPerms(class AdminGroupDetailPage extends Page {
    state = {
        edit: null,
        editing: false,
        tab: 'codeholders',
    };

    static contextType = coreContext;

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

        this.#commitTask = this.context.createTask('adminGroups/update', {
            id: this.props.match[1],
            _changedFields: changedFields,
        }, this.state.edit);
        this.#commitTask.on('success', this.onEndEdit);
        this.#commitTask.on('drop', () => this.#commitTask = null);
    };

    componentDidUpdate () {
        if (!this.didInitWithPerms) this.tryInitWithPerms();
    }

    tryInitWithPerms () {
        if (this.props.perms._isDummy) return;
        this.didInitWithPerms = true;

        const tab = this.state.tab;
        const perms = this.props.perms;

        if (tab === 'clients' && !perms.hasPerm('clients.read')) {
            this.setState({ tab: 'codeholders' });
        } else if (tab === 'codeholders' && !perms.hasPerm('codeholders.read')) {
            this.setState({ tab: 'clients' });
        }
    }

    componentWillUnmount () {
        if (this.#commitTask) this.#commitTask.drop();
    }

    get id () {
        return this.props.match[1];
    }

    render ({ perms, editing }, { tab, edit }) {
        const actions = [];
        const permsTarget = `/administrado/grupoj/${this.id}/permesoj`;

        if (perms.hasPerm('admin_groups.update')) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.edit,
                action: () => this.props.push('redakti'),
            });
        }

        if (perms.hasPerm('admin_groups.delete')) {
            actions.push({
                overflow: true,
                label: locale.delete,
                action: () => this.context.createTask('adminGroups/delete', {}, { id: this.id }),
            });
        }

        const showList = perms.hasPerm('clients.read') || perms.hasPerm('codeholders.read');

        // still show the other tab items to imply that they exist, but disable the ability to
        // switch to them
        const canChangeTabs = perms.hasPerm('clients.read') && perms.hasPerm('codeholders.read');
        const canEditItems = perms.hasPerm('admin_groups.update') && (tab === 'clients'
            ? perms.hasPerm('clients.read')
            : perms.hasPerm('codeholders.read'));

        return (
            <div class="admin-group-detail-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />
                <DetailView
                    view="adminGroups/group"
                    id={this.id}
                    header={Header}
                    fields={fields}
                    locale={locale}
                    userData={{ permsTarget }}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit} />
                {showList && (
                    <Tabs
                        class="tab-switcher"
                        value={tab}
                        onChange={tab => this.setState({ tab })}
                        disabled={!canChangeTabs}
                        tabs={{
                            codeholders: locale.tabs.codeholders,
                            clients: locale.tabs.clients,
                        }} />
                )}
                {showList && (
                    <GroupList
                        tab={tab}
                        id={this.id}
                        editing={canEditItems && editing}
                        perms={perms} />
                )}
            </div>
        );
    }
});

function GroupList ({ tab, id, editing, perms }) {
    if (tab === 'codeholders') {
        return <CodeholdersList perms={perms} id={id} editing={editing} />;
    } else if (tab === 'clients') {
        return <ClientsList perms={perms} id={id} editing={editing} />;
    }
}

/// Handles item list during editing.
///
/// - task: list task
/// - addTask/deleteTask
/// - type: type used in add/delete tasks
/// - id: group id
/// - editing
class WithItems extends PureComponent {
    state = {
        data: [],
        loading: false,
        addingItems: [],
        deletingItems: [],
    };

    static contextType = coreContext;

    componentDidMount () {
        if (this.props.editing) this.load();
    }

    componentDidUpdate (prevProps) {
        if (this.props.editing && !prevProps.editing) {
            this.setState({ loading: true });
            this.load();
        }
    }

    componentWillUnmount () {
        this.dead = true;
    }

    load () {
        if (this.dead) return;
        this.setState({ loading: true });
        this.context.createTask(this.props.task, {
            group: this.props.id,
        }, {
            offset: this.state.data.length,
            fields: [],
            limit: 100,
        }).runOnceAndDrop().then(res => {
            if (!res.items.length) {
                this.setState({ loading: false });
                return;
            }
            this.setState({
                data: this.state.data.slice().concat(res.items),
            }, () => this.load());
        }).catch(err => {
            console.error(err); // eslint-disable-line
            setTimeout(() => this.load(), 1000);
        });
    }

    addItem = id => {
        this.setState({
            addingItems: this.state.addingItems.slice().concat([id]),
        });
        this.context.createTask(this.props.addTask, {
            group: this.props.id,
        }, { [this.props.type]: id }).runOnceAndDrop().then(() => {
            this.setState({
                data: this.state.data.concat([id]),
            });
        }).catch(err => {
            console.error(err); // eslint-disable-line no-console
        }).then(() => {
            const addingItems = this.state.addingItems.slice();
            addingItems.splice(addingItems.indexOf(id), 1);
            this.setState({ addingItems });
        });
    };
    deleteItem = id => {
        this.setState({
            deletingItems: this.state.deletingItems.slice().concat([id]),
        });
        this.context.createTask(this.props.deleteTask, {
            group: this.props.id,
        }, { [this.props.type]: id }).runOnceAndDrop().then(() => {
            const data = this.state.data.slice();
            data.splice(data.indexOf(id), 1);
            this.setState({ data });
        }).catch(err => {
            console.error(err); // eslint-disable-line no-console
        }).then(() => {
            const deletingItems = this.state.deletingItems.slice();
            deletingItems.splice(deletingItems.indexOf(id), 1);
            this.setState({ deletingItems });
        });
    };

    hasItem = id => {
        if (this.state.addingItems.includes(id)) return null;
        if (this.state.deletingItems.includes(id)) return null;
        return this.state.data.includes(id);
    };

    selection = {
        add: this.addItem,
        delete: this.deleteItem,
        has: this.hasItem,
    };

    render ({ children }) {
        return children(this.selection, this.state.loading);
    }
}

function CodeholdersList ({ perms, id, editing }) {
    const [offset, setOffset] = useState(0);
    const [parameters, setParameters] = useState({
        limit: 10,
        fields: [{ id: 'code', sorting: 'asc' }, { id: 'name', sorting: 'asc' }],
    });

    return (
        <WithItems
            id={id}
            type="codeholder"
            task="adminGroups/listCodeholders"
            addTask="adminGroups/addCodeholder"
            deleteTask="adminGroups/removeCodeholder"
            editing={editing}>
            {(selection, loading) => (
                <div>
                    <LinearProgress hideIfNone class="edit-loading" indeterminate={loading} />
                    <OverviewList
                        task={editing ? 'codeholders/list' : 'adminGroups/listCodeholders'}
                        notice={<GlobalFilterNotice perms={perms} />}
                        view="codeholders/codeholder"
                        selection={editing && selection}
                        options={{
                            group: id,
                        }}
                        fields={CODEHOLDER_FIELDS}
                        useDeepCmp
                        parameters={{ ...parameters, offset }}
                        onGetItemLink={editing ? null : (id => `/membroj/${id}`)}
                        onSetOffset={setOffset}
                        onSetLimit={limit => setParameters({ ...parameters, limit })}
                        updateView={editing ? null : ['adminGroups/group', { id }]}
                        locale={codeholdersLocale.fields} />
                </div>
            )}
        </WithItems>
    );
}

function ClientsList ({ perms, id, editing }) {
    const [offset, setOffset] = useState(0);
    const [parameters, setParameters] = useState({
        limit: 10,
        fields: [{ id: 'name', sorting: 'none' }, { id: 'apiKey', sorting: 'asc' }, { id: 'ownerName', sorting: 'none' }],
    });

    return (
        <WithItems
            id={id}
            type="client"
            task="adminGroups/listClients"
            addTask="adminGroups/addClient"
            deleteTask="adminGroups/removeClient"
            editing={editing}>
            {(selection, loading) => (
                <div>
                    <LinearProgress hideIfNone class="edit-loading" indeterminate={loading} />
                    <OverviewList
                        task={editing ? 'clients/list' : 'adminGroups/listClients'}
                        notice={<GlobalFilterNotice perms={perms} />}
                        view="clients/client"
                        selection={editing && selection}
                        options={{
                            group: id,
                        }}
                        fields={CLIENT_FIELDS}
                        useDeepCmp
                        parameters={{ ...parameters, offset }}
                        onGetItemLink={editing ? null : (id => `/administrado/klientoj/${id}`)}
                        onSetOffset={setOffset}
                        onSetLimit={limit => setParameters({ ...parameters, limit })}
                        updateView={editing ? null : ['adminGroups/group', { id }]}
                        locale={clientsLocale.fields} />
                </div>
            )}
        </WithItems>
    );
}

function Header ({ item, userData, editing }) {
    if (editing) return null;
    return (
        <div class="group-header">
            <h1 class="group-title">{item.name}</h1>
            <div class="group-description">{item.description}</div>
            <LinkButton class="edit-perms-button" target={userData.permsTarget}>
                {locale.editPerms}
            </LinkButton>
        </div>
    );
}

const fields = {
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
    description: {
        component ({ value, onChange }) {
            return (
                <TextField
                    value={value}
                    onChange={e => onChange(e.target.value)} />
            );
        },
        shouldHide: (_, editing) => !editing,
    },
};
