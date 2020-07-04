import { util } from '@tejo/akso-client';
import asyncClient from '../client';
import { AbstractDataView, createStoreObserver } from '../view';
import * as store from '../store';
import { fieldsToOrder } from '../list';
import { deepMerge } from '../../util';

export const CONGRESSES = 'congresses';
export const SIG_CONGRESSES = '!congresses';

export const tasks = {
    list: async (_, { search, offset, fields, limit }) => {
        const client = await asyncClient;

        const opts = {
            offset,
            limit,
            fields: ['id', 'name', 'abbrev', 'org'],
            order: fieldsToOrder(fields),
        };

        if (search && search.query) {
            const transformedQuery = util.transformSearch(search.query);
            if (!util.isValidSearch(transformedQuery)) {
                throw { code: 'invalid-search-query', message: 'invalid search query' };
            }
            opts.search = { cols: [search.field], str: transformedQuery };
        }

        const res = await client.get('/congresses', opts);

        for (const item of res.body) {
            const existing = store.get([CONGRESSES, item.id]);
            store.insert([CONGRESSES, item.id], deepMerge(existing, item));
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

    congress: async ({ id }) => {
        const client = await asyncClient;

        const res = await client.get(`/congresses/${id}`, {
            fields: ['id', 'name', 'abbrev', 'org'],
        });
        const item = res.body;

        const existing = store.get([CONGRESSES, item.id]);
        store.insert([CONGRESSES, item.id], deepMerge(existing, item));

        return store.get([CONGRESSES, item.id]);
    },
};

export const views = {
    congress: class CongressView extends AbstractDataView {
        constructor (options) {
            super();
            this.id = options.id;

            store.subscribe([CONGRESSES, this.id], this.#onUpdate);
            const current = store.get([CONGRESSES, this.id]);
            if (current) setImmediate(this.#onUpdate);

            if (!options.noFetch) {
                tasks.congress({ id: this.id }).catch(err => this.emit('error', err));
            }
        }

        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) {
                this.emit('update', store.get([CONGRESSES, this.id]), 'delete');
            } else {
                this.emit('update', store.get([CONGRESSES, this.id]));
            }
        };

        drop () {
            store.unsubscribe([CONGRESSES, this.id], this.#onUpdate);
        }
    },

    sigCongresses: createStoreObserver([CONGRESSES, SIG_CONGRESSES]),
};
