import { h } from 'preact';
import { Fragment } from 'preact/compat';
import EditIcon from '@material-ui/icons/Edit';
import DetailPage from '../../../components/detail/detail-page';
import DetailView from '../../../components/detail/detail';
import { newsletters as locale } from '../../../locale';
import { FIELDS } from './fields';

export default class Newsletter extends DetailPage {
    state = {
        org: null,
    };

    locale = locale;

    get id () {
        return +this.props.match[1];
    }

    createCommitTask (changedFields, edit) {
        return this.context.createTask('newsletters/update', {
            id: this.id,
            _changedFields: changedFields,
        }, edit);
    }

    renderActions ({ perms }, { org }) {
        const actions = [];

        if (perms.hasPerm(`newsletters.${org}.update`)) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
                action: this.onBeginEdit,
            });
        }

        if (perms.hasPerm(`newsletters.${org}.delete`)) {
            actions.push({
                label: locale.delete.menuItem,
                action: () => this.context.createTask('newsletters/delete', { id: this.id }),
                overflow: true,
            });
        }

        return actions;
    }

    renderContents ({ editing }, { edit }) {
        return (
            <Fragment>
                <DetailView
                    view="newsletters/newsletter"
                    id={this.id}
                    fields={FIELDS}
                    locale={locale}
                    edit={edit}
                    onData={data => data && this.setState({ org: data.org })}
                    onEditChange={edit => this.setState({ edit })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    onDelete={this.onDelete} />
            </Fragment>
        );
    }
}
