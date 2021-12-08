import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../../components/page';
import DetailView from '../../../../components/detail/detail';
import Meta from '../../../meta';
import { coreContext } from '../../../../core/connection';
import { FIELDS } from './fields';
import { countries as locale, detail as detailLocale } from '../../../../locale';
import { connectPerms } from '../../../../perms';
import './style';

export default connectPerms(class CountryPage extends Page {
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

        this.#commitTask = this.context.createTask('countries/update', {
            id: this.props.match[1],
            _changedFields: changedFields,
        }, this.state.edit);
        this.#commitTask.on('success', this.onEndEdit);
        this.#commitTask.on('drop', () => this.#commitTask = null);
    };

    componentWillUnmount () {
        if (this.#commitTask) this.#commitTask.drop();
    }

    render ({ perms, match, editing }, { edit }) {
        const id = match[1];

        const actions = [];

        if (perms.hasPerm('countries.update')) {
            actions.push({
                label: detailLocale.edit,
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                action: () => this.props.onNavigate(`/administrado/landoj/${id}/redakti`, true),
            });
        }

        return (
            <div class="country-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />
                <DetailView
                    view="countries/country"
                    id={id}
                    fields={FIELDS}
                    locale={locale}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit} />
            </div>
        );
    }
});
