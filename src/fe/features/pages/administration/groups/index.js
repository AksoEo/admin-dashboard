import { h } from 'preact';
import Page from '../../../../components/page';
import OverviewList from '../../../../components/overview-list';
import Meta from '../../../meta';
import { adminGroups as locale } from '../../../../locale';

const FIELDS = {
    name: {
        component ({ value }) {
            return value;
        },
    },
    description: {
        component ({ value }) {
            return value;
        },
    },
};

export default class AdminGroups extends Page {
    state = {
        parameters: {
            search: {
                field: null,
                query: '',
            },
            fields: [
                { id: 'name', sorting: 'none', fixed: true },
                { id: 'description', sorting: 'none', fixed: true },
            ],
            offset: 0,
            limit: 10,
        },
    };

    render (_, { parameters }) {
        return (
            <div class="admin-groups-page">
                <Meta title={locale.title} />
                <OverviewList
                    task="adminGroups/list"
                    view="adminGroups/group"
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/administrado/grupoj/${id}`}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />
            </div>
        );
    }
}
