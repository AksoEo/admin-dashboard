import { util } from '@tejo/akso-client';
import JSON5 from 'json5';
import { AbstractDataView, createStoreObserver } from '../view';
import asyncClient from '../client';
import * as store from '../store';
import { fieldsToOrder } from '../list';
import { deepMerge } from '../../util';

export const CLIENTS = 'clients';
export const CLIENT_PERMS = 'clientPerms';
export const SIG_CLIENTS = '!clients';

export const tasks = {
    /// clients/list: lists clients
    list: async (_, { search, offset, limit, fields, jsonFilter }) => {
        const client = await asyncClient;

        const opts = { offset, limit };
        if (search && search.query) {
            if (search.field === 'apiKey') {
                try {
                    const key = Buffer.from(search.query, 'hex');
                    if (key.length !== 16) throw new Error('invalid length');
                    opts.filter = { apiKey: key };
                } catch {
                    throw { code: 'invalid-api-key', message: 'invalid API key' };
                }
            } else {
                const transformedQuery = util.transformSearch(search.query);
                if (!util.isValidSearch(transformedQuery)) {
                    throw { code: 'invalid-search-query', message: 'invalid search query' };
                }
                opts.search = { cols: [search.field], str: transformedQuery };
            }
        }

        if (jsonFilter && jsonFilter.filter) {
            opts.filter = opts.filter ? { $and: [opts.filter, jsonFilter.filter] }
                : jsonFilter.filter;
        }

        const res = await client.get('/clients', {
            fields: ['name', 'apiKey', 'ownerName', 'ownerEmail'],
            order: fieldsToOrder(fields),
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

    /// clients/client: returns a single client
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

    /// clients/create: creates a client
    create: async (_, { name, ownerName, ownerEmail }) => {
        const client = await asyncClient;
        const res = await client.post('/clients', { name, ownerName, ownerEmail });
        store.signal([CLIENTS, SIG_CLIENTS]);
        return {
            id: res.res.headers.get('x-identifier'),
            secret: Buffer.from(res.body.apiSecret).toString('hex'),
        };
    },
    // dummy for UI
    _createdSecret: async () => {},

    /// clients/update: updates a client
    update: async ({ id }, { name, ownerName, ownerEmail }) => {
        const client = await asyncClient;
        await client.patch(`/clients/${id}`, { name, ownerName, ownerEmail });

        const existing = store.get([CLIENTS, id]);
        store.insert([CLIENTS, id], deepMerge(existing, { name, ownerName, ownerEmail }));

        store.signal([CLIENTS, id]);
    },

    /// clients/delete: deletes a client
    delete: async (_, { id }) => {
        const client = await asyncClient;
        await client.delete(`/clients/${id}`);
        store.remove([CLIENTS, id]);
        store.signal([CLIENTS, SIG_CLIENTS]);
    },

    /// clients/permissions: returns permissions of a client
    permissions: async ({ id }) => {
        const client = await asyncClient;
        const res = await client.get(`/clients/${id}/permissions`);

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

        const perms = res.body.map(({ permission }) => permission);
        const mrEnabled = !!memberRestrictions;
        const mrFilter = mrEnabled
            ? JSON5.stringify(memberRestrictions.filter, undefined, 4)
            : '{\n\t\n}';
        const mrFields = mrEnabled
            ? memberRestrictions.fields
            : {};

        const permData = {
            permissions: perms,
            mrEnabled,
            mrFilter,
            mrFields,
        };

        store.insert([CLIENT_PERMS, id], permData);
        return permData;
    },
    setPermissions: () => {}, // dummy for UI
    /// clients/setPermissionsPX: sets client permissions (ONLY sends permissions to server)
    setPermissionsPX: async ({ id }, { permissions }) => {
        const client = await asyncClient;
        await client.put(`/clients/${id}/permissions`, permissions.permissions);
        const existing = store.get([CLIENT_PERMS, id]);
        store.insert([CLIENT_PERMS, id], deepMerge(existing, {
            permissions: permissions.permissions,
        }));
    },
    /// clients/setPermissionsMR: sets client permissions (ONLY sends MR to server)
    setPermissionsMR: async ({ id }, { permissions }) => {
        const client = await asyncClient;
        const existing = store.get([CLIENT_PERMS, id]);
        if (permissions.mrEnabled) {
            await client.put(`/clients/${id}/member_restrictions`, {
                filter: JSON5.parse(permissions.mrFilter),
                fields: permissions.mrFields,
            });
        } else {
            try {
                await client.delete(`/clients/${id}/member_restrictions`);
            } catch (err) {
                if (err.statusCode === 404) {
                    // not found; means there weren’t any in the first place
                } else {
                    throw err;
                }
            }
        }
        store.insert([CLIENT_PERMS, id], deepMerge(existing, {
            mrEnabled: permissions.mrEnabled,
            mrFilter: permissions.mrFilter,
            mrFields: permissions.mrFields,
        }));
    },
};

export const views = {
    /// clients/client: data view of a client.
    ///
    /// # Options
    /// - id: client id
    /// - noFetch: if true, will not fetch any new data
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
    /// clients/permissions: views a client’s permissions
    ///
    /// # Options
    /// - id: client id
    /// - noFetch: if true, will not fetch any new data
    permissions: class ClientPerms extends AbstractDataView {
        constructor ({ id, noFetch }) {
            super();
            this.id = id;
            store.subscribe([CLIENT_PERMS, this.id], this.#onUpdate);
            const current = store.get([CLIENT_PERMS, this.id]);
            if (current) setImmediate(this.#onUpdate);

            if (!noFetch) {
                tasks.permissions({ id }).catch(err => this.emit('error', err));
            }
        }
        #onUpdate = () => this.emit('update', store.get([CLIENT_PERMS, this.id]));
        drop () {
            store.unsubscribe([CLIENT_PERMS, this.id]);
        }
    },

    sigClients: createStoreObserver([CLIENTS, SIG_CLIENTS]),
};
