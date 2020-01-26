import { util } from '@tejo/akso-client';
import asyncClient from '../client';
import { AbstractDataView } from '../view';
import { CLIENTS } from './clients';
import {
    CODEHOLDERS,
    parametersToRequestData as codeholdersPTRD,
    clientFromAPI as codeholderFromAPI,
} from './codeholders';
import { deepMerge } from '../../util';
import * as store from '../store';

export const ADMIN_GROUPS = 'adminGroups';
export const PERMISSIONS = 'permissions';
export const SIG_LIST = '!list';

export const tasks = {
    /// adminGroups/list: lists admin groups
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

        const res = await client.get('/admin_groups', {
            fields: ['id', 'name', 'description', 'memberRestrictions.filter', 'memberRestrictions.fields'],
            ...opts,
        });

        for (const item of res.body) {
            store.insert([ADMIN_GROUPS, item.id], item);
        }

        return {
            items: res.body.map(item => item.id),
            total: +res.res.headers.get('x-total-items'),
        };
    },
    /// adminGroups/group: returns an admin group
    group: async ({ id }) => {
        const client = await asyncClient;

        const res = await client.get(`/admin_groups/${id}`, {
            fields: ['id', 'name', 'description', 'memberRestrictions.filter', 'memberRestrictions.fields'],
        });
        const existing = store.get([ADMIN_GROUPS, id]);
        store.insert([ADMIN_GROUPS, id], deepMerge(existing, res.body));
        return res.body;
    },
    create: async (_, { name, description, memberRestrictions }) => {
        const client = await asyncClient;

        const res = await client.post('/admin_groups', {
            name,
            description,
            memberRestrictions,
        });
        const id = +res.res.headers.get('x-identifier');
        store.insert([ADMIN_GROUPS, id], { name, description, memberRestrictions });
        return id;
    },
    update: async ({ id }, { name, description, memberRestrictions }) => {
        const client = await asyncClient;

        await client.patch(`/admin_groups/${id}`, {
            name,
            description,
            memberRestrictions,
        });

        const existing = store.get([ADMIN_GROUPS, id]);
        store.insert([ADMIN_GROUPS, id], deepMerge(existing, { name, description, memberRestrictions }));
    },
    delete: async (_, { id }) => {
        const client = await asyncClient;
        await client.delete(`/admin_groups/${id}`);
        store.remove([ADMIN_GROUPS, id]);
    },

    permissions: async ({ id }) => {
        const client = await asyncClient;
        const res = await client.get(`/admin_groups/${id}/permissions`);

        const perms = res.body.map(x => x.permission);

        const existing = store.get([ADMIN_GROUPS, id]);
        store.insert([ADMIN_GROUPS, id], deepMerge(existing, {
            permissions: perms,
        }));
        return perms;
    },

    listCodeholders: async ({ group }, { offset, limit }) => {
        const client = await asyncClient;
        const { options } = codeholdersPTRD({
            fields: [{ id: 'code', sorting: 'asc' }, { id: 'name', sorting: 'asc' }],
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

    listClients: async ({ group }, { offset, limit }) => {
        const client = await asyncClient;

        const res = await client.get(`/admin_groups/${group}/clients`, {
            fields: ['apiKey', 'name', 'ownerName', 'ownerEmail'],
            order: [['apiKey', 'asc']],
            offset,
            limit,
        });

        for (const item of res.body) {
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

    addCodeholder: async ({ group }, { codeholder }) => {
        const client = await asyncClient;
        await client.put(`/admin_groups/${group}/codeholders/${codeholder}`);
        store.signal([ADMIN_GROUPS, group, SIG_LIST]);
    },
    removeCodeholder: async ({ group }, { codeholder }) => {
        const client = await asyncClient;
        await client.delete(`/admin_groups/${group}/codeholders/${codeholder}`);
        store.signal([ADMIN_GROUPS, group, SIG_LIST]);
    },

    addClient: async ({ group }, { client: id }) => {
        const client = await asyncClient;
        await client.put(`/admin_groups/${group}/clients/${id}`);
        store.signal([ADMIN_GROUPS, group, SIG_LIST]);
    },
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
};
