import { h } from 'preact';
import { AppBarProxy, Button, MenuIcon, CircularProgress } from '@cpsdqs/yamdl';
import PermsEditor from '../administration/perms-editor';
import DoneIcon from '@material-ui/icons/Done';
import Meta from '../../meta';
import Page from '../../../components/page';
import { deepEq } from '../../../../util';
import { codeholders as locale } from '../../../locale';
import { connect } from '../../../core/connection';
import { connectPerms } from '../../../perms';

export default connect(({ matches }) => {
    return ['codeholders/permissions', {
        id: +matches[matches.length - 2][1],
    }];
})((data, core) => ({ codeholderPerms: data, core }))(connectPerms(class CodeholderPermsEditor extends Page {
    state = {
        permissions: null,
    };

    #save = () => {
        const { core } = this.props;
        core.createTask('codeholders/setPermissions', {
            id: +this.props.matches[this.props.matches.length - 2][1],
        }, {
            permissions: this.state.permissions,
            original: this.props.codeholderPerms,
        });
    };

    render ({ perms, codeholderPerms }) {
        const edited = !!this.state.permissions && !deepEq(this.state.permissions, codeholderPerms);

        const editable = perms.hasPerm('codeholders.perms.update');

        let permsEditor;
        if (codeholderPerms) {
            permsEditor = (
                <PermsEditor
                    editable={editable}
                    value={this.state.permissions || codeholderPerms}
                    onChange={permissions => this.setState({ permissions })} />
            );
        } else {
            permsEditor = <center><CircularProgress indeterminate /></center>;
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
}));
