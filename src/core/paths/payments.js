import asyncClient from '../client';
import * as store from '../store';
import { deepMerge } from '../../util';
import { makeParametersToRequestData, makeClientFromAPI, makeClientToAPI } from '../list';

export const PAYMENT_ORGS = 'paymentOrgs';
export const PO_ADDONS = 'poAddons';
export const PO_METHODS = 'poMethods';
export const PAYMENT_INTENTS = 'paymentIntents';

//! # Data structure
//! ```
//! PAYMENT_ORGS
//! |- [org id]
//!    |- (org data)
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

// intents stuff
const iClientFields = {
    id: 'id',
    customer: {
        apiFields: ['codeholderId', 'customer.email', 'customer.name'],
        fromAPI: intent => ({
            id: intent.codeholderId,
            email: intent.customer.email,
            name: intent.customer.name,
        }),
        toAPI: () => ({}),
    },
    method: {
        apiFields: ['paymentMethod.id'],
        fromAPI: intent => ({
            id: intent.paymentMethodId,
        }),
        toAPI: () => ({}),
    },
    org: 'org',
    currency: 'currency',
    status: 'status',
    events: 'events',
    timeCreated: 'timeCreated',
    statusTime: 'statusTime',
    internalNotes: 'internalNotes',
    customerNotes: 'customerNotes',
    foreignId: 'foreignId',
    stripePaymentIntentId: 'stripePaymentIntentId',
    stripeClientSecret: 'stripeClientSecret',
    purposes: 'purposes',
    totalAmount: 'totalAmount',
    amountRefunded: 'amountRefunded',
};
const iClientFilters = {};

const iParametersToRequestData = makeParametersToRequestData({
    clientFields: iClientFields,
    clientFilters: iClientFilters,
});
const iClientFromAPI = makeClientFromAPI(iClientFields);

