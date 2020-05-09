import { h } from 'preact';
import { AppBarProxy, Button, MenuIcon, CircularProgress } from '@cpsdqs/yamdl';
import DoneIcon from '@material-ui/icons/Done';
import Meta from '../../../meta';
import Page from '../../../../components/page';
import { deepEq } from '../../../../../util';
import PermsEditor from '../perms-editor';
import { adminGroups as locale } from '../../../../locale';
import { connect } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';
import './detail.less';

export default connect(({ matches }) => {
    return ['adminGroups/group', {
        id: +matches[matches.length - 2][1],
        fetchPerms: true,
    }];
})((data, core) => ({ group: data, core }))(connectPerms(class AdminGroupPermsEditor extends Page {
    state = {
        permissions: null,
    };

    #save = () => {
        const { core } = this.props;
        core.createTask('adminGroups/setPermissions', {
            id: +this.props.matches[this.props.matches.length - 2][1],
        }, {
            permissions: this.state.permissions,
            original: this.props.group.permissions,
        });
    };

    render ({ perms, group }) {
        const edited = !!this.state.permissions && !deepEq(this.state.permissions, group.permissions);

        let permsEditor;
        if (group && group.permissions && group.id) {
            permsEditor = (
                <PermsEditor
                    editable={perms.hasPerm('admin_groups.update')}
                    value={this.state.permissions || group.permissions}
                    onChange={permissions => this.setState({ permissions })} />
            );
        } else {
            permsEditor = <center><CircularProgress indeterminate /></center>;
        }

        return (
            <div class="admin-group-perms-editor">
                <Meta title={locale.permsTitle} />
                <AppBarProxy
                    class="perms-editor-app-bar"
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
}));
