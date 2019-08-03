import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { AppBarProxy, Button, MenuIcon, Dialog, TextField } from 'yamdl';
import EditIcon from '@material-ui/icons/Edit';
import locale from '../../../locale';
import './style';

export default class DetailView extends React.PureComponent {
    static propTypes = {
        open: PropTypes.bool,
        onClose: PropTypes.func,
        onRequest: PropTypes.func,
        onUpdateItem: PropTypes.func.isRequired,
        onPatch: PropTypes.func,
        onDelete: PropTypes.func,
        items: PropTypes.object.isRequired,
        id: PropTypes.any,
        locale: PropTypes.object.isRequired,
        fields: PropTypes.object,
        headerComponent: PropTypes.any,
        footerComponent: PropTypes.any,
    };

    state = {
        // id is derived state so it lingers when the detail view is closed
        id: null,
        error: null,
        editingCopy: null,

        confirmDeleteOpen: false,
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
                this.setState({ id: this.props.id }, () => this.load());
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
            <div className={'detail-view-container' + (open ? '' : ' closed')}>
                <div className="detail-view-backdrop" onClick={this.onClose} />
                <div className="detail-view">
                    <DetailAppBar
                        item={item}
                        open={open}
                        locale={detailLocale}
                        onClose={this.onClose}
                        editing={!!this.state.editingCopy}
                        onEdit={() => this.beginEdit()}
                        onEditCancel={() => this.endEdit()}
                        onEditSave={() => this.setState({ saveOpen: true })}
                        onDelete={() => this.setState({ confirmDeleteOpen: true })} />
                    <DetailViewContents
                        original={item}
                        item={this.state.editingCopy || item}
                        editing={!!this.state.editingCopy}
                        onItemChange={item => this.setState({ editingCopy: item })}
                        fields={this.props.fields}
                        headerComponent={this.props.headerComponent}
                        footerComponent={this.props.footerComponent}
                        locale={detailLocale} />

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
                </div>
            </div>
        );
    }
}

function DetailAppBar ({
    item,
    open,
    onClose,
    locale: detailLocale,
    editing,
    onEdit,
    onEditCancel,
    onEditSave,
    onDelete,
}) {
    let title = detailLocale.title;
    if (editing) title = detailLocale.editingTitle;

    const actions = [];
    if (!editing) {
        actions.push({
            key: 'edit',
            icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
            label: locale.listView.detail.edit,
            action: onEdit,
        }, {
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

DetailAppBar.propTypes = {
    item: PropTypes.object,
    open: PropTypes.bool,
    onClose: PropTypes.func,
    getTitle: PropTypes.func,
    locale: PropTypes.object.isRequired,
    editing: PropTypes.bool,
    onEdit: PropTypes.func.isRequired,
    onEditCancel: PropTypes.func.isRequired,
    onEditSave: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

function DetailViewContents ({
    original,
    item,
    editing,
    onItemChange,
    fields,
    headerComponent: Header,
    footerComponent: Footer,
    locale,
}) {
    if (!item) return null;

    const makeFieldProps = () => ({
        editing,
        original,
        value: item,
        onChange: onItemChange,
    });

    const header = Header ? <Header {...makeFieldProps()} /> : null;
    const footer = Footer ? <Footer {...makeFieldProps()} /> : null;

    const tableRows = [];
    if (fields) {
        for (const id in fields) {
            const field = fields[id];
            if (field.editingOnly && !editing) continue;
            if (field.shouldHide && field.shouldHide(item)) continue;
            const Component = field.component;

            let changed = true;
            if (field.hasDiff) changed = field.hasDiff(original, item);

            const keyCell = (
                <td class="field-name">
                    {locale.fields[id]}
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

            tableRows.push(
                <tr key={id} class={className}>
                    {keyCell}
                    {valueCell}
                </tr>
            );
        }
    }

    return (
        <div class="detail-view-contents">
            {header}
            <table class="fields-table">
                <tbody>
                    {tableRows}
                </tbody>
            </table>
            {footer}
        </div>
    );
}

DetailViewContents.propTypes = {
    original: PropTypes.object, // for diffing
    item: PropTypes.object,
    editing: PropTypes.bool,
    onItemChange: PropTypes.func.isRequired,
    fields: PropTypes.array,
    headerComponent: PropTypes.any,
    footerComponent: PropTypes.any,
    locale: PropTypes.object.isRequired,
};

function DetailSaveDialog({
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
                label={locale.listView.detail.saveDialog.modComment}
                value={comment}
                disabled={saving}
                onChange={e => setComment(e.target.value)}
                maxLength={500} />
        </Dialog>
    );
}

DetailSaveDialog.propTypes = {
    id: PropTypes.any,
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onSuccess: PropTypes.func.isRequired,
    onPatch: PropTypes.func.isRequired,
    original: PropTypes.object.isRequired,
    value: PropTypes.object.isRequired,
    fields: PropTypes.object,
    detailLocale: PropTypes.object.isRequired,
};

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
                        this.props.onDelete(id).then(() => {
                            setDeleting(false);
                            onClose();
                            onDeleted();
                        }).catch(err => {
                            console.error(
                                'Failed to delete',
                                err,
                            ); // eslint-disable-line no-console
                            setDeleting(false);
                        });
                    },
                },
            ]}>
            {detailLocale.deleteConfirm}
        </Dialog>
    );
}

ConfirmDeleteDialog.propTypes = {
    id: PropTypes.any,
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onDeleted: PropTypes.func.isRequired,
    detailLocale: PropTypes.object.isRequired,
};
