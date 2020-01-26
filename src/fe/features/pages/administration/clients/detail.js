import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import { CircularProgress } from '@cpsdqs/yamdl';
import Page from '../../../../components/page';
import Meta from '../../../meta';
import { connect } from '../../../../core/connection';
import { clients as locale } from '../../../../locale';
import { coreContext } from '../../../../core/connection';

export default connect(props => ['clients/client', {
    id: props.match[1],
}])((item, core) => ({ item, core }))(class ClientDetailPage extends Page {
    render ({ item, core, match }) {
        if (!item) return (
            <div class="client-detail-page is-loading">
                <CircularProgress indeterminate />
            </div>
        );

        const id = match[1];

        const actions = [];
        actions.push({
            label: locale.delete,
            action: () => core.createTask('clients/delete', {}, { id }),
            overflow: true,
        });

        actions.push({
            icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
            label: locale.update,
            action: () => core.createTask('clients/update', { id }, { ...item }),
        });

        return (
            <div class="client-detail-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />

                perms and stuff
                {item.name}
            </div>
        );
    }
});
