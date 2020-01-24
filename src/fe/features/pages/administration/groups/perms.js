import { h } from 'preact';
import Meta from '../../../meta';
import Page from '../../../../components/page';
import PermsEditor from '../perms-editor';
import { adminGroups as locale } from '../../../../locale';

export default class AdminGroupPermsEditor extends Page {
    state = {
        TEMP: [
            'codeholders.read',
            'codeholders.update',
            'codeholders.delete',
            'admin_groups.*',
            'cats',
        ],
        TEMP2: {
            birthdate: 'r',
            profilePicture: 'r',
            profilePictureHash: 'rw',
        },
    };

    render ({ matches }) {
        const groupId = +matches[matches.length - 1][1];

        return (
            <div class="admin-group-perms-editor">
                <Meta title={locale.permsTitle} />
                <PermsEditor
                    permissions={this.state.TEMP}
                    memberFields={this.state.TEMP2}
                    onChange={permissions => this.setState({ TEMP: permissions })}
                    onFieldsChange={fields => this.setState({ TEMP2: fields })} />
            </div>
        );
    }
}
