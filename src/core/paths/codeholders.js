import { UEACode, util } from '@tejo/akso-client';
import { AbstractDataView, createStoreObserver } from '../view';
import asyncClient from '../client';
import * as store from '../store';
import * as log from '../log';
import { makeParametersToRequestData, makeClientFromAPI, makeClientToAPI } from '../list';
import { LOGIN_ID } from './login-keys';
import { deepMerge, deepEq } from '../../util';

//! # Client-side codeholder representation
//! - fields with no value are null or an empty string
//! - fields that have not been loaded must be undefined
//!
//! ## Fields
//! - id: identical to API
//! - type: string 'human' or 'org'
//! - name: object { first, last, firstLegal, lastLegal, honorific }
//!   or object { full, local, abbrev }
//! - careOf: identical to API
//! - website: identical to API
//! - biography: identical to API
//! - code: object { new, old } where old always has a check letter
//! - creationTime: identical to API
//! - hasPassword: identical to API
//! - address: object that’s identical to API, except every field also has a -Latin variant
//!   may have a magic `$latin: bool` key to only send one variant to the API
//! - feeCountry: identical to API
//! - membership: identical to API
//! - email: identical to API
//! - enabled: identical to API
//! - notes: identical to API
//! - officePhone: object { value, formatted }
//! - landlinePhone: object { value, formatted }
//! - cellphone: object { value, formatted }
//! - isDead: identical to API
//! - birthdate: identical to API
//! - age: object { now, atStartOfYear }
//! - deathdate: identical to API
//! - profilePictureHash: identical to API
//! - isActiveMember: identical to API
//! - profession: identical to API
//!
//! Read-only derived fields:
//!
//! - country: { fee, address }
//! - addressCity: identical to addressLatin.city
//! - addressCountryArea: identical to addressLatin.countryArea

/// Data store path.
export const CODEHOLDERS = 'codeholders';

// signals
export const SIG_MEMBERSHIPS = '!memberships';
export const SIG_FILES = '!files';

// used below; this is just here for DRY
const addressSubfields = [
    'country',
    'countryArea',
    'city',
    'cityArea',
    'streetAddress',
    'postalCode',
    'sortingCode',
];
// ditto
const phoneFormat = field => ({
    apiFields: [field, field + 'Formatted'],
    fromAPI: codeholder => codeholder[field] === undefined
        ? undefined
        : { value: codeholder[field], formatted: codeholder[field + 'Formatted'] },
    // -Formatted is a derived property so we never serialize it
    toAPI: ({ value }) => value !== undefined ? { [field]: value } : {},
});

