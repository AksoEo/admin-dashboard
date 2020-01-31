import { h } from 'preact';
import { AppBarProxy, Button, MenuIcon, CircularProgress } from '@cpsdqs/yamdl';
import DoneIcon from '@material-ui/icons/Done';
import Meta from '../../meta';
import Page from '../../../components/page';
import PermsEditor from '../administration/perms-editor';
import { codeholders as locale } from '../../../locale';
import { connect } from '../../../core/connection';

export default connect(({ matches }) => {
    return ['codeholders/codeholderPerms', {
        id: +matches[matches.length - 2][1],
    }];
})((data, core) => ({ perms: data, core }))(class CodeholderPermsEditor extends Page {
    state = {
        permissions: null,
        memberFields: undefined,
    };

    #save = () => {
        const { core } = this.props;
        const task = core.createTask('codeholders/setPermissions', {
            id: +this.props.matches[this.props.matches.length - 2][1],
        }, {
            permissions: this.state.permissions,
        });
        task.on('success', () => this.props.pop());
    };

    render ({ perms }) {
        const edited = this.state.permissions || this.state.memberFields !== undefined;

        let permsEditor;
        if (perms && perms.permissions) {
            permsEditor = (
                <PermsEditor
                    permissions={this.state.permissions || perms.permissions}
                    memberFields={this.state.memberFields === undefined
                        ? (perms.memberRestrictions && perms.memberRestrictions.fields)
                        : this.state.memberFields}
                    onChange={permissions => this.setState({ permissions })}
                    onFieldsChange={fields => this.setState({ memberFields: fields })} />
            );
        } else {
            permsEditor = <CircularProgress indeterminate />;
        }

        return (
            <div class="codeholders-perms-editor">
                <Meta title={locale.perms.title} />
                <AppBarProxy
                    class="codeholders-perms-editor-app-bar"
                    priority={edited ? 9 : -Infinity}
                    menu={(
                        <Button small icon onClick={() => this.props.pop()}>
                            <MenuIcon type="close" />
                        </Button>
                    )}
                    title={locale.perms.title}
                    actions={[
                        {
                            icon: <DoneIcon />,
                            action: this.#save,
                        },
                    ]} />
                {permsEditor}
            </div>
        );
    }
});
