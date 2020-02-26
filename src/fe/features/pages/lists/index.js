import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import Page from '../../../components/page';
import SearchFilters from '../../../components/search-filters';
import OverviewList from '../../../components/overview-list';
import CSVExport from '../../../components/csv-export';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../components/list-url-coding';
import Meta from '../../meta';
import { lists as locale, search as searchLocale } from '../../../locale';
import { coreContext } from '../../../core/connection';
import { connectPerms } from '../../../perms';

export const FIELDS = {
    name: {
        component ({ value }) {
            return value;
        },
        stringify: v => v,
    },
    description: {
        component ({ value }) {
            return value;
        },
        stringify: v => v,
    },
};

export default connectPerms(class Lists extends Page {
    state = {
        parameters: {
            search: {
                field: 'name',
                query: '',
            },
            fields: [
                { id: 'name', sorting: 'none', fixed: true },
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
        if (perms.hasPerm('lists.create') && perms.hasPerm('codeholders.read')) {
            actions.push({
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.add,
                action: () => this.context.createTask('lists/create', {}, {
                    filters: ['{\n\t\n}'],
                }),
            });
        }

        actions.push({
            label: searchLocale.csvExport,
            action: () => this.setState({ csvExportOpen: true }),
            overflow: true,
        });

        return (
            <div class="lists-page">
                <Meta
                    title={locale.title}
                    actions={actions} />
                <SearchFilters
                    value={parameters}
                    searchFields={[
                        'name',
                        'description',
                    ]}
                    onChange={parameters => this.setState({ parameters })}
                    locale={{
                        searchPlaceholders: locale.search.placeholders,
                        searchFields: locale.fields,
                    }}
                    inputRef={view => this.#searchInput = view} />
                <OverviewList
                    task="lists/list"
                    view="lists/list"
                    updateView={['lists/sigLists']}
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/listoj/${id}`}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />

                <CSVExport
                    open={this.state.csvExportOpen}
                    onClose={() => this.setState({ csvExportOpen: false })}
                    task="lists/list"
                    parameters={parameters}
                    fields={FIELDS}
                    detailView="lists/list"
                    detailViewOptions={id => ({ id, noFetch: true })}
                    locale={{ fields: locale.fields }}
                    filenamePrefix={locale.csvFilename} />
            </div>
        );
    }
});
