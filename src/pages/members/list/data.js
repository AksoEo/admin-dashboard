/** Handles interfacing with the API. */

import EventEmitter from 'events';
import { UEACode, util as aksoUtil } from 'akso-client';
import client from '../../../client';
import { Sorting } from './fields';
import { FILTERABLE_FIELDS } from './search-input/fields';
import msgpack from 'msgpack-lite';

const { transformSearch, isValidSearch } = aksoUtil;

const dataSingleton = new EventEmitter();

const fieldIdMapping = {
    code: ['newCode', 'oldCode'],
    name: [
        'firstName',
        'lastName',
        'firstNameLegal',
        'lastNameLegal',
        'fullName',
        'fullNameLocal',
        'nameAbbrev',
    ],
    country: ['feeCountry', 'addressLatin.country'],
    age: ['age', 'agePrimo'],
    officePhone: ['officePhone', 'officePhoneFormatted'],
    landlinePhone: ['landlinePhone', 'landlinePhoneFormatted'],
    cellphone: ['cellphone', 'cellphoneFormatted'],
};

const phoneNumberFields = ['landlinePhone', 'officePhone', 'cellphone'];

const mapFieldId = id => fieldIdMapping[id] || [id];

/** The current search query as the user would describe it, i.e. only the search and filters. */
let currentUserSearchQuery;
/** The current search query as the API sees it, i.e. everything in the query string. */
let currentSearchQuery;
/** The current search promise. */
let currentSearch;
/** The current search result. */
let currentResult;

/**
 * Performs a search if necessary.
 * @param {string} field - the search field
 * @param {string} query - the query
 * @param {Array} filters - an array of search filters
 * @param {Array} fields - an array of selected fields
 */
dataSingleton.search = function search (field, query, filters, fields, offset, limit) {
    const order = fields.map(({ id, sorting }) => {
        if (sorting === Sorting.NONE) return null;
        else if (sorting === Sorting.ASC) return [mapFieldId(id)[0], 'asc'];
        else return [mapFieldId(id)[0], 'desc'];
    }).filter(id => id);

    const selectedFields = fields.map(({ id }) => mapFieldId(id)).flatMap(v => v);

    selectedFields.push('id');

    let singlePrependedItem = Promise.resolve(null);

    let searchFields = [field];
    if (field === 'nameOrCode') {
        try {
            // query is a valid UEA code; prepend search
            const code = new UEACode(query);
            const filter = {};
            if (code.type === 'new') filter.newCode = query;
            else filter.oldCode = query;
            singlePrependedItem = client.get('/codeholders', {
                filter,
                fields: selectedFields,
                limit: 1,
            }).then(result => {
                return result.body[0];
            });
        } catch (invalidUeaCode) { /* only search for name otherwise */ }
        searchFields = ['name'];
    } else if (field === 'address') searchFields = ['searchAddress'];
    else if (phoneNumberFields.includes(field)) {
        // filter out non-alphanumeric chars because they might be interpreted as search operators
        query = query.replace(/[^a-z0-9]/ig, '');
    }

    const filter = {};
    for (const predicate of filters) {
        if (predicate.enabled) {
            const result = toFilterValue(predicate.field, predicate.value);
            if (result) {
                const [field, value] = result;
                filter[field] = value;
            }
        }
    }

    const options = {
        order,
        fields: selectedFields,
        filter,
        offset,
        limit,
    };

    if (query) {
        const transformedQuery = transformSearch(query);

        if (!isValidSearch(transformedQuery)) {
            dataSingleton.emit('result', {
                ok: false,
                error: {
                    code: 'invalid-search-query',
                    toString () {
                        // TEMP
                        return '((temporary error message) invalid search query)';
                    },
                },
            });
            return;
        }

        options.search = { str: transformedQuery, cols: searchFields };
    }

    const userSearchQuery = JSON.stringify({
        filter: options.filter,
        search: options.search,
    });

    let goBackToFirstPage = false;
    if (userSearchQuery !== currentUserSearchQuery) {
        currentUserSearchQuery = userSearchQuery;
        goBackToFirstPage = true;
        options.offset = 0;
    }

    const searchQuery = JSON.stringify(options);
    if (searchQuery === currentSearchQuery && currentResult.ok) {
        dataSingleton.emit('result', currentResult);
        return;
    } else {
        currentSearchQuery = searchQuery;
    }

    const promise = currentSearch = singlePrependedItem.then(prependedItem => {
        if (prependedItem) {
            if (options.offset === 0) {
                // first page; show prepended item and show one less result
                options.limit--;
            } else {
                // not the first page; need to offset by one
                options.offset--;
            }
        }

        return client.get('/codeholders', options).then(result => [prependedItem, result]);
    }).then(([prependedItem, result]) => {
        if (currentSearch === promise) {
            if (result.bodyOk) {
                const list = result.body;

                // prepend `prependedItem` as long it’s not a duplicate
                // and as long as this is page 1
                let prependedIsDuplicate = false;
                if (prependedItem) {
                    for (const j of list) {
                        if (j.id === prependedItem.id) {
                            prependedIsDuplicate = true;
                            break;
                        }
                    }
                    if (!prependedIsDuplicate) list.unshift(prependedItem);
                }

                let totalItems = +result.res.headers.map['x-total-items'];
                if (prependedItem && !prependedIsDuplicate) totalItems++;

                currentResult = {
                    ok: true,
                    list,
                    resTime: result.resTime,
                    totalItems,
                };
                dataSingleton.emit('result', currentResult);
                if (goBackToFirstPage) dataSingleton.emit('reset-page');
            } else {
                // TODO: handle error
                throw new Error('unimplemented: handle !bodyOk');
            }
        }
    }).catch(error => {
        if (currentSearch === promise) {
            currentResult = { ok: false, error };
            dataSingleton.emit('result', currentResult);
        }
    });
};

