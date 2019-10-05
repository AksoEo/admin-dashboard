import * as store from '../store';

// hack
class UEACode {}
const FILTERS = {};
const client = {};
const Sorting = {};
const JSON5 = {};
const util = {};

// maps client fields to api fields
const fieldMapping = {
    codeholderType: {
        fields: ['codeholderType', 'enabled', 'isDead'],
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
            'honorific',
            'codeholderType',
            'isDead',
        ],
        sort: ['searchName'],
    },
    country: {
        fields: ['feeCountry', 'addressLatin.country'],
        sort: ['feeCountry', 'addressLatin.country'],
    },
    age: {
        fields: ['age', 'agePrimo'],
        sort: ['age'],
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

/// search field -> transient field mapping
const searchFieldToTransientFields = {
    nameOrCode: ['name', 'code'],
    address: ['addressLatin'],
};

function parametersToRequestData (params) {
    const useJSONFilters = 'jsonFilter' in params;

    const state = {}; // HACK

    const options = {};
    const transientFields = [];

    let prependedUeaCodeSearch = null;

    if (state.search.query) {
        let query = state.search.query;
        let searchField = state.search.field;

        // select search field as temporary field
        transientFields.push(...(searchFieldToTransientFields[searchField] || [searchField]));

        if (searchField === 'nameOrCode') {
            searchField = 'searchName';

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
            const error = Error('invalid search query');
            error.id = 'invalid-search-query';
            throw error;
        }

        options.search = { str: transformedQuery, cols: [searchField] };
    }

    // list of all fields that have been selected
    const fields = state.fields.fixed.concat(
        state.fields.user,
        transientFields.map(field => ({ id: field, sorting: Sorting.NONE })),
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

    options.offset = state.list.page * state.list.itemsPerPage;
    options.limit = state.list.itemsPerPage;

    let usedFilters = false;
    if (useJSONFilters) {
        usedFilters = true;
        try {
            options.filter = JSON5.parse(state.jsonFilter.filter);
        } catch (err) {
            err.id = 'invalid-json';
            throw err;
        }
    } else if (state.filters.enabled) {
        const filters = [];
        for (const id in state.filters.filters) {
            const filter = state.filters.filters[id];
            if (filter.enabled) {
                filters.push(FILTERS[id].toRequest
                    ? FILTERS[id].toRequest(filter.value)
                    : { [id]: filter.value });
            }
        }

        if (filters.length) {
            options.filter = { $and: filters };
            usedFilters = true;
        }
    }

    return {
        options,
        prependedUeaCodeSearch,
        usedFilters,
        transientFields,
    };
}

export const tasks = {
    /// codeholders/filters: lists available filters
    filters: async (options, parameters) => {
        // TODO
        throw new Error('unimplemented');
    },

    /// codeholders/list: lists all codeholders
    /// options: none
    /// parameters:
    ///    - search: { field: string, query: string }
    ///    - filters: { [name]: value }, or
    ///    - jsonFilter: Object
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
        const {
            options, prependedUeaCodeSearch, usedFilters, transientFields,
        } = parametersToRequestData(parameters);

        const state = {}; // HACK

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
            if (state.list.page === 0) options.limit--;
            // and on any other page, reduce the offset to compensate
            else options.offset--;
        }

        const result = await client.get('/codeholders', options);
        const list = result.body;
        let totalItems = +result.res.headers.map['x-total-items'];
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
                if (state.list.page === 0) list.unshift(itemToPrepend);
                totalItems++;
            }
        }

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
};
