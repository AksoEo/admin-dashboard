import { h } from 'preact';
import { AppBarProxy, Button, MenuIcon, CircularProgress } from '@cpsdqs/yamdl';
import PermsEditor from '../perms-editor';
import DoneIcon from '@material-ui/icons/Done';
import Meta from '../../../meta';
import Page from '../../../../components/page';
import { clients as locale } from '../../../../locale';
import { connect } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';

export default connect(({ matches }) => {
    return ['clients/clientPerms', {
        id: matches[matches.length - 2][1],
    }];
})((data, core) => ({ clientPerms: data, core }))(connectPerms(class ClientPermsEditor extends Page {
    state = {
        permissions: null,
        memberFields: undefined,
        memberFilter: undefined,
        memberRestrictionsEnabled: undefined,
    };

    #save = () => {
        const { core } = this.props;
        if (!this.state.permissions) {
            this.#saveMemberRestrictions();
            return;
        }
        const task = core.createTask('clients/setPermissions', {
            id: this.props.matches[this.props.matches.length - 2][1],
        }, {
            permissions: this.state.permissions,
        });
        task.on('success', this.#saveMemberRestrictions);
    };
    #saveMemberRestrictions = () => {
        const { core } = this.props;

        const enabled = this.state.memberRestrictionsEnabled !== undefined
            ? this.state.memberRestrictionsEnabled
            : this.props.clientPerms.memberRestrictions && this.props.clientPerms.memberRestrictions !== null;
        const filter = this.state.memberFilter !== undefined
            ? this.state.memberFilter.filter
            : this.props.clientPerms.memberRestrictions && this.props.clientPerms.memberRestrictions.filter;
        const fields = this.state.memberFields !== undefined
            ? this.state.memberFields
            : this.props.clientPerms.memberRestrictions && this.props.clientPerms.memberRestrictions.fields;

        const task = core.createTask('clients/setMemberRestrictions', {
            id: this.props.matches[this.props.matches.length - 2][1],
        }, {
            enabled,
            filter,
            fields,
        });
        task.runOnce().catch(err => {
            console.error(err); // eslint-disable-line no-console
        });
        task.on('success', () => this.props.pop());
    };

    render ({ perms, clientPerms }) {
        const edited = this.state.permissions || this.state.memberRestrictionsEnabled !== undefined
            || this.state.memberFields !== undefined || this.state.memberFilter !== undefined;

        let permsEditor;
        if (clientPerms && clientPerms.permissions && clientPerms.memberRestrictions !== undefined) {
            const editable = perms.hasPerm('clients.perms.update');

            permsEditor = (
                <PermsEditor
                    editable={editable}
                    permissions={this.state.permissions || clientPerms.permissions}
                    memberFields={this.state.memberFields === undefined
                        ? (clientPerms.memberRestrictions && clientPerms.memberRestrictions.fields)
                        : this.state.memberFields}
                    memberFilter={this.state.memberFilter === undefined
                        ? (clientPerms.memberRestrictions && { filter: clientPerms.memberRestrictions.filter })
                        : this.state.memberFilter}
                    memberRestrictionsEnabled={this.state.memberRestrictionsEnabled === undefined
                        ? clientPerms.memberRestrictions !== null
                        : this.state.memberRestrictionsEnabled}
                    onChange={permissions => this.setState({ permissions })}
                    onFieldsChange={fields => this.setState({ memberFields: fields })}
                    onFilterChange={filter => this.setState({ memberFilter: filter })}
                    onMemberRestrictionsEnabledChange={enabled => this.setState({ memberRestrictionsEnabled: enabled })} />
            );
        } else {
            permsEditor = <CircularProgress indeterminate />;
        }

        return (
            <div class="clients-perms-editor">
                <Meta title={locale.perms.title} />
                <AppBarProxy
                    class="clients-perms-editor-app-bar"
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
