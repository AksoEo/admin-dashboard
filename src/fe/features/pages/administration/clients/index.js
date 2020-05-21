import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import Page from '../../../../components/page';
import SearchFilters from '../../../../components/search-filters';
import OverviewList from '../../../../components/overview-list';
import { email } from '../../../../components/data';
import CSVExport from '../../../../components/csv-export';
import Meta from '../../../meta';
import { clients as locale, search as searchLocale } from '../../../../locale';
import { coreContext } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';
import { connectContextualActions } from '../../../../context-action';
import { apiKey } from '../../../../components/data';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../../components/list-url-coding';
import './style';

export const FIELDS = {
    name: {
        slot: 'title',
        component ({ value, slot }) {
            if (slot === 'title') return <b>{value}</b>;
            return value;
        },
        stringify: v => v,
    },
    apiKey: {
        skipLabel: true,
        component ({ value }) {
            return <apiKey.inlineRenderer value={value} />;
        },
        stringify: v => Buffer.from(v).toString('hex'),
    },
    ownerName: {
        component ({ value }) {
            return value;
        },
        stringify: v => v,
    },
    ownerEmail: {
        component ({ value }) {
            return <email.inlineRenderer value={value} />;
        },
        stringify: v => v,
    },
};

export default connectContextualActions(connectPerms(class Clients extends Page {
    state = {
        parameters: {
            search: {
                field: 'name',
                query: '',
            },
            fields: [
                { id: 'name', sorting: 'none', fixed: true },
                { id: 'apiKey', sorting: 'none', fixed: true },
                { id: 'ownerName', sorting: 'none', fixed: true },
                { id: 'ownerEmail', sorting: 'none', fixed: true },
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

    render ({ contextualAction, perms }, { parameters }) {
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

        let selection = null;
        if (contextualAction && contextualAction.action === 'select-clients') {
            selection = contextualAction.selected;
        }

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
                    selection={selection}
                    fields={FIELDS}
                    onGetItemLink={id => `/administrado/klientoj/${id}`}
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
}));
