import { combineReducers } from 'redux';
import * as actions from './actions';
import { FILTERABLE_FIELDS } from './search-input/fields';
import { Sorting } from './fields';

function json (state = {}, action) {
    switch (action.type) {
    case actions.SET_JSON_ENABLED:
        return { ...state, enabled: action.enabled };
    case actions.SET_JSON_FILTER:
        return { ...state, filter: action.filter };
    default:
        return state;
    }
}

function search (state = {}, action) {
    switch (action.type) {
    case actions.SET_SEARCH_FIELD:
        return { ...state, field: action.field };
    case actions.SET_SEARCH_QUERY:
        return { ...state, query: action.query };
    default:
        return state;
    }
}

function maybeRestrictCodeholderType (filters) {
    let restriction = null;
    for (const id in filters) {
        if (!filters[id].enabled) continue;
        if (!restriction) {
            restriction = FILTERABLE_FIELDS[id].codeholderType;
        } else if (FILTERABLE_FIELDS[id].codeholderType !== restriction) {
            filters[id] = { ...filters[id], enabled: false };
        }
    }

    if (restriction) {
        filters.codeholderType = {
            ...filters.codeholderType,
            enabled: true,
            value: restriction === 'human'
                ? { human: true, org: false, _restricted: true }
                : { human: false, org: true, _restricted: true },
        };
    } else {
        delete filters.codeholderType.value._restricted;
    }
}

function filters (state = {}, action) {
    switch (action.type) {
    case actions.SET_FILTER_ENABLED:
        state = { ...state };
        state[action.id] = { ...state[action.id], enabled: action.enabled };
        maybeRestrictCodeholderType(state);
        return state;
    case actions.SET_FILTER_VALUE:
        state = { ...state };
        state[action.id] = { ...state[action.id], value: action.value, enabled: true };
        maybeRestrictCodeholderType(state);
        return state;
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

function fields (state = {}, action) {
    return { ...state, user: userFields(state.user, action) };
}

function page (state = {}, action) {
    switch (action.type) {
    case actions.SUBMIT:
        return { ...state, submitted: true };
    case actions.UNSUBMIT:
        return { ...state, submitted: false };
    case actions.SET_FILTERS_ENABLED:
        return { ...state, filtersEnabled: action.enabled };
    case actions.SET_PAGE:
        return { ...state, page: action.page };
    case actions.SET_ROWS_PER_PAGE:
        return { ...state, rowsPerPage: action.rowsPerPage };
    default:
        return state;
    }
}

function results (state = {}, action) {
    switch (action.type) {
    case actions.UNSUBMIT:
        return { ...state, hasResults: false };
    case actions.RECEIVE_MEMBERS:
        return {
            ...state,
            hasResults: true,
            list: action.list,
            temporaryFields: action.temporaryFields,
            stats: action.stats,
        };
    default:
        return state;
    }
}

export const searchPage = combineReducers({
    json,
    search,
    fields,
    filters,
    page,
    results,
});
