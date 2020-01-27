import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import Page from '../../../../components/page';
import SearchFilters from '../../../../components/search-filters';
import OverviewList from '../../../../components/overview-list';
import Meta from '../../../meta';
import { adminGroups as locale } from '../../../../locale';
import { coreContext } from '../../../../core/connection';

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
                field: 'name',
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

    static contextType = coreContext;

    render (_, { parameters }) {
        const actions = [];
        actions.push({
            icon: <AddIcon />,
            label: locale.add,
            action: () => this.context.createTask('adminGroups/create'),
        });

        return (
            <div class="admin-groups-page">
                <Meta
                    title={locale.title}
                    actions={actions} />
                <SearchFilters
                    value={parameters}
                    onChange={parameters => this.setState({ parameters })}
                    locale={{
                        searchPlaceholders: locale.search.placeholders,
                    }} />
                <OverviewList
                    task="adminGroups/list"
                    view="adminGroups/group"
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/administrado/grupoj/${id}`}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields}
                    updateView={['adminGroups/sigList']} />
            </div>
        );
    }
}
