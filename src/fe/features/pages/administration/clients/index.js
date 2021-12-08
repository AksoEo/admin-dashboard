import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import Page from '../../../../components/page';
import SearchFilters from '../../../../components/overview/search-filters';
import OverviewList from '../../../../components/lists/overview-list';
import CSVExport from '../../../../components/tasks/csv-export';
import Meta from '../../../meta';
import { clients as locale, search as searchLocale } from '../../../../locale';
import { coreContext } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../../components/overview/list-url-coding';
import { FIELDS } from './fields';
import './style';

export default connectPerms(class Clients extends Page {
    state = {
        parameters: {
            search: {
                field: 'name',
                query: '',
            },
            fields: [
                { id: 'name', sorting: 'asc', fixed: true },
                { id: 'ownerName', sorting: 'none', fixed: true },
                { id: 'ownerEmail', sorting: 'none', fixed: true },
                { id: 'apiKey', sorting: 'none', fixed: true },
            ],
            offset: 0,
            limit: 10,
        },
        csvExportOpen: false,
    };

    static contextType = coreContext;

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

    render ({ perms }, { parameters }) {
        const actions = [];
        if (perms.hasPerm('clients.create')) {
            actions.push({
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.add,
                action: () => this.context.createTask('clients/create'),
            });
        }

        actions.push({
            label: searchLocale.csvExport,
            action: () => this.setState({ csvExportOpen: true }),
            overflow: true,
        });

        return (
            <div class="clients-page">
                <Meta
                    title={locale.title}
                    actions={actions} />
                <SearchFilters
                    value={parameters}
                    searchFields={[
                        'name',
                        'apiKey',
                        'ownerName',
                        'ownerEmail',
                    ]}
                    onChange={parameters => this.setState({ parameters })}
                    locale={{
                        searchPlaceholders: locale.search.placeholders,
                        searchFields: locale.fields,
                    }}
                    inputRef={view => this.#searchInput = view} />
                <OverviewList
                    task="clients/list"
                    view="clients/client"
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/administrado/klientoj/${id}`}
                    onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields}
                    updateView={['clients/sigClients']} />

                <CSVExport
                    open={this.state.csvExportOpen}
                    onClose={() => this.setState({ csvExportOpen: false })}
                    task="clients/list"
                    parameters={parameters}
                    fields={FIELDS}
                    detailView="clients/client"
                    detailViewOptions={id => ({ id, noFetch: true })}
                    locale={{ fields: locale.fields }}
                    filenamePrefix={locale.csvFilename} />
            </div>
        );
    }
});
