import { util } from '@tejo/akso-client';
import { AbstractDataView, createStoreObserver } from '../view';
import asyncClient from '../client';
import * as log from '../log';
import * as store from '../store';
import { fieldDiff, fieldsToOrder } from '../list';
import { deepMerge } from '../../util';

/// Data store path.
export const MEMBERSHIPS = 'memberships';
export const MEMBERSHIP_CATEGORIES = [MEMBERSHIPS, 'categories'];
export const MEMBERSHIP_CATEGORIES_LIST = [MEMBERSHIPS, 'all_categories'];
export const SIG_CATEGORIES = '!categories';
export const MEMBERSHIP_OPTIONS = [MEMBERSHIPS, 'options'];
export const SIG_OPTIONS = '!options';

/// Loads all membership categories because there won’t be too many for this to become a problem
async function loadAllMembershipCategories () {
    if (store.get(MEMBERSHIP_CATEGORIES_LIST)) return;

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

    store.insert(MEMBERSHIP_CATEGORIES_LIST, categories);
}

const CATEGORY_FIELDS = [
    'id',
    'nameAbbrev',
    'name',
    'description',
    'givesMembership',
    'lifetime',
    'availableFrom',
    'availableTo',
];

const OPTIONS_FIELDS = [
    'year',
    'enabled',
    'paymentOrgId',
    'currency',
    'offers',
];

