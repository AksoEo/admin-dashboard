/// Converts params to request options. See e.g. task codeholders/list for details.
export const makeParametersToRequestData = ({
    searchFieldToTransientFields,
    handleSearchFields,
    clientFields,
    clientFilters,
}) => params => {
    const options = {};
    const transientFields = [];

    const additionalData = {};

    if (params.search && params.search.query) {
        const searchField = params.search.field;

        // select search fields as temporary fields
        if (searchFieldToTransientFields) {
            transientFields.push(...(searchFieldToTransientFields[searchField] || [searchField]));
        } else {
            transientFields.push(searchField);
        }

        if (handleSearchFields) {
            const { search, data } = handleSearchFields(params.search);
            if (data) Object.assign(additionalData, data);
            options.search = search;
        } else {
            options.search = { str: params.search.query, cols: [searchField] };
        }
    }

    // list of all fields that have been selected
    const fields = (params.fields || []).concat(transientFields.map(id => ({ id, sorting: 'none' })));

    for (const field of fields) {
        if (!(field.id in clientFields)) {
            throw { code: 'unknown-field', message: `unknown field ${field.id}` };
        }
        for (const required of (clientFields[field.id].requires || [])) {
            fields.push({ id: required, sorting: 'none' });
        }
    }

    options.order = fields
        .filter(({ sorting }) => sorting !== 'none')
        // some fields have multiple sub-fields that must be sorted individually
        .flatMap(({ id, sorting }) => typeof clientFields[id] === 'string'
            ? [[clientFields[id], sorting]]
            : (clientFields[id].sort || clientFields[id].apiFields).map(id => [id, sorting]));

    // order by relevance if no order is selected
    if (options.search && !options.order.length) {
        options.order = [['_relevance', 'desc']];
    }

    options.fields = fields.flatMap(({ id }) => typeof clientFields[id] === 'string'
        ? clientFields[id]
        : clientFields[id].apiFields);
    options.fields.push('id'); // also select the ID field

    options.offset = params.offset | 0;
    options.limit = params.limit | 0;

    const filters = [];
    if (params.filters && !params.filters._disabled) {
        for (const filter in params.filters) {
            if (filter === '_disabled') continue;
            if (!(filter in clientFilters)) {
                throw { code: 'unknown-filter', message: `unknown filter ${filter}` };
            }
            if (params.filters[filter].enabled) {
                filters.push(clientFilters[filter].toAPI(params.filters[filter].value));
            }
        }
    }
    if (filters.length) {
        // merge filters with no common keys
        let accum = {};
        let items = [accum];
        const split = () => items.push(accum = {});
        const queue = [...filters];
        while (queue.length) {
            const filter = queue.pop();
            for (const k in filter) {
                if (k === '$and') {
                    // also spill $and into the parent scope
                    queue.push(...filter[k]);
                } else {
                    if (accum[k]) split();
                    accum[k] = filter[k];
                }
            }
        }
        items = items.filter(f => Object.keys(f).length);

        options.filter = items.length === 1 ? items[0] : { $and: items };
    }

    if (params.jsonFilter && !params.jsonFilter._disabled) {
        if (params.jsonFilter.error) throw params.jsonFilter.error;
        if (options.filter) options.filter.$and.push(params.jsonFilter.filter);
        else options.filter = params.jsonFilter.filter;
    }
    const usedFilters = 'filter' in options && !!Object.keys(options.filter).length;

    return {
        options,
        usedFilters,
        transientFields,
        ...additionalData,
    };
};

/// converts from API repr to client repr
export const makeClientFromAPI = clientFields => apiRepr => {
    const clientRepr = {};
    for (const field in clientFields) {
        const spec = clientFields[field];
        clientRepr[field] = typeof spec === 'string' ? apiRepr[spec]
            : typeof spec.apiFields === 'string'
                ? apiRepr[spec.apiFields]
                : spec.fromAPI(apiRepr);
    }
    return clientRepr;
};

export function coerceToNull (value) {
    if (value === null || value === undefined || value === '') return null;
    return value;
}

/// converts from client repr to api repr
export const makeClientToAPI = clientFields => (clientRepr) => {
    const apiRepr = {};
    for (const field in clientFields) {
        const spec = clientFields[field];
        if (clientRepr[field] === undefined) {
            // do not have this field
            continue;
        }
        if (typeof spec === 'string') apiRepr[spec] = coerceToNull(clientRepr[field]);
        else if (typeof spec.apiFields === 'string') apiRepr[spec.apiFields] = coerceToNull(clientRepr[field]);
        else Object.assign(apiRepr, spec.toAPI(clientRepr[field], clientRepr));
    }
    return apiRepr;
};
