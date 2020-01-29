import { h } from 'preact';
import { AppBarProxy, Button, MenuIcon, CircularProgress } from '@cpsdqs/yamdl';
import DoneIcon from '@material-ui/icons/Done';
import Meta from '../../../meta';
import Page from '../../../../components/page';
import PermsEditor from '../perms-editor';
import { adminGroups as locale } from '../../../../locale';
import { connect } from '../../../../core/connection';
import './detail.less';

export default connect(({ matches }) => {
    return ['adminGroups/group', {
        id: +matches[matches.length - 2][1],
        fetchPerms: true,
    }];
})((data, core) => ({ group: data, core }))(class AdminGroupPermsEditor extends Page {
    state = {
        permissions: null,
        memberFields: undefined,
    };

    #save = () => {
        const { core } = this.props;
        const task = core.createTask('adminGroups/setPermissions', {
            id: +this.props.matches[this.props.matches.length - 2][1],
        }, {
            permissions: this.state.permissions,
        });
        task.on('success', () => this.props.pop());
    };

    render ({ group }) {
        const edited = this.state.permissions || this.state.memberFields !== undefined;

        let permsEditor;
        if (group && group.permissions && group.id) {
            permsEditor = (
                <PermsEditor
                    permissions={this.state.permissions || group.permissions}
                    memberFields={this.state.memberFields === undefined
                        ? (group.memberRestrictions && group.memberRestrictions.fields)
                        : this.state.memberFields}
                    onChange={permissions => this.setState({ permissions })}
                    onFieldsChange={fields => this.setState({ memberFields: fields })} />
            );
        } else {
            permsEditor = <CircularProgress indeterminate />;
        }

        return (
            <div class="admin-group-perms-editor">
                <Meta title={locale.permsTitle} />
                <AppBarProxy
                    class="admin-groups-perms-editor-app-bar"
                    priority={edited ? 9 : -Infinity}
                    menu={(
                        <Button small icon onClick={() => this.props.pop()}>
                            <MenuIcon type="close" />
                        </Button>
                    )}
                    title={locale.permsTitle}
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
