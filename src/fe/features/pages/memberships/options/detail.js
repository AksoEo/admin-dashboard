import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../../components/page';
import DetailView from '../../../../components/detail/detail';
import Meta from '../../../meta';
import { connectPerms } from '../../../../perms';
import { coreContext } from '../../../../core/connection';
import { membershipOptions as locale } from '../../../../locale';
import { FIELDS } from './fields';

export default connectPerms(class RegistrationOptions extends Page {
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

        this.#commitTask = this.context.createTask('memberships/updateOptions', {
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
        return +this.props.match[1];
    }

    render ({ perms, editing }, { edit }) {
        const id = this.id;
        const actions = [];

        if (perms.hasPerm('registration.options.update')) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
                action: () => this.props.push('redakti', true),
            });
        }

        if (perms.hasPerm('registration.options.delete')) {
            actions.push({
                label: locale.delete.menuItem,
                action: () => this.context.createTask('memberships/deleteOptions', { id }),
                overflow: true,
            });
        }

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
