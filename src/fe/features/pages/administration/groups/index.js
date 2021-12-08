import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import Page from '../../../../components/page';
import SearchFilters from '../../../../components/overview/search-filters';
import OverviewList from '../../../../components/lists/overview-list';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../../components/overview/list-url-coding';
import CSVExport from '../../../../components/tasks/csv-export';
import Meta from '../../../meta';
import { adminGroups as locale, search as searchLocale } from '../../../../locale';
import { coreContext } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';

const FIELDS = {
    name: {
        sortable: true,
        slot: 'title',
        component ({ value, slot }) {
            if (slot === 'title') return <b>{value}</b>;
            return value;
        },
        stringify: v => v,
    },
    description: {
        skipLabel: true,
        component ({ value }) {
            return value;
        },
        stringify: v => v,
    },
};

export default connectPerms(class AdminGroups extends Page {
    state = {
        parameters: {
            search: {
                field: 'name',
                query: '',
            },
            fields: [
                { id: 'name', sorting: 'asc', fixed: true },
                { id: 'description', sorting: 'none', fixed: true },
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

        if (perms.hasPerm('admin_groups.create')) {
            actions.push({
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.add,
                action: () => this.context.createTask('adminGroups/create'),
            });
        }

        actions.push({
            label: searchLocale.csvExport,
            action: () => this.setState({ csvExportOpen: true }),
            overflow: true,
        });

        return (
            <div class="admin-groups-page">
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
                    task="adminGroups/list"
                    view="adminGroups/group"
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/administrado/grupoj/${id}`}
                    onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields}
                    updateView={['adminGroups/sigList']} />

                <CSVExport
                    open={this.state.csvExportOpen}
                    onClose={() => this.setState({ csvExportOpen: false })}
                    task="adminGroups/list"
                    parameters={parameters}
                    fields={FIELDS}
                    detailView="adminGroups/group"
                    detailViewOptions={id => ({ id, noFetch: true })}
                    locale={{ fields: locale.fields }}
                    filenamePrefix={locale.csvFilename} />
            </div>
        );
    }
});
