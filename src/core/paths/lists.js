import { util } from '@tejo/akso-client';
import { AbstractDataView, createStoreObserver } from '../view';
import asyncClient from '../client';
import * as store from '../store';
import { deepMerge } from '../../util';
import JSON5 from 'json5';

export const LISTS = 'lists';
export const SIG_LISTS = '!lists';

export const tasks = {
    list: async (_, { search, offset, limit }) => {
        const client = await asyncClient;

        const opts = { offset, limit };
        if (search && search.query) {
            const transformedQuery = util.transformSearch(search.query);
            if (!util.isValidSearch(transformedQuery)) {
                throw { code: 'invalid-search-query', message: 'invalid search query' };
            }
            opts.search = { cols: [search.field], str: transformedQuery };
        }

        const res = await client.get('/lists', {
            fields: ['id', 'name', 'description'],
            order: [['name', 'asc']],
            ...opts,
        });

        for (const item of res.body) {
            const existing = store.get([LISTS, item.id]);
            store.insert([LISTS, item.id], deepMerge(existing, item));
        }

        return {
            items: res.body.map(item => item.id),
            total: +res.res.headers.get('x-total-items'),
            stats: {
                filtered: false,
                time: res.resTime,
            },
        };
    },

    item: async ({ id }) => {
        const client = await asyncClient;

        const res = await client.get(`/lists/${id}`, {
            fields: ['id', 'name', 'description', 'filters', 'memberFilter'],
        });

        const item = res.body;
        // try converting filters to JSON5 syntax
        item.filters = item.filters.map(filter => {
            try {
                return JSON5.stringify(JSON.parse(filter), undefined, 4);
            } catch {
                return filter;
            }
        });
        const existing = store.get([LISTS, item.id]);
        store.insert([LISTS, item.id], deepMerge(existing, item));

        return store.get([LISTS, item.id]);
    },

    create: async (_, { name, description, filters }) => {
        const client = await asyncClient;

        const options = { name, filters };
        if (description) options.description = description;

        const res = await client.post('/lists', options);
        store.signal([LISTS, SIG_LISTS]);
        return res.res.headers.get('x-identifier');
    },

    update: async ({ id }, parameters) => {
        const client = await asyncClient;

        const opts = {};
        if ('name' in parameters) opts.name = parameters.name;
        if ('description' in parameters) opts.description = parameters.description;
        if ('filters' in parameters) {
            // convert back from JSON5 syntax
            opts.filters = parameters.filters.map(filter => JSON.stringify(JSON5.parse(filter)));
        }

        await client.patch(`/lists/${id}`, opts);

        const existing = store.get([LISTS, id]);
        store.insert([LISTS, id], deepMerge(existing, opts));
        store.signal([LISTS, id]);
    },

    delete: async (_, { id }) => {
        const client = await asyncClient;
        await client.delete(`/lists/${id}`);
        store.remove([LISTS, id]);
        store.signal([LISTS, SIG_LISTS]);
    },

    codeholders: async ({ id }, { offset, limit }) => {
        const client = await asyncClient;
        const res = await client.get(`/lists/public/${id}/codeholders`, {
            fields: ['id', 'name', 'profilePictureHash'],
            offset,
            limit,
        });
        return {
            items: res.body,
            total: +res.res.headers.get('x-total-items'),
        };
    },
};

export const views = {
    list: class ListView extends AbstractDataView {
        constructor (options) {
            super();
            this.id = options.id;

            store.subscribe([LISTS, this.id], this.#onUpdate);
            const current = store.get([LISTS, this.id]);
            if (current) setImmediate(this.#onUpdate);

            if (!options.noFetch) {
                tasks.item({ id: this.id }).catch(err => this.emit('error', err));
            }
        }

        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) {
                this.emit('update', store.get([LISTS, this.id]), 'delete');
            } else {
                this.emit('update', store.get([LISTS, this.id]));
            }
        };

        drop () {
            store.unsubscribe([LISTS, this.id], this.#onUpdate);
        }
    },

    sigLists: createStoreObserver([LISTS, SIG_LISTS]),
};
