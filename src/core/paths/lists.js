import { util } from '@tejo/akso-client';
import { AbstractDataView, createStoreObserver } from '../view';
import asyncClient from '../client';
import * as store from '../store';
import { fieldsToOrder } from '../list';
import { deepMerge } from '../../util';
import JSON5 from 'json5';

export const LISTS = 'lists';
export const SIG_LISTS = '!lists';

export const tasks = {
    /// lists/list: lists lists
    list: async (_, { search, offset, fields, limit }) => {
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
            order: fieldsToOrder(fields),
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

    /// lists/item: fetches a single list
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

    /// lists/create: creates a list
    create: async (_, { name, description, filters }) => {
        const client = await asyncClient;

        const options = { name, filters };
        if (description) options.description = description;

        const res = await client.post('/lists', options);
        store.signal([LISTS, SIG_LISTS]);
        return res.res.headers.get('x-identifier');
    },

    /// lists/update: updates a list
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

    /// lists/delete: deletes a list
    delete: async (_, { id }) => {
        const client = await asyncClient;
        await client.delete(`/lists/${id}`);
        store.remove([LISTS, id]);
        store.signal([LISTS, SIG_LISTS]);
    },

    /// lists/codeholders: lists codeholders that are part of a list
    codeholders: async ({ id }, { offset, limit }) => {
        const client = await asyncClient;
        const res = await client.get(`/lists/${id}/codeholders`, {
            offset,
            limit,
        });

        const res2 = await client.get(`/codeholders`, {
            fields: [
                'id',
                'firstName',
                'lastName',
                'firstNameLegal',
                'lastNameLegal',
                'honorific',
                'fullName',
                'profilePictureHash',
            ],
            filter: { id: { $in: res.body } },
            offset: 0,
            limit,
        });
        const codeholders = Object.fromEntries(res2.body.map(c => [c.id, c]));

        return {
            items: res.body.map(id => codeholders[id]),
            // FIXME: x-total-items is broken on the server side at the moment
            total: 9999999, // +res.res.headers.get('x-total-items'),
        };
    },
};

export const views = {
    /// lists/list: data view of a single list
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

    /// lists/sigLists: emits a signal when the list of lists may have changed
    sigLists: createStoreObserver([LISTS, SIG_LISTS]),
};
