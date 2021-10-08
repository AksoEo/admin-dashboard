import { h } from 'preact';
import Page from '../../../../components/page';
import SearchFilters from '../../../../components/search-filters';
import OverviewList from '../../../../components/overview-list';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../../components/list-url-coding';
import Meta from '../../../meta';
import { delegations as locale } from '../../../../locale';
import { coreContext } from '../../../../core/connection';
import { FIELDS } from './fields';
import { FILTERS } from './filters';

export default class DelegatesPage extends Page {
    state = {
        parameters: {
            search: {
                field: 'hosting.description',
                query: '',
            },
            fields: [
                { id: 'org', sorting: 'none', fixed: true },
                { id: 'codeholderId', sorting: 'asc', fixed: true },
                { id: 'countries', sorting: 'none', fixed: true },
                { id: 'approvedTime', sorting: 'none', fixed: true },
            ].filter(x => x),
            filters: {},
            jsonFilter: {
                _disabled: true,
                filter: {},
            },
            offset: 0,
            limit: 10,
        },
        expanded: false,
    };

    static contextType = coreContext;

    #searchInput;
    #currentQuery = '';

    decodeURLQuery () {
        this.setState({
            parameters: applyDecoded(decodeURLQuery(this.props.query, FILTERS), this.state.parameters),
        });
        this.#currentQuery = this.props.query;
    }

    encodeURLQuery () {
        const encoded = encodeURLQuery(this.state.parameters, FILTERS);
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

    get codeholderId () {
        return this.props.matches.codeholder ? +this.props.matches.codeholder[1] : null;
    }

    render (_, { parameters, expanded }) {
        return (
            <div class="delegations-delegates-page">
                <Meta title={locale.title} />
                <SearchFilters
                    value={parameters}
                    searchFields={[
                        'hosting.description',
                    ]}
                    filters={FILTERS}
                    onChange={parameters => this.setState({ parameters })}
                    locale={{
                        searchPlaceholders: locale.search.placeholders,
                        searchFields: locale.search.fields,
                        filters: locale.search.filters,
                    }}
                    expanded={expanded}
                    onExpandedChange={expanded => this.setState({ expanded })}
                    inputRef={view => this.#searchInput = view} />
                <OverviewList
                    task="delegations/listDelegates"
                    view="codeholders/delegation"
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={(id, data) => `/membroj/${data.codeholderId}/delegitoj/${data.org}`}
                    outOfTree
                    onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    expanded={expanded}
                    locale={locale.fields} />
            </div>
        );
    }
}
