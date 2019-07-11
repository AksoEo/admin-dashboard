import { FILTERABLE_FIELDS } from './search-input/fields';
import { Sorting } from './fields';
import { UEACode, util } from 'akso-client';
import JSON5 from 'json5';
import client from '../../../client';

export const SET_JSON_ENABLED = 'set-json-enabled';
export function setJSONEnabled (enabled) {
    return { type: SET_JSON_ENABLED, enabled };
}

export const SET_JSON_FILTER = 'set-json-filtera';
export function setJSONFilter (filter) {
    return { type: SET_JSON_FILTER, filter };
}

export const SET_SEARCH_FIELD = 'set-search-field';
export function setSearchField (field) {
    return { type: SET_SEARCH_FIELD, field };
}

export const SET_SEARCH_QUERY = 'set-search-query';
export function setSearchQuery (query) {
    return { type: SET_SEARCH_QUERY, query };
}

export const SET_FILTER_ENABLED = 'set-filter-enabled';
export function setFilterEnabled (id, enabled) {
    return { type: SET_FILTER_ENABLED, id, enabled };
}

export const SET_FILTER_VALUE = 'set-filter-value';
export function setFilterValue (id, value) {
    return { type: SET_FILTER_VALUE, id, value };
}

export const ADD_FIELD = 'add-field';
export function addField (id, prepend = false) {
    return { type: ADD_FIELD, id, prepend };
}

export const REMOVE_FIELD = 'remove-field';
export function removeField (index) {
    return { type: REMOVE_FIELD, index };
}

export const SET_FIELD_SORTING = 'set-field-sorting';
export function setFieldSorting (index, sorting) {
    return { type: SET_FIELD_SORTING, index, sorting };
}

export const MOVE_FIELD = 'move-field';
export function moveField (index, target) {
    return { type: MOVE_FIELD, index, target };
}

export const SET_FILTERS_ENABLED = 'set-filters-enabled';
export function setFiltersEnabled (enabled) {
    return { type: SET_FILTERS_ENABLED, enabled };
}

export const SET_PAGE = 'set-page';
export function setPage (page) {
    return { type: SET_PAGE, page };
}

export const SET_ROWS_PER_PAGE = 'set-rows-per-page';
export function setRowsPerPage (rowsPerPage) {
    return { type: SET_ROWS_PER_PAGE, rowsPerPage };
}

export const UNSUBMIT = 'unsubmit';
export function unsubmit () {
    return (dispatch, getState, data) => {
        dispatch({ type: UNSUBMIT });
        data.currentRequest = -1;
        clearTimeout(data.submitTimeout);
        data.updateURLQuery();
    };
}

export const SUBMIT = 'submit';
export function submit () {
    return (dispatch, getState, data) => {
        dispatch({ type: SUBMIT });

        const currentRequest = data.currentRequest = Math.random();

        // return to page 0 if the “request ID” changes
        const state = getState();
        const requestID = state.json.enabled
            ? '0' + state.json.query
            : '1' + JSON.stringify([state.search, state.filters]);
        if ('requestID' in data && requestID !== data.requestID && state.page !== 0) {
            dispatch(setPage(0));
        }
        data.requestID = requestID;

        clearTimeout(data.submitTimeout);
        data.submitTimeout = setTimeout(() => {
            requestMembers(getState()).then(result => {
                if (data.currentRequest !== currentRequest) return;
                dispatch(receiveMembers(result.list, result.temporaryFields, result.stats));
                data.updateURLQuery();
            }).catch(err => {
                // TODO: handle
                /* eslint-disable no-console */
                console.error(err);
                /* eslint-enable no-console */
            });
        }, 500);
    };
}

export const RECEIVE_MEMBERS = 'receive-members';
function receiveMembers (list, temporaryFields, stats) {
    return {
        type: RECEIVE_MEMBERS,
        list,
        temporaryFields,
        stats,
    };
}

const fieldMapping = {
    codeholderType: {
        fields: ['codeholderType', 'enabled'],
        sort: ['codeholderType'],
    },
    code: {
        fields: ['newCode', 'oldCode'],
        sort: ['newCode', 'oldCode'],
    },
    name: {
        fields: [
            'firstName',
            'lastName',
            'firstNameLegal',
            'lastNameLegal',
            'fullName',
            'fullNameLocal',
            'nameAbbrev',
            'isDead',
        ],
        sort: ['lastNameLegal'], // FIXME: this is probably wrong
    },
    country: {
        fields: ['feeCountry', 'addressLatin.country'],
        sort: ['feeCountry', 'addressLatin.country'],
    },
    age: {
        fields: ['age', 'agePrimo'],
        sort: ['age'],
    },
    officePhone: {
        fields: ['officePhone', 'officePhoneFormatted'],
    },
    landlinePhone: {
        fields: ['landlinePhone', 'landlinePhoneFormatted'],
    },
    cellphone: {
        fields: ['cellphone', 'cellphoneFormatted'],
    },
    addressLatin: {
        fields: [
            'country',
            'countryArea',
            'city',
            'cityArea',
            'streetAddress',
            'postalCode',
            'sortingCode',
        ].map(x => 'addressLatin.' + x),
        sort: ['addressLatin.country', 'addressLatin.postalCode'],
    },
    addressCity: {
        fields: ['addressLatin.city', 'addressLatin.cityArea'],
        sort: ['addressLatin.city', 'addressLatin.cityArea'],
    },
    addressCountryArea: {
        fields: ['addressLatin.countryArea'],
        sort: ['addressLatin.countryArea'],
    },
};

