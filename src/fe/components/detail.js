import { h } from 'preact';
import { PureComponent, Fragment } from 'preact/compat';
import { Button, CircularProgress, AppBarProxy, MenuIcon } from '@cpsdqs/yamdl';
import DoneIcon from '@material-ui/icons/Done';
import { detail as locale } from '../locale';
import { coreContext } from '../core/connection';
import './detail.less';

/// Renders a detail view.
///
/// This opens a connection to a core data view and optionally to a core task to edit the data.
///
/// # Props
/// - view: data view name. The data view should expect an `id` option.
/// - editing/onEndEdit: editing state
/// - id: detail view id
/// - options: additional view options; will *not* cause a reload on update
/// - fields: object { [client field id]: field spec }, with field spec being an object:
///    - component: field editor component { value, onChange, editing, item }
///    - isEmpty: field value => bool
/// - header: like a field editor component, but without value, and with onItemChange
/// - footer: like header
export default class DetailView extends PureComponent {
    static contextType = coreContext;

    state = {
        data: null,
        error: null,

        // current editing copy
        edit: null,
    };

    /// current data view
    #view;

    createView () {
        const { view, id, options } = this.props;
        if (!id) return;
        if (this.#view) this.#view.drop();
        this.#view = this.context.createDataView(view, { id, ...(options || {}) });
        this.#view.on('update', this.#onViewUpdate);
        this.#view.on('error', this.#onViewError);
    }

    #onViewUpdate = data => this.setState({ data, error: null });
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

    render ({ editing }) {
        let contents;
        if (this.state.error) {
            contents = (
                <div class="detail-view-error">
                    {this.state.error.valueOf()}
                </div>
            );
        } else if (this.state.data) {
            const itemData = this.state.edit || this.state.data;
            const fieldProps = {
                editing,
                item: itemData,
                onItemChange: item => this.setState({ edit: item }),
            };

            let header = null;
            const items = [];
            let footer = null;

            if (this.props.header) {
                const Header = this.props.header;
                header = <Header {...fieldProps} />;
            }
            if (this.props.footer) {
                const Footer = this.props.footer;
                footer = <Footer {...fieldProps} />;
            }

            // TODO: proper field rendering
            for (const fieldId in this.props.fields) {
                const field = this.props.fields[fieldId];
                const FieldComponent = field.component;
                items.push(
                    <div class="detail-field-id" key={'i' + fieldId}>{fieldId}</div>,
                    <div class="detail-field-editor" key={'e' + fieldId}>
                        <FieldComponent
                            value={itemData[fieldId]}
                            onChange={value => {
                                this.setState({
                                    edit: {
                                        ...itemData,
                                        [fieldId]: value,
                                    },
                                });
                            }}
                            {...fieldProps} />
                    </div>,
                );
            }

            contents = (
                <Fragment>
                    <AppBarProxy
                        class="detail-view-editing-app-bar"
                        priority={editing ? 2 : -Infinity}
                        title={locale.editing}
                        menu={(
                            <Button icon small onClick={() => {
                                this.setState({ edit: null });
                                this.props.onEndEdit();
                            }} aria-label={locale.cancel}>
                            <MenuIcon type="close" />
                        </Button>
                        )}
                        actions={[
                            {
                                label: locale.done,
                                icon: <DoneIcon />,
                                action: () => {
                                    // TODO: commit first
                                    this.props.onEndEdit();
                                },
                            }
                        ]} />
                    {header}
                    <div class="detail-fields">
                    {items}
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


        return (
            <div class="detail-view">
                {contents}
            </div>
        );
    }
}
