import { h } from 'preact';
import { memo, PureComponent, useState } from 'preact/compat';
import { AppBarProxy, Button, MenuIcon, Dialog, TextField } from '@cpsdqs/yamdl';
import EditIcon from '@material-ui/icons/Edit';
import HistoryIcon from '@material-ui/icons/History';
import locale from '../../../locale';
import FieldHistory from './history';
import Form from '../../form';
import { CardStackProvider, CardStackRenderer, CardStackItem } from '../../card-stack';
import './style';

export default class DetailViewContainer extends PureComponent {
    render () {
        return (
            <CardStackProvider>
                <CardStackRenderer class="detail-view-card-stack" />
                <DetailView {...this.props} />
            </CardStackProvider>
        );
    }
}

/// The detail view in a list view, which is shown as a modal overlay and contains details about a
/// selected item.
/// - open/onClose: open state
/// - onRequest: (id) => Promise<Object> - detail view request handler
/// - onUpdateItem: Called when the item is updated *from the database*, meaning the full data was
///   loaded and should be used to patch the potentially only partial data in the redux store.
/// - onPatch: Called when the item is edited and saved, with `(id, original, value, comment)`.
///   - `id`: the unique ID of the item
///   - `original`: the original value
///   - `value`: the edited value
///   - `comment`: the commit message
/// - onDelete: (id) => Promise<void> - called when an item is deleted
/// - items: item data from the redux store
/// - id: current item id
/// - locale: locale data for the detail view (see list view docs for details)
/// - fields: spec for all the detail fields
/// - headerComponent: component that renders the header; same structure as a field
/// - footerComponent: component that renders the footer; same structure as a field
/// - onFetchFieldHistory: callback
class DetailView extends PureComponent {
    state = {
        // id is in derived state so it can linger while the detail view is closing, because
        // the id field is also used as the open state in the list view
        id: null,
        // any kind of error while loading the detail view data
        error: null,
        // a temporary copy of the data that is meant to be mutable and is used in edit mode
        editingCopy: null,

        // if true, the “are you sure you want to delete x” dialog is open
        confirmDeleteOpen: false,
        // if true, the “commit and save” dialog is open
        saveOpen: false,
    };

    onClose = () => {
        if (this.state.editingCopy) return;
        this.props.onClose();
    };

    componentDidMount () {
        if (this.props.id) this.setState({ id: this.props.id }, () => this.load());
    }

    componentDidUpdate (prevProps) {
        if (prevProps.id !== this.props.id) {
            if (this.props.id) {
                // id changed; reload
                this.setState({ id: this.props.id }, () => this.load());

                // and reset scroll position
                if (this.scrollViewNode) this.scrollViewNode.scrollTop = 0;
            }
        }
    }

    load () {
        if (!this.props.onRequest) return;
        const { id } = this.state;
        this.props.onRequest(id).then(item => {
            this.props.onUpdateItem(id, item);
        }).catch(error => {
            if (this.state.id === id) {
                console.error('Error fetching detail', error); // eslint-disable-line no-console
                this.setState({ error });
            }
        });
    }

    beginEdit () {
        if (!this.props.onPatch) return;
        this.setState({ editingCopy: this.props.items[this.state.id] });
    }

    endEdit () {
        this.setState({ editingCopy: null });
    }

