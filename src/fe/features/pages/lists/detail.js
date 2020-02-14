import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import { CircularProgress } from '@cpsdqs/yamdl';
import Page from '../../../components/page';
import Meta from '../../meta';
import { connect } from '../../../core/connection';
import { connectPerms } from '../../../perms';
import { lists as locale } from '../../../locale';

export default connect(props => ['lists/list', {
    id: props.match[1],
}])((item, core) => ({ item, core }))(connectPerms(class ListDetailPage extends Page {
    render ({ item, core, match, perms }) {
        if (!item) return (
            <div class="list-detail-page is-loading">
                <CircularProgress indeterminate />
            </div>
        );

        const id = match[1];

        const actions = [];

        if (perms.hasPerm('lists.delete')) {
            actions.push({
                label: locale.delete,
                action: () => core.createTask('lists/delete', {}, { id }),
                overflow: true,
            });
        }

        if (perms.hasPerm('lists.update') && perms.hasPerm('codeholders.read')) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update,
                action: () => core.createTask('lists/update', { id }, { ...item }),
            });
        }

        return (
            <div class="list-detail-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />

                stuff goes here

                {item.name}
            </div>
        );
    }
}));
