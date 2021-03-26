import { h } from 'preact';
import { AppBarProxy, Button, MenuIcon, CircularProgress } from '@cpsdqs/yamdl';
import DoneIcon from '@material-ui/icons/Done';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
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
        id: +matches.group[1],
        fetchPerms: true,
    }];
})((data, core) => ({ group: data, core }))(connectPerms(class AdminGroupPermsEditor extends Page {
    state = {
        permissions: null,
        history: [],
        future: [],
    };

    #save = () => {
        const { core } = this.props;
        core.createTask('adminGroups/setPermissions', {
            id: +this.props.matches.group[1],
        }, {
            permissions: this.state.permissions,
            original: this.props.group.permissions,
        });
    };
    #undo = () => {
        const history = this.state.history.slice();
        const future = this.state.future.slice();

        if (!history.length) return;
        future.push(this.state.permissions);
        const permissions = history.pop();

        this.setState({ history, permissions, future });
    };
    #redo = () => {
        const history = this.state.history.slice();
        const future = this.state.future.slice();

        if (!future.length) return;
        history.push(this.state.permissions);
        const permissions = future.pop();

        this.setState({ history, permissions, future });
    };
    #onChange = permissions => {
        const history = this.state.history.slice();
        history.push(this.state.permissions);
        this.setState({ history, permissions, future: [] });
    };


    render ({ perms, group }) {
        const edited = !!this.state.permissions && !deepEq(this.state.permissions, group.permissions);

        let permsEditor;
        if (group && group.permissions && group.id) {
            permsEditor = (
                <PermsEditor
                    editable={perms.hasPerm('admin_groups.update')}
                    value={this.state.permissions || group.permissions}
                    onChange={this.#onChange} />
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
                        { icon: <UndoIcon />, action: this.#undo },
                        { icon: <RedoIcon />, action: this.#redo },
                        { icon: <DoneIcon />, action: this.#save },
                    ]} />
                {permsEditor}
            </div>
        );
    }
}));