/// Codeholder fields in the client-side representation.
///
/// - apiFields: corresponding API fields for this field
///   this can either be a string (for 1:1 mapping) or an array (for other mappings)
/// - fromAPI: maps an API codeholder to a value of this field. required fields can be assumed to
///   exist in the API codeholder (if apiFields is a string, this is automatic)
///   except in field history, required fields won’t be loaded there. use heuristics
/// - toAPI: maps a value of this field to a partial API codeholder
///   (if apiFields is a string, this is automatic)
/// - requires: required client-side fields that must also be requested (for e.g. disambiguation)
/// - sort: API field to sort by. If not given, use apiFields in the given order
const clientFields = {
    id: 'id',
    type: {
        apiFields: ['codeholderType'],
        fromAPI: codeholder => codeholder.codeholderType,
        toAPI: value => ({ codeholderType: value }),
        requires: ['enabled', 'isDead'],
    },
    name: {
        apiFields: [
            'firstName', 'lastName', 'firstNameLegal', 'lastNameLegal', 'honorific',
            'fullName', 'fullNameLocal', 'nameAbbrev',
        ],
        fromAPI: codeholder => {
            const value = {};
            let isEmpty = true;

            // use actual type or heuristics
            const codeholderType = codeholder.codeholderType || (codeholder.firstNameLegal ? 'human' : 'org');

            if (codeholderType === 'human') {
                for (const f of ['firstName', 'lastName', 'firstNameLegal', 'lastNameLegal', 'honorific']) {
                    const item = codeholder[f];
                    if (item !== undefined) {
                        isEmpty = false;
                        value[f.replace(/Name/, '')] = item;
                    }
                }
            } else if (codeholderType === 'org') {
                if (codeholder.fullName !== undefined
                    || codeholder.fullNameLocal !== undefined
                    || codeholder.nameAbbrev !== undefined) {
                    isEmpty = false;
                }
                if (codeholder.fullName !== undefined) value.full = codeholder.fullName;
                if (codeholder.fullNameLocal !== undefined) value.local = codeholder.fullNameLocal;
                if (codeholder.nameAbbrev !== undefined) value.abbrev = codeholder.nameAbbrev;
            }
            if (isEmpty) return undefined;
            return value;
        },
        toAPI: value => {
            const codeholder = {};
            if (value !== undefined && ('firstLegal' in value)) {
                // human
                for (const f of ['firstName', 'lastName', 'firstNameLegal', 'lastNameLegal', 'honorific']) {
                    const cf = f.replace(/Name/, '');
                    if (value[cf] !== undefined) codeholder[f] = value[cf] || null;
                }
            } else if (value !== undefined) {
                // org
                if (value.full !== undefined) codeholder.fullName = value.full || null;
                if (value.local !== undefined) codeholder.fullNameLocal = value.local || null;
                if (value.abbrev !== undefined) codeholder.nameAbbrev = value.abbrev || null;
            }
            return codeholder;
        },
        requires: ['type', 'isDead'],
        sort: ['searchName'],
    },
    careOf: 'careOf',
    website: 'website',
    biography: 'biography',
    code: {
        apiFields: ['newCode', 'oldCode'],
        fromAPI: codeholder => codeholder.newCode === undefined && codeholder.oldCode === undefined
            ? undefined
            : { new: codeholder.newCode, old: codeholder.oldCode },
        // oldCode is read-only, so we only serialize newCode
        toAPI: value => value.new !== undefined ? { newCode: value.new } : {},
    },
    creationTime: 'creationTime',
    hasPassword: 'hasPassword',
    address: {
        apiFields: addressSubfields.flatMap(f => [`address.${f}`, `addressLatin.${f}`]),
        fromAPI: codeholder => {
            const value = {};
            let isEmpty = true;
            for (const f of addressSubfields) {
                const aValue = codeholder.address ? codeholder.address[f] : undefined;
                if (aValue !== undefined) {
                    isEmpty = false;
                    value[f] = aValue;
                }
                const lValue = codeholder.addressLatin ? codeholder.addressLatin[f] : undefined;
                if (lValue !== undefined) {
                    isEmpty = false;
                    value[f + 'Latin'] = lValue;
                }
            }
            if (isEmpty) return undefined;
            return value;
        },
        toAPI: value => {
            const codeholder = {};
            const sendNormal = value.$latin !== true;
            const sendLatin = value.$latin !== false;
            if (sendNormal) codeholder.address = {};
            if (sendLatin) codeholder.addressLatin = {};
            for (const f of addressSubfields) {
                if (sendNormal && value[f] !== undefined) codeholder.address[f] = value[f];
                if (sendLatin && value[f + 'Latin'] !== undefined) codeholder.addressLatin[f] = value[f + 'Latin'];
            }
            if (!Object.keys(codeholder.address).length) delete codeholder.address;
            if (!Object.keys(codeholder.addressLatin).length) delete codeholder.addressLatin;
            return codeholder;
        },
        sort: ['addressLatin.country', 'addressLatin.postalCode'],
    },
    feeCountry: 'feeCountry',
    membership: 'membership',
    email: 'email',
    enabled: 'enabled',
    notes: 'notes',
    officePhone: phoneFormat('officePhone'),
    landlinePhone: phoneFormat('landlinePhone'),
    cellphone: phoneFormat('cellphone'),
    isDead: 'isDead',
    birthdate: {
        apiFields: ['birthdate'],
        fromAPI: codeholder => codeholder.birthdate,
        toAPI: value => value !== undefined ? { birthdate: value } : {},
        requires: ['age'],
    },
    age: {
        apiFields: ['age', 'agePrimo'],
        fromAPI: codeholder => codeholder.age === undefined && codeholder.agePrimo === undefined
            ? undefined
            : { now: codeholder.age, atStartOfYear: codeholder.agePrimo },
        // agePrimo is a derived property so we never serialize it
        toAPI: value => value.now !== undefined ? { age: value.now } : {},
        requires: ['isDead'], // to ignore atStartOfYear when they’re dead
    },
    deathdate: 'deathdate',
    profilePictureHash: 'profilePictureHash',
    isActiveMember: 'isActiveMember',
    profession: 'profession',

    country: {
        apiFields: ['addressLatin.country', 'feeCountry'],
        fromAPI: codeholder => codeholder.feeCountry === undefined
            && (!codeholder.addressLatin || codeholder.addressLatin.country === undefined)
            ? undefined
            : {
                fee: codeholder.feeCountry,
                address: codeholder.addressLatin && codeholder.addressLatin.country,
            },
        toAPI: () => ({}),
    },
    addressCity: {
        apiFields: ['addressLatin.city'],
        fromAPI: codeholder => codeholder.addressLatin && codeholder.addressLatin.city,
        toAPI: () => ({}),
    },
    addressCountryArea: {
        apiFields: ['addressLatin.countryArea'],
        fromAPI: codeholder => codeholder.addressLatin && codeholder.addressLatin.countryArea,
        toAPI: () => ({}),
    },
};

