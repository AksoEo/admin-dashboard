import { util } from '@tejo/akso-client';
import JSON5 from 'json5';
import asyncClient from '../client';
import { AbstractDataView } from '../view';
import { CLIENTS } from './clients';
import {
    CODEHOLDERS,
    parametersToRequestData as codeholdersPTRD,
    clientFromAPI as codeholderFromAPI,
} from './codeholders';
import { fieldsToOrder } from '../list';
import { deepMerge } from '../../util';
import * as store from '../store';

export const ADMIN_GROUPS = 'adminGroups';
export const PERMISSIONS = 'permissions';
export const SIG_LIST = '!list';

export const tasks = {
    /// adminGroups/list: lists admin groups
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

        const res = await client.get('/admin_groups', {
            fields: ['id', 'name', 'description', 'memberRestrictions.filter', 'memberRestrictions.fields'],
            order: fieldsToOrder(fields),
            ...opts,
        });

        for (const item of res.body) {
            const existing = store.get([ADMIN_GROUPS, item.id]);
            store.insert([ADMIN_GROUPS, item.id], deepMerge(existing, item));
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
    /// adminGroups/group: returns an admin group
    group: async ({ id }) => {
        const client = await asyncClient;

        const res = await client.get(`/admin_groups/${id}`, {
            fields: ['id', 'name', 'description'],
        });
        const existing = store.get([ADMIN_GROUPS, id]);
        store.insert([ADMIN_GROUPS, id], deepMerge(existing, res.body));
        return res.body;
    },
    /// adminGroups/create: creates an admin group
    create: async (_, { name, description, memberRestrictions }) => {
        const client = await asyncClient;

        const res = await client.post('/admin_groups', {
            name,
            description: description || null,
            memberRestrictions,
        });
        const id = +res.res.headers.get('x-identifier');
        store.insert([ADMIN_GROUPS, id], { name, description, memberRestrictions });
        store.signal([ADMIN_GROUPS, SIG_LIST]);
        return id;
    },
    /// adminGroups/update: updates an admin group
    update: async ({ id }, { name, description }) => {
        const client = await asyncClient;

        const options = {};
        if (name) options.name = name;
        if (description !== undefined) options.description = description || null;

        await client.patch(`/admin_groups/${id}`, options);

        const existing = store.get([ADMIN_GROUPS, id]);
        store.insert([ADMIN_GROUPS, id], deepMerge(existing, options));
        store.signal([ADMIN_GROUPS, SIG_LIST]);
    },
    /// adminGroups/delete: deletes an admin group
    delete: async (_, { id }) => {
        const client = await asyncClient;
        await client.delete(`/admin_groups/${id}`);
        store.remove([ADMIN_GROUPS, id]);
        store.signal([ADMIN_GROUPS, SIG_LIST]);
    },

    /// adminGroups/permissions: returns admin group perm data
    permissions: async ({ id }) => {
        const client = await asyncClient;
        const res = await client.get(`/admin_groups/${id}/permissions`);
        const res2 = await client.get(`/admin_groups/${id}`, {
            fields: ['memberRestrictions.filter', 'memberRestrictions.fields'],
        });

        const perms = res.body.map(x => x.permission);
        const mrEnabled = !!res2.body.memberRestrictions;
        const mrFilter = mrEnabled
            ? JSON5.stringify(res2.body.memberRestrictions.filter, undefined, 4)
            : '{\n\t\n}';
        const mrFields = mrEnabled
            ? res2.body.memberRestrictions.fields
            : {};

        const permData = {
            permissions: perms,
            mrEnabled,
            mrFilter,
            mrFields,
        };

        const existing = store.get([ADMIN_GROUPS, id]);
        store.insert([ADMIN_GROUPS, id], deepMerge(existing, {
            permissions: permData,
        }));
        return permData;
    },
    setPermissions: () => {}, // dummy for UI
    /// adminGroups/setPermissionsPX: sets admin group permissions (ONLY sends permissions to
    /// server).
    /// consider also calling setPermissionsMR to complete the transaction.
    setPermissionsPX: async ({ id }, { permissions }) => {
        const client = await asyncClient;
        await client.put(`/admin_groups/${id}/permissions`, permissions.permissions);
        const existing = store.get([ADMIN_GROUPS, id]);
        store.insert([ADMIN_GROUPS, id], deepMerge(existing, {
            permissions: { permissions: permissions.permissions },
        }));
    },
    /// adminGroups/setPermissionsMR: sets admin group permissions (ONLY sends MR to server).
    /// consider also calling setPermissions to complete the transaction.
    setPermissionsMR: async ({ id }, { permissions }) => {
        const client = await asyncClient;


        await client.patch(`/admin_groups/${id}`, {
            memberRestrictions: permissions.mrEnabled ? {
                filter: JSON5.parse(permissions.mrFilter),
                fields: permissions.mrFields,
            } : null,
        });

        const existing = store.get([ADMIN_GROUPS, id]);
        store.insert([ADMIN_GROUPS, id], deepMerge(existing, {
            permissions: {
                mrEnabled: permissions.mrEnabled,
                mrFilter: permissions.mrFilter,
                mrFields: permissions.mrFields,
            },
        }));
    },

    /// adminGroups/listCodeholders: lists codeholders that are part of an admin group
    listCodeholders: async ({ group }, { offset, limit, fields }) => {
        const client = await asyncClient;
        const { options } = codeholdersPTRD({
            fields: [{ id: 'code', sorting: 'asc' }, { id: 'name', sorting: 'asc' }],
            order: fieldsToOrder(fields),
            offset,
            limit,
        });
        const res = await client.get(`/admin_groups/${group}/codeholders`, options);

        for (const item of res.body) {
            const existing = store.get([CODEHOLDERS, item.id]);
            store.insert([CODEHOLDERS, item.id], deepMerge(existing, codeholderFromAPI(item)));
        }

        const list = res.body.map(item => item.id);

        return {
            items: list,
            total: +res.res.headers.get('x-total-items'),
            stats: {
                time: res.resTime,
                filtered: false,
            },
        };
    },

    /// adminGroups/listClients: lists clients that are part of an admin group
    listClients: async ({ group }, { offset, limit, fields }) => {
        const client = await asyncClient;

        const res = await client.get(`/admin_groups/${group}/clients`, {
            fields: ['apiKey', 'name', 'ownerName', 'ownerEmail'],
            order: fieldsToOrder(fields),
            offset,
            limit,
        });

        for (const item of res.body) {
            item.id = Buffer.from(item.apiKey).toString('hex');
            const existing = store.get([CLIENTS, item.id]);
            store.insert([CLIENTS, item.id], deepMerge(existing, item));
        }

        const list = res.body.map(item => item.id);

        return {
            items: list,
            total: +res.res.headers.get('x-total-items'),
            stats: {
                time: res.resTime,
                filtered: false,
            },
        };
    },

    // dummies for task views
    addCodeholdersBatchTask: async () => {},
    removeCodeholdersBatchTask: async () => {},
    addClientsBatchTask: async () => {},
    removeClientsBatchTask: async () => {},

    /// adminGroups/addCodeholder: adds a single codeholder
    addCodeholder: async ({ group }, { codeholder }) => {
        const client = await asyncClient;
        await client.put(`/admin_groups/${group}/codeholders/${codeholder}`);
        store.signal([ADMIN_GROUPS, group, SIG_LIST]);
    },
    /// adminGroups/removeCodeholder: removes a single codeholder
    removeCodeholder: async ({ group }, { codeholder }) => {
        const client = await asyncClient;
        await client.delete(`/admin_groups/${group}/codeholders/${codeholder}`);
        store.signal([ADMIN_GROUPS, group, SIG_LIST]);
    },

    /// adminGroups/addClient: adds a single client
    addClient: async ({ group }, { client: id }) => {
        const client = await asyncClient;
        await client.put(`/admin_groups/${group}/clients/${id}`);
        store.signal([ADMIN_GROUPS, group, SIG_LIST]);
    },
    /// adminGroups/removeClient: removes a single client
    removeClient: async ({ group }, { client: id }) => {
        const client = await asyncClient;
        await client.delete(`/admin_groups/${group}/clients/${id}`);
        store.signal([ADMIN_GROUPS, group, SIG_LIST]);
    },
};

export const views = {
    /// adminGroups/group: observes an admin group
    ///
    /// # Parameters
    /// - id: admin group id
    /// - noFetch: if true, will not fetch
    /// - fetchPerms: if true, will fetch perms
    group: class AdminGroupView extends AbstractDataView {
        constructor ({ id, noFetch, fetchPerms }) {
            super();
            this.id = id;

            store.subscribe([ADMIN_GROUPS, this.id], this.#onUpdate);
            const current = store.get([ADMIN_GROUPS, this.id]);
            if (current) setImmediate(this.#onUpdate);

            if (!noFetch) {
                tasks.group({ id }, {})
                    .then(res => this.emit('update', res))
                    .catch(err => this.emit('error', err));
            }

            if (fetchPerms) {
                tasks.permissions({ id }, {})
                    .then(() => this.#onUpdate())
                    .catch(err => this.emit('error', err));
            }
        }

        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) {
                this.emit('update', store.get([ADMIN_GROUPS, this.id]), 'delete');
            } else {
                this.emit('update', store.get([ADMIN_GROUPS, this.id]));
            }
        };

        drop () {
            store.unsubscribe([ADMIN_GROUPS, this.id], this.#onUpdate);
        }
    },

    /// adminGroups/sigList: emits a signal when the list changes
    sigList: class AdminGroupListSignal extends AbstractDataView {
        constructor () {
            super();
            store.subscribe([ADMIN_GROUPS, SIG_LIST], this.#onUpdate);
        }
        #onUpdate = () => {
            this.emit('update', null);
        };
        drop () {
            store.unsubscribe([ADMIN_GROUPS, SIG_LIST], this.#onUpdate);
        }
    },
};
