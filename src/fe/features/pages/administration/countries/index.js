import { h } from 'preact';
import Page from '../../../../components/page';
import SearchFilters from '../../../../components/search-filters';
import OverviewList from '../../../../components/overview-list';
import Meta from '../../../meta';
import { countries as locale } from '../../../../locale';
import { FIELDS } from './fields';
import './style';

export default class CountriesPage extends Page {
    state = {
        parameters: {
            search: {
                query: '',
            },
            fields: [
                { id: 'code', sorting: 'asc' },
                { id: 'enabled', sorting: 'none' },
                { id: 'name_eo', sorting: 'none' },
            ],
            offset: 0,
            limit: 300,
        },
    };

    render (_, { parameters }) {
        return (
            <div class="countries-page">
                <Meta
                    title={locale.title} />
                <SearchFilters
                    value={parameters}
                    onChange={parameters => this.setState({ parameters })}
                    locale={{
                        searchPlaceholders: locale.search.placeholders,
                    }} />
                <OverviewList
                    task="countries/list"
                    view="countries/country"
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/administrado/landoj/${id}`}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields}
                    limits={[10, 20, 100, 200, 300]} />
            </div>
        );
    }
}