const fieldHistoryBlacklist = [
    'oldCode',
    'landlinePhoneFormatted',
    'officePhoneFormatted',
    'cellphoneFormatted',
];
const isFieldHistoryBlacklisted = field => fieldHistoryBlacklist.includes(field);

/// converts from API repr to client repr (see above)
const clientFromAPI = makeClientFromAPI(clientFields);
const clientToAPI = makeClientToAPI(clientFields);

//! # Client-side filter representation
//! - type: 'human', or 'org'
//! - country: object { type, set } where type is one of null, 'fee', or 'address' and set is a
//!   list of countries and country groups
//! - enabled: true or false
//! - age: object { range, atStartOfYear } where range is a two-element array representing an
//!   inclusive interval and atStartOfYear is a bool
//! - hasOldCode: true or false
//! - hasEmail: true or false
//! - hasPassword: true or false
//! - isDead: true or false
//! - membership: array of objects { invert, lifetime, givesMembership, useRange, range, categories }
//!   where invert, lifetime, givesMembership, useRange are bool, range is an inclusive year
//!   interval, and categories is an array of membership category ids
//! - isActiveMember: array [lower bound year, upper bound year]
//! - deathdate: array [lower bound year, upper bound year]

/// Client filter specs.
///
/// - toAPI: converts client repr to an API filter
/// - fields: required API fields for this filter (wrt permissions)
const clientFilters = {
    type: {
        toAPI: value => ({ codeholderType: value }),
        fields: ['codeholderType'],
    },
    country: {
        toAPI: ({ type, set }) => {
            const countryGroups = [];
            const countries = [];
            for (const item of set) {
                if (item.startsWith('x')) countryGroups.push(item);
                else countries.push(item);
            }
            const filterItems = [];
            if (type === null || type === 'fee') {
                filterItems.push({ feeCountry: { $in: countries } });
                filterItems.push({ feeCountryGroups: { $hasAny: countryGroups } });
            }
            if (type === null || type === 'address') {
                filterItems.push({ 'addressLatin.country': { $in: countries } });
                filterItems.push({ 'addressCountryGroups': { $hasAny: countryGroups } });
            }
            return { $or: filterItems };
        },
        // TODO: maybe there are user who can only see one but still want to use the filter?
        fields: ['feeCountry', 'addressLatin.country'],
    },
    enabled: {
        toAPI: value => ({ enabled: value }),
        fields: ['enabled'],
    },
    age: {
        toAPI: ({ range, atStartOfYear }) => ({ [atStartOfYear ? 'agePrimo' : 'age']: { $range: range } }),
        fields: ['age', 'agePrimo'],
    },
    hasOldCode: {
        toAPI: value => ({ oldCode: value ? { $neq: null } : null }),
        fields: ['oldCode'],
    },
    hasEmail: {
        toAPI: value => ({ email: value ? { $neq: null } : null }),
        fields: ['email'],
    },
    hasPassword: {
        toAPI: value => ({ hasPassword: value }),
        fields: ['hasPassword'],
    },
    isDead: {
        toAPI: value => ({ isDead: value }),
        fields: ['isDead'],
    },
    membership: {
        toAPI: value => {
            const items = value.map(({
                invert, lifetime, givesMembership, useRange, range, categories,
            }) => {
                const filter = {};
                if (givesMembership !== null) {
                    filter.givesMembership = invert ? !givesMembership : givesMembership;
                }
                if (lifetime !== null) {
                    filter.lifetime = invert ? !lifetime : lifetime;
                }
                if (useRange) {
                    if (invert) {
                        const [lowerYear, upperYear] = range;
                        filter.$or = [
                            { year: { $lt: lowerYear } },
                            { year: { $gt: upperYear } },
                        ];
                    } else filter.year = { $range: range };
                }
                if (categories.length) {
                    filter.categoryId = invert ? { $nin: categories } : { $in: categories };
                }
                return filter;
            });

            return { $membership: { $and: items } };
        },
        fields: ['membership'],
    },
    isActiveMember: {
        toAPI: range => ({
            $membership: {
                givesMembership: true,
                $or: [
                    {
                        lifetime: false,
                        year: { $range: range },
                    },
                    {
                        lifetime: true,
                        year: { $lte: range[0] },
                    },
                ],
            },
        }),
        fields: ['membership'],
    },
    deathdate: {
        toAPI: range => ({ deathdate: { $range: [`${range[0]}-01-01`, `${range[1]}-12-31`] } }),
        fields: ['deathdate'],
    },
};

