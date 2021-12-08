import { h } from 'preact';
import SortIcon from '@material-ui/icons/Sort';
import SaveIcon from '@material-ui/icons/Save';
import Page from '../../../../components/page';
import SearchFilters from '../../../../components/overview/search-filters';
import OverviewList from '../../../../components/lists/overview-list';
import FieldPicker from '../../../../components/pickers/field-picker';
import { coreContext } from '../../../../core/connection';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../../components/overview/list-url-coding';
import { httpLog as locale, search as searchLocale } from '../../../../locale';
import CSVExport from '../../../../components/tasks/csv-export';
import Meta from '../../../meta';
import FILTERS from './filters';
import FIELDS from './table-fields';
import './style';

const searchableFields = [
    'userAgent',
    'userAgentParsed',
];

// TODO: permissions

export default class APILogListView extends Page {
    state = {
        parameters: {
            search: {
                field: searchableFields[0],
                query: '',
            },
            filters: {},
            jsonFilter: {
                _disabled: true,
                filter: {},
            },
            fields: [
                { id: 'time', sorting: 'desc' },
                { id: 'identity', sorting: 'none' },
                { id: 'ip', sorting: 'none' },
                { id: 'method', sorting: 'none' },
                { id: 'path', sorting: 'none' },
            ],
            offset: 0,
            limit: 10,
        },
        expanded: false,
        csvExportOpen: false,
    };

    static contextType = coreContext;

    #searchInput;

    // current url query state
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
        const originalQuery = this.props.query;
        this.decodeURLQuery();

        if (!originalQuery) {
            // FIXME: extremely hacky: wait for state update
            setTimeout(() => {
                // fresh load; we can add default filters
                if (!this.state.parameters.filters._disabled) {
                    this.setState({
                        parameters: {
                            ...this.state.parameters,
                            filters: {
                                ...this.state.parameters.filters,
                                path: {
                                    // filter out http log requests by default
                                    value: {
                                        type: 'invert',
                                        path: '/http_log',
                                    },
                                    enabled: true,
                                },
                            },
                        },
                    });
                }
            }, 10);
        }

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

    render (_, { parameters, expanded }) {
        const menu = [];

        if (!expanded) {
            menu.push({
                icon: <SaveIcon style={{ verticalAlign: 'middle' }} />,
                label: searchLocale.csvExport,
                action: () => this.setState({ csvExportOpen: true }),
                overflow: true,
            });
        }

        menu.push({
            icon: <SortIcon style={{ verticalAlign: 'middle' }} />,
            label: searchLocale.pickFields,
            action: () => this.setState({ fieldPickerOpen: true }),
        });

        return (
            <div class="administration-log-page" ref={node => this.node = node}>
                <Meta title={locale.title} actions={menu} />
                <SearchFilters
                    value={parameters}
                    onChange={parameters => this.setState({ parameters })}
                    searchFields={searchableFields}
                    fields={Object.keys(FIELDS)}
                    filters={FILTERS}
                    expanded={expanded}
                    onExpandedChange={expanded => this.setState({ expanded })}
                    locale={{
                        searchFields: locale.fields,
                        searchPlaceholders: locale.search.placeholders,
                        filters: locale.search.filters,
                    }}
                    category="http_log"
                    filtersToAPI="httpLog/filtersToAPI"
                    inputRef={view => this.#searchInput = view} />
                <FieldPicker
                    open={this.state.fieldPickerOpen}
                    onClose={() => this.setState({ fieldPickerOpen: false })}
                    // TODO: use core views
                    available={Object.keys(FIELDS)}
                    sortables={Object.keys(FIELDS).filter(x => FIELDS[x].sortable)}
                    selected={parameters.fields}
                    onChange={fields => this.setState({ parameters: { ...parameters, fields } })}
                    locale={locale.fields} />
                <OverviewList
                    // TODO: also note global filter if present (use core view?)
                    task="httpLog/list"
                    view="httpLog/request"
                    parameters={parameters}
                    expanded={expanded}
                    fields={FIELDS}
                    onGetItemLink={id => `/administrado/protokolo/${id}`}
                    onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />
                <CSVExport
                    open={this.state.csvExportOpen}
                    onClose={() => this.setState({ csvExportOpen: false })}
                    task="httpLog/list"
                    parameters={parameters}
                    fields={FIELDS}
                    detailView="httpLog/request"
                    detailViewOptions={id => ({ id, noFetch: true })}
                    locale={{
                        fields: locale.fields,
                    }}
                    filenamePrefix={locale.csvFilename} />
            </div>
        );
    }
}
