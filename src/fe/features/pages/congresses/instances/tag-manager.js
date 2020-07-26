import { h } from 'preact';
import { PureComponent, useState } from 'preact/compat';
import { Button, CircularProgress, Dialog, TextField } from '@cpsdqs/yamdl';
import AddIcon from '@material-ui/icons/Add';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import DisplayError from '../../../../components/error';
import TinyProgress from '../../../../components/tiny-progress';
import { connect, coreContext } from '../../../../core/connection';
import { data as locale } from '../../../../locale';
import './tag-manager.less';

/// Lets you manage and attach tags to a node.
///
/// - list/selected: tasks used to list all/selected tags
/// - options: task options
/// - view: tag view
/// - viewOptions: view options
/// - taskOptions: options used for all other tasks
/// - addTask/updateTask/deleteTask: tasks used to add or delete tags
/// - attachTask/removeTask: tasks used to attach or remove tags from this node
export default class TagManager extends PureComponent {
    state = {
        all: [], // all tags
        selected: [], // selected tags
        loading: false,
        error: null,
        managerOpen: false,
    };

    static contextType = coreContext;

    load () {
        const { list, options, selected } = this.props;

        this.setState({ loading: true });

        const allTags = new ListLoader(this.context, list, options).load();
        const selTags = new ListLoader(this.context, selected, options).load();

        Promise.all([allTags, selTags]).then(([all, selected]) => {
            this.setState({ loading: false, all, selected });
        }).catch(error => {
            console.error(error); // eslint-disable-line no-console
            this.setState({ loading: false, error });
        });
    }

    componentDidMount () {
        this.load();
    }

