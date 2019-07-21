import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { createStore, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import thunk from 'redux-thunk';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import locale from '../../locale';
import * as actions from './actions';
import { listView as listViewReducer } from './reducers';
import SearchInput from './search-input';
import Filter from './filter';
import Results, { ErrorResult } from './results';
import FieldPicker from './field-picker';
import PaperList from './paper-list';
import { encodeURLQuery, decodeURLQuery } from './deser';
import './style';

const JSONEditor = lazy(() => import('./json-editor'));

const reloadingActions = [
    actions.SET_SEARCH_QUERY,
    actions.SET_FILTERS_ENABLED,
    actions.SET_FILTER_ENABLED,
    actions.SET_FILTER_VALUE,
    actions.SET_JSON_FILTER_ENABLED,
    actions.SET_JSON_FILTER,
    actions.ADD_FIELD,
    actions.SET_FIELD_SORTING,
    actions.SET_FIELDS,
    actions.ADD_FILTER,
    actions.REMOVE_FILTER,
    actions.SET_PAGE,
    actions.SET_ITEMS_PER_PAGE,
];

const urlQueryActions = reloadingActions.concat([
    actions.MOVE_FIELD,
    actions.REMOVE_FIELD,
    actions.SUBMIT,
    actions.UNSUBMIT,
]);

const reloadMiddleware = listView => () => next => action => {
    if (reloadingActions.includes(action.type)) {
        listView.scheduleReload();
    }
    if (urlQueryActions.includes(action.type)) {
        listView.updateURLQuery();
    }
    next(action);
};
const RELOAD_DEBOUNCE_TIME = 500; // ms

const filterConstraintMiddleware = listView => () => next => action => {
    if ([actions.SET_FILTER_VALUE, actions.SET_FILTER_ENABLED].includes(action.type)) {
        // actions issued by constraints must skip constraints (see below) because bad
        // applyConstraints implementations might cause an infinite loop otherwise
        if (!action.skipConstraints) listView.scheduleFilterConstraintsUpdate();
    }
    next(action);
};

/// Renders a searchable and filterable list of items, each with a detail view.
export default class ListView extends React.PureComponent {
    static propTypes = {
        /// Defaults for various things.
        ///
        /// - `searchField`: the default search field
        /// - `fixedFields`: list of fixed fields: `{ id: string, sorting: Sorting }[]`
        /// - `fields`: list of default fields: `{ id: string, sorting: Sorting }[]`
        defaults: PropTypes.object,

        /// Title component; will be put above the search field when not submitted.
        title: PropTypes.element,

        /// List of searchable fields.
        searchFields: PropTypes.arrayOf(PropTypes.string),

        /// List of available filters.
        /// Should be keyed by filter ID. See ./filter.js for how to write filter specs.
        filters: PropTypes.object,

        /// List of available fields.
        /// Should be keyed by field ID.
        fields: PropTypes.object,

        /// Column for which the header will be replaced with the field configuration button.
        fieldConfigColumn: PropTypes.string,

        /// List request handler.
        onRequest: PropTypes.func,

        /// If true, will show a notice about being restricted by a global filter.
        isRestrictedByGlobalFilter: PropTypes.bool,

        /// Fired whenever the URL query changes.
        onURLQueryChange: PropTypes.func,

        /// Locale data.
        ///
        /// - `searchFields`: translations for search fields
        /// - `placeholders`: translations for search placeholders
        /// - `filters`: translations for filters
        /// - `fields`: translations for fields
        locale: PropTypes.object.isRequired,
    };

    /// State store.
    store = createStore(listViewReducer, applyMiddleware(
        thunk.withExtraArgument(this),
        reloadMiddleware(this),
        filterConstraintMiddleware(this),
    ));

    state = {
        fieldPickerOpen: false,
    };

    constructor (props) {
        super(props);

        this.resetStore(props.defaults || {});

        if (props.filters) {
            for (const id of Object.keys(props.filters)) {
                this.addFilter(id, props.filters[id]);
            }
        }
    }

    resetStore (defaults) {
        [
            actions.setSearchField(defaults.searchField || null),
            actions.setSearchQuery(''),
            actions.setFiltersEnabled(false),
            actions.setJSONFilterEnabled(false),
            actions.setJSONFilter('{\n\t\n}'),
            actions.setFields(defaults.fixedFields || [], defaults.fields || []),
            actions.unsubmit(),
            actions.setPage(0),
            actions.setItemsPerPage(10),
        ].forEach(i => this.store.dispatch(i));
    }

    componentDidUpdate (prevProps) {
        if (prevProps.filters !== this.props.filters) {
            // diff filters and update store
            const prevKeys = prevProps.filters ? Object.keys(prevProps.filters) : [];
            const newKeys = this.props.filters ? Object.keys(this.props.filters) : [];

            // FIXME: really inefficient diffing
            for (const id of newKeys) {
                if (!prevKeys.includes(id)) {
                    this.addFilter(id, this.props.filters[id]);
                }
            }
            for (const id of prevKeys) {
                if (!newKeys.includes(id)) {
                    this.removeFilter(id);
                }
            }
        }
    }

    /// Performs a data request for the given state and returns a promise.
    async performRequest (state) {
        if (this.props.onRequest) {
            return await this.props.onRequest(state);
        } else {
            throw new Error('no request handler');
        }
    }

    scheduleReload () {
        clearTimeout(this.scheduledReload);
        this.scheduledReload = setTimeout(() => this.reload(), RELOAD_DEBOUNCE_TIME);
    }

    reload () {
        if (this.store.getState().list.submitted) {
            this.store.dispatch(actions.submit());
        }
    }

    scheduleFilterConstraintsUpdate () {
        clearTimeout(this.scheduledConstraintUpdate);
        this.scheduledConstraintUpdate = setTimeout(() => this.applyFilterConstraints(), 50);
    }

    applyFilterConstraints () {
        const state = this.store.getState();
        if (!state.filters.enabled) return;
        for (const id in state.filters.filters) {
            if (this.props.filters[id].applyConstraints) {
                const result = this.props.filters[id].applyConstraints(
                    state.filters.filters[id].value,
                    state.filters.filters,
                );
                if (result) {
                    if ('enabled' in result) {
                        this.store.dispatch(actions.setFilterEnabled(id, result.value, true));
                    }
                    if ('value' in result) {
                        this.store.dispatch(actions.setFilterValue(id, result.value, true));
                    }
                }
            }
        }
    }

    /// Internal function to handle a new filter.
    /// The filter must not exist in the store yet.
    addFilter (id, spec) {
        this.store.dispatch(actions.addFilter(id, {
            enabled: false,
            value: spec.default ? spec.default() : null, // TODO: fetch from type
        }));
    }

    /// Internal function to handle a removed filter.
    removeFilter (id) {
        this.store.dispatch(actions.removeFilter(id));
    }

    emitURLQuery () {
        if (!this.props.onURLQueryChange) return;

        const state = this.store.getState();
        if (state.list.submitted) {
            const query = encodeURLQuery(state, this.props.filters || {});
            this.props.onURLQueryChange(query);
        } else {
            this.props.onURLQueryChange('');
        }
    }

    /// Call this whenever the URL query changes.
    decodeURLQuery (query) {
        if (!query) {
            this.store.dispatch(actions.unsubmit());
            return;
        }

        const decoded = decodeURLQuery(query, this.props.filters || {});
        this.resetStore(this.props.defaults || {});
        decoded.forEach(action => this.store.dispatch(action));
        this.store.dispatch(actions.submit());
        clearTimeout(this.scheduledReload);
    }

    updateURLQuery () {
        clearTimeout(this.urlQueryUpdateTimeout);
        this.urlQueryUpdateTimeout = setTimeout(() => this.emitURLQuery(), RELOAD_DEBOUNCE_TIME);
    }

    isSubmitted () {
        return this.store.getState().list.submitted;
    }

    isJSONFilterEnabled () {
        return this.store.getState().jsonFilter.enabled;
    }

    setJSONFilterEnabled (enabled) {
        this.store.dispatch(actions.setJSONFilterEnabled(enabled));
    }

    render () {
        const fields = Object.keys(this.props.fields || {})
            .filter(id => !this.props.fields[id].hideColumn);

        return (
            <Provider store={this.store}>
                <div className="list-view">
                    <ConnectedFieldPicker
                        open={this.state.fieldPickerOpen}
                        onClose={() => this.setState({ fieldPickerOpen: false })}
                        available={fields}
                        sortables={fields.filter(id => this.props.fields[id].sortable)}
                        localizedFields={this.props.locale.fields} />
                    <SearchFilters
                        title={this.props.title}
                        searchInput={(
                            <ConnectedSearchInput
                                fields={this.props.searchFields || []}
                                localizedFields={this.props.locale.searchFields}
                                localizedPlaceholders={this.props.locale.placeholders} />
                        )}
                        filters={this.props.filters || {}}
                        localizedFilters={this.props.locale.filters} />
                    <ConnectedResults
                        isRestrictedByGlobalFilter={this.props.isRestrictedByGlobalFilter}
                        fieldSpec={this.props.fields || {}}
                        configColumn={this.props.fieldConfigColumn}
                        onEditFields={() => this.setState({ fieldPickerOpen: true })}
                        onAddField={(...args) => this.store.dispatch(actions.addField(...args))}
                        onSetFieldSorting={(...args) => {
                            this.store.dispatch(actions.setFieldSorting(...args));
                        }}
                        localizedFields={this.props.locale.fields} />
                </div>
            </Provider>
        );
    }
}

const ConnectedFieldPicker = connect(state => ({
    selected: state.fields.user,
    fixedFields: state.fields.fixed.map(field => field.id),
}), dispatch => ({
    onAddField: (...args) => dispatch(actions.addField(...args)),
    onRemoveField: (...args) => dispatch(actions.removeField(...args)),
    onSetFieldSorting: (...args) => dispatch(actions.setFieldSorting(...args)),
    onMoveField: (...args) => dispatch(actions.moveField(...args)),
}))(function FieldPickerContainer (props) {
    return <FieldPicker
        {...props}
        available={props.available.filter(id => !props.fixedFields.includes(id))} />;
});

const ConnectedSearchInput = connect(state => ({
    field: state.search.field,
    query: state.search.query,
    submitted: state.list.submitted,
}), dispatch => ({
    onSubmit: () => dispatch(actions.submit()),
    onUnsubmit: () => dispatch(actions.unsubmit()),
    onFieldChange: field => dispatch(actions.setSearchField(field)),
    onQueryChange: query => dispatch(actions.setSearchQuery(query)),
}))(SearchInput);

const SearchFilters = connect(state => ({
    jsonFilterEnabled: state.jsonFilter.enabled,
    jsonFilter: state.jsonFilter.filter,
    expanded: state.filters.enabled,
    filterStates: state.filters.filters,
    submitted: state.list.submitted,
}), dispatch => ({
    onChange: (id, value) => dispatch(actions.setFilterValue(id, value)),
    onEnabledChange: (id, enabled) => dispatch(actions.setFilterEnabled(id, enabled)),
    onFiltersEnabledChange: (enabled) => dispatch(actions.setFiltersEnabled(enabled)),
    onJSONChange: (filter) => dispatch(actions.setJSONFilter(filter)),
    onSubmit: () => dispatch(actions.submit()),
}))(function SearchFilters (props) {
    const items = [];
    if (props.title) items.push({
        node: props.title,
        hidden: props.submitted,
    });
    items.push({ node: props.searchInput });

    if (props.jsonFilterEnabled) {
        items.push({
            node: (
                <Suspense fallback={<div className="json-filter-loading">
                    {locale.listView.json.loading}
                </div>}>
                    <JSONEditor
                        value={props.jsonFilter}
                        onChange={props.onJSONChange}
                        submitted={props.submitted}
                        onSubmit={props.onSubmit} />
                </Suspense>
            ),
        });
    } else {
        const filters = Object.entries(props.filters);
        let hasEnabledFilters = false;
        for (const id of filters) {
            if (props.filterStates[id] && props.filterStates[id].enabled) {
                hasEnabledFilters = true;
                break;
            }
        }

        if (filters.length) {
            items.push({
                node: <FilterDisclosureButton
                    expanded={props.expanded}
                    onChange={props.onFiltersEnabledChange} />,
                hidden: props.submitted && !hasEnabledFilters,
            });
        }

        items.push(
            ...filters.filter(([id]) => (id in props.filterStates))
                .map(([id, filter]) => ({
                    node: <Filter
                        key={id}
                        id={id}
                        localizedName={props.localizedFilters[id]}
                        filter={filter}
                        enabled={props.filterStates[id].enabled}
                        value={props.filterStates[id].value}
                        onChange={value => props.onChange(id, value)}
                        onEnabledChange={value => props.onEnabledChange(id, value)}
                        submitted={props.submitted} />,
                    hidden: !props.expanded || props.submitted && !props.filterStates[id].enabled,
                    staticHeight: true,
                }))
        );
    }

    return <PaperList className="search-filters-container">{items}</PaperList>;
});

function FilterDisclosureButton (props) {
    return (
        <button
            className={'filter-disclosure' + (props.expanded ? ' expanded' : '')}
            onClick={() => props.onChange(!props.expanded)}>
            {locale.listView.filters}
            <KeyboardArrowDownIcon className="filter-disclosure-icon" />
        </button>
    );
}

FilterDisclosureButton.propTypes = {
    expanded: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

const ConnectedResults = connect(state => ({
    submitted: state.list.submitted,
    error: state.results.error,
    list: state.results.items,
    items: state.items,
    page: state.list.page,
    itemsPerPage: state.list.itemsPerPage,
    time: state.results.stats.time,
    isFiltered: state.results.stats.filtered,
    totalItems: state.results.stats.total,
    fields: state.fields,
    transientFields: state.results.transientFields,
}), dispatch => ({
    onSetPage: page => dispatch(actions.setPage(page)),
    onSetItemsPerPage: itemsPerPage => dispatch(actions.setItemsPerPage(itemsPerPage)),
}))(function ResultsContainer (props) {
    if (props.submitted) {
        if (props.error) return ErrorResult({ error: props.error });
        return Results(props);
    }
    return null;
});
