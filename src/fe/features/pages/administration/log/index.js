import { h, Component } from 'preact';
import { util } from '@tejo/akso-client';
import ListView, { Sorting } from '../../../../components/list';
import ListViewURLHandler from '../../../../components/list/url-handler';
import { routerContext } from '../../../../router';
import client from '../../../../client';
import locale from '../../../../locale';
import FILTERS from './filters';
import FIELDS from './table-fields';
import DETAIL_FIELDS from './detail-fields';
import './style';

// TODO: permissions

export default class APILogListView extends Component {
    static contextType = routerContext;

    state = {
        detail: null,
    };

    constructor (props) {
        super(props);

        this.urlHandler = new ListViewURLHandler('/administrado/log', true);
        this.urlHandler.on('navigate', target => this.context.navigate(target));
        this.urlHandler.on('decodeURLQuery', query => this.listView.decodeURLQuery(query));
        this.urlHandler.on('detail', detail => this.setState({ detail }));
    }

    componentDidMount () {
        this.urlHandler.update(this.props.path, this.props.query);
    }

    componentDidUpdate () {
        this.urlHandler.update(this.props.path, this.props.query);
    }

    render () {
        return (
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
                    searchFields: locale.administration.log.fields,
                    filters: locale.administration.log.filters,
                    fields: locale.administration.log.fields,
                    placeholders: locale.administration.log.placeholders,
                    detail: {
                        title: locale.administration.log.detailTitle,
                        fields: locale.administration.log.fields,
                    },
                }}
                detailView={this.state.detail}
                getLinkTarget={this.urlHandler.getLinkTarget}
                onURLQueryChange={this.urlHandler.onURLQueryChange}
                onDetailClose={this.urlHandler.onDetailClose}
                filters={FILTERS}
                fields={FIELDS}
                detailFields={DETAIL_FIELDS}
                onRequest={handleRequest}
                onDetailRequest={handleDetailRequest} />
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