/// Transient client fields that will be selected for a given search field.
///
/// This is a list of exceptions; all other will be passed through as-is.
const searchFieldToTransientFields = {
    nameOrCode: ['name', 'code'],
    searchAddress: ['address'],
};

/// Converts params to request options. See task codeholders/list for details.
const parametersToRequestData = makeParametersToRequestData({
    searchFieldToTransientFields,
    handleSearchFields: ({ query, field }) => {
        let prependedUeaCodeSearch;

        if (field === 'nameOrCode') {
            field = 'searchName';
            try {
                // if the query is a valid UEA code; prepend search
                const code = new UEACode(query);
                if (code.type === 'new') prependedUeaCodeSearch = { newCode: query };
                else prependedUeaCodeSearch = { oldCode: query };
            } catch (invalidUeaCode) { /* only search for name otherwise */ }
        } else if (['landlinePhone', 'officePhone', 'cellphone'].includes(field)) {
            // filter out non-alphanumeric characters because they might be interpreted as
            // search operators
            query = query.replace(/[^a-z0-9]/ig, '');
        }

        const transformedQuery = util.transformSearch(query);

        if (!util.isValidSearch(transformedQuery)) {
            throw { code: 'invalid-search-query', message: 'invalid search query' };
        }

        return {
            search: { str: transformedQuery, cols: [field] },
            data: { prependedUeaCodeSearch },
        };
    },
    clientFields,
    clientFilters,
});

