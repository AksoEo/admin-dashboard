import React from 'react';
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
import './style';

// TODO: fix locale

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
    async performRequest (state) {
        if (this.props.onRequest) {
            return await this.props.onRequest(state);
        } else {
            throw new Error('no request handler');
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
                    <ConnectedResults
                        isRestrictedByGlobalFilter={/* TODO */ false} />
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
    onFiltersEnabledChange: (enabled) => dispatch(actions.setFiltersEnabled(enabled)),
}))(function Filters (props) {
    const filters = Object.entries(props.filters);

    return (
        <React.Fragment>
            {filters.length ? (
                <FilterDisclosureButton
                    expanded={props.expanded}
                    onChange={props.onFiltersEnabledChange}/>
            ) : null}
            {filters
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

function FilterDisclosureButton (props) {
    return (
        <button
            className={'filter-disclosure' + (props.expanded ? ' expanded' : '')}
            onClick={() => props.onChange(!props.expanded)}>
            {locale.members.search.filters}
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
