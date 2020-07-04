import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../components/page';
import DetailView from '../../../components/detail';
import Meta from '../../meta';
import { coreContext } from '../../../core/connection';
import { connectPerms } from '../../../perms';
import { congresses as locale } from '../../../locale';
import { FIELDS } from './fields';

export default connectPerms(class CongressDetailPage extends Page {
    state = {
        edit: null,
        org: 'meow', // dummy placeholder
    };

    static contextType = coreContext;

    #commitTask = null;
    onCommit = changedFields => {
        if (!this.props.editing || this.#commitTask) return;
        if (!changedFields.length) {
            // nothing changed, so we can just pop the editing state
            this.props.editing.pop(true);
            return;
        }

        this.#commitTask = this.context.createTask('congresses/update', {
            id: this.props.match[1],
            _changedFields: changedFields,
        }, this.state.edit);
        this.#commitTask.on('success', this.onEndEdit);
        this.#commitTask.on('drop', () => this.#commitTask = null);
    };
    onEndEdit = () => {
        this.props.editing && this.props.editing.pop(true);
        this.setState({ edit: null });
    };

    render ({ match, perms, editing }, { org }) {
        const id = +match[1];

        const actions = [];

        if (perms.hasPerm(`congresses.delete.${org}`)) {
            actions.push({
                label: locale.delete.menuItem,
                action: () => this.context.createTask('congresses/delete', {}, { id }),
                overflow: true,
            });
        }

        if (perms.hasPerm(`congresses.update.${org}`)) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
                action: () => {
                    this.props.onNavigate(`/kongresoj/${id}/redakti`, true);
                },
            });
        }

        return (
            <div class="congresses-detail-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />
                <DetailView
                    view="congresses/congress"
                    id={id}
                    editing={editing}
                    edit={this.state.edit}
                    onEditChange={edit => this.setState({ edit })}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    fields={FIELDS}
                    onData={data => data && this.setState({ org: data.org })}
                    locale={locale}
                    onDelete={() => this.props.pop()} />
            </div>
        );
    }
});
