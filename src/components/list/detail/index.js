import React from 'react';
import PropTypes from 'prop-types';
import { AppBarProxy, Button, MenuIcon } from 'yamdl';
import EditIcon from '@material-ui/icons/Edit';
import locale from '../../../locale';
import './style';

export default class DetailView extends React.PureComponent {
    static propTypes = {
        open: PropTypes.bool,
        onClose: PropTypes.func,
        onRequest: PropTypes.func,
        onUpdateItem: PropTypes.func.isRequired,
        getTitle: PropTypes.func,
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

    cancelEdit () {
        this.setState({ editingCopy: null });
    }

    saveEdit () {
        this.setState({ editingCopy: null });
        // TODO: save
    }

    render () {
        const { items, open, locale, getTitle } = this.props;
        const { id } = this.state;

        const item = id && items[id] ? items[id] : null;

        return (
            <div className={'detail-view-container' + (open ? '' : ' closed')}>
                <div className="detail-view-backdrop" onClick={this.onClose} />
                <div className="detail-view">
                    <DetailAppBar
                        item={item}
                        open={open}
                        locale={locale}
                        onClose={this.onClose}
                        getTitle={getTitle}
                        editing={!!this.state.editingCopy}
                        onEdit={() => this.beginEdit()}
                        onEditCancel={() => this.cancelEdit()}
                        onEditSave={() => this.saveEdit()} />
                    <DetailViewContents
                        original={item}
                        item={this.state.editingCopy || item}
                        editing={!!this.state.editingCopy}
                        onItemChange={item => {
                            if (this.state.editingCopy) this.setState({ editingCopy: item });
                        }}
                        fields={this.props.fields}
                        headerComponent={this.props.headerComponent}
                        footerComponent={this.props.footerComponent}
                        locale={locale} />
                </div>
            </div>
        );
    }
}

function DetailAppBar ({
    item,
    open,
    onClose,
    getTitle,
    locale: detailLocale,
    editing,
    onEdit,
    onEditCancel,
    onEditSave,
}) {
    let title;
    if (getTitle && item) title = getTitle(item);
    if (!title) title = detailLocale.fallbackTitle;
    if (editing) title = detailLocale.editingTitle;

    const actions = [];
    if (!editing) {
        actions.push({
            key: 'edit',
            icon: <EditIcon />,
            label: locale.listView.detail.edit,
            action: onEdit,
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
};

function DetailViewContents ({
    original,
    item,
    editing,
    onItemChange,
    fields,
    headerComponent,
    footerComponent,
    locale,
}) {
    if (!item) return null;

    const Header = headerComponent;
    const Footer = footerComponent;

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
