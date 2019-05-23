import React from 'react';
import PropTypes from 'prop-types';
import TablePagination from '@material-ui/core/TablePagination';
import SearchInput from './search-input';
import { filterableFields } from './search-input/predicates';
import { FIELDS } from './fields';
import MembersList from './list';
import FieldPicker from './field-picker';
import { routerContext } from '../../../router';
import locale from '../../../locale';
import data from './data';

const initialState = () => ({
    searchField: 'nameOrCode',
    searchQuery: '',
    searchFilters: false,
    predicates: filterableFields(),
    selectedFields: MembersList.defaultSelectedFields(),
    submitted: false,
    fieldPickerOpen: false,
    list: null,
    responseStats: null,
    page: 0,
    rowsPerPage: 10,
});

export default class MembersSearch extends React.PureComponent {
    static propTypes = {
        openMember: PropTypes.func.isRequired,
        getMemberPath: PropTypes.func.isRequired,
        query: PropTypes.string.isRequired,
    };

    static contextType = routerContext;

    state = initialState();

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

    componentDidUpdate (prevProps) {
        if (prevProps.query !== this.props.query) {
            if (this.props.query === '') {
                // reset
                this.setState(initialState());
            }
        }
    }

    decodeQuery (query) {
        // TODO: this
    }

    encodeQuery () {
        // TODO: this
        return 'todo';
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

    onSubmit = () => {
        clearTimeout(this.debounceTimeout);
        this.setState({ submitted: true });

        // TODO: char limit check
        this.context.replace(`/membroj/?${this.encodeQuery()}`);

        // TODO: these
        const offset = this.state.rowsPerPage * this.state.page;
        const limit = this.state.rowsPerPage;

        data.search(
            this.state.searchField,
            this.state.searchQuery,
            this.state.searchFilters ? this.state.predicates : [],
            this.state.selectedFields,
            offset,
            limit,
        );
    };

    onUnsubmit = () => {
        this.setState({ submitted: false, list: null });
    };

    submitDebounced () {
        if (!this.state.submitted) return;
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(this.onSubmit, 500);
    }

    onSelectedFieldsChange = (selectedFields) => {
        let shouldReload = false;
        if (selectedFields.length > this.state.selectedFields.length) {
            // more fields selected than available; needs reload
            shouldReload = true;
        }

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

        this.setState({ selectedFields });
    };

    render () {
        // TODO: use actual data
        const count = this.state.list && this.state.list.length;
        const total = this.state.responseStats && this.state.responseStats.total;
        const time = this.state.responseStats && this.state.responseStats.time;
        const filtered = this.state.predicates.filter(p => p.enabled).length;
        const statsText = locale.members.resultStats(count, filtered, total, time);

        const hasResults = !!this.state.list;

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
                ) : <div className="members-list-container">
                    <MembersList
                        selectedFields={this.state.selectedFields}
                        onFieldsChange={this.onSelectedFieldsChange}
                        onEditFields={() => this.setState({ fieldPickerOpen: true })}
                        openMemberWithTransitionTitleNode={this.props.openMember}
                        getMemberPath={this.props.getMemberPath}
                        list={this.state.list} />
                </div>)}
                {hasResults && !this.state.error && <TablePagination
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
