import { util } from '@tejo/akso-client';
import { AbstractDataView } from '../view';
import asyncClient from '../client';
import * as store from '../store';
import { deepMerge } from '../../util';

export const CLIENTS = 'clients';
export const CLIENT_PERMS = 'clientPerms';

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
            const existing = store.get([CLIENTS, item.id]);
            store.insert([CLIENTS, item.id], deepMerge(existing, item));
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
        const existing = store.get([CLIENTS, id]);
        store.insert([CLIENTS, item.id], deepMerge(existing, item));

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

    clientPerms: async ({ id }) => {
        const client = await asyncClient;
        const res = await client.get(`/clients/${id}/permissions`);
        const perms = res.body.map(({ permission }) => permission);
        const existing = store.get([CLIENT_PERMS, id]);
        store.insert([CLIENT_PERMS, id], deepMerge(existing, { permissions: perms }));
        return perms;
    },
    setPermissions: async ({ id }, { permissions }) => {
        const client = await asyncClient;
        await client.put(`/clients/${id}/permissions`, permissions);
        const existing = store.get([CLIENT_PERMS, id]);
        store.insert([CLIENT_PERMS, id], deepMerge(existing, { permissions }));
    },
    memberRestrictions: async ({ id }) => {
        const client = await asyncClient;
        let memberRestrictions;
        try {
            const res = await client.get(`/clients/${id}/member_restrictions`, {
                fields: ['filter', 'fields'],
            });
            memberRestrictions = res.body;
        } catch (err) {
            if (err.statusCode === 404) {
                memberRestrictions = null;
            } else {
                throw err;
            }
        }
        const existing = store.get([CLIENT_PERMS, id]);
        store.insert([CLIENT_PERMS, id], deepMerge(existing, { memberRestrictions }));
        return memberRestrictions;
    },
    setMemberRestrictions: async ({ id }, { enabled, filter, fields }) => {
        const client = await asyncClient;
        if (enabled) {
            await client.put(`/clients/${id}/member_restrictions`, {
                filter,
                fields,
            });
            const existing = store.get([CLIENT_PERMS, id]);
            store.insert([CLIENT_PERMS, id], deepMerge(existing, { memberRestrictions: { filter, fields } }));
        } else {
            await client.delete(`/clients/${id}/member_restrictions`);
            const existing = store.get([CLIENT_PERMS, id]);
            store.insert([CLIENT_PERMS, id], deepMerge(existing, { memberRestrictions: null }));
        }
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
    clientPerms: class ClientPerms extends AbstractDataView {
        constructor ({ id, noFetch }) {
            super();
            this.id = id;
            store.subscribe([CLIENT_PERMS, this.id], this.#onUpdate);
            const current = store.get([CLIENT_PERMS, this.id]);
            if (current) setImmediate(this.#onUpdate);

            if (!noFetch) {
                tasks.clientPerms({ id }).catch(err => this.emit('error', err));
                tasks.memberRestrictions({ id }).catch(err => this.emit('error', err));
            }
        }
        #onUpdate = () => this.emit('update', store.get([CLIENT_PERMS, this.id]));
        drop () {
            store.unsubscribe([CLIENT_PERMS, this.id]);
        }
    },
};
