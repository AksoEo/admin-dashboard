import React from 'react';
import PropTypes from 'prop-types';
import { createStore, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import thunk from 'redux-thunk';
import * as actions from './actions';
import { listView as listViewReducer } from './reducers';
import SearchInput from './search-input';
import Filter from './filter';
import './style';

/// Renders a searchable and filterable list of items, each with a detail view.
export default class ListView extends React.PureComponent {
    static propTypes = {
        /// Defaults for various things.
        ///
        /// - `searchField`: the default search field
        /// - `fields`: list of default fields: `{ id: string, sorting: Sorting }[]`
        defaults: PropTypes.object,

        /// List of searchable fields.
        searchFields: PropTypes.arrayOf(PropTypes.string),

        /// List of available filters.
        /// Should be keyed by filter ID. See search/filter.js for how to write filter specs.
        filters: PropTypes.object,

        /// List request handler.
        onRequest: PropTypes.func,
    };

    /// State store.
    store = createStore(listViewReducer, applyMiddleware(thunk.withExtraArgument(this)));

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
            // TODO: filters?
            actions.setJSONFilterEnabled(false),
            actions.setJSONFilter('{\n\t\n}'),
            // TODO: set fields
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
    performRequest (state) {
        // TODO
        return new Promise((_, j) => j());
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

    render () {
        return (
            <Provider store={this.store}>
                <div className="list-view">
                    <div className="list-view-search-list-container-goes-here">
                        <ConnectedSearchInput
                            fields={this.props.searchFields || []} />
                        <Filters
                            filters={this.props.filters || {}} />
                    </div>
                    {
                        // TODO: list
                    }
                </div>
            </Provider>
        );
    }
}

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

const Filters = connect(state => ({
    expanded: state.filters.enabled,
    filterStates: state.filters.filters,
    submitted: state.list.submitted,
}), dispatch => ({
    onChange: (id, value) => dispatch(actions.setFilterValue(id, value)),
    onEnabledChange: (id, enabled) => dispatch(actions.setFilterEnabled(id, enabled)),
}))(function Filters (props) {
    // TODO: handle expanded state
    return (
        <React.Fragment>
            {Object.entries(props.filters)
                .filter(([id]) => (id in props.filterStates))
                .map(([id, filter]) => (
                    <Filter
                        key={id}
                        filter={filter}
                        enabled={props.filterStates[id].enabled}
                        value={props.filterStates[id].value}
                        onChange={value => props.onChange(id, value)}
                        onEnabledChange={value => props.onEnabledChange(id, value)}
                        submitted={props.submitted} />
                ))}
        </React.Fragment>
    );
});
