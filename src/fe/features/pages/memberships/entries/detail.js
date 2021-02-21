import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../../components/page';
import DetailView from '../../../../components/detail';
import Meta from '../../../meta';
import { connectPerms } from '../../../../perms';
import { coreContext } from '../../../../core/connection';
import { membershipEntries as locale } from '../../../../locale';
import { Header, FIELDS } from './fields';

export default connectPerms(class RegistrationEntry extends Page {
    state = {
        edit: null,
    };

    static contextType = coreContext;

    onEndEdit = () => {
        this.props.editing && this.props.editing.pop(true);
        this.setState({ edit: null });
    };

    #commitTask = null;
    onCommit = changedFields => {
        if (!this.props.editing || this.#commitTask) return;
        if (!changedFields.length) {
            // nothing changed, so we can just pop the editing state
            this.props.editing.pop(true);
            return;
        }

        this.#commitTask = this.context.createTask('memberships/updateEntry', {
            id: this.id,
            _changedFields: changedFields,
        }, this.state.edit);
        this.#commitTask.on('success', this.onEndEdit);
        this.#commitTask.on('drop', () => this.#commitTask = null);
    };

    componentWillUnmount () {
        if (this.#commitTask) this.#commitTask.drop();
    }

    get id () {
        return this.props.match[1];
    }

    render ({ perms, editing }, { edit }) {
        const actions = [];

        const id = this.id;

        if (perms.hasPerm('registration.entries.update')) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
                action: () => this.props.push('redakti', true),
            });
        }

        if (perms.hasPerm('registration.entries.delete')) {
            actions.push({
                label: locale.delete.menuItem,
                action: () => this.context.createTask('memberships/deleteEntry', { id }),
                overflow: true,
            });
        }

        return (
            <div class="registration-entry-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />

                <DetailView
                    view="memberships/entry"
                    id={id}
                    header={Header}
                    fields={FIELDS}
                    options={{
                        fields: ['year', 'status', 'issue', 'newCodeholderId', 'timeSubmitted',
                            'internalNotes', 'offers', 'codeholderData'],
                    }}
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