export const tasks = {
    listCategories: async (_, { offset, limit, fields, search, jsonFilter }) => {
        const client = await asyncClient;

        const opts = {
            offset,
            limit,
            fields: CATEGORY_FIELDS,
            order: fieldsToOrder(fields),
        };
        if (jsonFilter) opts.filter = jsonFilter.filter;

        if (search && search.query) {
            const transformedQuery = util.transformSearch(search.query);
            if (!util.isValidSearch(transformedQuery)) {
                throw { code: 'invalid-search-query', message: 'invalid search query' };
            }
            opts.search = { cols: [search.field], str: transformedQuery };
        }

        const res = await client.get('/membership_categories', opts);

        for (const item of res.body) {
            store.insert([MEMBERSHIP_CATEGORIES, item.id], item);
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
    category: async ({ id }) => {
        const client = await asyncClient;
        const res = await client.get(`/membership_categories/${id}`, {
            fields: CATEGORY_FIELDS,
        });
        store.insert([MEMBERSHIP_CATEGORIES, id], res.body);
        return res.body;
    },
    createCategory: async (_, params) => {
        const client = await asyncClient;
        const res = await client.post('/membership_categories', params);
        const id = +res.res.headers.get('x-identifier');
        store.insert([MEMBERSHIP_CATEGORIES, id], params);
        store.signal(MEMBERSHIP_CATEGORIES.concat([SIG_CATEGORIES]));
        // fetch rest
        tasks.category({ id }).catch(() => {});
        return id;
    },
    updateCategory: async ({ id }, params) => {
        const client = await asyncClient;
        delete params.id;
        await client.patch(`/membership_categories/${id}`, params);
        const existing = store.get([MEMBERSHIP_CATEGORIES, id]);
        store.insert([MEMBERSHIP_CATEGORIES, id], deepMerge(existing, params));
    },
    deleteCategory: async ({ id }) => {
        const client = await asyncClient;
        await client.delete(`/membership_categories/${id}`);
        store.remove([MEMBERSHIP_CATEGORIES, id]);
        store.signal(MEMBERSHIP_CATEGORIES.concat([SIG_CATEGORIES]));
    },

    listOptions: async (_, { offset, limit, fields }) => {
        const client = await asyncClient;

        const opts = {
            offset,
            limit,
            fields: OPTIONS_FIELDS,
            order: fieldsToOrder(fields),
        };

        const res = await client.get('/registration/options', opts);

        for (const item of res.body) {
            item.id = item.year;
            store.insert([MEMBERSHIP_OPTIONS, item.id], item);
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
    options: async ({ id }) => {
        const client = await asyncClient;

        if (store.get([MEMBERSHIP_OPTIONS, id])?._virtual) return store.get([MEMBERSHIP_OPTIONS, id]);

        const res = await client.get(`/registration/options/${id}`, {
            fields: OPTIONS_FIELDS,
        });
        store.insert([MEMBERSHIP_OPTIONS, id], res.body);
        return res.body;
    },
    createOptions: async (_, { year }) => {
        const id = parseInt(year, 10);
        if (!Number.isFinite(id)) throw { code: 'bad-request', message: 'Bad year number' };

        // check if it exists
        if (!store.get([MEMBERSHIP_OPTIONS, id])) {
            await tasks.options({ id: year }).catch(err => {
                if (err.statusCode === 404) return null;
                throw err;
            });
        }

        if (store.get([MEMBERSHIP_OPTIONS, id])) return year;
        store.insert([MEMBERSHIP_OPTIONS, id], {
            _virtual: true,
            id,
            year: id,
            enabled: false,
            currency: null,
            paymentOrgId: null,
            offers: [],
        });
        return year;
    },
    updateOptions: async ({ id }, params) => {
        const client = await asyncClient;
        const existing = store.get([MEMBERSHIP_OPTIONS, id]);
        existing._virtual = false;
        const delta = fieldDiff(existing, params);
        const complete = { ...deepMerge(existing, delta) };
        delete complete.id;
        delete complete.year;
        delete complete._virtual;
        await client.put(`/registration/options/${id}`, complete);
        store.insert([MEMBERSHIP_OPTIONS, id], deepMerge(existing, params));
        store.signal(MEMBERSHIP_OPTIONS.concat([SIG_OPTIONS]));
    },
    deleteOptions: async ({ id }) => {
        const client = await asyncClient;
        await client.delete(`/registration/options/${id}`);
        store.remove([MEMBERSHIP_OPTIONS, id]);
        store.signal(MEMBERSHIP_OPTIONS.concat([SIG_OPTIONS]));
    },
};

export const views = {
    /// memberships/categories: a view of all membership categories and their (significant)
    /// properties
    categories: class Categories extends AbstractDataView {
        constructor () {
            super();

            store.subscribe(MEMBERSHIP_CATEGORIES_LIST, this.#onUpdate);
            if (store.get(MEMBERSHIP_CATEGORIES_LIST)) this.#onUpdate();

            loadAllMembershipCategories().catch(err => this.emit('error', err));
        }

        #onUpdate = () => this.emit('update', store.get(MEMBERSHIP_CATEGORIES_LIST));

        drop () {
            store.unsubscribe(MEMBERSHIP_CATEGORIES_LIST, this.#onUpdate);
        }
    },
    category: class MembershipCategory extends AbstractDataView {
        constructor ({ id, noFetch }) {
            super();
            this.id = id;

            store.subscribe([MEMBERSHIP_CATEGORIES, id], this.#onUpdate);
            if (store.get([MEMBERSHIP_CATEGORIES, id])) setImmediate(this.#onUpdate);

            if (!noFetch) {
                tasks.category({ id }).catch(err => this.emit('error', err));
            }
        }
        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) {
                this.emit('update', store.get([MEMBERSHIP_CATEGORIES, this.id]), 'delete');
            } else {
                this.emit('update', store.get([MEMBERSHIP_CATEGORIES, this.id]));
            }
        }
        drop () {
            store.unsubscribe([MEMBERSHIP_CATEGORIES, this.id], this.#onUpdate);
        }
    },
    sigCategories: createStoreObserver(MEMBERSHIP_CATEGORIES.concat([SIG_CATEGORIES])),

    options: class RegistrationOptions extends AbstractDataView {
        constructor ({ id, noFetch }) {
            super();
            this.id = id;

            store.subscribe([MEMBERSHIP_OPTIONS, id], this.#onUpdate);
            if (store.get([MEMBERSHIP_OPTIONS, id])) setImmediate(this.#onUpdate);

            if (!noFetch) {
                tasks.options({ id }).catch(err => this.emit('error', err));
            }
        }
        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) {
                this.emit('update', store.get([MEMBERSHIP_OPTIONS, this.id]), 'delete');
            } else {
                this.emit('update', store.get([MEMBERSHIP_OPTIONS, this.id]));
            }
        }
        drop () {
            store.unsubscribe([MEMBERSHIP_OPTIONS, this.id], this.#onUpdate);
        }
    },
    sigOptions: createStoreObserver(MEMBERSHIP_OPTIONS.concat([SIG_OPTIONS])),
};
