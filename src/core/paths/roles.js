import { util } from '@tejo/akso-client';
import { AbstractDataView, createStoreObserver } from '../view';
import asyncClient from '../client';
import * as log from '../log';
import * as store from '../store';
import { deepMerge } from '../../util';

/// Data store path.
export const ROLES = 'codeholder_roles';
export const SIG_ROLES = '!roles';

/// Loads all roles because there won’t be too many for that to be a problem
async function loadAllRoles () {
    if (store.get([ROLES])) return;

    const client = await asyncClient;
    let total = Infinity;
    const items = [];
    while (total > items.length) {
        const res = await client.get('/codeholder_roles', {
            offset: items.length,
            limit: 100,
            fields: [
                'id',
                'name',
                'description',
            ],
        });
        total = +res.res.headers.get('x-total-items');
        items.push(...res.body);

        if (res.body.length === 0) {
            log.error(
                `failed loading roles: we currently have ${items.length}`
                + ` and server reported total count ${total} but unexpectedly returned zero items;`
                + ` aborting and returning partial result`,
            );
            break;
        }
    }

    const roles = {};
    for (const item of items) {
        roles[item.id] = item;
    }

    store.insert([ROLES], roles);
}

export const tasks = {
    list: async (_, { offset, limit, search }) => {
        const client = await asyncClient;

        const opts = {
            offset,
            limit,
            fields: ['id', 'name', 'description'],
        };

        if (search && search.query) {
            const transformedQuery = util.transformSearch(search.query);
            if (!util.isValidSearch(transformedQuery)) {
                throw { code: 'invalid-search-query', message: 'invalid search query' };
            }
            opts.search = { cols: [search.field], str: transformedQuery };
        }

        const res = await client.get('/codeholder_roles', opts);

        for (const item of res.body) {
            store.insert([ROLES, item.id], item);
        }

        return {
            items: res.body.map(item => item.id),
            total: +res.res.headers.get('x-total-items'),
            stats: {
                time: res.resTime,
                filtered: false,
            },
        };
    },
    role: async ({ id }) => {
        const client = await asyncClient;
        const res = await client.get(`/codeholder_roles/${id}`, {
            fields: ['id', 'name', 'description'],
        });
        return res.body;
    },
    create: async (_, params) => {
        const client = await asyncClient;
        const res = await client.post('/codeholder_roles', params);
        const id = +res.res.headers.get('x-identifier');
        store.insert([ROLES, id], params);
        store.signal([ROLES, SIG_ROLES]);
        return id;
    },
    update: async ({ id }, params) => {
        const client = await asyncClient;
        delete params.id;
        await client.patch(`/codeholder_roles/${id}`, params);
        const existing = store.get([ROLES, id]);
        store.insert([ROLES, id], deepMerge(existing, params));
    },
    delete: async ({ id }) => {
        const client = await asyncClient;
        await client.delete(`/codeholder_roles/${id}`);
        store.remove([ROLES, id]);
        store.signal([ROLES, SIG_ROLES]);
    },
};

export const views = {
    /// roles/roles: a view of all roles
    roles: class Roles extends AbstractDataView {
        constructor () {
            super();

            store.subscribe([ROLES], this.#onUpdate);
            if (store.get([ROLES])) this.#onUpdate();

            loadAllRoles().catch(err => this.emit('error', err));
        }

        #onUpdate = () => this.emit('update', store.get([ROLES]));

        drop () {
            store.unsubscribe([ROLES], this.#onUpdate);
        }
    },
    role: class Role extends AbstractDataView {
        constructor ({ id, noFetch }) {
            super();
            this.id = id;

            store.subscribe([ROLES, id], this.#onUpdate);
            if (store.get([ROLES, id])) setImmediate(this.#onUpdate);

            if (!noFetch) {
                tasks.role({ id }).catch(err => this.emit('error', err));
            }
        }
        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) {
                this.emit('update', store.get([ROLES, this.id]), 'delete');
            } else {
                this.emit('update', store.get([ROLES, this.id]));
            }
        }
        drop () {
            store.unsubscribe([ROLES, this.id], this.#onUpdate);
        }
    },
    sigRoles: createStoreObserver([ROLES, SIG_ROLES]),
};
