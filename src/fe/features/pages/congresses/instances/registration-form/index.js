import { h } from 'preact';
import { createRef, PureComponent } from 'preact/compat';
import { AppBarProxy, Button, CircularProgress, MenuIcon } from '@cpsdqs/yamdl';
import Meta from '../../../../meta';
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import Page from '../../../../../components/page';
import FormEditor from '../../../../../components/form-editor';
import { connect } from '../../../../../core/connection';
import { connectPerms } from '../../../../../perms';
import { congressRegistrationForm as locale } from '../../../../../locale';
import './index.less';

export default connectPerms(class RegistrationFormPage extends Page {
    state = {
        org: '',
    };

    editor = createRef();

    get congress () {
        return +this.props.matches[this.props.matches.length - 4][1];
    }
    get instance () {
        return +this.props.matches[this.props.matches.length - 2][1];
    }

    render ({ perms }, { org }) {
        const actions = [];

        // TODO: load org

        if (perms.hasPerm(`congress_instances.update.${org}`)) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
                action: () => this.editor.current.beginEditing(),
            }, {
                overflow: true,
                label: locale.delete.menuItem,
                action: () => {
                    // TODO: delete only if there is an item?
                    // TODO: delete
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
                    congress={this.congress}
                    instance={this.instance} />
            </div>
        );
    }
});

const InnerEditor = connect(({ congress, instance }) => [
    'congresses/registrationForm',
    { congress, instance },
])((data, core, err, loaded) => ({ core, data, loaded }))(class InnerEditor extends PureComponent {
    state = {
        edit: null,
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

    beginCommit = () => {
        this.props.core.createTask('congresses/setRegistrationForm', {
            congress: this.props.congress,
            instance: this.props.instance,
        }, {
            data: this.state.edit,
        });
    };

    render ({ data, loaded }, { edit }) {
        if (!loaded) {
            return (
                <div class="form-editor-loading">
                    <CircularProgress indeterminate />
                </div>
            );
        }

        if ((edit || data) === null) {
            return (
                <div class="form-editor-create">
                    <Button raised onClick={this.createForm}>
                        {locale.create}
                    </Button>
                </div>
            );
        }

        return (
            <div class="form-editor-container">
                <AppBarProxy
                    class="detail-view-editing-app-bar"
                    priority={edit ? 2 : -Infinity}
                    title={locale.editingTitle}
                    menu={(
                        <Button icon small onClick={() => {
                            this.setState({ edit: null });
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
                <FormEditor
                    editing={!!edit}
                    value={edit || data}
                    onChange={edit => this.setState({ edit })} />
            </div>
        );
    }
});
