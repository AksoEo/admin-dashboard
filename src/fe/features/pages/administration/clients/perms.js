import { h } from 'preact';
import { AppBarProxy, Button, MenuIcon, CircularProgress } from '@cpsdqs/yamdl';
import PermsEditor from '../perms-editor';
import DoneIcon from '@material-ui/icons/Done';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import Meta from '../../../meta';
import Page from '../../../../components/page';
import { deepEq } from '../../../../../util';
import { clients as locale } from '../../../../locale';
import { connect } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';

export default connect(({ matches }) => {
    return ['clients/permissions', {
        id: matches[matches.length - 2][1],
    }];
})((data, core) => ({ clientPerms: data, core }))(connectPerms(class ClientPermsEditor extends Page {
    state = {
        permissions: null,
        history: [],
        future: [],
    };

    #save = () => {
        const { core } = this.props;
        core.createTask('clients/setPermissions', {
            id: this.props.matches[this.props.matches.length - 2][1],
        }, {
            original: this.props.clientPerms,
            permissions: this.state.permissions,
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

    render ({ perms, clientPerms }) {
        const edited = !!this.state.permissions && !deepEq(this.state.permissions, clientPerms);

        let permsEditor;
        if (clientPerms) {
            const editable = perms.hasPerm('clients.perms.update');

            permsEditor = (
                <PermsEditor
                    editable={editable}
                    value={this.state.permissions || clientPerms}
                    onChange={this.#onChange} />
            );
        } else {
            permsEditor = <center><CircularProgress indeterminate /></center>;
        }

        return (
            <div class="clients-perms-editor">
                <Meta title={locale.perms.title} />
                <AppBarProxy
                    class="perms-editor-app-bar"
                    priority={edited ? 9 : -Infinity}
                    menu={(
                        <Button small icon onClick={() => this.props.pop()}>
                            <MenuIcon type="close" />
                        </Button>
                    )}
                    title={locale.perms.title}
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
