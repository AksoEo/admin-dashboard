import { base32 } from 'rfc4648';
import asyncClient from '../client';
import * as store from '../store';
import { fieldsToOrder } from '../list';
import { deepMerge } from '../../util';
import { AbstractDataView, createStoreObserver } from '../view';
import { makeParametersToRequestData, makeClientFromAPI, makeClientToAPI, filtersToAPI } from '../list';

export const PAYMENT_ORGS = 'paymentOrgs';
export const SIG_PAYMENT_ORGS = '!paymentOrgs';
export const PO_DATA = 'poData';
export const PO_ADDONS = 'poAddons';
export const SIG_PO_ADDONS = '!poAddons';
export const PO_METHODS = 'poMethods';
export const SIG_PO_METHODS = '!poMethods';
export const PAYMENT_INTENTS = 'paymentIntents';
export const SIG_PAYMENT_INTENTS = '!paymentIntents';

//! # Data structure
//! ```
//! PAYMENT_ORGS
//! |- [org id]
//!    |- PO_DATA
//!    |  |- (org data)
//!    |- PO_ADDONS
//!    |  |- [addon id]
//!    |     |- ...
//!    |- PO_METHODS
//!       |- [method id]
//!          |- ...
//! PAYMENT_INTENTS
//! |- [intent id]
//!    |- ...
//! ```

// returns a random string to use as cache-buster with thumbnails
function getThumbnailKey () {
    return Math.random().toString(36).replace(/\./g, '');
}

function iReadId (idBuffer) {
    return base32.stringify(idBuffer);
}

// intents stuff
const iClientFields = {
    id: {
        apiFields: ['id'],
        fromAPI: intent => iReadId(intent.id),
        toAPI: () => ({}),
    },
    customer: {
        apiFields: ['codeholderId', 'customer.email', 'customer.name'],
        fromAPI: intent => intent.customer ? ({
            id: intent.codeholderId,
            email: intent.customer.email,
            name: intent.customer.name,
        }) : undefined,
        toAPI: ({ id, email, name }) => ({
            customer: { email, name },
            codeholderId: id,
        }),
    },
    method: {
        apiFields: ['paymentMethod'],
        fromAPI: intent => intent.paymentMethod,
        toAPI: ({ id }) => ({ paymentMethodId: id }),
    },
    org: 'org',
    paymentOrg: 'paymentOrgId',
    currency: 'currency',
    status: 'status',
    events: 'events',
    timeCreated: 'timeCreated',
    statusTime: 'statusTime',
    internalNotes: 'internalNotes',
    customerNotes: 'customerNotes',
    foreignId: 'foreignId',
    stripePaymentIntentId: 'stripePaymentIntentId',
    purposes: {
        apiFields: ['purposes'],
        fromAPI: intent => {
            if (!intent.purposes) return undefined;
            const purposes = [];
            for (const apiPurpose of intent.purposes) {
                let purpose = apiPurpose;
                if (purpose.type === 'trigger') {
                    purpose = {
                        ...apiPurpose,
                        dataId: Buffer.from(purpose.dataId).toString('hex'),
                    };
                }
                purposes.push(purpose);
            }
            return purposes;
        },
        toAPI: purposes => {
            const apiPurposes = [];
            for (const purpose of purposes) {
                let apiPurpose = purpose;
                if (purpose.type === 'trigger') {
                    apiPurpose = { ...purpose, dataId: Buffer.from(purpose.dataId, 'hex') };
                }
                apiPurposes.push(apiPurpose);
            }
            return { purposes: apiPurposes };
        },
    },
    totalAmount: {
        apiFields: ['totalAmount'],
        fromAPI: intent => intent.totalAmount,
        toAPI: totalAmount => ({ totalAmount }),
        requires: ['currency'],
    },
    amountRefunded: 'amountRefunded',
};
const iClientFilters = {
    customerName: {
        toAPI: value => ({ 'customer.name': { $pre: value } }),
    },
    customerEmail: {
        toAPI: value => ({ 'customer.email': value }),
    },
    paymentOrg: {
        toAPI: value => ({ paymentOrgId: value }),
    },
    paymentMethod: {
        toAPI: value => ({ paymentMethodId: value }),
    },
    org: {
        toAPI: value => ({ org: value }),
    },
    currencies: {
        toAPI: value => ({ currency: { $in: value } }),
    },
    status: {
        toAPI: value => ({ status: value }),
    },
    purposeTrigger: {
        toAPI: value => ({ $purposes: { triggers: value } }),
    },
    purposeDataId: {
        toAPI: value => ({ $purposes: { dataId: value } }),
    },
};

