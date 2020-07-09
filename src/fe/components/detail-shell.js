import { h } from 'preact';
import { Fragment, PureComponent } from 'preact/compat';
import { Button, CircularProgress, AppBarProxy, MenuIcon } from '@cpsdqs/yamdl';
import DoneIcon from '@material-ui/icons/Done';
import { coreContext } from '../core/connection';
import { deepEq } from '../../util';
import { detail as locale } from '../locale';
import Form from './form';
import DisplayError from './error';
import './detail-shell.less';

/// The outer shell of a detail view. Does not handle fields.
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
/// - onDelete: called when the item is deleted
/// - onData: will be called with data when it loads
/// - children: (data) => Node
export default class DetailShell extends PureComponent {
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
            if (this.props.onDelete) this.props.onDelete();
        }
        this.setState({ data, error: null });
        if (this.props.onData) this.props.onData(data);
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

    render ({ editing, children }) {
        let contents;
        if (this.state.error) {
            contents = (
                <div class="detail-view-error">
                    <DisplayError error={this.state.error} />
                </div>
            );
        } else if (this.state.data) {
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
                    {!!children && children(this.state.data)}
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
            <Form
                ref={view => this.#form = view}
                class="detail-view"
                onSubmit={() => {}}>
                {contents}
            </Form>
        );
    }
}
