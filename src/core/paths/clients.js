import { util } from '@tejo/akso-client';
import { AbstractDataView } from '../view';
import asyncClient from '../client';
import * as store from '../store';
import { deepMerge } from '../../util';

export const CLIENTS = 'clients';

export const tasks = {
    list: async (_, { search, offset, limit }) => {
        const client = await asyncClient;

        const opts = { offset, limit };
        if (search && search.query) {
            if (search.field === 'apiKey') {
                opts.filter = { apiKey: Buffer.from(search.query, 'hex') };
            } else {
                const transformedQuery = util.transformSearch(search.query);
                if (!util.isValidSearch(transformedQuery)) {
                    throw { code: 'invalid-search-query', message: 'invalid search query' };
                }
                opts.search = { cols: [search.field], str: transformedQuery };
            }
        }

        const res = await client.get('/clients', {
            fields: ['name', 'apiKey', 'ownerName', 'ownerEmail'],
            ...opts,
        });

        for (const item of res.body) {
            item.id = item.apiKey.toString('hex');
            store.insert([CLIENTS, item.id], item);
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

    client: async ({ id }) => {
        const client = await asyncClient;

        const res = await client.get(`/clients/${id}`, {
            fields: ['name', 'apiKey', 'ownerName', 'ownerEmail'],
        });

        const item = res.body;
        item.id = item.apiKey.toString('hex');
        store.insert([CLIENTS, item.id], item);

        return item;
    },

    create: async (_, { name, ownerName, ownerEmail }) => {
        const client = await asyncClient;
        const res = await client.post('/clients', { name, ownerName, ownerEmail });
        return {
            id: res.res.headers.get('x-identifier'),
            secret: Buffer.from(res.body.apiSecret).toString('hex'),
        };
    },

    update: async ({ id }, { name, ownerName, ownerEmail }) => {
        const client = await asyncClient;
        await client.patch(`/clients/${id}`, { name, ownerName, ownerEmail });

        const existing = store.get([CLIENTS, id]);
        store.insert([CLIENTS, id], deepMerge(existing, { name, ownerName, ownerEmail }));

        store.signal([CLIENTS, id]);
    },

    delete: async (_, { id }) => {
        const client = await asyncClient;
        await client.delete(`/clients/${id}`);
        store.remove([CLIENTS, id]);
    },
};

export const views = {
    client: class ClientView extends AbstractDataView {
        constructor (options) {
            super();
            this.id = options.id;

            store.subscribe([CLIENTS, this.id], this.#onUpdate);
            const current = store.get([CLIENTS, this.id]);
            if (current) setImmediate(this.#onUpdate);

            if (!options.noFetch) {
                tasks.client({ id: this.id }).catch(err => this.emit('error', err));
            }
        }

        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) {
                this.emit('update', store.get([CLIENTS, this.id]), 'delete');
            } else {
                this.emit('update', store.get([CLIENTS, this.id]));
            }
        };

        drop () {
            store.unsubscribe([CLIENTS, this.id], this.#onUpdate);
        }
    },
};