export const tasks = {
    listOrgs: async (_, { offset, limit }) => {
        const client = await asyncClient;
        const res = await client.get('/aksopay/payment_orgs', {
            offset,
            limit,
            fields: ['id', 'org', 'name', 'description'],
        });
        for (const item of res.body) {
            const existing = store.get([PAYMENT_ORGS, item.id]);
            store.insert([PAYMENT_ORGS, item.id], deepMerge(existing, item));
        }
        return { items: res.body.map(x => x.id), total: +res.headers.get('x-total-items') };
    },
    createOrg: async (_, { org, name, description }) => {
        const client = await asyncClient;
        description = description || null;
        const res = await client.post('/aksopay/payment_orgs', {
            org,
            name,
            description,
        });
        const id = +res.headers.get('x-identifier');
        store.insert([PAYMENT_ORGS, id], { id, org, name, description });
        return id;
    },
    updateOrg: async ({ id }, params) => {
        const client = await asyncClient;
        await client.patch(`/aksopay/payment_orgs/${id}`, params);
        const existing = store.get([PAYMENT_ORGS, +id]);
        store.insert([PAYMENT_ORGS, +id], deepMerge(existing, params));
    },
    deleteOrg: async ({ id }) => {
        const client = await asyncClient;
        await client.delete(`/aksopay/payment_orgs/${id}`);
        store.remove([PAYMENT_ORGS, id]);
    },
    listAddons: async ({ org }, { offset, limit }) => {
        const client = await asyncClient;
        const res = await client.get(`/aksopay/payment_orgs/${org}/addons`, {
            offset,
            limit,
            fields: ['id', 'name', 'description'],
        });
        for (const item of res.body) {
            const path = [PAYMENT_ORGS, org, PO_ADDONS, item.id];
            store.insert(path, item);
        }
        return { items: res.body.map(x => x.id), total: +res.headers.get('x-total-items') };
    },
    createAddon: async ({ org }, { name, description }) => {
        const client = await asyncClient;
        const res = await client.post(`/aksopay/payment_orgs/${org}/addons`, {
            name,
            description,
        });
        const id = +res.headers.get('x-identifier');
        store.insert([PAYMENT_ORGS, org, PO_ADDONS, id], { id, name, description });
        return id;
    },
    updateAddon: async ({ org, id }, params) => {
        const client = await asyncClient;
        await client.patch(`/aksopay/payment_orgs/${org}/addons/${id}`, params);
        const path = [PAYMENT_ORGS, org, PO_ADDONS, id];
        const existing = store.get(path);
        store.insert(path, deepMerge(existing, params));
    },
    deleteAddon: async ({ org, id }) => {
        const client = await asyncClient;
        await client.delete(`/aksopay/payment_orgs/${org}/addons/${id}`);
        store.remove([PAYMENT_ORGS, org, PO_ADDONS, id]);
    },
    listMethods: async ({ org }, { offset, limit }) => {
        const client = await asyncClient;
        const res = await client.get(`/aksopay/payment_orgs/${org}/methods`, {
            offset,
            limit,
            fields: ['id', 'type', 'name', 'internalDescription'],
        });
        for (const item of res.body) {
            const path = [PAYMENT_ORGS, org, PO_METHODS, item.id];
            item.thumbnailKey = getThumbnailKey();
            const existing = store.get(path);
            store.insert(path, deepMerge(existing, item));
        }
        return { items: res.body.map(x => x.id), total: +res.headers.get('x-total-items') };
    },
    createMethod: async ({ org }, params) => {
        const client = await asyncClient;
        const res = await client.post(`/aksopay/payment_orgs/${org}/methods`, params);
        const id = +res.headers.get('x-identifier');
        store.insert([PAYMENT_ORGS, org, PO_METHODS, id], { id, ...params });
        return id;
    },
    getMethod: async ({ org, id }) => {
        const client = await asyncClient;
        const res = await client.get(`/aksopay/payment_orgs/${org}/methods/${id}`, {
            fields: [
                'id', 'type', 'stripeMethods', 'name', 'internalDescription',
                'description', 'currencies', 'paymentValidity', 'isRecommended',
                'stripePublishableKey',
            ],
        });
        const path = [PAYMENT_ORGS, org, PO_METHODS, id];
        const existing = store.get(path);
        store.insert(path, deepMerge(existing, res.body));
        return res.body;
    },
    updateMethod: async ({ org, id }, params) => {
        const client = await asyncClient;
        await client.patch(`/aksopay/payment_orgs/${org}/methods/${id}`, params);
        const path = [PAYMENT_ORGS, org, PO_METHODS, id];
        const existing = store.get(path);
        store.insert(path, deepMerge(existing, params));
    },
    deleteMethod: async ({ org, id }) => {
        const client = await asyncClient;
        await client.delete(`/aksopay/payment_orgs/${org}/methods/${id}`);
        store.remove([PAYMENT_ORGS, org, PO_METHODS, id]);
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
    },
    deleteMethodThumbnail: async ({ org, id }) => {
        const client = await asyncClient;
        await client.delete(`/aksopay/payment_orgs/${org}/methods/${id}/thumbnail`);
        const path = [PAYMENT_ORGS, org, PO_METHODS, id];
        const existing = store.get(path);
        store.insert(path, deepMerge(existing, { thumbnailKey: getThumbnailKey() }));
    },

    // MARK - INTENTS
    listIntents: async (_, parameters) => {
        const client = await asyncClient;
        const { options, usedFilters, transientFields } = iParametersToRequestData(parameters);
        const result = await client.get('/aksopay/payment_intents', options);
        const list = result.body;
        const totalItems = +result.res.headers.get('x-total-items');

        for (const item of list) {
            const existing = store.get([PAYMENT_INTENTS, item.id]);
            store.insert([PAYMENT_INTENTS, item.id], deepMerge(existing, iClientFromAPI(item)));
        }

        return {
            items: list.map(x => x.id),
            total: totalItems,
            transientFields,
            stats: {
                time: result.resTime,
                filtered: usedFilters,
            },
        };
    },
    intent: async ({ id }, { fields }) => {
        const client = await asyncClient;
        const res = await client.get(`/aksopay/payment_intents/${id}`, {
            fields: ['id'].concat(fields.flatMap(id => typeof iClientFields[id] === 'string'
                ? [iClientFields[id]]
                : iClientFields[id].apiFields)),
        });

        const existing = store.get([PAYMENT_INTENTS, +id]);
        store.insert([PAYMENT_INTENTS, +id], deepMerge(existing, iClientFromAPI(res.body)));

        return +id;
    },
    cancelIntent: async ({ id }) => {
        const client = await asyncClient;
        await client.post(`/aksopay/payment_intents/${id}/!cancel`);
        const existing = store.get([PAYMENT_INTENTS, +id]);
        store.insert([PAYMENT_INTENTS, +id], deepMerge(existing, { status: 'canceled' }));
    },
    markIntentDisputed: async ({ id }) => {
        const client = await asyncClient;
        await client.post(`/aksopay/payment_intents/${id}/!mark_disputed`);
        const existing = store.get([PAYMENT_INTENTS, +id]);
        store.insert([PAYMENT_INTENTS, +id], deepMerge(existing, { status: 'disputed' }));
    },
    markIntentRefunded: async ({ id }) => {
        const client = await asyncClient;
        await client.post(`/aksopay/payment_intents/${id}/!mark_refunded`);
        const existing = store.get([PAYMENT_INTENTS, +id]);
        store.insert([PAYMENT_INTENTS, +id], deepMerge(existing, { status: 'refunded' }));
    },
    markIntentSucceeded: async ({ id }) => {
        const client = await asyncClient;
        await client.post(`/aksopay/payment_intents/${id}/!mark_succeeded`);
        const existing = store.get([PAYMENT_INTENTS, +id]);
        store.insert([PAYMENT_INTENTS, +id], deepMerge(existing, { status: 'succeeded' }));
    },
    submitIntent: async ({ id }) => {
        const client = await asyncClient;
        await client.post(`/aksopay/payment_intents/${id}/!submit`);
        const existing = store.get([PAYMENT_INTENTS, +id]);
        store.insert([PAYMENT_INTENTS, +id], deepMerge(existing, { status: 'submitted' }));
    },
};
export const views = {};
