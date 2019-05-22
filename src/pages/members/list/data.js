/** Handles interfacing with the API. */

import EventEmitter from 'events';
import { UEACode, util as aksoUtil } from 'akso-client';
import client from '../../../client';
import { Sorting } from './fields';

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
    country: ['addressLatin.country', 'feeCountry'],
    age: ['age', 'agePrimo'],
};

const phoneNumberFields = ['landlinePhone', 'officePhone', 'cellphone'];

const mapFieldId = id => fieldIdMapping[id] || [id];

let currentSearchQuery;
let currentSearch;
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

    let searchFields = [field];
    if (field === 'nameOrCode') {
        if (UEACode.validate(query)) {
            // TODO: prepend extra search with only the code
        }
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

    const searchQuery = JSON.stringify(options);
    if (searchQuery === currentSearchQuery && currentResult.ok) {
        dataSingleton.emit('result', currentResult);
        return;
    } else {
        currentSearchQuery = searchQuery;
    }

    const promise = currentSearch = client.get('/codeholders', options);
    promise.then(result => {
        if (currentSearch === promise) {
            if (result.bodyOk) {
                currentResult = {
                    ok: true,
                    list: result.body,
                    resTime: result.resTime,
                    totalItems: +result.res.headers.map['x-total-items'],
                };
                dataSingleton.emit('result', currentResult);
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
    const v = {};
    if (value.startInclusive) v.$gte = value.start;
    else v.$gt = value.start;
    if (value.endInclusive) v.$lte = value.end;
    else v.$lt = value.end;
    return v;
}

let loadedCountries;
dataSingleton.getCountries = function getCountries () {
    if (!loadedCountries) {
        loadedCountries = client.get('/countries', {
            limit: 300,
            fields: ['code', 'name_eo'],
            order: [['name_eo', 'asc']],
        }).then(result => {
            const map = {};
            for (const item of result.body) {
                map[item.code] = item.name_eo;
            }
            return map;
        });
    }
    return loadedCountries;
};

let loadedCountryGroups;
dataSingleton.getCountryGroups = function getCountryGroups () {
    if (!loadedCountryGroups) {
        loadedCountryGroups = client.get('/country_groups', {
            limit: 100,
            fields: ['code', 'name', 'countries'],
            order: [['name', 'asc']],
        }).then(result => {
            const map = {};
            for (const item of result.body) {
                map[item.code] = item;
            }
            return map;
        });
    }
    return loadedCountryGroups;
};

export default dataSingleton;
