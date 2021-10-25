import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import Page from '../../../../components/page';
import SearchFilters from '../../../../components/search-filters';
import OverviewList from '../../../../components/overview-list';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../../components/list-url-coding';
import Meta from '../../../meta';
import {
    delegations as locale,
    delegationSubjects as subjectsLocale,
    delegationApplications as applicationsLocale,
} from '../../../../locale';
import { coreContext } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';
import { FIELDS } from './fields';
import { FILTERS } from './filters';

export default connectPerms(class DelegatesPage extends Page {
    state = {
        parameters: {
            search: {
                field: 'hosting.description',
                query: '',
            },
            fields: [
                { id: 'org', sorting: 'none', fixed: true },
                { id: 'codeholderId', sorting: this.codeholderId ? 'none' : 'asc', fixed: true },
                { id: 'cities', sorting: 'none', fixed: true },
                { id: 'countries', sorting: 'none', fixed: true },
                { id: 'approvedTime', sorting: 'none', fixed: true },
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

    get codeholderId () {
        return this.props.matches.codeholder ? +this.props.matches.codeholder[1] : null;
    }

    render ({ perms }, { parameters, expanded }) {
        const actions = [];

        actions.push({
            label: subjectsLocale.title,
            action: () => this.props.push('fakoj'),
        });

        actions.push({
            label: applicationsLocale.title,
            action: () => this.props.push('kandidatighoj'),
        });

        // TODO: better perm check across orgs?
        if (perms.hasPerm('codeholders.delegations.create.uea')) {
            actions.push({
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.create.menuItem,
                action: () => this.context.createTask('codeholders/createDelegations', {}, {
                    codeholderId: this.codeholderId,
                }),
            });
        }

        return (
            <div class="delegations-delegates-page">
                <Meta title={locale.title} actions={actions} />
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
                    task={this.codeholderId ? 'codeholders/listDelegations' : 'delegations/listDelegates'}
                    options={this.codeholderId ? { id: this.codeholderId } : null}
                    updateView={['codeholders/sigDelegations']}
                    useDeepCmp
                    view="codeholders/delegation"
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={(id, data) => `/delegitoj/${data.codeholderId}/${data.org}`}
                    outOfTree
                    onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    expanded={expanded}
                    locale={locale.fields} />
            </div>
        );
    }
});
