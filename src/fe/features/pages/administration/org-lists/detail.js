import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import DetailPage from '../../../../components/detail/detail-page';
import DetailView from '../../../../components/detail/detail';
import { Header, FIELDS } from './fields';
import { orgLists as locale, detail as detailLocale } from '../../../../locale';

export default class OrgListPage extends DetailPage {
    state = {
        edit: null,
    };

    locale = locale;

    get id () {
        return this.props.match[1];
    }

    createCommitTask (changedFields, edit) {
        return this.context.createTask('orgLists/updateList', {
            id: this.id,
            _changedFields: changedFields,
        }, edit);
    }

    renderActions ({ perms }) {
        const actions = [];

        if (perms.hasPerm('org_lists.update')) {
            actions.push({
                label: locale.create.duplicateMenuItem,
                action: () => this.context.createTask('orgLists/createList', {
                    _duplicate: true,
                }, {
                    list: this._data.list,
                }),
                overflow: true,
            });
        }

        if (perms.hasPerm('org_lsits.update')) {
            actions.push({
                label: detailLocale.edit,
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                action: () => this.props.push('redakti', true),
            });
        }

        if (perms.hasPerm('org_lists.delete')) {
            actions.push({
                label: detailLocale.delete,
                action: () => this.context.createTask('orgLists/deleteList', { id: this.id }),
                overflow: true,
            });
        }

        return actions;
    }

    renderContents ({ editing }, { edit }) {
        return (
            <DetailView
                view="orgLists/list"
                id={this.id}
                header={Header}
                fields={FIELDS}
                locale={locale}
                edit={edit}
                onData={data => this._data = data}
                onEditChange={edit => this.setState({ edit })}
                editing={editing}
                onEndEdit={this.onEndEdit}
                onCommit={this.onCommit}
                onDelete={this.onDelete}
                compact />
        );
    }
}
