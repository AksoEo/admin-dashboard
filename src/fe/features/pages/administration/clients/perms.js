import { h } from 'preact';
import { AppBarProxy, Button, MenuIcon, CircularProgress } from '@cpsdqs/yamdl';
import PermsEditor from '../perms-editor';
import DoneIcon from '@material-ui/icons/Done';
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

    render ({ perms, clientPerms }) {
        const edited = !!this.state.permissions && !deepEq(this.state.permissions, clientPerms);

        let permsEditor;
        if (clientPerms) {
            const editable = perms.hasPerm('clients.perms.update');

            permsEditor = (
                <PermsEditor
                    editable={editable}
                    value={this.state.permissions || clientPerms}
                    onChange={permissions => this.setState({ permissions })} />
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
