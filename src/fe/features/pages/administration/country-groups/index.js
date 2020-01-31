import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import Page from '../../../../components/page';
import SearchFilters from '../../../../components/search-filters';
import OverviewList from '../../../../components/overview-list';
import Meta from '../../../meta';
import { countryGroups as locale } from '../../../../locale';
import { coreContext } from '../../../../core/connection';
import { FIELDS } from './fields';
import './style';

export default class CountryGroupsPage extends Page {
    static contextType = coreContext;

    state = {
        parameters: {
            search: {
                query: '',
            },
            fields: [
                { id: 'code', sorting: 'asc' },
                { id: 'name', sorting: 'none' },
            ],
            offset: 0,
            limit: 10,
        },
    };

    render (_, { parameters }) {
        const actions = [];

        actions.push({
            icon: <AddIcon />,
            label: locale.create.menuItem,
            action: () => this.context.createTask('countries/createGroup'),
        });

        return (
            <div class="country-groups-page">
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
                    task="countries/listGroups"
                    view="countries/group"
                    updateView={['countries/sigCountryGroups']}
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/administrado/landgrupoj/${id}`}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />
            </div>
        );
    }
}
