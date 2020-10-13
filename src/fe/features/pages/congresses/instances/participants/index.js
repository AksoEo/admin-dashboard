import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../../../components/list-url-coding';
import SearchFilters from '../../../../../components/search-filters';
import OverviewList from '../../../../../components/overview-list';
import DetailShell from '../../../../../components/detail-shell';
import { congressParticipants as locale } from '../../../../../locale';
import { FIELDS } from './fields';
import { FILTERS } from './filters';

export default class ParticipantsView extends PureComponent {
    state = {
        parameters: {
            search: {
                field: 'notes',
                query: '',
            },
            filters: {},
            jsonFilter: {
                _disabled: true,
                filter: {},
            },
            fields: [
                { id: 'isValid', sorting: 'none', fixed: true },
                { id: 'codeholderId', sorting: 'none', fixed: true },
                { id: 'approved', sorting: 'none', fixed: true },
                { id: 'price', sorting: 'none', fixed: true },
                { id: 'paid', sorting: 'none', fixed: true },
            ],
            offset: 0,
            limit: 10,
        },
        expanded: false,

        currency: null,
    };

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
        if (this.#searchInput) this.#searchInput.focus(500);
    }

    componentDidUpdate (prevProps, prevState) {
        if (prevProps.query !== this.props.query && this.props.query !== this.#currentQuery) {
            this.decodeURLQuery();
        }
        if (prevState.parameters !== this.state.parameters) {
            this.encodeURLQuery();
        }
    }

    render ({ congress, instance }, { parameters, expanded, currency }) {
        // TODO: hide this page if the user does not have permission?
        return (
            <div class="participants-view">
                <SearchFilters
                    value={parameters}
                    searchFields={[
                        'notes',
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
                    inputRef={view => this.#searchInput = view}
                    userData={{ congress, instance, currency }} />
                <OverviewList
                    expanded={expanded}
                    useDeepCmp options={{ congress, instance }}
                    viewOptions={{ congress, instance }}
                    task="congresses/listParticipants"
                    view="congresses/participant"
                    updateView={['congresses/sigParticipants', { congress, instance }]}
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/kongresoj/${congress}/okazigoj/${instance}/alighintoj/${id}`}
                    onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields}
                    userData={{ congress, instance, currency }} />
                <DetailShell
                    /* a hack to get the currency */
                    view="congresses/registrationForm"
                    options={{ congress, instance }}
                    id="irrelevant" // detail shell won't work without one
                    fields={{}}
                    locale={{}}
                    onData={data => data && this.setState({
                        currency: data.price ? data.price.currency : null,
                    })} />
            </div>
        );
    }
}