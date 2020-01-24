import { h } from 'preact';
import Page from '../../../../components/page';
import Meta from '../../../meta';
import { clients as locale } from '../../../../locale';
import { coreContext } from '../../../../core/connection';

export default class ClientDetailPage extends Page {
    static contextType = coreContext;

    render ({ match }) {
        const id = match[1];

        const actions = [];
        actions.push({
            label: locale.delete,
            action: () => this.context.createTask('clients/delete', {}, { id }),
            overflow: true,
        });

        return (
            <div class="client-detail-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />

                perms and stuff
            </div>
        );
    }
}
