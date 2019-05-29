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
import data from './data';

const TMP_SELECTED_FIELDS = {
    'nameOrCode': ['name', 'code'],
    'address': ['addressLatin'],
};

const MembersSearch = connect(
    state => state,
    dispatch => ({ dispatch }),
)(class MembersSearch extends React.PureComponent {
    static propTypes = {
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
        const { search, filters, fields, page, results, dispatch } = this.props;

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
                    onUnsubmit={onUnsubmit} />
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
                        openMemberWithTransitionTitleNode={() => {}}
                        getMemberPath={() => ''}
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

        // TODO: decode props.query into this
        this.store = createStore(searchPage, {
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

            for (const id in state.filters) {
                if (id in serialized.p) {
                    let value = serialized.p[id];
                    if (FILTERABLE_FIELDS[id].deserialize) {
                        value = FILTERABLE_FIELDS[id].deserialize(value);
                    }
                    this.store.dispatch(actions.setFilterValue(id, value));
                } else if (state.filters[id].enabled) {
                    this.store.dispatch(actions.setFilterEnabled(id, false));
                }
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
            serialized.p = {};
            for (const id in state.filters) {
                const filter = state.filters[id];
                if (!filter.enabled) continue;
                let value = filter.value;
                if (FILTERABLE_FIELDS[id].serialize) value = FILTERABLE_FIELDS[id].serialize(value);
                serialized.p[id] = value;
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

/** Members search page. Needs a refactor */
export class TmpMembersSearch extends React.PureComponent {
    static propTypes = {
        openMember: PropTypes.func.isRequired,
        getMemberPath: PropTypes.func.isRequired,
        query: PropTypes.string.isRequired,
    };

    static contextType = routerContext;

    state = {};

    componentDidMount () {
        data.on('result', this.onResult);
        data.on('reset-page', this.onResetPage);

        data.getPerms().then(perms => {
            if (Object.keys(perms.memberFilter).length) {
                // there’s a member filter so we need to display a notice about it
                this.setState({ isRestrictedByGlobalFilter: true });
            }
        });

        if (this.props.query) {
            this.decodeQuery(this.props.query);
        }
    }

    componentWillUnmount () {
        data.removeListener('result', this.onResult);
        data.removeListener('reset-page', this.onResetPage);
    }

    mostRecentlyEncodedQuery = null;

    componentDidUpdate (prevProps) {
        if (prevProps.query !== this.props.query) {
            if (this.props.query === '') {
                // reset
                if (this.dontResetState) this.dontResetState = false;
                else this.setState({});
            } else if (this.props.query !== this.mostRecentlyEncodedQuery) {
                this.decodeQuery(this.props.query);
            }
        }
    }

    onResult = result => {
        if (result.ok) {
            this.setState({
                list: result.list,
                responseStats: {
                    time: result.resTime,
                    total: result.totalItems,
                },
                error: null,
            });
        } else {
            // TODO: handle error properly
            /* eslint-disable no-console */
            console.error(result.error);
            /* eslint-enable no-console */
            this.setState({ list: [], error: result.error });
        }
    };

    onResetPage = () => {
        this.setState({ page: 0 });
    };

    setRequestURL () {
        // TODO: char limit check
        const query = '?' + this.encodeQuery();
        this.context.replace(`/membroj/${query}`);
        this.mostRecentlyEncodedQuery = query;
    }

    onSubmit = () => {
        clearTimeout(this.debounceTimeout);

        const tmpSelectedFields = (TMP_SELECTED_FIELDS[this.state.searchField]
            || [this.state.searchField]);

        this.setState({ submitted: true, tmpSelectedFields }, () => {
            this.setRequestURL();
        });

        const offset = this.state.rowsPerPage * this.state.page;
        const limit = this.state.rowsPerPage;

        data.search(
            this.state.searchField,
            this.state.searchQuery,
            this.state.searchFilters ? this.state.predicates : [],
            this.state.selectedFields.concat(
                tmpSelectedFields.map(id => ({ id, sorting: Sorting.NONE }))
            ),
            offset,
            limit,
        );
    };

    onUnsubmit = () => {
        this.setState({ submitted: false, list: null });
        this.dontResetState = true;
        this.context.replace('/membroj/');
    };

    submitDebounced () {
        if (!this.state.submitted) return;
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(this.onSubmit, 500);
    }

    onSelectedFieldsChange = (selectedFields) => {
        let shouldReload = false;
        let shouldSetURL = false;
        if (selectedFields.length > this.state.selectedFields.length) {
            // more fields selected than available; needs reload
            shouldReload = true;
        } else shouldSetURL = true; // still need to set the URL though

        const currentSorting = {};
        for (const field of this.state.selectedFields) {
            currentSorting[field.id] = field.sorting;
        }
        for (const field of selectedFields) {
            if (field.id in currentSorting && currentSorting[field.id] !== field.sorting) {
                // sorting changed; reload
                this.setState({ page: 0 });
                shouldReload = true;
                break;
            }
        }

        if (shouldReload) this.submitDebounced();

        this.setState({ selectedFields }, () => {
            if (shouldSetURL && !shouldReload) this.setRequestURL();
        });
    };

    render () {
        const count = this.state.list && this.state.list.length;
        const total = this.state.responseStats && this.state.responseStats.total;
        const time = this.state.responseStats && this.state.responseStats.time;
        const filtered = this.state.predicates.filter(p => p.enabled).length;
        const statsText = locale.members.resultStats(count, filtered, total, time);

        const hasResults = !!this.state.list;
        const resultsNotEmpty = hasResults && !!this.state.list.length;

        // TODO: proper error display

        // TODO: filter available fields to ones permitted by user permissions
        const availableFields = Object.keys(FIELDS)
            .filter(field => !FIELDS[field].hideColumn);

        return (
            <div className="members-list-page">
                <FieldPicker
                    open={this.state.fieldPickerOpen}
                    available={availableFields}
                    sortables={Object.keys(FIELDS).filter(f => FIELDS[f].sortable)}
                    permanent={['codeholderType']}
                    selected={this.state.selectedFields}
                    onChange={this.onSelectedFieldsChange}
                    onClose={() => this.setState({ fieldPickerOpen: false })} />
                <SearchInput
                    field={this.state.searchField}
                    onFieldChange={searchField => {
                        if (searchField !== this.state.searchField) {
                            this.submitDebounced();
                            this.setState({ searchField, searchQuery: '' });
                        }
                    }}
                    query={this.state.searchQuery}
                    onQueryChange={searchQuery => {
                        this.submitDebounced();
                        this.setState({ searchQuery });
                    }}
                    submitted={this.state.submitted}
                    predicates={this.state.predicates}
                    onPredicatesChange={predicates => {
                        this.submitDebounced();
                        this.setState({ predicates });
                    }}
                    expanded={this.state.searchFilters}
                    onExpandedChange={searchFilters => {
                        this.submitDebounced();
                        this.setState({ searchFilters });
                    }}
                    onSubmit={this.onSubmit}
                    onUnsubmit={this.onUnsubmit} />
                {hasResults && !this.state.error && <div className="stats-line">{statsText}</div>}
                {hasResults && this.state.isRestrictedByGlobalFilter && (
                    <div className="global-filter-notice">
                        {locale.members.globalFilterNotice}
                    </div>
                )}
                {hasResults && (this.state.error ? (
                    <div className="members-list-error">
                        {this.state.error.toString()}
                    </div>
                ) : resultsNotEmpty ? (
                    <div className="members-list-container">
                        <MembersList
                            selectedFields={this.state.selectedFields}
                            tmpSelectedFields={this.state.tmpSelectedFields}
                            onFieldsChange={this.onSelectedFieldsChange}
                            onEditFields={() => this.setState({ fieldPickerOpen: true })}
                            openMemberWithTransitionTitleNode={this.props.openMember}
                            getMemberPath={this.props.getMemberPath}
                            list={this.state.list} />
                    </div>
                ) : (
                    <div className="members-list-no-results">
                        {locale.members.noResults}
                    </div>
                ))}
                {resultsNotEmpty && !this.state.error && <TablePagination
                    className="table-pagination"
                    component="div"
                    count={total | 0}
                    labelDisplayedRows={locale.members.pagination.displayedRows}
                    labelRowsPerPage={locale.members.pagination.rowsPerPage}
                    page={this.state.page}
                    rowsPerPage={this.state.rowsPerPage}
                    onChangePage={(e, page) => {
                        if (page !== this.state.page) {
                            this.setState({ page }, this.onSubmit);
                        }
                    }}
                    onChangeRowsPerPage={e => {
                        if (e.target.value !== this.state.rowsPerPage) {
                            this.setState({
                                page: Math.floor(
                                    (this.state.page * this.state.rowsPerPage) / e.target.value
                                ),
                                rowsPerPage: e.target.value,
                            }, this.onSubmit);
                        }
                    }} />}
            </div>
        );
    }
}