export const tasks = {
    /// codeholders/fields: lists available fields according to permissions (it is recommended that
    /// you use the corresponding view instead)
    /// returns an array with field ids
    fields: async () => {
        const client = await asyncClient;
        const fields = [];
        for (const field in clientFields) {
            const spec = clientFields[field];
            let hasPerm;
            if (typeof spec === 'string') hasPerm = await client.hasCodeholderField(spec);
            else if (typeof spec.apiFields === 'string') hasPerm = await client.hasCodeholderField(spec.apiFields);
            else {
                for (const f of spec.apiFields) {
                    if (await client.hasCodeholderField(f, 'r')) {
                        hasPerm = true;
                        break;
                    }
                }
            }
            if (hasPerm) fields.push(field);
        }
        return fields;
    },
    /// codeholders/filters: lists available filters according to permissions (it is recommended
    /// that you use the corresponding view instead)
    /// returns an array with filter ids
    filters: async () => {
        const client = await asyncClient;
        const filters = [];
        for (const filter in clientFilters) {
            if (client.hasCodeholderFields('r', ...clientFilters[filter].fields)) {
                filters.push(filter);
            }
        }
        return filters;
    },
    /// codeholders/list: fetches codeholders
    /// options: none
    /// parameters:
    ///    - search: { field: string, query: string }
    ///    - filters: object { [name]: { value, enabled } }
    ///        - if key `_disabled` is set, will be disabled
    ///    - jsonFilter: object { filter: object, error: string?, disabled: bool }
    ///    - fields: [{ id: string, sorting: 'asc' | 'desc' | 'none' }]
    ///    - offset: number
    ///    - limit: number
    /// returns:
    ///    - items: [data store id list]
    ///    - transientFields: [string]
    ///    - total: number
    ///    - cursed: bool
    ///    - stats
    ///        - filtered: bool
    ///        - time: string
    list: async (_, parameters) => {
        const client = await asyncClient;

        const {
            options, prependedUeaCodeSearch, usedFilters, transientFields,
        } = parametersToRequestData(parameters);

        let itemToPrepend = null;
        if (prependedUeaCodeSearch) {
            itemToPrepend = (await client.get('/codeholders', {
                filter: prependedUeaCodeSearch,
                // only need to know about its existence on later pages
                fields: options.offset === 0 ? options.fields : [],
                limit: 1,
            })).body[0];
            if (itemToPrepend) itemToPrepend.isCursed = true;
        }

        if (itemToPrepend) {
            // there’s an extra item at the front
            // on the first page, just reduce the limit to compensate
            if (parameters.offset === 0) options.limit--;
            // and on any other page, reduce the offset to compensate
            else options.offset--;
        }

        const result = await client.get('/codeholders', options);
        let list = result.body;
        let totalItems = +result.res.headers.get('x-total-items');
        let cursed = false;

        if (itemToPrepend) {
            cursed = true;
            let isDuplicate = false;
            for (const item of list) {
                if (item.id === itemToPrepend.id) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                // prepend item on the first page if it’s not a duplicate
                if (parameters.offset === 0) list.unshift(itemToPrepend);
                totalItems++;
            }
        }

        for (const item of list) {
            const existing = store.get([CODEHOLDERS, item.id]);
            store.insert([CODEHOLDERS, item.id], deepMerge(existing, clientFromAPI(item)));
        }

        list = list.map(item => item.id);

        return {
            items: list,
            total: totalItems,
            cursed,
            transientFields,
            stats: {
                time: result.resTime,
                filtered: usedFilters,
            },
        };
    },
    /// codeholders/codeholder: gets a single codeholder and puts it in the data store
    ///
    /// # Options
    /// - id: codeholder id or `self`
    /// - fields: client field ids
    ///
    /// Returns the resolved id (i.e. always a number, never `self`)
    codeholder: async (_, { id, fields }) => {
        const client = await asyncClient;
        const res = await client.get(`/codeholders/${id}`, {
            fields: ['id'].concat(fields.flatMap(id => typeof clientFields[id] === 'string'
                ? [clientFields[id]]
                : clientFields[id].apiFields)),
        });

        const storeId = id === 'self' ? store.get(LOGIN_ID) : id;

        const existing = store.get([CODEHOLDERS, storeId]);
        store.insert([CODEHOLDERS, storeId], deepMerge(existing, clientFromAPI(res.body)));

        return id;
    },
    /// codeholders/create: creates a codeholder
    ///
    /// # Parameters
    /// - all codeholder fields, really
    create: async (_, data) => {
        const client = await asyncClient;
        await client.post('/codeholders', clientToAPI(data));
        // can’t insert anything into the store because we don’t know the id
    },
    /// codeholders/delete: deletes a codeholder
    ///
    /// # Options
    /// - id: codeholder id
    delete: async ({ id }) => {
        const client = await asyncClient;
        await client.delete(`/codeholders/${id}`);

        const storeId = id === 'self' ? store.get(LOGIN_ID) : id;
        store.remove([CODEHOLDERS, storeId]);
    },
    /// codeholders/update: updates a codeholder
    ///
    /// # Options
    /// - id: codeholder id
    ///
    /// # Parameters
    /// - updateComment: modCmt
    /// - any codeholder fields; will be diffed
    update: async ({ id }, data) => {
        const client = await asyncClient;
        const codeholderData = { ...data };
        delete codeholderData.updateComment;
        const options = {};
        if (data.updateComment) options.modCmt = data.updateComment;

        const storeId = id === 'self' ? store.get(LOGIN_ID) : id;
        const existing = store.get([CODEHOLDERS, storeId]);
        const currentData = clientToAPI(existing);
        const newData = clientToAPI(codeholderData);
        const diff = {};

        for (const k in newData) {
            if (!deepEq(currentData[k], newData[k])) {
                diff[k] = newData[k];
            }
        }

        await client.patch(`/codeholders/${id}`, diff, options);

        // also update data in store
        store.insert([CODEHOLDERS, storeId], deepMerge(existing, codeholderData));
    },
    /// codeholders/setProfilePicture: sets a codeholder’s profile picture
    ///
    /// # Options and Parameters
    /// - id: codeholder id or `self`
    /// - blob: file blob (which has an appropriate mime type)
    setProfilePicture: async ({ id }, { blob }) => {
        const client = await asyncClient;
        await client.put(`/codeholders/${id}/profile_picture`, null, {}, [{
            name: 'picture',
            type: blob.type,
            value: blob,
        }]);
        // need to update profilePictureHash
        // but we don’t await this because when this fails it shouldn’t display an error
        tasks.codeholder({}, { id, fields: ['profilePictureHash'] }).catch(err => {
            log.error('failed to fetch new profile picture hash', err);
        });
    },
    /// codeholders/listFiles: lists files for a codeholder
    ///
    /// # Options and Parameters
    /// - id: codeholder id
    /// - offset, limit
    ///
    /// Returns { items, total }
    listFiles: async ({ id }, { offset, limit }) => {
        const client = await asyncClient;
        const res = await client.get(`/codeholders/${id}/files`, {
            offset,
            limit,
            // all the fields
            fields: ['id', 'time', 'addedBy', 'name', 'description', 'mime', 'size'],
        });

        return { items: res.body, total: +res.res.headers.get('x-total-items') };
    },
    /// codeholders/uploadFile: uploads a file
    ///
    /// # Options and Parameters
    /// - id: codeholder id
    /// - name: file name
    /// - description: optional file description
    /// - file: blob
    uploadFile: async ({ id }, { name, description, file }) => {
        const client = await asyncClient;
        const options = { name };
        if (description) options.description = description;
        await client.post(`/codeholders/${id}/files`, options, undefined, [{
            name: 'file',
            type: file.type,
            value: file,
        }]);

        const storeId = id === 'self' ? store.get(LOGIN_ID) : id;
        store.signal([CODEHOLDERS, storeId, SIG_FILES]);
    },
    /// codeholders/deleteFile: deletes a file
    ///
    /// # Options and Parameters
    /// - id: codeholder id
    /// - file: file id
    deleteFile: async ({ id, file }) => {
        const client = await asyncClient;
        await client.delete(`codeholders/${id}/files/${file}`);
        const storeId = id === 'self' ? store.get(LOGIN_ID) : id;
        store.signal([CODEHOLDERS, storeId, SIG_FILES]);
    },
    /// codeholders/listMemberships: lists memberships for a codeholder
    ///
    /// # Options and Parameters
    /// - id: codeholder id
    /// - offset, limit
    ///
    /// Returns { items, total }
    listMemberships: async ({ id }, { offset, limit }) => {
        const client = await asyncClient;
        const res = await client.get(`/codeholders/${id}/membership`, {
            offset,
            limit,
            // most of the fields
            fields: [
                'id',
                'categoryId',
                'year',
                'nameAbbrev',
                'name',
                'givesMembership',
                'lifetime',
            ],
            order: [['year', 'desc']],
        });

        return { items: res.body, total: +res.res.headers.get('x-total-items') };
    },
    /// codeholders/addMembership: adds a membership
    ///
    /// # Options and Parameters
    /// - id: codeholder id
    /// - category: category id
    /// - year: year
    addMembership: async ({ id }, { category, year }) => {
        const client = await asyncClient;
        await client.post(`/codeholders/${id}/membership`, {
            categoryId: category,
            year: year,
        });

        const storeId = id === 'self' ? store.get(LOGIN_ID) : id;
        store.signal([CODEHOLDERS, storeId, SIG_MEMBERSHIPS]);

        // need to update membership
        // but we don’t await this because when this fails it shouldn’t display an error
        tasks.codeholder({}, { id, fields: ['membership'] }).catch(err => {
            log.error('failed to fetch new memberships', err);
        });
    },
    /// codeholders/deleteMembership: deletes a membership
    ///
    /// # Options and Parameters
    /// - id: codeholder id
    /// - membership: membership id
    deleteMembership: async ({ id }, { membership }) => {
        const client = await asyncClient;
        await client.delete(`/codeholders/${id}/membership/${membership}`);

        const storeId = id === 'self' ? store.get(LOGIN_ID) : id;
        store.signal([CODEHOLDERS, storeId, SIG_MEMBERSHIPS]);

        // need to update membership
        // but we don’t await this because when this fails it shouldn’t display an error
        tasks.codeholder({}, { id, fields: ['membership'] }).catch(err => {
            log.error('failed to fetch new memberships', err);
        });
    },
    /// codeholders/makeAddressLabels: spawns a task on the server
    ///
    /// # Options
    /// see codeholders/list
    ///
    /// # Parameters
    /// see api docs
    makeAddressLabels: async ({ search, filters, jsonFilter, fields }, parameters) => {
        const client = await asyncClient;
        const { options } = parametersToRequestData({ search, filters, jsonFilter, fields });
        delete options.fields;
        delete options.offset;
        delete options.limit;
        await client.post('/codeholders/!make_address_labels', parameters, options);
    },
    /// codeholders/address: gets a codeholder’s formatted address
    ///
    /// # Options and Parameters
    /// - id: codeholder id
    /// - lang: language (defaults to eo)
    /// - postal: whether to format as postalLatin
    address: async ({ id }, { lang = 'eo', postal = false }) => {
        const client = await asyncClient;
        const res = await client.get(`/codeholders/${id}/address/${lang}`, {
            formatAs: postal ? 'postalLatin' : 'displayLatin',
        });
        return res.body[id];
    },
    /// codeholders/fieldHistory: gets a codeholder field’s entire history
    ///
    /// Unlike the API, here mods contain the *new* value and not the *old* value.
    ///
    /// # Props
    /// - id: codeholder id
    /// - field: client field name
    ///
    /// # Returns
    /// - items: modifications, sorted by time
    fieldHistory: async ({ id, field }) => {
        const client = await asyncClient;

        const apiFields = typeof clientFields[field] === 'string'
            ? [clientFields[field]]
            : clientFields[field].apiFields.filter(x => !isFieldHistoryBlacklisted(x));
        let histFields = apiFields;

        // special history endpoint
        if (field === 'address') histFields = ['address'];

        const mods = {
            // the “null” change; initial value at db creation time or something
            priori: {
                comment: null,
                author: null,
                time: 0,
                id: null,
                data: {},
            },
        };

        const currentValues = (await client.get(`/codeholders/${id}`, {
            fields: apiFields,
        })).body;

        for (const fieldId of histFields) {
            let offset = 0;
            let total = null;
            let prevMod = 'priori';
            while (total === null || offset < total) {
                const res = await client.get(`/codeholders/${id}/hist/${fieldId}`, {
                    fields: ['val', 'modId', 'modTime', 'modBy', 'modCmt'],
                    offset,
                    limit: 100,
                    order: [['modId', 'asc']],
                });
                total = res.res.headers.get('x-total-items');
                if (res.body.length === 0 && offset < total) {
                    log.error('server returned zero items but we expected nonzero; aborting and returning partial');
                    total = 0;
                }
                offset += 100;

                for (const item of res.body) {
                    if (!mods[item.modId]) mods[item.modId] = {
                        comment: item.modCmt,
                        author: item.modBy,
                        time: item.modTime,
                        id: item.modId,
                        data: {},
                    };
                    // mod contains the *old* value; meaning this value goes in prevMod
                    if (prevMod) mods[prevMod].data[fieldId] = item.val[fieldId];
                    prevMod = item.modId;
                }
            }

            if (prevMod) mods[prevMod].data[fieldId] = currentValues[fieldId];
        }

        const modsByTime = Object.keys(mods).sort((a, b) => mods[a].time - mods[b].time);
        const currentData = {};
        for (const k of modsByTime) {
            // we’re operating under the assumption that not all fields might change for a given mod
            // so with multiple api fields, we might only have partial data sometimes
            // hence, we first assign the new partial data to the current data to update it
            Object.assign(currentData, mods[k].data);
            // then assign the merged data to the mod to have a complete snapshot
            mods[k].data = { ...currentData };
        }

        // now, decode the data into client-side reprs
        for (const k in mods) {
            mods[k].data = clientFromAPI(mods[k].data);
        }

        return {
            items: modsByTime.reverse().map(k => mods[k]),
        };
    },
};

