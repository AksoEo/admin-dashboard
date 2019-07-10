import React from 'react';
import PropTypes from 'prop-types';
import { createStore, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import thunk from 'redux-thunk';
import msgpack from 'msgpack-lite';
import * as actions from './actions';
import { searchPage } from './reducers';
import TablePagination from '@material-ui/core/TablePagination';
import SearchInput from './search-input';
import { FILTERABLE_FIELDS } from './search-input/fields';
import { FIELDS, Sorting } from './fields';
import MembersList from './list';
import FieldPicker from './field-picker';
import { routerContext } from '../../../router';
import locale from '../../../locale';

const MembersSearch = connect(
    state => state,
    dispatch => ({ dispatch }),
)(class MembersSearch extends React.PureComponent {
    static propTypes = {
        json: PropTypes.object.isRequired,
        search: PropTypes.object.isRequired,
        filters: PropTypes.object.isRequired,
        fields: PropTypes.object.isRequired,
        page: PropTypes.object.isRequired,
        results: PropTypes.object.isRequired,
        dispatch: PropTypes.func.isRequired,
    };

    state = {
        fieldPickerOpen: false,
    };

    render () {
        const { json, search, filters, fields, page, results, dispatch } = this.props;

        const onSearchFieldChange = field => dispatch(actions.setSearchField(field));
        const onSearchQueryChange = query => dispatch(actions.setSearchQuery(query));
        const onFiltersEnabledChange = enabled => dispatch(actions.setFiltersEnabled(enabled));
        const onSetFilterValue = (id, value) => dispatch(actions.setFilterValue(id, value));
        const onSetFilterEnabled = (id, enabled) => dispatch(actions.setFilterEnabled(id, enabled));
        const onSetPage = (page) => dispatch(actions.setPage(page));
        const onSetRowsPerPage = (rowsPerPage) => dispatch(actions.setRowsPerPage(rowsPerPage));
        const onAddField = (id, prepend) => dispatch(actions.addField(id, prepend));
        const onRemoveField = (i) => dispatch(actions.removeField(i));
        const onSetFieldSorting = (i, sorting) => dispatch(actions.setFieldSorting(i, sorting));
        const onMoveField = (i, j) => dispatch(actions.moveField(i, j));
        const onSubmit = () => dispatch(actions.submit());
        const onUnsubmit = () => dispatch(actions.unsubmit());
        const onJSONChange = filter => dispatch(actions.setJSONFilter(filter));

        // FIXME: hacky solution
        const maybeResubmit = f => (...args) => {
            f(...args);
            if (page.submitted) onSubmit();
        };

        const fixedFieldIds = fields.fixed.map(x => x.id);

        // TODO: filter available fields to ones permitted by user permissions
        const availableFields = Object.keys(FIELDS)
            .filter(field => !FIELDS[field].hideColumn)
            .filter(field => !fixedFieldIds.includes(field));

        return (
            <div className="members-list-page">
                <FieldPicker
                    open={this.state.fieldPickerOpen}
                    available={availableFields}
                    sortables={Object.keys(FIELDS).filter(f => FIELDS[f].sortable)}
                    selected={fields.user}
                    onAddField={maybeResubmit(onAddField)}
                    onRemoveField={onRemoveField}
                    onSetFieldSorting={maybeResubmit(onSetFieldSorting)}
                    onMoveField={onMoveField}
                    onClose={() => this.setState({ fieldPickerOpen: false })} />
                <SearchInput
                    field={search.field}
                    onFieldChange={maybeResubmit(onSearchFieldChange)}
                    query={search.query}
                    onQueryChange={maybeResubmit(onSearchQueryChange)}
                    filtersEnabled={page.filtersEnabled}
                    onFiltersEnabledChange={maybeResubmit(onFiltersEnabledChange)}
                    filters={filters}
                    onSetFilterEnabled={maybeResubmit(onSetFilterEnabled)}
                    onSetFilterValue={maybeResubmit(onSetFilterValue)}
                    submitted={page.submitted}
                    onSubmit={onSubmit}
                    onUnsubmit={onUnsubmit}
                    useJSON={json.enabled}
                    jsonFilter={json.filter}
                    onJSONChange={maybeResubmit(onJSONChange)} />
                {results.hasResults && page.submitted ? (
                    <Results
                        isRestrictedByGlobalFilter={false} // TODO: this
                        list={results.list}
                        stats={results.stats}
                        fixedFields={fields.fixed}
                        userSelectedFields={fields.user}
                        temporaryFields={results.temporaryFields}
                        page={page.page}
                        rowsPerPage={page.rowsPerPage}
                        onSetPage={maybeResubmit(onSetPage)}
                        onSetRowsPerPage={maybeResubmit(onSetRowsPerPage)}
                        onAddField={maybeResubmit(onAddField)}
                        onSetFieldSorting={maybeResubmit(onSetFieldSorting)}
                        onOpenFieldPicker={() => this.setState({ fieldPickerOpen: true })} />
                ) : null}
            </div>
        );
    }
});

function Results (props) {
    const count = props.list.length;
    const total = props.stats.total;
    const time = props.stats.time;
    const filtered = props.stats.filtered;
    const statsText = locale.members.resultStats(count, filtered, total, time);

    return (
        <div className="members-results">
            <div className="stats-line">{statsText}</div>
            {props.isRestrictedByGlobalFilter && (
                <div className="global-filter-notice">
                    {locale.members.globalFilterNotice}
                </div>
            )}
            {props.list.length ? (
                <div className="members-list-container">
                    <MembersList
                        fixedFields={props.fixedFields}
                        userSelectedFields={props.userSelectedFields}
                        temporaryFields={props.temporaryFields}
                        onAddField={props.onAddField}
                        onSetFieldSorting={props.onSetFieldSorting}
                        onEditFields={props.onOpenFieldPicker}
                        getMemberPath={id => `/membroj/${id}`}
                        list={props.list} />
                </div>
            ) : (
                <div className="members-list-no-results">
                    {locale.members.noResults}
                </div>
            )}
            {!!props.list.length && <TablePagination
                className="table-pagination"
                component="div"
                count={total | 0}
                labelDisplayedRows={locale.members.pagination.displayedRows}
                labelRowsPerPage={locale.members.pagination.rowsPerPage}
                page={props.page}
                rowsPerPage={props.rowsPerPage}
                onChangePage={(e, page) => props.onSetPage(page)}
                onChangeRowsPerPage={e => props.onSetRowsPerPage(e.target.value)} />}
        </div>
    );
}

Results.propTypes = {
    isRestrictedByGlobalFilter: PropTypes.bool.isRequired,
    list: PropTypes.array.isRequired,
    stats: PropTypes.object.isRequired,
    fixedFields: PropTypes.array.isRequired,
    userSelectedFields: PropTypes.array.isRequired,
    temporaryFields: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    onSetPage: PropTypes.func.isRequired,
    onSetRowsPerPage: PropTypes.func.isRequired,
    onAddField: PropTypes.func.isRequired,
    onSetFieldSorting: PropTypes.func.isRequired,
    onOpenFieldPicker: PropTypes.func.isRequired,
};

export default class MembersSearchContainer extends React.PureComponent {
    static propTypes = {
        query: PropTypes.string,
    };

    static contextType = routerContext;

    constructor (props) {
        super(props);

        this.store = createStore(searchPage, {
            json: {
                enabled: false,
                filter: '{}',
            },
            search: {
                field: 'nameOrCode',
                query: '',
            },
            filters: Object.fromEntries(Object.keys(FILTERABLE_FIELDS).map(field => [field, {
                enabled: false,
                value: FILTERABLE_FIELDS[field].default(),
            }])),
            fields: {
                fixed: [
                    {
                        id: 'codeholderType',
                        sorting: Sorting.NONE,
                    },
                ],
                user: [
                    {
                        id: 'code',
                        sorting: Sorting.ASC,
                    },
                    {
                        id: 'name',
                        sorting: Sorting.NONE,
                    },
                    {
                        id: 'age',
                        sorting: Sorting.NONE,
                    },
                    {
                        id: 'country',
                        sorting: Sorting.NONE,
                    },
                ],
            },
            page: {
                submitted: false,
                filtersEnabled: false,
                page: 0,
                rowsPerPage: 10,
            },
            results: {
                hasResults: false,
                list: [],
                temporaryFields: [],
                stats: {
                    time: 0,
                    total: 0,
                    filtered: false,
                },
            },
        }, applyMiddleware(thunk.withExtraArgument({
            updateURLQuery: this.updateURLQuery,
        })));

        if (props.query) this.decodeQuery(props.query);
    }

    getOverflowMenu () {
        const state = this.store.getState();
        return [
            {
                action: () => {
                    if (state.page.submitted) {
                        this.store.dispatch(actions.unsubmit());
                    }
                    this.store.dispatch(actions.setJSONEnabled(!state.json.enabled));
                },
                label: state.json.enabled
                    ? locale.members.search.json.menuLabel.disable
                    : locale.members.search.json.menuLabel.enable,
            },
        ];
    }

    decodeQuery (query) {
        query = query.replace(/^\?/, '');
        const state = this.store.getState();

        if (!query) {
            this.store.dispatch(actions.unsubmit());
            return;
        }

        try {
            const serialized = msgpack.decode(Buffer.from(query, 'base64'));

            this.store.dispatch(actions.setSearchField(serialized.f || 'nameOrCode'));
            this.store.dispatch(actions.setSearchQuery(serialized.q || ''));

            let enableFilters = false;
            if (serialized.j) {
                this.store.dispatch(actions.setJSONEnabled(true));
                this.store.dispatch(actions.setJSONFilter(serialized.j));
            } else {
                for (const id in state.filters) {
                    enableFilters = true;

                    if (id in serialized.p) {
                        let value = serialized.p[id];
                        if (FILTERABLE_FIELDS[id].deserialize) {
                            value = FILTERABLE_FIELDS[id].deserialize(value);
                        }
                        this.store.dispatch(actions.setFilterValue(id, value));
                        this.store.dispatch(actions.setFilterEnabled(id, true));
                    } else if (state.filters[id].enabled) {
                        this.store.dispatch(actions.setFilterEnabled(id, false));
                    }
                }
            }

            if (enableFilters) {
                this.store.dispatch(actions.setFiltersEnabled(true));
            }

            for (const field of state.fields.user) {
                this.store.dispatch(actions.removeField(field.id));
            }
            let index = 0;
            for (const field of serialized.c) {
                const { i: id, s: sorting } = field;
                this.store.dispatch(actions.addField(id));
                this.store.dispatch(actions.setFieldSorting(index++, sorting));
            }

            this.store.dispatch(actions.setPage(serialized.pos[0]));
            this.store.dispatch(actions.setRowsPerPage(serialized.pos[1]));
            this.store.dispatch(actions.submit());
        } catch (err) {
            // TODO: handle error
        }
    }

    encodeQuery () {
        const state = this.store.getState();

        if (state.page.submitted) {
            const serialized = {};
            if (state.search.query) {
                serialized.f = state.search.field;
                serialized.q = state.search.query;
            }
            if (state.json.enabled) {
                serialized.j = state.json.filter;
            } else {
                serialized.p = {};
                for (const id in state.filters) {
                    const filter = state.filters[id];
                    if (!filter.enabled) continue;
                    let value = filter.value;
                    if (FILTERABLE_FIELDS[id].serialize) {
                        value = FILTERABLE_FIELDS[id].serialize(value);
                    }
                    serialized.p[id] = value;
                }
            }
            serialized.c = state.fields.user.map(f => ({ i: f.id, s: f.sorting }));
            serialized.pos = [state.page.page, state.page.rowsPerPage];
            return msgpack.encode(serialized).toString('base64');
        } else return null;
    }

    updateURLQuery = () => {
        let query = this.encodeQuery();
        if (query) query = '?' + query;
        else query = '';
        this.query = query;
        if (query !== this.props.query) {
            this.context.navigate(`/membroj/${query}`);
        }
    };

    componentDidUpdate (prevProps) {
        if (prevProps.query !== this.props.query && this.props.query !== this.query) {
            this.decodeQuery(this.props.query);
        }
    }

    render () {
        return (
            <div className="app-page members-page">
                <Provider store={this.store}><MembersSearch /></Provider>
            </div>
        );
    }
}
