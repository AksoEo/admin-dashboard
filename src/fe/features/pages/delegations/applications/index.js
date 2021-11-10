import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import Page from '../../../../components/page';
import SearchFilters from '../../../../components/search-filters';
import OverviewList from '../../../../components/overview-list';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../../components/list-url-coding';
import Meta from '../../../meta';
import { delegationApplications as locale } from '../../../../locale';
import { coreContext } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';
import { FIELDS } from './fields';
import { FILTERS } from './filters';

export default connectPerms(class DelegateApplicationsPage extends Page {
    state = {
        parameters: {
            search: {
                field: 'internalNotes',
                query: '',
            },
            fields: [
                { id: 'org', sorting: 'none', fixed: true },
                { id: 'status', sorting: 'desc', fixed: true },
                { id: 'codeholderId', sorting: 'asc', fixed: true },
                { id: 'cities', sorting: 'none', fixed: true },
                { id: 'countries', sorting: 'none', fixed: true },
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

    render ({ perms }, { parameters, expanded }) {
        const actions = [];

        // TODO: better perm check across orgs?
        if (perms.hasPerm('delegations.applications.read.uea')) {
            actions.push({
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.create.menuItem,
                action: () => this.context.createTask('delegations/createApplication', {}, {}),
            });
        }

        return (
            <div class="delegation-applications-page">
                <Meta title={locale.title} actions={actions} />
                <SearchFilters
                    value={parameters}
                    searchFields={[
                        'internalNotes',
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
                    task={'delegations/listApplications'}
                    updateView={['delegations/sigApplications']}
                    view="delegations/application"
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/delegitoj/kandidatighoj/${id}`}
                    onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    expanded={expanded}
                    locale={locale.fields} />
            </div>
        );
    }
});
