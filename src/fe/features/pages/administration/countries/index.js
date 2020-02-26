import { h } from 'preact';
import Page from '../../../../components/page';
import SearchFilters from '../../../../components/search-filters';
import OverviewList from '../../../../components/overview-list';
import CSVExport from '../../../../components/csv-export';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../../components/list-url-coding';
import Meta from '../../../meta';
import { countries as locale, search as searchLocale } from '../../../../locale';
import { FIELDS } from './fields';
import './style';

export default class CountriesPage extends Page {
    state = {
        parameters: {
            search: {
                field: 'name_eo',
                query: '',
            },
            fields: [
                { id: 'code', sorting: 'none', fixed: true },
                { id: 'enabled', sorting: 'none', fixed: true },
                { id: 'name_eo', sorting: 'none', fixed: true },
            ],
            offset: 0,
            limit: 300,
        },
        csvExportOpen: false,
    };

    #searchInput;
    #currentQuery = '';

    decodeURLQuery () {
        this.setState({
            parameters: applyDecoded(decodeURLQuery(this.props.query, {}), this.state.parameters),
        });
        this.#currentQuery = this.props.query;
    }

    encodeURLQuery () {
        const encoded = encodeURLQuery(this.state.parameters, {});
        if (encoded === this.#currentQuery) return;
        this.#currentQuery = encoded;
        this.props.onQueryChange(encoded);
    }

    componentDidMount () {
        this.decodeURLQuery();

        this.#searchInput.focus(500);
    }

    componentDidUpdate (prevProps, prevState) {
        if (prevProps.query !== this.props.query && this.props.query !== this.#currentQuery) {
            this.decodeURLQuery();
        }
        if (prevState.parameters !== this.state.parameters) {
            this.encodeURLQuery();
        }
    }

    render (_, { parameters }) {
        const actions = [
            {
                label: searchLocale.csvExport,
                action: () => this.setState({ csvExportOpen: true }),
                overflow: true,
            },
        ];

        return (
            <div class="countries-page">
                <Meta
                    title={locale.title}
                    actions={actions} />
                <SearchFilters
                    value={parameters}
                    onChange={parameters => this.setState({ parameters })}
                    locale={{
                        searchPlaceholders: locale.search.placeholders,
                    }}
                    inputRef={view => this.#searchInput = view} />
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

                <CSVExport
                    open={this.state.csvExportOpen}
                    onClose={() => this.setState({ csvExportOpen: false })}
                    task="countries/list"
                    parameters={parameters}
                    fields={FIELDS}
                    detailView="countries/country"
                    detailViewOptions={id => ({ id, noFetch: true })}
                    locale={{ fields: locale.fields }}
                    filenamePrefix={locale.csvFilename} />
            </div>
        );
    }
}
