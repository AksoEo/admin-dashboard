import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import Page from '../../../../components/page';
import OverviewList from '../../../../components/lists/overview-list';
import SearchFilters from '../../../../components/overview/search-filters';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../../components/overview/list-url-coding';
import Meta from '../../../meta';
import { membershipEntries as locale } from '../../../../locale';
import { coreContext } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';
import { FIELDS } from './fields';
import { FILTERS } from './filters';

const SEARCHABLE_FIELDS = ['internalNotes'];

export default connectPerms(class RegistrationEntries extends Page {
    state = {
        parameters: {
            search: {
                field: SEARCHABLE_FIELDS[0],
                query: '',
            },
            fields: [
                { id: 'timeSubmitted', sorting: 'desc', fixed: true },
                { id: 'year', sorting: 'none', fixed: true },
                { id: 'codeholderData', sorting: 'none', fixed: true },
                { id: 'status', sorting: 'none', fixed: true },
            ],
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

    #searchInput = null;
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

    render ({ perms }, { parameters, expanded }) {
        const actions = [];
        if (perms.hasPerm('registration.entries.create')) {
            actions.push({
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.create.menuItem,
                action: () => this.context.createTask('memberships/createEntry', {}),
            });
        }

        return (
            <div class="registration-entries-page">
                <Meta
                    title={locale.title}
                    actions={actions} />
                <SearchFilters
                    value={parameters}
                    onChange={parameters => this.setState({ parameters })}
                    expanded={expanded}
                    onExpandedChange={expanded => this.setState({ expanded })}
                    searchFields={SEARCHABLE_FIELDS}
                    filters={FILTERS}
                    locale={{
                        searchPlaceholders: locale.search.placeholders,
                        searchFields: locale.search.fields,
                        filters: locale.filters,
                    }}
                    inputRef={view => this.#searchInput = view}
                    filtersToAPI="memberships/entryFiltersToAPI"
                    category="registr_entries" />
                <OverviewList
                    expanded={expanded}
                    task="memberships/listEntries"
                    view="memberships/entry"
                    updateView={['memberships/sigEntries']}
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/membreco/alighoj/${id}`}
                    onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />
            </div>
        );
    }
});