    render () {
        const { items, open, locale: detailLocale }  = this.props;
        const { id } = this.state;

        const item = id && items[id] ? items[id] : null;

        return (
            <CardStackItem
                class="detail-view"
                depth={0}
                open={open}
                onClose={this.onClose}
                scrollViewRef={node => this.scrollViewNode = node}
                appBar={
                    <DetailAppBar
                        item={item}
                        open={open}
                        locale={detailLocale}
                        onClose={this.onClose}
                        editing={!!this.state.editingCopy}
                        canEdit={!!this.props.onPatch}
                        onEdit={() => this.beginEdit()}
                        onEditCancel={() => this.endEdit()}
                        onEditSave={() => {
                            if (this.formRef.validate()) {
                                this.setState({ saveOpen: true });
                            }
                        }}
                        canDelete={!!this.props.onDelete}
                        onDelete={() => this.setState({ confirmDeleteOpen: true })} />
                }>
                <DetailViewContents
                    original={item}
                    formRef={form => this.formRef = form}
                    item={this.state.editingCopy || item}
                    itemId={id}
                    editing={!!this.state.editingCopy}
                    onItemChange={item =>
                        this.props.onPatch && this.setState({ editingCopy: item })}
                    fields={this.props.fields}
                    headerComponent={this.props.headerComponent}
                    footerComponent={this.props.footerComponent}
                    locale={detailLocale}
                    onFetchFieldHistory={this.props.onFetchFieldHistory}
                    forceReload={() => this.load()}
                    userData={this.props.userData} />

                <ConfirmDeleteDialog
                    id={id}
                    open={this.state.confirmDeleteOpen}
                    onClose={() => this.setState({ confirmDeleteOpen: false })}
                    onDelete={this.props.onDelete}
                    onDeleted={this.props.onClose}
                    detailLocale={detailLocale} />
                <DetailSaveDialog
                    id={id}
                    open={this.state.saveOpen}
                    onClose={() => this.setState({ saveOpen: false })}
                    onSuccess={() => {
                        this.props.onUpdateItem(id, this.state.editingCopy);
                        this.endEdit();
                    }}
                    onPatch={this.props.onPatch}
                    original={item}
                    value={this.state.editingCopy || item}
                    fields={this.props.fields}
                    detailLocale={detailLocale} />
            </CardStackItem>
        );
    }
}

function DetailAppBar ({
    open,
    onClose,
    locale: detailLocale,
    editing,
    canEdit,
    onEdit,
    onEditCancel,
    onEditSave,
    onDelete,
    canDelete,
}) {
    let title = detailLocale.title;
    if (editing) title = detailLocale.editingTitle;

    const actions = [];
    if (!editing) {
        if (canEdit) actions.push({
            key: 'edit',
            icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
            label: locale.listView.detail.edit,
            action: onEdit,
        });
        if (canDelete) actions.push({
            key: 'delete',
            label: locale.listView.detail.delete,
            action: onDelete,
            overflow: true,
        });
    } else {
        actions.push({
            key: 'cancel',
            label: locale.listView.detail.editCancel,
            action: onEditCancel,
        }, {
            key: 'save',
            label: locale.listView.detail.editSave,
            action: onEditSave,
        });
    }

    return <AppBarProxy
        class={editing ? 'list-view-detail-editing-app-bar' : null}
        priority={open ? 3 : -Infinity}
        menu={!editing && (
            <Button icon small onClick={onClose}>
                <MenuIcon type="back" />
            </Button>
        )}
        title={title}
        actions={actions} />;
}