    #onCreate = async (name) => {
        await this.context.createTask(this.props.addTask, this.props.taskOptions, {
            name,
        }).runOnceAndDrop();
        this.load();
    };
    #onUpdate = async (id, name) => {
        await this.context.createTask(this.props.updateTask, {
            ...this.props.taskOptions,
            id,
        }, { name }).runOnceAndDrop();
    };
    #onDelete = async (id) => {
        await this.context.createTask(this.props.deleteTask, {
            ...this.props.taskOptions,
            id,
        }).runOnceAndDrop();
    };
    #onAttach = async (id) => {
        await this.context.createTask(this.props.attachTask, {
            ...this.props.taskOptions,
            id,
        }).runOnceAndDrop();
        if (this.state.selected.includes(id)) return;
        const selected = this.state.selected.slice();
        selected.push(id);
        this.setState({ selected });
    };
    #onRemove = async (id) => {
        await this.context.createTask(this.props.removeTask, {
            ...this.props.taskOptions,
            id,
        }).runOnceAndDrop();
        if (!this.state.selected.includes(id)) return;
        const selected = this.state.selected.slice();
        selected.splice(selected.indexOf(id), 1);
        this.setState({ selected });
    };

    render ({ view, viewOptions }, { loading, error, all, selected, managerOpen }) {
        const summary = selected.map(id => <Tag
            view={view}
            viewOptions={viewOptions}
            id={id}
            key={id} />);

        let contents;
        if (loading) {
            contents = <CircularProgress indeterminate small />;
        } else if (error) {
            contents = <DisplayError error={error} />;
        } else if (summary.length) {
            contents = summary;
        } else {
            contents = <span class="empty-label">{locale.tagManager.noTags}</span>;
        }

        return (
            <div class="congress-tag-manager">
                {contents}
                <Button
                    icon small class="manage-button"
                    onClick={() => this.setState({ managerOpen: true })}>
                    <MoreHorizIcon style={{ verticalAlign: 'middle' }} />
                </Button>
                <Dialog
                    class="congress-tag-manager-popout"
                    title={locale.tagManager.dialogTitle}
                    open={managerOpen}
                    onClose={() => this.setState({ managerOpen: false })}>
                    <PopoutContents
                        all={all}
                        view={view}
                        viewOptions={viewOptions}
                        selected={selected}
                        onCreate={this.#onCreate}
                        onUpdate={this.#onUpdate}
                        onDelete={this.#onDelete}
                        onAttach={this.#onAttach}
                        onRemove={this.#onRemove} />
                </Dialog>
            </div>
        );
    }
}

// TODO: make this a function if there's no reason for this to be a state machine
class ListLoader {
    constructor (core, task, options) {
        this.core = core;
        this.task = task;
        this.options = options;
        this.offset = 0;
        this.total = NaN;
        this.items = [];
    }

    async load () {
        const res = await this.core.createTask(this.task, this.options, {
            offset: this.offset,
            limit: 100,
        }).runOnceAndDrop();

        this.total = res.total;

        if (res.items.length === 0 && this.offset < this.total) throw new Error('internal error');
        this.offset += res.items.length;
        this.items.push(...res.items);

        if (this.offset === this.total) {
            // done
            return this.items;
        } else return await this.load();
    }
}

const Tag = connect(({ view, viewOptions, id }) =>
    [view, { ...viewOptions, id, noFetch: true }])(data => ({ data }))(function Tag ({ data }) {
    let contents;
    if (!data) contents = <TinyProgress />;
    else contents = data.name;

    return <span class="congress-tag">{contents}</span>;
});

function PopoutContents ({
    all, selected, onCreate, onUpdate, onDelete, onAttach, onRemove, view, viewOptions,
}) {
    const [editing, setEditing] = useState(null);

    return (
        <div class="congress-tags-list">
            <div class="list-inner">
                {all.map(id => (
                    <PopoutTag
                        key={id}
                        id={id}
                        view={view}
                        editing={editing === id}
                        onEdit={() => setEditing(id)}
                        onEndEdit={() => setEditing(null)}
                        options={viewOptions}
                        selected={selected.includes(id)}
                        onUpdate={onUpdate}
                        onAttach={onAttach}
                        onRemove={onRemove} />
                ))}
                <AddTag onCreate={onCreate} />
            </div>
        </div>
    );
}

const PopoutTag = connect(({ id, view, options }) =>
    [view, { ...options, id, noFetch: true }])(data => ({ data }))(function PopoutTag ({
    id, selected, editing, onEdit, onEndEdit, data, onUpdate, onAttach, onRemove,
}) {
    const [editedName, setEditedName] = useState('');
    const [loadingAttachment, setLoadingAttachment] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [didError, setDidError] = useState(false);

    return (
        <div
            class={'congress-tag' + (selected ? ' is-selected' : '')}
            onClick={e => {
                if (loadingAttachment || editing) return;
                if (e.target.tagName === 'BUTTON') return;
                if (e.target.tagName === 'INPUT') return;

                setLoadingAttachment(true);
                (selected ? onRemove(id) : onAttach(id)).catch(error => {
                    console.error(error); // eslint-disable-line no-console
                }).then(() => {
                    setLoadingAttachment(false);
                });
            }}>
            {editing ? (
                <div class="tag-edit-cancel">
                    <Button icon small onClick={e => {
                        e.stopPropagation(); // prevent this click from modifying attachment
                        onEndEdit();
                    }}>
                        <CancelIcon />
                    </Button>
                </div>
            ) : null}
            <div class="tag-name">
                {editing ? (
                    <TextField
                        outline
                        maxLength="50"
                        value={editedName}
                        onChange={e => setEditedName(e.target.value)} />
                ) : data ? data.name : <TinyProgress />}
            </div>
            <div class="tag-check">
                {loadingAttachment ? (
                    <CircularProgress indeterminate small />
                ) : (
                    <div class="check-icon">
                        <CheckIcon style={{ verticalAlign: 'middle' }} />
                    </div>
                )}
            </div>
            <div class={'tag-edit-container' + (didError ? ' did-error' : '')}>
                {editing ? (
                    <Button icon small onClick={() => {
                        setUpdating(true);
                        setDidError(false);
                        onUpdate(id, editedName).catch(error => {
                            console.error(error); // eslint-disable-line no-console
                            setDidError(true);
                        }).then(() => {
                            setUpdating(false);
                            onEndEdit();
                        });
                    }}>
                        <CheckIcon style={{ verticalAlign: 'middle' }} />
                    </Button>
                ) : (
                    <Button disabled={!data} icon small onClick={() => {
                        if (!data) return;
                        setEditedName(data.name);
                        onEdit();
                    }}>
                        <EditIcon style={{ verticalAlign: 'middle' }} />
                    </Button>
                )}
            </div>
        </div>
    );
});

function AddTag ({ onCreate }) {
    const [adding, setAdding] = useState(false);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    return (
        <div class="add-tag">
            <Button icon small onClick={() => {
                if (adding) {
                    setAdding(false);
                } else {
                    setAdding(true);
                    setName('');
                }
            }}>
                {adding ? (
                    <CancelIcon style={{ verticalAlign: 'middle' }} />
                ) : (
                    <AddIcon style={{ verticalAlign: 'middle' }} />
                )}
            </Button>
            <TextField
                disabled={loading}
                outline
                maxLength="50"
                value={name}
                onChange={e => setName(e.target.value)} />
            <Button icon small onClick={() => {
                onCreate(name).then(() => {
                    setName('');
                }).catch(error => {
                    setError(error);
                }).then(() => setLoading(false));
            }}>
                <CheckIcon style={{ verticalAlign: 'middle' }} />
            </Button>
        </div>
    );
}
