import { combineReducers } from 'redux';
import * as actions from './actions';
import Sorting from './sorting';

function search (state = { field: null, query: '' }, action) {
    switch (action.type) {
    case actions.SET_SEARCH_FIELD:
        return { ...state, field: action.field };
    case actions.SET_SEARCH_QUERY:
        return { ...state, query: action.query };
    default:
        return state;
    }
}

function filters (state = { enabled: false, filters: {} }, action) {
    switch (action.type) {
    case actions.SET_FILTERS_ENABLED:
        return { ...state, enabled: action.enabled };
    case actions.SET_FILTER_ENABLED:
        if (state.filters[action.id]) {
            return {
                ...state,
                filters: {
                    ...state.filters,
                    [action.id]: {
                        ...state.filters[action.id],
                        enabled: action.enabled,
                    },
                },
            };
        }
        return state;
    case actions.SET_FILTER_VALUE:
        if (state.filters[action.id]) {
            return {
                ...state,
                filters: {
                    ...state.filters,
                    [action.id]: {
                        ...state.filters[action.id],
                        value: action.value,
                        enabled: true, // auto-enable when changed
                    },
                },
            };
        }
        return state;
    case actions.ADD_FILTER:
        return {
            ...state,
            filters: {
                ...state.filters,
                [action.id]: action.data,
            },
        };
    case actions.REMOVE_FILTER: {
        const filters = { ...state.filters };
        delete filters[action.id];
        return { ...state, filters };
    }
    default:
        return state;
    }
}

function jsonFilter (state = { enabled: false, filter: '' }, action) {
    switch (action.type) {
    case actions.SET_JSON_FILTER_ENABLED:
        return { ...state, enabled: action.enabled };
    case actions.SET_JSON_FILTER:
        return { ...state, filter: action.filter };
    default:
        return state;
    }
}

function userFields (state = [], action) {
    switch (action.type) {
    case actions.ADD_FIELD: {
        const newItem = { id: action.id, sorting: Sorting.NONE };
        if (action.prepend) return [newItem].concat(state);
        return state.concat([newItem]);
    }
    case actions.REMOVE_FIELD:
        state = state.slice();
        state.splice(action.index, 1);
        return state;
    case actions.SET_FIELD_SORTING:
        state = state.slice();
        state[action.index] = { ...state[action.index], sorting: action.sorting };
        return state;
    case actions.MOVE_FIELD:
        state = state.slice();
        state.splice(action.target, 0, state.splice(action.index, 1)[0]);
        return state;
    default:
        return state;
    }
}

function fields (state = { fixed: [], user: [] }, action) {
    switch (action.type) {
    case actions.SET_FIELDS:
        return { ...state, fixed: action.fixed, user: action.user };
    case actions.SET_USER_FIELDS:
        return { ...state, user: action.user };
    default:
        return { ...state, user: userFields(state.user, action) };
    }
}

function items (state = {}, action) {
    switch (action.type) {
    case actions.RECEIVE_SUCCESS:
        state = { ...state };
        for (const item of action.items) {
            state[item.id] = item;
        }
        return state;
    case actions.UPDATE_ITEM:
        state = { ...state };
        state[action.id] = { ...state[action.id], ...action.data };
        return state;
    default:
        return state;
    }
}

function list (state = { submitted: false, page: 0, itemsPerPage: 10 }, action) {
    switch (action.type) {
    case actions.SUBMIT:
        return { ...state, submitted: true };
    case actions.UNSUBMIT:
        return { ...state, submitted: false };
    case actions.SET_PAGE:
        return { ...state, page: action.page };
    case actions.SET_ITEMS_PER_PAGE:
        return { ...state, itemsPerPage: action.itemsPerPage };
    default:
        return state;
    }
}

function results (state = {
    items: [],
    transientFields: [],
    error: null,
    stats: {},
}, action) {
    switch (action.type) {
    case actions.RECEIVE_SUCCESS:
        return {
            ...state,
            items: action.items.map(item => item.id),
            transientFields: action.transientFields,
            stats: action.stats,
            error: null,
        };
    case actions.RECEIVE_FAILURE:
        return { ...state, items: [], transientFields: [], stats: {}, error: action.error };
    default:
        return state;
    }
}

export const listView = combineReducers({
    search,
    filters,
    jsonFilter,
    fields,
    items,
    list,
    results,
});
