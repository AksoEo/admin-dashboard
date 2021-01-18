import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../../components/page';
import DetailView from '../../../../components/detail';
import Meta from '../../../meta';
import { connectPerms } from '../../../../perms';
import { membershipOptions as locale } from '../../../../locale';
import { FIELDS } from './fields';

export default connectPerms(class RegistrationOptions extends Page {
    get id () {
        return +this.props.match[1];
    }

    render ({ perms, editing }, { edit }) {
        const id = this.id;
        const actions = [];

        return (
            <div class="registration-options-detail-page">
                <Meta
                    title={locale.title}
                    actions={actions} />

                <DetailView
                    view="memberships/options"
                    id={id}
                    fields={FIELDS}
                    locale={locale}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    onDelete={() => this.props.pop()} />
            </div>
        );
    }
});
