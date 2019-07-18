// dear tc39, i wish javascript had macros

export const SET_SEARCH_FIELD = 'set-search-field';
export const setSearchField = (field) => ({ type: SET_SEARCH_FIELD, field });

export const SET_SEARCH_QUERY = 'set-search-query';
export const setSearchQuery = (query) => ({ type: SET_SEARCH_QUERY, query });

export const SET_FILTERS_ENABLED = 'set-filters-enabled';
export const setFiltersEnabled = (enabled) => ({ type: SET_FILTERS_ENABLED, enabled });

export const SET_FILTER_ENABLED = 'set-filter-enabled';
export const setFilterEnabled = (id, enabled) => ({ type: SET_FILTER_ENABLED, id, enabled });

export const SET_FILTER_VALUE = 'set-filter-value';
export const setFilterValue = (id, value) => ({ type: SET_FILTER_VALUE, id, value });

export const SET_JSON_FILTER_ENABLED = 'set-json-filter-enabled';
export const setJSONFilterEnabled = (enabled) => ({ type: SET_FILTER_ENABLED, enabled });

export const SET_JSON_FILTER = 'set-json-filter';
export const setJSONFilter = (filter) => ({ type: SET_FILTER_VALUE, filter });

export const ADD_FIELD = 'add-field';
export const addField = (id, prepend = false) => ({ type: ADD_FIELD, id, prepend });

export const REMOVE_FIELD = 'remove-field';
export const removeField = (index) => ({ type: REMOVE_FIELD, index });

export const SET_FIELD_SORTING = 'set-field-sorting';
export const setFieldSorting = (index, sorting) => ({ type: SET_FIELD_SORTING, index, sorting });

export const MOVE_FIELD = 'move-field';
export const moveField = (index, target) => ({ type: MOVE_FIELD, index, target });

export const RECEIVE_SUCCESS = 'receive-success';
const receiveSuccess = (items, transientFields, stats) => ({
    type: RECEIVE_SUCCESS, items, transientFields, stats,
});

export const RECEIVE_FAILURE = 'receive-failure';
const receiveFailure = (error) => ({ type: RECEIVE_FAILURE, error });

export const SUBMIT = 'submit';
export const submit = () => (dispatch, getState, listView) => {
    dispatch({ type: SUBMIT });

    listView.performRequest(getState()).then(({ items, transientFields, stats }) => {
        dispatch(receiveSuccess(items, transientFields, stats));
    }).catch(error => dispatch(receiveFailure(error)));
};

export const UNSUBMIT = 'unsubmit';
export const unsubmit = () => ({ type: UNSUBMIT });

export const SET_PAGE = 'set-page';
export const setPage = (page) => ({ type: SET_PAGE, page });

export const SET_ITEMS_PER_PAGE = 'set-items-per-page';
export const setItemsPerPage = (itemsPerPage) => ({ type: SET_ITEMS_PER_PAGE, itemsPerPage });

export const ADD_FILTER = 'add-filter';
export const addFilter = (id, data) => ({ type: ADD_FILTER, id, data });

export const REMOVE_FILTER = 'remove-filter';
export const removeFilter = (id) => ({ type: REMOVE_FILTER, id });