function toFilterValue (field, value) {
    if (field === 'age') {
        return [value.atStartOfYear ? 'agePrimo' : 'age', numericRangeToFilter(value.range)];
    } else if (field === 'codeholderType') {
        if (value.org !== value.human) {
            if (value.org) return [field, 'org'];
            else return [field, 'human'];
        } else return null;
    } else if (field === 'hasOldCode') {
        return ['oldCode', value ? { $neq: null } : null];
    } else if (field === 'hasEmail') {
        return ['email', value ? { $neq: null } : null];
    } else {
        return [field, value];
    }
}

function numericRangeToFilter (value) {
    if (value.isCollapsed()) return { $eq: value.collapsedValue() };
    const v = {};
    if (value.startInclusive) v.$gte = value.start;
    else v.$gt = value.start;
    if (value.endInclusive) v.$lte = value.end;
    else v.$lt = value.end;
    return v;
}

dataSingleton.encodeQuery = function encodeQuery (
    field,
    query,
    filters,
    fields,
    page,
    rowsPerPage,
) {
    const serialized = {};
    if (query) {
        serialized.f = field;
        serialized.q = query;
    }
    if (filters.length) {
        const serializedFilters = filters
            .filter(x => x.enabled)
            .map(x => {
                if (FILTERABLE_FIELDS[x.field].serialize) {
                    return { i: x.field, v: FILTERABLE_FIELDS[x.field].serialize(x.value) };
                } else return { i: x.field, v: x.value };
            });
        serialized.p = serializedFilters;
    }
    serialized.c = fields.map(f => ({ i: f.id, s: f.sorting }));
    serialized.pos = [page, rowsPerPage];
    return msgpack.encode(serialized).toString('base64');
};

/** @throws */
dataSingleton.decodeQuery = function decodeQuery (query) {
    const serialized = msgpack.decode(Buffer.from(query, 'base64'));
    return {
        field: serialized.f,
        query: serialized.q,
        filters: (serialized.p || []).map(x => {
            if (FILTERABLE_FIELDS[x.i].deserialize) {
                return { field: x.i, value: FILTERABLE_FIELDS[x.i].deserialize(x.v) };
            } else return { field: x.i, value: x.v };
        }),
        fields: serialized.c.map(f => ({ id: f.i, sorting: f.s })),
        page: serialized.pos[0],
        rowsPerPage: serialized.pos[1],
    };
};

function cachedRequest (endpoint, options = {}, handle = (result => result.body)) {
    let cached;
    return function getCached () {
        if (!cached) {
            cached = client.get(endpoint, options).then(handle);
        }
        return cached;
    };
}

dataSingleton.getCountries = cachedRequest('/countries', {
    limit: 300,
    fields: ['code', 'name_eo'],
    order: [['name_eo', 'asc']],
}, result => {
    const map = {};
    for (const item of result.body) {
        map[item.code] = item.name_eo;
    }
    return map;
});

dataSingleton.getCountryGroups = cachedRequest('/country_groups', {
    limit: 100,
    fields: ['code', 'name', 'countries'],
    order: [['name', 'asc']],
}, result => {
    const map = {};
    for (const item of result.body) {
        map[item.code] = item;
    }
    return map;
});

dataSingleton.getPerms = cachedRequest('/perms');

export default dataSingleton;
