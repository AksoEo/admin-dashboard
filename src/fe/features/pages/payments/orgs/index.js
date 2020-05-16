import { h } from 'preact';
import Page from '../../../../components/page';
import OverviewList from '../../../../components/overview-list';
import Meta from '../../../meta';
import { paymentOrgs as locale } from '../../../../locale';
import { FIELDS } from './fields';

export default class Orgs extends Page {
    state = {
        parameters: {
            fields: [
                { id: 'org', sorting: 'none', fixed: true },
                { id: 'name', sorting: 'none', fixed: true },
                { id: 'description', sorting: 'none', fixed: true },
            ],
            offset: 0,
            limit: 10,
        },
    };

    render (_, { parameters }) {
        const actions = [];

        return (
            <div class="payment-orgs-page">
                <Meta
                    title={locale.title}
                    actions={actions} />
                <OverviewList
                    task="payments/listOrgs"
                    view="payments/org"
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/pagoj/organizoj/${id}`}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />
            </div>
        );
    }
}
