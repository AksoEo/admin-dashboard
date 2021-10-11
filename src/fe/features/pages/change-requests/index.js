import { h } from 'preact';
import Page from '../../../components/page';
import SearchFilters from '../../../components/search-filters';
import OverviewList from '../../../components/overview-list';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../components/list-url-coding';
import Meta from '../../meta';
import { codeholderChgReqs as locale } from '../../../locale';
import { coreContext } from '../../../core/connection';
import { FIELDS } from './fields';
import { FILTERS } from './filters';

export default class ChangeRequestsPage extends Page {
    state = {
        parameters: {
            search: {
                field: 'codeholderDescription',
                query: '',
            },
            fields: [
                { id: 'status', sorting: 'none', fixed: true },
                this.codeholderId ? null : ({ id: 'codeholderId', sorting: 'none', fixed: true }),
                { id: 'time', sorting: this.codeholderId ? 'desc' : 'asc', fixed: true },
                { id: 'codeholderDescription', sorting: 'none', fixed: true },
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
            <div class="codeholder-change-requests-page">
                <Meta title={locale.title} />
                <SearchFilters
                    value={parameters}
                    searchFields={[
                        'codeholderDescription',
                        'internalNotes',
                    ]}
                    filters={FILTERS}
                    onChange={parameters => this.setState({ parameters })}
                    locale={{
                        searchPlaceholders: locale.search.placeholders,
                        searchFields: locale.fields,
                        filters: locale.search.filters,
                    }}
                    expanded={expanded}
                    onExpandedChange={expanded => this.setState({ expanded })}
                    inputRef={view => this.#searchInput = view} />
                <OverviewList
                    compact={!!this.codeholderId}
                    task="codeholders/changeRequests"
                    view="codeholders/changeRequest"
                    useDeepCmp
                    options={{ id: this.codeholderId }}
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/shanghopetoj/${id}`}
                    outOfTree={!!this.codeholderId}
                    onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    expanded={expanded}
                    locale={locale.fields} />
            </div>
        );
    }
}