const CODEHOLDER_FETCH_BATCH_TIME = 50; // ms
const codeholderBatchIds = new Set();
const codeholderBatchFields = new Set();
const codeholderBatchRejects = new Set();
let flushCodeholdersTimeout;

function flushCodeholders () {
    flushCodeholdersTimeout = null;
    const ids = [...codeholderBatchIds];
    const fields = [...codeholderBatchFields];
    const rejects = [...codeholderBatchRejects];
    codeholderBatchIds.clear();
    codeholderBatchFields.clear();
    codeholderBatchRejects.clear();

    tasks.list({}, {
        fields: fields.map(x => ({ id: x, sorting: 'none' })).concat([{ id: 'id', sorting: 'asc' }]),
        jsonFilter: {
            filter: {
                id: {
                    $in: ids,
                }
            },
        },
        limit: ids.length,
    }).catch(err => {
        for (const reject of rejects) reject(err);
    });
}

/// Fetches a codeholder’s details. Batches calls.
function fetchCodeholderForView (id, fields) {
    if (id === 'self') {
        // can’t batch this one
        return tasks.codeholder({}, { id, fields });
    }
    const now = Date.now() / 1000;
    if (codeholderBatchIds.size >= 100) {
        // we can only request 100 at once; flush now
        flushCodeholders();
    }
    codeholderBatchIds.add(id);
    for (const field of fields) codeholderBatchFields.add(field);
    if (!flushCodeholdersTimeout) {
        flushCodeholdersTimeout = setTimeout(flushCodeholders, CODEHOLDER_FETCH_BATCH_TIME);
    }
    return new Promise((resolve, reject) => {
        codeholderBatchRejects.add(reject);
    });
}

