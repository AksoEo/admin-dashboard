import { h, Component } from 'preact';
import { util } from 'akso-client';
import ListView, { Sorting } from '../../../../components/list';
import { routerContext } from '../../../../router';
import client from '../../../../client';
import locale from '../../../../locale';
import FIELDS from './table-fields';

// TODO: permissions

export default class APILogListView extends Component {
    static contextType = routerContext;

    componentDidMount () {
        this.tryDecodeURLQuery();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.query !== this.props.query) {
            this.tryDecodeURLQuery();
        }
    }

    tryDecodeURLQuery () {
        if (!this.props.query && this.currentQuery) {
            this.currentQuery = '';
            this.listView.decodeURLQuery('');
            return;
        }
        if (!this.props.query.startsWith('?q=')) return;
        const query = this.props.query.substr(3);
        if (this.isQueryUnchanged(query)) return;
        this.currentQuery = query;

        try {
            this.listView.decodeURLQuery(query);
        } catch (err) {
            // TODO: error?
            console.error('Failed to decode URL query', err); // eslint-disable-line no-console
        }
    }

    isQueryUnchanged (query) {
        return this.currentQuery === query
            || decodeURIComponent(this.currentQuery) === decodeURIComponent(query);
    }

    /// Updates the url query in the address bar; called by the list view.
    onURLQueryChange = (query, force = false) => {
        if (this.isQueryUnchanged(query) && !force) return;
        this.currentQuery = query;
        if (query) this.context.navigate('/administrado?q=' + query);
        else this.context.navigate('/administrado');
    };

    render () {
        return (
            <ListView
                ref={view => this.listView = view}
                searchFields={['userAgent', 'userAgentParsed']}
                defaults={{
                    searchField: 'userAgent',
                    fields: [
                        { id: 'time', sorting: Sorting.DESC },
                        { id: 'codeholderId', sorting: Sorting.NONE },
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
                    fields: locale.administration.log.fields,
                    placeholders: locale.administration.log.placeholders,
                }}
                fields={FIELDS}
                onURLQueryChange={this.onURLQueryChange}
                onRequest={handleRequest} />
        );
    }
}

async function handleRequest (state) {
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

    options.fields = ['id'];
    options.fields.push(...state.fields.fixed.map(f => f.id));
    options.fields.push(...state.fields.user.map(f => f.id));

    options.order = [];
    for (const field of state.fields.fixed.concat(state.fields.user)) {
        if (field.sorting !== Sorting.NONE) {
            options.order.push([field.id, field.sorting === Sorting.ASC ? 'asc' : 'desc']);
        }
    }

    const result = await client.get('/http_log', options);
    const items = result.body;
    const total = +result.res.headers.map['x-total-items'];

    return {
        items,
        transientFields,
        stats: {
            time: result.resTime,
            total,
        },
    };
}
