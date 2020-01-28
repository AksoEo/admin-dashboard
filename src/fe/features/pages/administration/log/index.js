import { h } from 'preact';
import { util } from '@tejo/akso-client';
import SortIcon from '@material-ui/icons/Sort';
import Page from '../../../../components/page';
import SearchFilters from '../../../../components/search-filters';
import OverviewList from '../../../../components/overview-list';
import FieldPicker from '../../../../components/field-picker';
import { coreContext } from '../../../../core/connection';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../../components/list-url-coding';
import { httpLog as locale, search as searchLocale } from '../../../../locale';
import Meta from '../../../meta';
import FILTERS from './filters';
import FIELDS from './table-fields';
import DETAIL_FIELDS from './detail-fields';
import './style';

function ListView () {
    return 'todo: remove this';
}
const Sorting = {};
const client = {};

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
                { id: 'time', sorting: 'desc'},
                { id: 'codeholder', sorting: 'none' },
                { id: 'apiKey', sorting: 'none' },
                { id: 'ip', sorting: 'none' },
                { id: 'origin', sorting: 'none' },
                { id: 'userAgent', sorting: 'none' },
                { id: 'userAgentParsed', sorting: 'none' },
                { id: 'method', sorting: 'none' },
                { id: 'path', sorting: 'none' },
                { id: 'query', sorting: 'none' },
                { id: 'resStatus', sorting: 'none' },
                { id: 'resTime', sorting: 'none' },
                { id: 'resLocation', sorting: 'none' },
            ],
            offset: 0,
            limit: 10,
        },
        expanded: false,
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
        const encoded = encodeURLQuery(this.state.options, FILTERS);
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
        if (prevState.options !== this.state.options) {
            this.encodeURLQuery();
        }
    }

    render (_, { parameters, expanded }) {
        const menu = [];

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
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />
                <ListView
                    ref={view => this.listView = view}
                    searchFields={['userAgent', 'userAgentParsed']}
                    defaults={{
                        searchField: 'userAgent',
                        filtersEnabled: true,
                        fields: [
                            { id: 'time', sorting: Sorting.DESC },
                            { id: 'codeholder', sorting: Sorting.NONE },
                            { id: 'apiKey', sorting: Sorting.NONE },
                            { id: 'ip', sorting: Sorting.NONE },
                            { id: 'origin', sorting: Sorting.NONE },
                            { id: 'userAgent', sorting: Sorting.NONE },
                            { id: 'userAgentParsed', sorting: Sorting.NONE },
                            { id: 'method', sorting: Sorting.NONE },
                            { id: 'path', sorting: Sorting.NONE },
                            { id: 'query', sorting: Sorting.NONE },
                            { id: 'resStatus', sorting: Sorting.NONE },
                            { id: 'resTime', sorting: Sorting.NONE },
                            { id: 'resLocation', sorting: Sorting.NONE },
                        ],
                    }}
                    locale={{
                        // TODO
                        searchFields: locale.fields,
                        filters: locale.filters,
                        fields: locale.fields,
                        placeholders: locale.placeholders,
                        detail: {
                            title: locale.detailTitle,
                            fields: locale.fields,
                        },
                    }}
                    detailView={this.state.detail}
                    getLinkTarget={this.getLinkTarget}
                    onURLQueryChange={this.onURLQueryChange}
                    onDetailClose={this.onDetailClose}
                    filters={FILTERS}
                    fields={FIELDS}
                    detailFields={DETAIL_FIELDS}
                    onRequest={handleRequest}
                    onDetailRequest={handleDetailRequest} />
            </div>
        );
    }
}

const fieldMapping = {
    codeholder: 'codeholderId',
};

const mapField = id => fieldMapping[id] || id;

async function handleRequest (state) {
    // TODO: json filters

    const transientFields = [];

    const options = {
        offset: state.list.page * state.list.itemsPerPage,
        limit: state.list.itemsPerPage,
    };

    if (state.search.query) {
        transientFields.push(state.search.field);
        const transformedQuery = util.transformSearch(state.search.query);
        if (!util.isValidSearch(transformedQuery)) {
            const error = Error('invalid search query');
            error.id = 'invalid-search-query';
            throw error;
        }
        options.search = { str: transformedQuery, cols: [state.search.field] };
    }

    if (state.filters.enabled) {
        const filters = [];
        for (const id in state.filters.filters) {
            const filter = state.filters.filters[id];
            if (filter.enabled) {
                filters.push(FILTERS[id].toRequest
                    ? FILTERS[id].toRequest(filter.value)
                    : { [id]: filter.value });
            }
        }

        if (filters.length) options.filter = { $and: filters };
    }

    options.fields = ['id'];
    options.fields.push(...state.fields.fixed.map(f => mapField(f.id)));
    options.fields.push(...state.fields.user.map(f => mapField(f.id)));

    options.order = [];
    for (const field of state.fields.fixed.concat(state.fields.user)) {
        if (field.sorting !== Sorting.NONE) {
            options.order.push([
                mapField(field.id),
                field.sorting === Sorting.ASC ? 'asc' : 'desc',
            ]);
        }
    }

    const result = await client.get('/http_log', options);
    const items = result.body;
    const total = +result.res.headers.map['x-total-items'];

    if (options.fields.includes('codeholderId')) {
        const codeholderMapRes = await client.get('/codeholders', {
            filter: {
                id: { $in: items.map(item => item.codeholderId) },
            },
            fields: ['id', 'newCode'],
            limit: options.limit,
        });
        const mapping = {};
        for (const item of codeholderMapRes.body) {
            mapping[item.id] = item.newCode;
        }
        for (const item of items) {
            item.newCode = mapping[item.codeholderId];
        }
    }

    return {
        items,
        transientFields,
        stats: {
            time: result.resTime,
            total,
        },
    };
}

async function handleDetailRequest (id) {
    const res = await client.get('/http_log', {
        filter: { id },
        fields: [
            'id',
            'time',
            'codeholderId',
            'apiKey',
            'ip',
            'origin',
            'userAgent',
            'userAgentParsed',
            'method',
            'path',
            'query',
            'resStatus',
            'resTime',
            'resLocation',
        ],
        limit: 1,
    });
    const item = res.body[0];
    if (!item) throw new Error('no such item');
    const codeholderMap = await client.get('/codeholders', {
        filter: { id: item.codeholderId },
        fields: ['id', 'newCode'],
        limit: 1,
    });
    item.newCode = codeholderMap.body[0].newCode;
    return item;
}
