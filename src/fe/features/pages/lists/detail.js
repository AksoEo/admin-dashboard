import { h, Component } from 'preact';
import { Button, TextField } from '@cpsdqs/yamdl';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import RemoveIcon from '@material-ui/icons/Remove';
import Page from '../../../components/page';
import DetailView from '../../../components/detail';
import JSONEditor from '../../../components/json-editor';
import RearrangingList from '../../../components/rearranging-list';
import Tabs from '../../../components/tabs';
import DataList from '../../../components/data-list';
import ProfilePicture from '../../../components/profile-picture';
import Meta from '../../meta';
import { coreContext } from '../../../core/connection';
import { connectPerms } from '../../../perms';
import { Link } from '../../../router';
import { lists as locale } from '../../../locale';
import './detail.less';

export default connectPerms(class ListDetailPage extends Page {
    state = {
        edit: null,
    };

    static contextType = coreContext;

    #commitTask = null;
    onCommit = changedFields => {
        if (!this.props.editing || this.#commitTask) return;
        if (!changedFields.length) {
            // nothing changed, so we can just pop the editing state
            this.props.editing.pop(true);
            return;
        }

        this.#commitTask = this.context.createTask('lists/update', {
            id: this.props.match[1],
            _changedFields: changedFields,
        }, this.state.edit);
        this.#commitTask.on('success', this.onEndEdit);
        this.#commitTask.on('drop', () => this.#commitTask = null);
    };
    onEndEdit = () => {
        this.props.editing && this.props.editing.pop(true);
        this.setState({ edit: null });
    };

    render ({ match, perms, editing }) {
        const id = +match[1];

        const actions = [];

        if (perms.hasPerm('lists.delete')) {
            actions.push({
                label: locale.delete.menuItem,
                action: () => this.context.createTask('lists/delete', {}, { id }),
                overflow: true,
            });
        }

        if (perms.hasPerm('lists.update') && perms.hasPerm('codeholders.read')) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
                action: () => {
                    this.props.onNavigate(`/listoj/${id}/redakti`, true);
                },
            });
        }

        return (
            <div class="list-detail-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />
                <DetailView
                    view="lists/list"
                    id={id}
                    editing={editing}
                    edit={this.state.edit}
                    onEditChange={edit => this.setState({ edit })}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    header={DetailViewInner}
                    onDelete={() => this.props.pop()} />
            </div>
        );
    }
});

class DetailViewInner extends Component {
    state = {
        tab: 'preview',
    };

    render ({ editing, item, onItemChange }) {
        let tab = this.state.tab;
        if (editing) tab = 'filters';

        return (
            <div class={'list-detail-inner' + (editing ? ' is-editing' : '')}>
                <Tabs
                    value={tab}
                    onChange={tab => this.setState({ tab })}
                    disabled={editing}
                    tabs={{
                        preview: locale.preview.title,
                        filters: locale.filters.title,
                    }} />
                <Header
                    item={item}
                    editing={editing}
                    onItemChange={onItemChange} />
                {tab === 'filters' ? (
                    <Filters item={item} editing={editing} onItemChange={onItemChange} />
                ) : (
                    <ListPreview item={item} />
                )}
            </div>
        );
    }
}

function Header ({ item, editing, onItemChange }) {
    if (editing) {
        return (
            <div class="detail-header">
                <div class="detail-header-field">
                    <TextField
                        label={locale.fields.name}
                        value={item.name}
                        onChange={e => onItemChange({ ...item, name: e.target.value })} />
                </div>
                <div class="detail-header-field">
                    <TextField
                        label={locale.fields.description}
                        value={item.description}
                        onChange={e => onItemChange({ ...item, description: e.target.value || null })} />
                </div>
            </div>
        );
    } else {
        return (
            <div class="detail-header">
                <h1>{item.name}</h1>
                <p>{item.description}</p>
            </div>
        );
    }
}

class Filters extends Component {
    /// These keys are used to identify filters while editing the list.
    /// This is necessary to enable rearranging that doesn’t look confusing.
    editFilterKeys = [];

    render ({ item, editing, onItemChange }) {
        const filters = [];
        for (let i = 0; i < (item.filters || []).length; i++) {
            if (!this.editFilterKeys[i]) {
                this.editFilterKeys[i] = 'f' + Math.random();
            }

            const index = i;
            const filter = item.filters[index];
            filters.push(
                <div class="filter-item" key={this.editFilterKeys[index]}>
                    <div class="filter-item-header">
                        {editing ? (
                            <span class="filter-item-remove-container">
                                <Button icon small class="filter-item-remove" onClick={() => {
                                    const newFilters = [...item.filters];
                                    newFilters.splice(index, 1);
                                    this.editFilterKeys.splice(index, 1);
                                    if (!newFilters.length) newFilters.push('{\n\t\n}');
                                    onItemChange({ ...item, filters: newFilters });
                                }}>
                                    <RemoveIcon style={{ verticalAlign: 'middle' }} />
                                </Button>
                            </span>
                        ) : null}
                        <span class="filter-item-title">{locale.filters.itemTitle(i)}</span>
                    </div>
                    <JSONEditor
                        value={filter}
                        disabled={!editing}
                        onChange={value => {
                            if (!editing) return;
                            const newFilters = [...item.filters];
                            newFilters[index] = value;
                            onItemChange({ ...item, filters: newFilters });
                        }} />
                </div>
            );
        }

        if (editing) {
            filters.push(
                <div class="add-filter-item" key="add">
                    <Button icon class="add-filter-button" onClick={() => {
                        const newFilters = [...item.filters];
                        newFilters.push('{\n\t\n}');
                        onItemChange({ ...item, filters: newFilters });
                    }}>
                        <AddIcon />
                    </Button>
                </div>
            );
        }

        if (editing) {
            return (
                <RearrangingList
                    class="detail-filters is-editing"
                    itemHeight={256}
                    isItemDraggable={(index) => index < filters.length - 1}
                    canMove={(toPos) => toPos >= 0 && toPos < filters.length - 1}
                    onMove={(fromPos, toPos) => {
                        const newFilters = [...item.filters];
                        const filter = newFilters.splice(fromPos, 1)[0];
                        newFilters.splice(toPos, 0, filter);
                        const filterKey = this.editFilterKeys.splice(fromPos, 1)[0];
                        this.editFilterKeys.splice(toPos, 0, filterKey);
                        onItemChange({ ...item, filters: newFilters });
                    }}>
                    {filters}
                </RearrangingList>
            );
        } else {
            return (
                <div class="detail-filters">
                    {filters}
                </div>
            );
        }
    }
}

function ListPreview ({ item }) {
    const listId = item.id;

    return (
        <coreContext.Consumer>
            {core => (
                <div class="detail-preview">
                    <DataList
                        onLoad={(offset, limit) => core.createTask('lists/codeholders', {
                            id: listId,
                        }, { offset, limit }).runOnceAndDrop()}
                        renderItem={item => {
                            return (
                                <div class="codeholder-item">
                                    <div class="codeholder-picture">
                                        <ProfilePicture
                                            id={item.id}
                                            profilePictureHash={item.profilePictureHash}
                                            profilePictureURL={id => `/lists/public/${listId}/codeholders/${id}/profile_picture/`} />
                                    </div>
                                    <div class="codeholder-name">
                                        <Link target={`/membroj/${item.id}`}>{item.name}</Link>
                                    </div>
                                </div>
                            );
                        }}
                        emptyLabel={locale.preview.empty}
                        useShowMore />
                </div>
            )}
        </coreContext.Consumer>
    );
}
