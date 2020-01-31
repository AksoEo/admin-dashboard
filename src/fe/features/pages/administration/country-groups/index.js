import { h } from 'preact';
import Page from '../../../../components/page';
import SearchFilters from '../../../../components/search-filters';
import OverviewList from '../../../../components/overview-list';
import Meta from '../../../meta';
import { countryGroups as locale } from '../../../../locale';
import { FIELDS } from './fields';
import './style';

export default class CountryGroupsPage extends Page {
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
        return (
            <div class="country-groups-page">
                <Meta
                    title={locale.title} />
                <SearchFilters
                    value={parameters}
                    onChange={parameters => this.setState({ parameters })}
                    locale={{
                        searchPlaceholders: locale.search.placeholders,
                    }} />
                <OverviewList
                    task="countries/listGroups"
                    view="countries/group"
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
