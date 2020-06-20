import { util } from '@tejo/akso-client';
import { AbstractDataView, createStoreObserver } from '../view';
import asyncClient from '../client';
import * as log from '../log';
import * as store from '../store';
import { deepMerge } from '../../util';

/// Data store path.
export const MEMBERSHIPS = 'memberships';
export const MEMBERSHIP_CATEGORIES = [MEMBERSHIPS, 'categories'];
export const SIG_MEMBERSHIPS = '!memberships';

/// Loads all membership categories because there won’t be too many for this to become a problem
async function loadAllMembershipCategories () {
    if (store.get(MEMBERSHIP_CATEGORIES)) return;

    const client = await asyncClient;
    let total = Infinity;
    const items = [];
    while (total > items.length) {
        const res = await client.get('/membership_categories', {
            offset: items.length,
            limit: 100,
            fields: [
                'id',
                'nameAbbrev',
                'name',
                'description',
                'givesMembership',
                'lifetime',
                'availableFrom',
                'availableTo',
            ],
        });
        total = +res.res.headers.get('x-total-items');
        items.push(...res.body);

        if (res.body.length === 0) {
            log.error(
                `failed loading membership categories: we currently have ${items.length}`
                + ` and server reported total count ${total} but unexpectedly returned zero items;`
                + ` aborting and returning partial result`,
            );
            break;
        }
    }

    const categories = {};
    for (const item of items) {
        categories[item.id] = item;
    }

    store.insert(MEMBERSHIP_CATEGORIES, categories);
}

const FIELDS = [
    'id',
    'nameAbbrev',
    'name',
    'description',
    'givesMembership',
    'lifetime',
    'availableFrom',
    'availableTo',
];

export const tasks = {
    list: async (_, { offset, limit, search }) => {
        const client = await asyncClient;

        const opts = {
            offset,
            limit,
            fields: FIELDS,
        };

        if (search && search.query) {
            const transformedQuery = util.transformSearch(search.query);
            if (!util.isValidSearch(transformedQuery)) {
                throw { code: 'invalid-search-query', message: 'invalid search query' };
            }
            opts.search = { cols: [search.field], str: transformedQuery };
        }

        const res = await client.get('/membership_categories', opts);

        for (const item of res.body) {
            store.insert([MEMBERSHIPS, item.id], item);
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
    membership: async ({ id }) => {
        const client = await asyncClient;
        const res = await client.get(`/membership_categories/${id}`, {
            fields: FIELDS,
        });
        return res.body;
    },
    create: async (_, params) => {
        const client = await asyncClient;
        const res = await client.post('/membership_categories', params);
        const id = +res.res.headers.get('x-identifier');
        store.insert([MEMBERSHIPS, id], params);
        store.signal([MEMBERSHIPS, SIG_MEMBERSHIPS]);
        // fetch rest
        tasks.membership({ id }).catch(() => {});
        return id;
    },
    update: async ({ id }, params) => {
        const client = await asyncClient;
        delete params.id;
        await client.patch(`/membership_categories/${id}`, params);
        const existing = store.get([MEMBERSHIPS, id]);
        store.insert([MEMBERSHIPS, id], deepMerge(existing, params));
    },
    delete: async ({ id }) => {
        const client = await asyncClient;
        await client.delete(`/membership_categories/${id}`);
        store.remove([MEMBERSHIPS, id]);
        store.signal([MEMBERSHIPS, SIG_MEMBERSHIPS]);
    },
};

export const views = {
    /// memberships/categories: a view of all membership categories and their (significant)
    /// properties
    categories: class Categories extends AbstractDataView {
        constructor () {
            super();

            store.subscribe(MEMBERSHIP_CATEGORIES, this.#onUpdate);
            if (store.get(MEMBERSHIP_CATEGORIES)) this.#onUpdate();

            loadAllMembershipCategories().catch(err => this.emit('error', err));
        }

        #onUpdate = () => this.emit('update', store.get(MEMBERSHIP_CATEGORIES));

        drop () {
            store.unsubscribe(MEMBERSHIP_CATEGORIES, this.#onUpdate);
        }
    },
    membership: class Membership extends AbstractDataView {
        constructor ({ id, noFetch }) {
            super();
            this.id = id;

            store.subscribe([MEMBERSHIPS, id], this.#onUpdate);
            if (store.get([MEMBERSHIPS, id])) setImmediate(this.#onUpdate);

            if (!noFetch) {
                tasks.membership({ id }).catch(err => this.emit('error', err));
            }
        }
        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) {
                this.emit('update', store.get([MEMBERSHIPS, this.id]), 'delete');
            } else {
                this.emit('update', store.get([MEMBERSHIPS, this.id]));
            }
        }
        drop () {
            store.unsubscribe([MEMBERSHIPS, this.id], this.#onUpdate);
        }
    },
    sigMemberships: createStoreObserver([MEMBERSHIPS, SIG_MEMBERSHIPS]),
};