const iSearchFieldToTransientFields = {
    customerEmail: ['customer'],
    customerName: ['customer'],
};
const iParametersToRequestData = makeParametersToRequestData({
    searchFieldToTransientFields: iSearchFieldToTransientFields,
    mapSearchField: field => {
        if (field === 'customerEmail') return 'customer.email';
        if (field === 'customerName') return 'customer.name';
        return field;
    },
    clientFields: iClientFields,
    clientFilters: iClientFilters,
});
const iClientFromAPI = makeClientFromAPI(iClientFields);
const iClientToAPI = makeClientToAPI(iClientFields);
const INTENT_ALLOWED_PATCH_FIELDS = [
    'codeholderId',
    'customer',
    'internalNotes',
    'customerNotes',
    'foreignId',
];

export const tasks = {
    listOrgs: async (_, { offset, limit, fields, jsonFilter, _skipMapHack }) => {
        const client = await asyncClient;
        const options = {
            offset,
            limit,
            fields: ['id', 'org', 'name', 'description'],
            order: fieldsToOrder(fields),
        };
        if (jsonFilter) options.filter = jsonFilter.filter;
        const res = await client.get('/aksopay/payment_orgs', options);
        for (const item of res.body) {
            const existing = store.get([PAYMENT_ORGS, item.id, PO_DATA]);
            store.insert([PAYMENT_ORGS, item.id, PO_DATA], deepMerge(existing, item));
        }
        return {
            items: _skipMapHack ? res.body : res.body.map(x => x.id),
            total: +res.res.headers.get('x-total-items'),
            stats: { time: res.resTime, filtered: false },
        };
    },
    createOrg: async (_, { org, name, description }) => {
        const client = await asyncClient;
        description = description || null;
        const res = await client.post('/aksopay/payment_orgs', {
            org,
            name,
            description,
        });
        const id = +res.res.headers.get('x-identifier');
        store.insert([PAYMENT_ORGS, id, PO_DATA], { id, org, name, description });
        store.signal([PAYMENT_ORGS, SIG_PAYMENT_ORGS]);
        return id;
    },
    getOrg: async ({ id }) => {
        const client = await asyncClient;
        const res = await client.get(`/aksopay/payment_orgs/${id}`, {
            fields: ['id', 'org', 'name', 'description'],
        });
        const path = [PAYMENT_ORGS, id, PO_DATA];
        const existing = store.get(path);
        store.insert(path, deepMerge(existing, res.body));
        return res.body;
    },
    updateOrg: async ({ id }, params) => {
        const client = await asyncClient;
        delete params.id;
        delete params.org;
        await client.patch(`/aksopay/payment_orgs/${id}`, params);
        const existing = store.get([PAYMENT_ORGS, +id, PO_DATA]);
        store.insert([PAYMENT_ORGS, id, PO_DATA], deepMerge(existing, params));
    },
    deleteOrg: async ({ id }) => {
        const client = await asyncClient;
        await client.delete(`/aksopay/payment_orgs/${id}`);
        store.remove([PAYMENT_ORGS, id, PO_DATA]);
        store.remove([PAYMENT_ORGS, id, PO_ADDONS]);
        store.remove([PAYMENT_ORGS, id, PO_METHODS]);
        store.remove([PAYMENT_ORGS, id]);
        store.signal([PAYMENT_ORGS, SIG_PAYMENT_ORGS]);
    },
    listAddons: async ({ org }, { offset, limit, fields, jsonFilter, _skipMapHack }) => {
        const client = await asyncClient;
        const opts = {
            offset,
            limit,
            fields: ['id', 'name', 'description'],
            order: fieldsToOrder(fields),
        };
        if (jsonFilter) opts.filter = jsonFilter.filter;
        const res = await client.get(`/aksopay/payment_orgs/${org}/addons`, opts);
        for (const item of res.body) {
            const path = [PAYMENT_ORGS, org, PO_ADDONS, item.id];
            store.insert(path, item);
        }
        return {
            items: _skipMapHack ? res.body : res.body.map(x => x.id),
            total: +res.res.headers.get('x-total-items'),
            stats: { time: res.resTime, filtered: false },
        };
    },
    createAddon: async ({ org }, { name, description }) => {
        const client = await asyncClient;
        const res = await client.post(`/aksopay/payment_orgs/${org}/addons`, {
            name,
            description: description || null,
        });
        const id = +res.res.headers.get('x-identifier');
        store.insert([PAYMENT_ORGS, org, PO_ADDONS, id], { id, name, description });
        store.signal([PAYMENT_ORGS, org, SIG_PO_ADDONS]);
        return id;
    },
    getAddon: async ({ org, id }) => {
        const client = await asyncClient;
        const res = await client.get(`/aksopay/payment_orgs/${org}/addons/${id}`, {
            fields: ['id', 'name', 'description'],
        });
        const path = [PAYMENT_ORGS, org, PO_ADDONS, id];
        const existing = store.get(path);
        store.insert(path, deepMerge(existing, res.body));
        return res.body;
    },
    updateAddon: async ({ org, id }, params) => {
        const client = await asyncClient;
        delete params.id;
        await client.patch(`/aksopay/payment_orgs/${org}/addons/${id}`, params);
        const path = [PAYMENT_ORGS, org, PO_ADDONS, id];
        const existing = store.get(path);
        store.insert(path, deepMerge(existing, params));
    },
    deleteAddon: async ({ org, id }) => {
        const client = await asyncClient;
        await client.delete(`/aksopay/payment_orgs/${org}/addons/${id}`);
        store.remove([PAYMENT_ORGS, org, PO_ADDONS, id]);
        store.signal([PAYMENT_ORGS, org, SIG_PO_ADDONS]);
    },
    listMethods: async ({ org }, { offset, limit, jsonFilter, fields, _skipMapHack }) => {
        const client = await asyncClient;
        const opts = {
            offset,
            limit,
            fields: ['id', 'type', 'name', 'internalDescription'],
            order: fieldsToOrder(fields),
        };
        if (jsonFilter) opts.filter = jsonFilter.filter;

        const res = await client.get(`/aksopay/payment_orgs/${org}/methods`, opts);
        for (const item of res.body) {
            const path = [PAYMENT_ORGS, org, PO_METHODS, item.id];
            item.thumbnailKey = getThumbnailKey();
            const existing = store.get(path);
            store.insert(path, deepMerge(existing, item));
        }
        return {
            items: _skipMapHack ? res.body : res.body.map(x => x.id),
            total: +res.res.headers.get('x-total-items'),
            stats: { time: res.resTime, filtered: false },
        };
    },
    createMethod: async ({ org }, params) => {
        const client = await asyncClient;
        delete params.id;
        const res = await client.post(`/aksopay/payment_orgs/${org}/methods`, params);
        const id = +res.res.headers.get('x-identifier');
        store.insert([PAYMENT_ORGS, org, PO_METHODS, id], { id, ...params });
        store.signal([PAYMENT_ORGS, org, SIG_PO_METHODS]);
        return id;
    },
    getMethod: async ({ org, id }) => {
        const client = await asyncClient;
        const res = await client.get(`/aksopay/payment_orgs/${org}/methods/${id}`, {
            fields: [
                'id', 'type', 'stripeMethods', 'name', 'internalDescription',
                'description', 'currencies', 'paymentValidity', 'isRecommended',
                'stripePublishableKey', 'feePercent', 'feeFixed.val', 'feeFixed.cur',
            ],
        });
        const path = [PAYMENT_ORGS, org, PO_METHODS, id];
        const existing = store.get(path);
        store.insert(path, deepMerge(existing, res.body));
        return res.body;
    },
    updateMethod: async ({ org, id }, params) => {
        const client = await asyncClient;
        delete params.id;
        delete params.type;
        delete params.thumbnailKey;
        await client.patch(`/aksopay/payment_orgs/${org}/methods/${id}`, params);
        const path = [PAYMENT_ORGS, org, PO_METHODS, id];
        const existing = store.get(path);
        store.insert(path, deepMerge(existing, params));
    },
    deleteMethod: async ({ org, id }) => {
        const client = await asyncClient;
        await client.delete(`/aksopay/payment_orgs/${org}/methods/${id}`);
        store.remove([PAYMENT_ORGS, org, PO_METHODS, id]);
        store.signal([PAYMENT_ORGS, org, SIG_PO_METHODS]);
    },
    methodThumbnail: async ({ org, id }) => {
        const client = await asyncClient;
        const res = await fetch(client.client.createURL(`/aksopay/payment_orgs/${org}/methods/${id}/thumbnail`), {
            credentials: 'include',
            mode: 'cors',
        });
        if (res.status === 404) return null;
        if (!res.ok) throw { statusCode: res.status };
        return await res.blob();
    },
    updateMethodThumbnail: async ({ org, id }, { thumbnail }) => {
        const client = await asyncClient;
        await client.put(`/aksopay/payment_orgs/${org}/methods/${id}/thumbnail`, null, {}, [{
            name: 'thumbnail',
            type: thumbnail.type,
            value: thumbnail,
        }]);
        const path = [PAYMENT_ORGS, org, PO_METHODS, id];
        const existing = store.get(path);
        store.insert(path, deepMerge(existing, { thumbnailKey: getThumbnailKey() }));
        store.signal([PAYMENT_ORGS, org, SIG_PO_METHODS]);
    },
    deleteMethodThumbnail: async ({ org, id }) => {
        const client = await asyncClient;
        await client.delete(`/aksopay/payment_orgs/${org}/methods/${id}/thumbnail`);
        const path = [PAYMENT_ORGS, org, PO_METHODS, id];
        const existing = store.get(path);
        store.insert(path, deepMerge(existing, { thumbnailKey: getThumbnailKey() }));
        store.signal([PAYMENT_ORGS, org, SIG_PO_METHODS]);
    },

    // MARK - INTENTS
    listIntents: async (_, parameters) => {
        const client = await asyncClient;
        const { options, usedFilters, transientFields } = iParametersToRequestData(parameters);
        const result = await client.get('/aksopay/payment_intents', options);
        const list = result.body;
        const totalItems = +result.res.headers.get('x-total-items');

        const items = [];

        for (const item of list) {
            const id = iReadId(item.id);
            const existing = store.get([PAYMENT_INTENTS, id]);
            store.insert([PAYMENT_INTENTS, id], deepMerge(existing, iClientFromAPI(item)));
            items.push(id);
        }

        return {
            items,
            total: totalItems,
            transientFields,
            stats: {
                time: result.resTime,
                filtered: usedFilters,
            },
        };
    },
    createIntent: async (_, params) => {
        const client = await asyncClient;
        let res;
        try {
            res = await client.post('/aksopay/payment_intents', iClientToAPI(params));
        } catch (err) {
            if (err.statusCode === 417) {
                throw { code: 'payment-exceeds-max', message: 'Exceeds max allowed transaction amount' };
            }
            throw err;
        }
        const id = res.res.headers.get('x-identifier');
        store.insert([PAYMENT_INTENTS, id], params);
        store.signal([PAYMENT_INTENTS, SIG_PAYMENT_INTENTS]);
        return id;
    },
    getIntent: async ({ id }, { fields }) => {
        const client = await asyncClient;
        const res = await client.get(`/aksopay/payment_intents/${id}`, {
            fields: ['id'].concat(fields.flatMap(id => typeof iClientFields[id] === 'string'
                ? [iClientFields[id]]
                : iClientFields[id].apiFields)),
        });

        const existing = store.get([PAYMENT_INTENTS, id]);
        store.insert([PAYMENT_INTENTS, id], deepMerge(existing, iClientFromAPI(res.body)));

        return +id;
    },
    updateIntent: async ({ id }, params) => {
        const client = await asyncClient;
        const data = iClientToAPI(params);

        for (const k in data) {
            if (!INTENT_ALLOWED_PATCH_FIELDS.includes(k)) {
                delete data[k];
            }
        }

        await client.patch(`/aksopay/payment_intents/${id}`, data);
        const existing = store.get([PAYMENT_INTENTS, id]);
        store.insert([PAYMENT_INTENTS, id], deepMerge(existing, params));
    },
    cancelIntent: async ({ id }) => {
        const client = await asyncClient;
        await client.post(`/aksopay/payment_intents/${id}/!cancel`);
        const existing = store.get([PAYMENT_INTENTS, id]);
        store.insert([PAYMENT_INTENTS, id], deepMerge(existing, { status: 'canceled' }));
        // event log should be updated
        tasks.getIntent({ id }, { fields: ['events'] }).catch(() => {});
    },
    markIntentDisputed: async ({ id }) => {
        const client = await asyncClient;
        await client.post(`/aksopay/payment_intents/${id}/!mark_disputed`);
        const existing = store.get([PAYMENT_INTENTS, id]);
        store.insert([PAYMENT_INTENTS, id], deepMerge(existing, { status: 'disputed' }));
        // event log should be updated
        tasks.getIntent({ id }, { fields: ['events'] }).catch(() => {});
    },
    markIntentRefunded: async ({ id }, { amount }) => {
        const client = await asyncClient;
        await client.post(`/aksopay/payment_intents/${id}/!mark_refunded`, {
            totalRefund: amount,
        });
        const existing = store.get([PAYMENT_INTENTS, id]);
        store.insert([PAYMENT_INTENTS, id], deepMerge(existing, {
            status: 'refunded',
            amountRefunded: amount,
        }));
        // event log should be updated
        tasks.getIntent({ id }, { fields: ['events'] }).catch(() => {});
    },
    markIntentSucceeded: async ({ id }) => {
        const client = await asyncClient;
        await client.post(`/aksopay/payment_intents/${id}/!mark_succeeded`);
        const existing = store.get([PAYMENT_INTENTS, id]);
        store.insert([PAYMENT_INTENTS, id], deepMerge(existing, { status: 'succeeded' }));
        // event log should be updated
        tasks.getIntent({ id }, { fields: ['events'] }).catch(() => {});
    },
    submitIntent: async ({ id }) => {
        const client = await asyncClient;
        await client.post(`/aksopay/payment_intents/${id}/!submit`);
        const existing = store.get([PAYMENT_INTENTS, id]);
        store.insert([PAYMENT_INTENTS, id], deepMerge(existing, { status: 'submitted' }));
        // event log should be updated
        tasks.getIntent({ id }, { fields: ['events'] }).catch(() => {});
    },

    report: async (_, { time, currency }) => {
        const client = await asyncClient;

        const res = await client.get('/aksopay/payment_intents/balance_report', {
            time: time.join('-'),
            currency,
        });

        return res.body;
    },

    iFiltersToAPI: async ({ filters }) => {
        return filtersToAPI(iClientFilters, filters);
    },
};
export const views = {
    org: class Org extends AbstractDataView {
        constructor (options) {
            super();
            const { id } = options;
            this.id = id;

            store.subscribe([PAYMENT_ORGS, id, PO_DATA], this.#onUpdate);
            const current = store.get([PAYMENT_ORGS, id, PO_DATA]);
            if (current) setImmediate(this.#onUpdate);

            if (!options.noFetch) {
                tasks.getOrg({ id }).catch(err => this.emit('error', err));
            }
        }
        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) {
                this.emit('update', store.get([PAYMENT_ORGS, this.id, PO_DATA]), 'delete');
            } else {
                this.emit('update', store.get([PAYMENT_ORGS, this.id, PO_DATA]));
            }
        };
        drop () {
            store.unsubscribe([PAYMENT_ORGS, this.id, PO_DATA], this.#onUpdate);
        }
    },

    addon: class Addon extends AbstractDataView {
        constructor (options) {
            super();
            const { org, id } = options;
            this.org = org;
            this.id = id;

            store.subscribe([PAYMENT_ORGS, org, PO_ADDONS, id], this.#onUpdate);
            const current = store.get([PAYMENT_ORGS, org, PO_ADDONS, id]);
            if (current) setImmediate(this.#onUpdate);

            if (!options.noFetch) {
                tasks.getAddon({ org, id }).catch(err => this.emit('error', err));
            }
        }
        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) {
                this.emit('update', store.get([PAYMENT_ORGS, this.org, PO_ADDONS, this.id]), 'delete');
            } else {
                this.emit('update', store.get([PAYMENT_ORGS, this.org, PO_ADDONS, this.id]));
            }
        };
        drop () {
            store.unsubscribe([PAYMENT_ORGS, this.org, PO_ADDONS, this.id], this.#onUpdate);
        }
    },

    method: class Method extends AbstractDataView {
        constructor (options) {
            super();
            const { org, id } = options;
            this.org = org;
            this.id = id;

            store.subscribe([PAYMENT_ORGS, org, PO_METHODS, id], this.#onUpdate);
            const current = store.get([PAYMENT_ORGS, org, PO_METHODS, id]);
            if (current) setImmediate(this.#onUpdate);

            if (!options.noFetch) {
                tasks.getMethod({ org, id }).catch(err => this.emit('error', err));
            }
        }
        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) {
                this.emit('update', store.get([PAYMENT_ORGS, this.org, PO_METHODS, this.id]), 'delete');
            } else {
                this.emit('update', store.get([PAYMENT_ORGS, this.org, PO_METHODS, this.id]));
            }
        };
        drop () {
            store.unsubscribe([PAYMENT_ORGS, this.org, PO_METHODS, this.id], this.#onUpdate);
        }
    },

    intent: class Intent extends AbstractDataView {
        constructor (options) {
            super();
            const { id, fields } = options;
            this.id = id;
            this.fields = fields;

            store.subscribe([PAYMENT_INTENTS, this.id], this.#onUpdate);
            const current = store.get([PAYMENT_INTENTS, this.id]);
            if (current) setImmediate(this.#onUpdate);

            let shouldFetch = !options.noFetch;
            if (options.lazyFetch) {
                shouldFetch = false;
                for (const field of options.fields) {
                    if (!current || !current[field]) {
                        shouldFetch = true;
                        break;
                    }
                }
            }

            if (shouldFetch) {
                tasks.getIntent({ id }, { fields }).catch(err => this.emit('error', err));
            }
        }

        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) {
                this.emit('update', store.get([PAYMENT_INTENTS, this.id]), 'delete');
            } else {
                this.emit('update', store.get([PAYMENT_INTENTS, this.id]));
            }
        };

        drop () {
            store.unsubscribe([PAYMENT_INTENTS, this.id], this.#onUpdate);
        }
    },

    sigOrgs: createStoreObserver([PAYMENT_ORGS, SIG_PAYMENT_ORGS]),
    sigAddons: createStoreObserver(({ org }) => [PAYMENT_ORGS, org, SIG_PO_ADDONS]),
    sigMethods: createStoreObserver(({ org }) => [PAYMENT_ORGS, org, SIG_PO_METHODS]),
    sigIntents: createStoreObserver([PAYMENT_INTENTS, SIG_PAYMENT_INTENTS]),
};