const DetailViewContents = memo(function DetailViewContents ({
    original,
    formRef,
    item,
    itemId,
    editing,
    onItemChange,
    fields,
    headerComponent: Header,
    footerComponent: Footer,
    locale,
    onFetchFieldHistory,
    forceReload,
    userData,
}) {
    if (!item) return null;

    const [openHistory, setOpenHistory] = useState(null);

    const makeFieldProps = () => ({
        editing,
        original,
        value: item,
        onChange: onItemChange,
        forceReload,
        userData,
    });

    const header = Header ? <Header {...makeFieldProps()} /> : null;
    const footer = Footer ? <Footer {...makeFieldProps()} /> : null;

    const tableRows = [];
    const emptyTableRows = [];
    if (fields) {
        for (const id in fields) {
            const field = fields[id];
            if (field.editingOnly && !editing) continue;
            if (field.shouldHide && field.shouldHide(item)) continue;
            const Component = field.component;

            let changed = true;
            if (field.hasDiff) changed = field.hasDiff(original, item);

            let historyButton;
            if (onFetchFieldHistory) {
                historyButton = (
                    <Button icon small class="field-history-button" onClick={() => {
                        setOpenHistory(id);
                    }}>
                        <HistoryIcon />
                    </Button>
                );
            }

            const keyCell = (
                <td class="field-name">
                    {locale.fields[id]}
                    {historyButton}
                </td>
            );
            const valueCell = (
                <td class="field-container">
                    <Component {...makeFieldProps()} />
                </td>
            );

            let className = 'field-row';
            if (changed) className += ' changed';
            if (field.tall) className += ' tall';

            if (!editing && field.isEmpty && field.isEmpty(item)) {
                emptyTableRows.push(
                    <tr key={id} class={className + ' is-empty'}>
                        {keyCell}
                        <td class="field-container">—</td>
                    </tr>
                );
            } else {
                tableRows.push(
                    <tr key={id} class={className}>
                        {keyCell}
                        {valueCell}
                    </tr>
                );
            }
        }
    }

    return (
        <Form
            class={'detail-view-contents' + (editing ? ' is-editing' : '')}
            ref={formRef}
            onSubmit={() => { /* nope */ }}>
            {header}
            <table class="fields-table">
                <tbody>
                    {tableRows}
                    {emptyTableRows}
                </tbody>
            </table>
            {footer}

            <FieldHistory
                onFetchFieldHistory={onFetchFieldHistory}
                fields={fields}
                locale={locale}
                itemId={itemId}
                id={openHistory}
                onClose={() => setOpenHistory(null)} />
        </Form>
    );
});

function DetailSaveDialog ({
    id, open, onClose, onSuccess, onPatch, original, value, fields, detailLocale,
}) {
    const [saving, setSaving] = useState(false);
    const [comment, setComment] = useState('');

    let diff = [];
    if (open && fields) {
        for (const id in fields) {
            const field = fields[id];
            if (field.hasDiff ? field.hasDiff(original, value) : true) {
                diff.push(<li class="diff-field" key={id}>{detailLocale.fields[id]}</li>);
            }
        }
    }

    if (!diff.length) {
        diff = <span class="no-changes">{locale.listView.detail.saveDialog.noChanges}</span>;
    } else {
        diff = <ul>{diff}</ul>;
    }

    const save = () => {
        setSaving(true);

        onPatch(id, original, value, comment).then(() => {
            setSaving(false);
            onClose();
            onSuccess();
            setComment('');
        }).catch(err => {
            console.error('Failed to save', err); // eslint-disable-line no-console
            setSaving(false);
        });
    };

    return (
        <Dialog
            open={open}
            backdrop
            class="list-view-detail-save-dialog"
            onClose={() => !saving && onClose()}
            title={locale.listView.detail.saveDialog.title}
            actions={[
                {
                    label: locale.listView.detail.saveDialog.commit,
                    disabled: saving,
                    action: save,
                },
            ]}>
            <div class="diff-fields">
                <div class="diff-title">{locale.listView.detail.saveDialog.diffTitle}</div>
                {diff}
            </div>
            <TextField
                class="commit-msg"
                label={locale.listView.detail.saveDialog.modComment}
                value={comment}
                disabled={saving}
                onChange={e => setComment(e.target.value)}
                maxLength={500} />
        </Dialog>
    );
}

function ConfirmDeleteDialog ({ id, open, onClose, onDelete, onDeleted, detailLocale }) {
    const [deleting, setDeleting] = useState(false);

    return (
        <Dialog
            open={open}
            backdrop
            class="list-view-detail-delete-dialog"
            onClose={() => !deleting && onClose()}
            actions={[
                {
                    label: locale.listView.detail.deleteCancel,
                    disabled: deleting,
                    action: () => onClose(),
                },
                {
                    label: locale.listView.detail.delete,
                    disabled: deleting,
                    action: () => {
                        setDeleting(true);
                        onDelete(id).then(() => {
                            setDeleting(false);
                            onClose();
                            onDeleted();
                        }).catch(err => {
                            console.error('Failed to delete', err); // eslint-disable-line no-console
                            setDeleting(false);
                        });
                    },
                },
            ]}>
            {detailLocale.deleteConfirm}
        </Dialog>
    );
}