export const views = {
    // FIXME: the following two views assume that permissions are **immutable**
    // however, this is not the case and we need to handle this at some point (maybe)
    // (edge cases don’t really seem to be a priority tbh so maybe never)
    /// codeholders/fields: lists available fields according to permissions
    fields: class Fields extends AbstractDataView {
        constructor () {
            super();
            tasks.fields()
                .then(fields => this.emit('update', fields))
                .catch(err => this.emit('error', err));
        }
    },
    /// codeholders/fields: lists available filters according to permissions
    filters: class Filters extends AbstractDataView {
        constructor () {
            super();
            tasks.filters()
                .then(fields => this.emit('update', fields))
                .catch(err => this.emit('error', err));
        }
    },
    /// codeholders/codeholder: observes (and fetches) a codeholder
    ///
    /// # Options
    /// - id: codeholder id
    /// - fields: list of field ids to consider the minimal required set (will be fetched)
    /// - noFetch: if true, will not fetch
    /// - lazyFetch: if true, will only fetch if the data is missing
    codeholder: class CodeholderView extends AbstractDataView {
        constructor (options) {
            super();
            const { id, fields } = options;
            this.id = id === 'self' ? store.get(LOGIN_ID) : id; // resolve id
            this.fields = fields;

            store.subscribe([CODEHOLDERS, this.id], this.#onUpdate);
            const current = store.get([CODEHOLDERS, this.id]);
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

            /// Note that this specifically uses the id argument and not this.id so that we’re
            /// fetching `self` instead of the resolved id if id is set to `self`
            if (shouldFetch) {
                fetchCodeholderForView(id, fields).catch(err => this.emit('error', err));
            }
        }

        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) {
                this.emit('update', store.get([CODEHOLDERS, this.id]), 'delete');
            } else {
                this.emit('update', store.get([CODEHOLDERS, this.id]));
            }
        };

        drop () {
            store.unsubscribe([CODEHOLDERS, this.id], this.#onUpdate);
        }
    },
    /// codeholders/codeholderSigFiles: observes codeholder files for client-side changes
    ///
    /// # Options
    /// - id: codeholder id
    codeholderSigFiles: createStoreObserver(({ id }) => [CODEHOLDERS, id, SIG_FILES]),
    /// codeholders/codeholderSigFiles: observes codeholder files for client-side changes
    ///
    /// # Options
    /// - id: codeholder id
    codeholderSigMemberships: createStoreObserver(({ id }) => [CODEHOLDERS, id, SIG_MEMBERSHIPS]),
};
