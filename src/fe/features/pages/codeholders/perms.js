import { h } from 'preact';
import { AppBarProxy, Button, MenuIcon, CircularProgress } from 'yamdl';
import PermsEditor from '../administration/perms-editor';
import DoneIcon from '@material-ui/icons/Done';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import Meta from '../../meta';
import Page from '../../../components/page';
import { deepEq } from '../../../../util';
import { codeholders as locale } from '../../../locale';
import { connect } from '../../../core/connection';
import { connectPerms } from '../../../perms';

export default connect(({ matches }) => {
    return ['codeholders/permissions', {
        id: +matches.codeholder[1],
    }];
})((data, core) => ({ codeholderPerms: data, core }))(connectPerms(class CodeholderPermsEditor extends Page {
    state = {
        permissions: null,
        history: [],
        future: [],
    };

    #save = () => {
        const { core } = this.props;
        core.createTask('codeholders/setPermissions', {
            id: +this.props.matches.codeholder[1],
        }, {
            permissions: this.state.permissions,
            original: this.props.codeholderPerms,
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


    render ({ perms, codeholderPerms }) {
        const edited = !!this.state.permissions && !deepEq(this.state.permissions, codeholderPerms);

        const editable = perms.hasPerm('codeholders.perms.update');

        let permsEditor;
        if (codeholderPerms) {
            permsEditor = (
                <PermsEditor
                    editable={editable}
                    value={this.state.permissions || codeholderPerms}
                    onChange={this.#onChange} />
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
                        <Button small icon onClick={() => {
                            if (edited) this.setState({ permissions: null });
                            else this.props.pop();
                        }}>
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
