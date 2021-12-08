import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../../components/page';
import DetailView from '../../../../components/detail/detail';
import Meta from '../../../meta';
import { connectPerms } from '../../../../perms';
import { coreContext } from '../../../../core/connection';
import { delegations as locale } from '../../../../locale';
import { FIELDS } from './fields';

export default connectPerms(class Delegations extends Page {
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

        this.#commitTask = this.context.createTask('codeholders/setDelegations', {
            id: this.codeholder,
            org: this.org,
            _changedFields: changedFields,
        }, this.state.edit);
        this.#commitTask.on('success', this.onEndEdit);
        this.#commitTask.on('drop', () => this.#commitTask = null);
    };

    componentWillUnmount () {
        if (this.#commitTask) this.#commitTask.drop();
    }

    get codeholder () {
        return +this.props.matches.codeholder[1];
    }

    get org () {
        return this.props.matches.org[1];
    }

    render ({ perms, editing }, { edit }) {
        const actions = [];

        if (perms.hasPerm(`codeholders.delegations.update.${this.org}`)) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
                action: () => this.props.push('redakti', true),
            });
        }

        if (perms.hasPerm(`codeholders.delegations.delete.${this.org}`)) {
            actions.push({
                label: locale.delete.menuItem,
                action: () => this.context.createTask('codeholders/deleteDelegations', {
                    id: this.codeholder,
                    org: this.org,
                }),
                overflow: true,
            });
        }

        return (
            <div class="delegations-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />

                <DetailView
                    view="codeholders/delegation"
                    id={this.codeholder}
                    options={{ org: this.org }}
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
