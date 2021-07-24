import { util } from '@tejo/akso-client';
import asyncClient from './client';
import * as store from './store';
import { deepMerge } from '../util';
import { fieldDiff, fieldsToOrder, filtersToAPI, addJSONFilter } from './list';
import { AbstractDataView } from './view';

export function crudList ({
    apiPath,
    fields: defaultFields,
    filters: filterDefs,
    storePath,
    withApiOptions,
    map,
}) {
    return async (options, { search, offset, limit, fields, filters, jsonFilter }) => {
        const client = await asyncClient;
        const apiOptions = {
            offset,
            limit,
            fields: defaultFields,
            order: fieldsToOrder(fields),
        };
        if (search && search.query) {
            const transformedQuery = util.transformSearch(search.query);
            if (!util.isValidSearch(transformedQuery)) {
                throw { code: 'invalid-search-query', message: 'invalid search query' };
            }
            apiOptions.search = { cols: [search.field], str: transformedQuery };
        }

        const apiFilter = filterDefs ? filtersToAPI(filterDefs, filters) : null;
        if (apiFilter) apiOptions.filter = apiFilter;
        if (jsonFilter) apiOptions.filter = addJSONFilter(apiOptions.filter, jsonFilter);

        if (withApiOptions) withApiOptions(apiOptions, options);
        const res = await client.get(apiPath(options), apiOptions);
        for (const item of res.body) {
            if (map) map(item);
            const existing = store.get(storePath(options, item));
            store.insert(storePath(options, item), deepMerge(existing, item));
        }
        return {
            items: res.body.map(x => x.id),
            total: +res.res.headers.get('x-total-items'),
            stats: { time: res.resTime, filtered: false },
        };
    };
}

export function crudCreate ({
    apiPath,
    fields,
    idField,
    storePath,
    signalPath,
    useAutoNull,
    then,
    methodName = 'post',
    parseId = (id => +id),
}) {
    idField = idField || 'id';

    return async (options, params) => {
        const client = await asyncClient;

        const apiOptions = {};
        for (const k of fields) {
            if (useAutoNull) {
                apiOptions[k] = (params[k] || params[k] === 0) ? params[k] : null;
            } else if (k in params) {
                apiOptions[k] = params[k];
            }
        }

        const res = await client[methodName](apiPath(options, params), apiOptions);
        const id = parseId(res.res.headers.get('x-identifier'), options, params);
        const storeData = { ...apiOptions };
        storeData[idField] = id;
        store.insert(storePath(options, id), storeData);
        if (signalPath) store.signal(signalPath(options));
        if (then) then(options, id);
        return id;
    };
}

export function crudGet ({
    apiPath,
    fields,
    storePath,
    map,
}) {
    return async (options) => {
        const client = await asyncClient;
        const res = await client.get(apiPath(options), { fields });
        const path = storePath(options);
        const existing = store.get(path);
        const data = res.body;
        if (map) map(data);
        store.insert(path, deepMerge(existing, data));
        return res.body;
    };
}

export function crudUpdate ({
    apiPath,
    storePath,
    map,
}) {
    return async (options, params) => {
        const client = await asyncClient;
        const existing = store.get(storePath(options));
        const delta = fieldDiff(existing, params);
        if (map) map(delta);
        await client.patch(apiPath(options), delta);
        store.insert(storePath(options), deepMerge(existing, params));
    };
}

export function crudDelete ({
    apiPath,
    storePath,
    storePaths,
    signalPath,
}) {
    return async (options) => {
        const client = await asyncClient;
        await client.delete(apiPath(options));
        const paths = storePaths ? storePaths(options) : [storePath(options)];
        for (const p of paths) store.remove(p);
        if (signalPath) store.signal(signalPath(options));
    };
}

export function getRawFile ({
    apiPath,
}) {
    return async (options, params) => {
        const client = await asyncClient;
        const res = await fetch(client.client.createURL(apiPath(options, params)), {
            credentials: 'include',
            mode: 'cors',
        });
        if (res.status === 404) return null;
        if (!res.ok) throw { statusCode: res.status };
        return await res.blob();
    };
}

export function simpleDataView ({
    storePath,
    get,
}) {
    return class SimpleDataView extends AbstractDataView {
        constructor (options, params) {
            super();
            this.path = storePath(options, params);

            store.subscribe(this.path, this.#onUpdate);
            const current = store.get(this.path);
            if (current) setImmediate(this.#onUpdate);

            if (get && !options.noFetch) {
                get(options, params).catch(err => this.emit('error', err));
            }
        }
        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) {
                this.emit('update', store.get(this.path), 'delete');
            } else {
                this.emit('update', store.get(this.path));
            }
        };
        drop () {
            store.unsubscribe(this.path, this.#onUpdate);
        }
    };
}
