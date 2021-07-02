import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../../components/page';
import DetailView from '../../../../components/detail';
import Meta from '../../../meta';
import { coreContext } from '../../../../core/connection';
import { FIELDS } from './fields';
import { countryLists as locale, detail as detailLocale } from '../../../../locale';
import { connectPerms } from '../../../../perms';

export default connectPerms(class CountryListsPage extends Page {
    static contextType = coreContext;

    state = {
        edit: null,
    };

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

        this.#commitTask = this.context.createTask('countryLists/update', {
            id: this.props.match[1],
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

        if (perms.hasPerm('countries.lists.update')) {
            actions.push({
                label: detailLocale.edit,
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                action: () => this.props.push('redakti', true),
            });
        }

        if (perms.hasPerm('countries.lists.delete')) {
            actions.push({
                label: detailLocale.delete,
                action: () => this.context.createTask('countryLists/deleteList', { id: this.id }),
                overflow: true,
            });
        }

        return (
            <div class="country-org-list-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />
                <DetailView
                    view="countryLists/list"
                    id={this.id}
                    fields={FIELDS}
                    locale={locale}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    onDelete={this.props.pop} />
            </div>
        );
    }
});
