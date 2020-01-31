import { h } from 'preact';
import CheckIcon from '@material-ui/icons/Check';
import Page from '../../../../components/page';
import SearchFilters from '../../../../components/search-filters';
import OverviewList from '../../../../components/overview-list';
import Meta from '../../../meta';
import { countries as locale } from '../../../../locale';
import './style';

const FIELDS = {
    code: {
        weight: 0.5,
        component ({ value }) {
            return <span class="country-code">{value}</span>;
        },
    },
    enabled: {
        weight: 0.5,
        component ({ value }) {
            return value ? <CheckIcon /> : null;
        },
    },
    name_eo: {
        component ({ value }) {
            return <span class="country-name">{value}</span>;
        },
    },
};

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
            limit: 10,
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
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />
            </div>
        );
    }
}
