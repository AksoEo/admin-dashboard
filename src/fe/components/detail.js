import { h } from 'preact';
import { PureComponent, Fragment } from 'preact/compat';
import { Button, CircularProgress, AppBarProxy, MenuIcon } from '@cpsdqs/yamdl';
import DoneIcon from '@material-ui/icons/Done';
import HistoryIcon from '@material-ui/icons/History';
import TinyProgress from './tiny-progress';
import Form from './form';
import { detail as locale } from '../locale';
import { coreContext } from '../core/connection';
import { Link } from '../router';
import { deepEq } from '../../util';
import './detail.less';

/// Renders a detail view.
///
/// This opens a connection to a core data view and optionally to a core task to edit the data.
///
/// # Props
/// - view: data view name. The data view should expect an `id` option.
///   The view may use the `extra` field and pass `'delete'` to trigger onDelete.
/// - editing/onEndEdit: editing state
/// - onCommit: should commit and end edit (or not, if the user cancels the task).
///   will be passed an array of changed field ids
/// - edit/onEditChange: editing copy. Is not necessarily synchronized with `editing`
/// - id: detail view id
/// - options: additional view options; will *not* cause a reload on update
/// - fields: object { [client field id]: field spec }, with field spec being an object:
///    - component: field editor component { value, onChange, editing, item }
///    - isEmpty: field value => bool
/// - header: like a field editor component, but without value, and with onItemChange
/// - footer: like header
/// - locale: object { fields: { field names... } }
/// - makeHistoryLink: if set, should be a callback that returns the url for the given field’s
///   history
/// - onDelete: called when the item is deleted
export default class DetailView extends PureComponent {
    static contextType = coreContext;

    state = {
        data: null,
        error: null,
    };

    /// current data view
    #view;

    /// current form ref
    #form;

    createView () {
        const { view, id, options } = this.props;
        if (!id) return;
        if (this.#view) this.#view.drop();
        this.#view = this.context.createDataView(view, { id, ...(options || {}) });
        this.#view.on('update', this.#onViewUpdate);
        this.#view.on('error', this.#onViewError);
    }

    #onViewUpdate = (data, extra) => {
        if (extra === 'delete') {
            this.props.onDelete();
        }
        this.setState({ data, error: null });
    }
    #onViewError = error => this.setState({ error });

    componentDidMount () {
        this.createView();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.view !== this.props.view || prevProps.id !== this.props.id) {
            this.createView();
        }
    }

    componentWillUnmount () {
        this.#view.drop();
    }

    getChangedFields () {
        if (!this.props.edit || !this.state.data) return [];
        return Object.keys(this.state.data)
            .filter(fieldId => !deepEq(this.state.data[fieldId], this.props.edit[fieldId]));
    }

    beginCommit () {
        if (!this.#form.validate()) return;
        const changes = this.getChangedFields();
        this.props.onCommit(changes);
    }

    render ({ editing, locale: detailLocale, makeHistoryLink }) {
        let contents;
        if (this.state.error) {
            contents = (
                <div class="detail-view-error">
                    {this.state.error.valueOf()}
                </div>
            );
        } else if (this.state.data) {
            const itemData = editing ? this.props.edit || this.state.data : this.state.data;
            const fieldProps = {
                editing,
                item: itemData,
                onItemChange: item => this.props.onEditChange(item),
            };

            const createHistoryLink = field => makeHistoryLink && (
                <Link
                    class="history-link"
                    target={makeHistoryLink(field, itemData)}>
                    <HistoryIcon style={{ verticalAlign: 'middle' }} />
                </Link>
            );
            const canReadHistory = !!makeHistoryLink;

            let header = null;
            const items = [];
            const emptyItems = [];
            let footer = null;

            if (this.props.header) {
                const Header = this.props.header;
                header = <Header {...fieldProps} createHistoryLink={createHistoryLink} canReadHistory={canReadHistory} />;
            }
            if (this.props.footer) {
                const Footer = this.props.footer;
                footer = <Footer {...fieldProps} createHistoryLink={createHistoryLink} canReadHistory={canReadHistory} />;
            }

            // TODO: proper field rendering
            for (const fieldId in this.props.fields) {
                const field = this.props.fields[fieldId];
                const FieldComponent = field.component;

                if (field.shouldHide && field.shouldHide(itemData, editing)) continue;

                const isNotLoaded = itemData[fieldId] === undefined;
                const isEmpty = !isNotLoaded && !editing
                    && (field.isEmpty ? field.isEmpty(itemData[fieldId]) : !itemData[fieldId]);
                const hasDiff = this.props.edit && this.state.data
                    && !deepEq(this.state.data[fieldId], this.props.edit[fieldId]);

                let idClass = 'detail-field-id';
                if (isEmpty) idClass += ' is-empty';
                if (hasDiff) idClass += ' has-diff';

                let historyLink = null;
                if (makeHistoryLink && field.history) historyLink = createHistoryLink(fieldId);
                else if (makeHistoryLink) historyLink = <span class="history-link-placeholder" />;

                const itemId = (
                    <div class={idClass} key={'i' + fieldId} data-id={fieldId}>
                        {detailLocale.fields[fieldId]}
                        {historyLink}
                    </div>
                );
                const itemContents = (
                    <div class="detail-field-editor" key={'e' + fieldId}>
                        {isNotLoaded ? (
                            <TinyProgress class="detail-field-loading" />
                        ) : isEmpty ? (
                            <div class="detail-field-empty">—</div>
                        ) : (
                            <FieldComponent
                                value={itemData[fieldId]}
                                onChange={value => {
                                    this.props.onEditChange({
                                        ...itemData,
                                        [fieldId]: value,
                                    });
                                }}
                                {...fieldProps} />
                        )}
                    </div>
                );

                if (isEmpty) {
                    // empty fields go below
                    emptyItems.push(itemId, itemContents);
                } else {
                    items.push(itemId, itemContents);
                }
            }

            contents = (
                <Fragment>
                    <AppBarProxy
                        class="detail-view-editing-app-bar"
                        priority={editing ? 2 : -Infinity}
                        title={locale.editing}
                        menu={(
                            <Button icon small onClick={() => {
                                this.props.onEditChange(null);
                                this.props.onEndEdit();
                            }} aria-label={locale.cancel}>
                                <MenuIcon type="close" />
                            </Button>
                        )}
                        actions={[
                            {
                                label: locale.done,
                                icon: <DoneIcon />,
                                action: () => this.beginCommit(),
                            },
                        ]} />
                    {header}
                    <div class="detail-fields">
                        {items}
                        {emptyItems}
                    </div>
                    {footer}
                </Fragment>
            );
        } else {
            contents = (
                <div class="detail-view-loading">
                    <CircularProgress indeterminate />
                </div>
            );
        }

        if (editing) {
            return (
                <Form
                    ref={view => this.#form = view}
                    class="detail-view"
                    onSubmit={() => {}}>
                    {contents}
                </Form>
            );
        } else {
            return (
                <div class="detail-view">
                    {contents}
                </div>
            );
        }
    }
}
