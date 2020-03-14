import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../components/page';
import DetailView from '../../../components/detail';
import Meta from '../../meta';
import { codeholders as locale, detail as detailLocale } from '../../../locale';
import { coreContext, connect } from '../../../core/connection';
import { connectPerms } from '../../../perms';
import { Header, fields, Footer } from './detail-fields';

export default connectPerms(connect('codeholders/fields')(fields => ({
    availableFields: fields,
}))(class Detail extends Page {
    static contextType = coreContext;

    state = {
        edit: null,
    };

    onEndEdit = () => {
        this.props.editing && this.props.editing.pop(true);
        this.setState({ edit: null });
    };

    #commitTask;

    onCommit = changedFields => {
        if (!this.props.editing || this.#commitTask) return;
        if (!changedFields.length) {
            // nothing changed, so we can just pop the editing state
            this.props.editing.pop(true);
            return;
        }

        this.#commitTask = this.context.createTask('codeholders/update', {
            id: +this.props.match[1],
            _changedFields: changedFields,
        }, this.state.edit);
        this.#commitTask.on('success', this.onEndEdit);
        this.#commitTask.on('drop', () => this.#commitTask = null);
    };

    componentWillUnmount () {
        if (this.#commitTask) this.#commitTask.drop();
    }

    render ({ availableFields, editing, match, perms }) {
        if (!availableFields) return;
        const id = match[1];

        const actions = [];
        if (!editing) {
            if (perms.hasPerm('codeholders.perms.read')) {
                actions.push({
                    label: locale.perms.title,
                    action: () => this.props.onNavigate(`/membroj/${id}/permesoj`),
                    overflow: true,
                });
            }
            if (perms.hasPerm('codeholders.update')) {
                actions.push({
                    label: detailLocale.edit,
                    icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                    action: () => this.props.onNavigate(`/membroj/${id}/redakti`, true),
                });
            }
            if (perms.hasCodeholderField('logins', 'r')) {
                actions.push({
                    label: locale.logins.title,
                    action: () => this.props.onNavigate(`/membroj/${id}/ensalutoj`),
                    overflow: true,
                });
            }
            actions.push({
                label: locale.resetPassword.create,
                action: () => this.context.createTask('codeholders/createPassword', { id }, { org: 'akso' }),
                overflow: true,
            }, {
                label: locale.resetPassword.reset,
                action: () => this.context.createTask('codeholders/resetPassword', { id }, { org: 'akso' }),
                overflow: true,
            });
            if (perms.hasPerm('codeholders.delete')) {
                actions.push({
                    label: locale.delete,
                    action: () => this.context.createTask('codeholders/delete', { id }),
                    overflow: true,
                });
            }
        }

        const canReadHistory = perms.hasPerm('codeholders.hist.read');

        return (
            <div class="codeholder-detail-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />
                <DetailView
                    view="codeholders/codeholder"
                    id={id}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    edit={this.state.edit}
                    onEditChange={edit => this.setState({ edit })}
                    onDelete={() => this.props.pop()}
                    makeHistoryLink={canReadHistory
                        ? field => `/membroj/${id}/historio?${field}`
                        : null}
                    options={{ fields: availableFields }}
                    header={Header}
                    fields={fields}
                    footer={Footer}
                    locale={locale} />
            </div>
        );
    }
}));
