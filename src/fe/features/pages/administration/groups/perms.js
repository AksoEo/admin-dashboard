import { h } from 'preact';
import { AppBarProxy, Button, MenuIcon, CircularProgress } from '@cpsdqs/yamdl';
import DoneIcon from '@material-ui/icons/Done';
import Meta from '../../../meta';
import Page from '../../../../components/page';
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
        const task = core.createTask('adminGroups/setPermissions', {
            id: +this.props.matches[this.props.matches.length - 2][1],
        }, {
            permissions: this.state.permissions,
        });
        task.on('success', this.#saveMemberRestrictions);
    };
    #saveMemberRestrictions = () => {
        const { core } = this.props;

        const filter = this.state.memberFilter !== undefined
            ? this.state.memberFilter.filter
            : this.props.group.memberRestrictions && this.props.group.memberRestrictions.filter;
        const fields = this.state.memberFields !== undefined
            ? this.state.memberFields
            : this.props.group.memberRestrictions && this.props.group.memberRestrictions.fields;

        const task = core.createTask('adminGroups/update', {
            id: +this.props.matches[this.props.matches.length - 2][1],
            _noEditors: true,
        }, {
            memberRestrictions: { filter, fields },
        });
        task.runOnce().catch(err => {
            console.error(err); // eslint-disable-line no-console
        });
        task.on('success', () => this.props.pop());
    };

    render ({ perms, group }) {
        const edited = this.state.permissions || this.state.memberRestrictionsEnabled !== undefined
            || this.state.memberFields !== undefined || this.state.memberFilter !== undefined;

        let permsEditor;
        if (group && group.permissions && group.id) {
            permsEditor = (
                <PermsEditor
                    editable={perms.hasPerm('admin_groups.update')}
                    permissions={this.state.permissions || group.permissions}
                    memberFields={this.state.memberFields === undefined
                        ? (group.memberRestrictions && group.memberRestrictions.fields)
                        : this.state.memberFields}
                    memberFilter={this.state.memberFilter === undefined
                        ? (group.memberRestrictions && { filter: group.memberRestrictions.filter })
                        : this.state.memberFilter}
                    memberRestrictionsEnabled={this.state.memberRestrictionsEnabled === undefined
                        ? group.memberRestrictions !== null
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
}));