/** Fields to additionally select when searching for a field. */
const searchFieldToSelectedFields = {
    nameOrCode: ['name', 'code'],
    address: ['addressLatin'],
};

async function requestMembers (state) {
    const useJSONFilters = state.json.enabled;

    const options = {};
    const temporaryFields = [];

    let prependedUeaCodeSearch = null;

    if (state.search.query) {
        let query = state.search.query;
        let searchField = state.search.field;

        // select search field as temporary field
        temporaryFields.push(...(searchFieldToSelectedFields[searchField] || [searchField]));

        if (searchField === 'nameOrCode') {
            searchField = 'name';

            try {
                // if the query is a valid UEA code; prepend search
                const code = new UEACode(query);
                if (code.type === 'new') prependedUeaCodeSearch = { newCode: query };
                else prependedUeaCodeSearch = { oldCode: query };
            } catch (invalidUeaCode) { /* only search for name otherwise */ }
        } else if (searchField === 'address') {
            searchField = 'searchAddress';
        } else if (['landlinePhone', 'officePhone', 'cellphone'].includes(searchField)) {
            // filter out non-alphanumeric characters because they might be interpreted as
            // search operators
            query = query.replace(/[^a-z0-9]/ig, '');
        }

        const transformedQuery = util.transformSearch(query);

        if (!util.isValidSearch(transformedQuery)) {
            // TODO: emit error?
            return;
        }

        options.search = { str: transformedQuery, cols: [searchField] };
    }

    // list of all fields that have been selected
    const fields = state.fields.fixed.concat(
        state.fields.user,
        temporaryFields.map(field => ({ id: field, sorting: Sorting.NONE })),
    );

    options.order = fields
        .filter(({ sorting }) => sorting !== Sorting.NONE)
        .flatMap(({ id, sorting }) => fieldMapping[id]
            ? fieldMapping[id].sort.map(id => ({ id, sorting })) || []
            : [{id, sorting}])
        .map(({ id, sorting }) => sorting === Sorting.ASC ? [id, 'asc'] : [id, 'desc']);

    // order by relevance if no order is selected
    if (options.search && !options.order.length) {
        options.order = [['_relevance', 'desc']];
    }

    options.fields = fields.flatMap(({ id }) => fieldMapping[id] ? fieldMapping[id].fields : [id]);
    options.fields.push('id'); // also select the ID field

    options.offset = state.page.page * state.page.rowsPerPage;
    options.limit = state.page.rowsPerPage;

    let usedFilters = false;
    if (useJSONFilters) {
        usedFilters = true;
        options.filter = JSON5.parse(state.json.filter);
    } else if (state.page.filtersEnabled) {
        const filters = [];
        for (const id in state.filters) {
            const filter = state.filters[id];
            if (filter.enabled) {
                filters.push(FILTERABLE_FIELDS[id].toRequest
                    ? FILTERABLE_FIELDS[id].toRequest(filter.value)
                    : { [id]: filter.value });
            }
        }

        if (filters.length) {
            options.filter = { $and: filters };
            usedFilters = true;
        }
    }

    let itemToPrepend = null;
    if (prependedUeaCodeSearch) {
        itemToPrepend = (await client.get('/codeholders', {
            filter: prependedUeaCodeSearch,
            // only need to know about its existence on later pages
            fields: options.offset === 0 ? options.fields : [],
            limit: 1,
        })).body[0];
    }

    if (itemToPrepend) {
        // there’s an extra item at the front
        // on the first page, just reduce the limit to compensate
        if (state.page.page === 0) options.limit--;
        // and on any other page, reduce the offset to compensate
        else options.offset--;
    }

    const result = await client.get('/codeholders', options);
    const list = result.body;
    let totalItems = +result.res.headers.map['x-total-items'];

    if (itemToPrepend) {
        let isDuplicate = false;
        for (const item of list) {
            if (item.id === itemToPrepend.id) {
                isDuplicate = true;
                break;
            }
        }
        if (!isDuplicate) {
            // prepend item on the first page if it’s not a duplicate
            if (state.page.page === 0) list.unshift(itemToPrepend);
            totalItems++;
        }
    }

    return {
        list,
        temporaryFields,
        stats: {
            time: result.resTime,
            total: totalItems,
            filtered: usedFilters,
        },
    };
}
