import { h } from 'preact';
import Page from '../../../components/page';
import SearchFilters from '../../../components/search-filters';
import OverviewList from '../../../components/overview-list';
import Meta from '../../meta';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../components/list-url-coding';
import { congresses as locale } from '../../../locale';
import { FIELDS } from './fields';

export default class CongressesPage extends Page {
    state = {
        parameters: {
            search: {
                field: 'name',
                query: '',
            },
            fields: [
                { id: 'org', sorting: 'none', fixed: true },
                { id: 'abbrev', sorting: 'none', fixed: true },
                { id: 'name', sorting: 'asc', fixed: true },
            ],
            offset: 0,
            limit: 10,
        },
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
        const actions = [];

        return (
            <div class="congresses-page">
                <Meta
                    title={locale.title}
                    actions={actions} />
                <SearchFilters
                    value={parameters}
                    searchFields={[
                        'name',
                        'abbrev',
                    ]}
                    onChange={parameters => this.setState({ parameters })}
                    locale={{
                        searchPlaceholders: locale.search.placeholders,
                        searchFields: locale.fields,
                    }}
                    inputRef={view => this.#searchInput = view} />
                <OverviewList
                    task="congresses/list"
                    view="congresses/congress"
                    updateView={['congresses/sigCongresses']}
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/kongresoj/${id}`}
                    onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />
            </div>
        );
    }
}
