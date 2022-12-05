import { h } from 'preact';
import { createRef, Fragment, PureComponent, useState } from 'preact/compat';
import { AppBarProxy, Button, CircularProgress, Dialog, LinearProgress, MenuIcon } from 'yamdl';
import Meta from '../../../../meta';
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import Page from '../../../../../components/page';
import { Form } from '../../../../../components/form';
import DetailShell from '../../../../../components/detail/detail-shell';
import FormEditor from '../../../../../components/form-editor';
import DisplayError from '../../../../../components/utils/error';
import { connect, coreContext } from '../../../../../core/connection';
import { connectPerms } from '../../../../../perms';
import { congressRegistrationForm as locale } from '../../../../../locale';
import InstancePicker from '../instance-picker';
import './index.less';

const ADDITIONAL_VARS = [
    { name: '@upfront_time', type: 'u', value: null },
    { name: '@is_member', type: 'b', value: true },
];

export default connectPerms(class RegistrationFormPage extends Page {
    state = {
        org: '',
        editorLoaded: false,
    };

    static contextType = coreContext;

    editor = createRef();

    onEditorLoad = loaded => this.setState({ editorLoaded: loaded });

    get congress () {
        return +this.props.matches.congress[1];
    }
    get instance () {
        return +this.props.matches.instance[1];
    }

    render ({ perms }, { org, editorLoaded }) {
        const actions = [];

        const canEdit = perms.hasPerm(`congress_instances.update.${org}`);

        if (canEdit && editorLoaded) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
                action: () => this.editor.current.beginEditing(),
            }, {
                overflow: true,
                label: locale.copyFrom.menuItem,
                action: () => this.editor.current.showCopyFromDialog(),
            }, {
                overflow: true,
                label: locale.delete.menuItem,
                action: () => {
                    this.context.createTask('congresses/deleteRegistrationForm', {
                        congress: this.congress,
                        instance: this.instance,
                    });
                },
            });
        }

        return (
            <div class="congress-registration-form-page">
                <Meta
                    title={locale.title}
                    actions={actions} />
                <InnerEditor
                    ref={this.editor}
                    canEdit={canEdit}
                    org={this.state.org}
                    onLoad={this.onEditorLoad}
                    congress={this.congress}
                    instance={this.instance} />
                <DetailShell
                    /* this is kind of a hack to get the org field */
                    view="congresses/congress"
                    id={this.congress}
                    fields={{}}
                    locale={{}}
                    onData={data => data && this.setState({ org: data.org })} />
            </div>
        );
    }
});

const InnerEditor = connect(({ congress, instance }) => [
    'congresses/registrationForm',
    { congress, instance },
])((data, core, err, loaded) => ({ core, data, err, loaded }))(class InnerEditor extends PureComponent {
    state = {
        copyFromPickerOpen: false,
        edit: null,
        formData: {},
    };

    beginEditing = () => {
        if (this.props.data) this.setState({ edit: this.props.data });
        else this.createForm();
    };

    createForm = () => {
        this.setState({
            edit: {
                allowUse: true,
                editable: true,
                cancellable: true,
                form: [],
            },
        });
    };

    showCopyFromDialog = () => {
        this.setState({
            copyFromPickerOpen: true,
        });
    };

    #form = createRef();
    #formEditor = createRef();
    #commitTask = null;
    beginCommit = () => {
        this.#form.current.requestSubmit();
    };

    #performCommit = () => {
        this.#formEditor.current.stopEditing();
        requestAnimationFrame(() => {
            this.#commitTask = this.props.core.createTask('congresses/setRegistrationForm', {
                congress: this.props.congress,
                instance: this.props.instance,
            }, {
                data: this.state.edit,
            });
            this.#commitTask.on('success', () => {
                this.setState({ edit: null });
            });
            this.#commitTask.on('drop', () => this.#commitTask = null);
        });
    };

    componentDidUpdate () {
        this.props.onLoad(this.props.loaded && !!this.props.data);
    }

    componentWillUnmount () {
        if (this.#commitTask) this.#commitTask.drop();
    }

    render ({ data, err, loaded, canEdit }, { edit }) {
        if (!loaded) {
            if (err) {
                return (
                    <div class="form-editor-loading">
                        <DisplayError error={err} />
                    </div>
                );
            }
            return (
                <div class="form-editor-loading">
                    <CircularProgress indeterminate />
                </div>
            );
        }

        if ((edit || data) === null) {
            if (canEdit) {
                return (
                    <div class="form-editor-create">
                        <Button raised onClick={this.createForm}>
                            {locale.create}
                        </Button>
                        {' '}
                        <Button raised onClick={this.showCopyFromDialog}>
                            {locale.copyFrom.menuItem}
                        </Button>
                        <CopyFromDialog
                            open={this.state.copyFromPickerOpen}
                            onClose={() => this.setState({ copyFromPickerOpen: false })}
                            onLoad={(data) => {
                                this.setState({
                                    edit: data,
                                    formData: {},
                                });
                            }}
                        />
                    </div>
                );
            } else {
                return (
                    <div class="form-editor-create">
                        {locale.noForm}
                    </div>
                );
            }
        }

        return (
            <div class="form-editor-container">
                <AppBarProxy
                    class="detail-view-editing-app-bar"
                    priority={edit ? 2 : -Infinity}
                    title={locale.editingTitle}
                    menu={(
                        <Button icon small onClick={() => {
                            this.#formEditor.current.stopEditing();
                            requestAnimationFrame(() => {
                                this.setState({ edit: null });
                            });
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
                <Form
                    ref={this.#form}
                    onSubmit={this.#performCommit}>
                    <FormEditor
                        ref={this.#formEditor}
                        isEditingContext
                        org={this.props.org}
                        editing={!!edit}
                        value={edit || data}
                        onChange={edit => this.setState({ edit })}
                        additionalVars={ADDITIONAL_VARS}
                        editingFormData
                        formData={this.state.formData}
                        onFormDataChange={formData => this.setState({ formData })} />
                </Form>
                <CopyFromDialog
                    open={this.state.copyFromPickerOpen}
                    onClose={() => this.setState({ copyFromPickerOpen: false })}
                    onLoad={(data) => {
                        this.setState({
                            edit: data,
                            formData: {},
                        });
                    }}
                />
            </div>
        );
    }
});

function CopyFromDialog ({ open, onClose, onLoad }) {
    const [loading, setLoading] = useState(false);

    return (
        <coreContext.Consumer>
            {core => (
                <Fragment>
                    <InstancePicker
                        open={open}
                        onClose={onClose}
                        onPick={(congress, instance) => {
                            setLoading(true);

                            const formData = core
                                .createTask('congresses/registrationForm', { congress, instance })
                                .runOnceAndDrop();

                            formData.then(data => {
                                setLoading(false);
                                if (!data) {
                                    core.createTask('info', {
                                        message: locale.copyFrom.hasNoForm,
                                    });
                                    return;
                                }

                                onLoad(data);
                            }).catch(err => {
                                setLoading(false);

                                console.error(err); // eslint-disable-line no-console
                                core.createTask('info', {
                                    message: locale.copyFrom.unknownError,
                                });
                            });
                        }} />
                    <Dialog
                        backdrop
                        open={loading}>
                        <LinearProgress indeterminate />
                    </Dialog>
                </Fragment>
            )}
        </coreContext.Consumer>
    );
}

