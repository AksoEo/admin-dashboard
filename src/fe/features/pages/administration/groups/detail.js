import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import { Button, TextField } from '@cpsdqs/yamdl';
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
        tab: 'codeholders',
        // TODO: store these in navigation data because users might move to/from other pages a lot (e.g. codeholders)
        codeholdersOffset: 0,
        clientsOffset: 0,
        parameters: {
            limit: 10,
        },
        codeholdersSelection: new Set(),
        clientsSelection: new Set(),

        edit: null,
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

    componentWillUnmount () {
        if (this.#commitTask) this.#commitTask.drop();
    }

    render ({ match, perms, editing }, { tab, parameters, edit }) {
        const id = match[1];

        const itemsTask = tab === 'clients' ? 'adminGroups/listClients' : 'adminGroups/listCodeholders';
        const itemsView = tab === 'clients' ? 'clients/client' : 'codeholders/codeholder';
        const offsetKey = tab === 'clients' ? 'clientsOffset' : 'codeholdersOffset';
        const itemsOffset = this.state[offsetKey];
        const itemFields = tab === 'clients'
            ? [{ id: 'name', sorting: 'none' }, { id: 'apiKey', sorting: 'asc' }, { id: 'ownerName', sorting: 'none' }]
            : [{ id: 'code', sorting: 'asc' }, { id: 'name', sorting: 'asc' }];
        const itemFieldSpecs = tab === 'clients'
            ? CLIENT_FIELDS
            : CODEHOLDER_FIELDS;
        const itemsLocale = tab === 'clients'
            ? clientsLocale.fields
            : codeholdersLocale.fields;
        const onGetItemLink = tab === 'clients'
            ? id => `/administrado/klientoj/${id}`
            : id => `/membroj/${id}`;
        const itemsNotice = tab === 'clients'
            ? null
            : <GlobalFilterNotice perms={perms} />;

        const addItem = tab === 'clients'
            ? () => this.context.createTask('adminGroups/addClientsBatchTask', { group: id })
            : () => this.context.createTask('adminGroups/addCodeholdersBatchTask', { group: id });

        const canAddItem = perms.hasPerm('admin_groups.update') && (tab === 'clients'
            ? perms.hasPerm('clients.read')
            : perms.hasPerm('codeholders.read'));

        const updateView = ['adminGroups/group', { id }];

        const removeItemsTask = tab === 'clients'
            ? 'adminGroups/removeClientsBatchTask'
            : 'adminGroups/removeCodeholdersBatchTask';

        const selectionSet = tab === 'clients'
            ? this.state.clientsSelection
            : this.state.codeholdersSelection;
        const selection = perms.hasPerm('admin_groups.update') ? {
            add: item => {
                selectionSet.add(item);
                this.forceUpdate();
            },
            delete: item => {
                selectionSet.delete(item);
                this.forceUpdate();
            },
            has: item => selectionSet.has(item),
        } : null;

        let selectionActionButton;
        if (selectionSet.size) {
            selectionActionButton = (
                <Button class="selection-action-button" onClick={() => {
                    const task = this.context.createTask(removeItemsTask, { group: id }, { items: [...selectionSet] });
                    task.on('success', () => {
                        // reset selection
                        this.setState({
                            clientsSelection: new Set(),
                            codeholdersSelection: new Set(),
                        });
                    });
                }}>
                    {locale.deleteSelection}
                </Button>
            );
        } else if (canAddItem) {
            selectionActionButton = (
                <Button class="selection-action-button" icon small onClick={addItem}>
                    <AddIcon style={{ verticalAlign: 'middle' }} />
                </Button>
            );
        }

        const actions = [];
        if (perms.hasPerm('admin_groups.delete')) {
            actions.push({
                overflow: true,
                label: locale.delete,
                action: () => this.context.createTask('adminGroups/delete', {}, { id }),
            });
        }

        if (perms.hasPerm('admin_groups.update')) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.edit,
                action: () => this.props.push('redakti'),
            });
        }

        const permsTarget = `/administrado/grupoj/${id}/permesoj`;

        return (
            <div class="admin-group-detail-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />
                <DetailView
                    view="adminGroups/group"
                    id={id}
                    header={Header}
                    fields={fields}
                    locale={locale}
                    userData={{ permsTarget }}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit} />
                {!editing && (
                    <Tabs
                        class="tab-switcher"
                        value={tab}
                        onChange={tab => this.setState({ tab })}
                        tabs={Object.fromEntries([
                            perms.hasPerm('codeholders.read') && ['codeholders', locale.tabs.codeholders],
                            perms.hasPerm('clients.read') && ['clients', locale.tabs.clients],
                        ].filter(x => x))} />
                )}
                {!editing && selectionActionButton}
                {!editing && (
                    <OverviewList
                        task={itemsTask}
                        notice={itemsNotice}
                        view={itemsView}
                        selection={selection}
                        options={{
                            group: id,
                        }}
                        fields={itemFieldSpecs}
                        useDeepCmp
                        parameters={{
                            ...parameters,
                            fields: itemFields,
                            offset: itemsOffset,
                        }}
                        onGetItemLink={onGetItemLink}
                        onSetOffset={offset => this.setState({ [offsetKey]: offset })}
                        onSetLimit={limit => this.setState({
                            parameters: { ...this.state.parameters, limit },
                        })}
                        updateView={updateView}
                        locale={itemsLocale} />
                )}
            </div>
        );
    }
});

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
