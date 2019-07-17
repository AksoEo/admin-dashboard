import React from 'react';
import PropTypes from 'prop-types';
import { createStore, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import thunk from 'redux-thunk';
import * as actions from './actions';
import { listView as listViewReducer } from './reducers';
import SearchInput from './search-input';
import Filter from './filter';

/// Renders a searchable and filterable list of items, each with a detail view.
export default class ListView extends React.PureComponent {
    static propTypes = {
        /// Defaults for various things.
        ///
        /// - `searchField`: the default search field
        /// - `fields`: list of default fields: `{ id: string, sorting: Sorting }[]`
        defaults: PropTypes.object,

        /// List of searchable fields.
        searchFields: PropTypes.array,

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
            // TODO: diff and remove from store if necessary
        }
    }

    /// Performs a data request for the given state and returns a promise.
    performRequest (state) {
        // TODO
        return new Promise((_, j) => j());
    }

    render () {
        return (
            <Provider store={this.store}>
                <div className="list-view">
                    <ConnectedSearchInput
                        fields={this.props.searchFields || []} />
                    // TODO: filters
                    // TODO: list
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
