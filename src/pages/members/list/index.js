import React from 'react';
import PropTypes from 'prop-types';
import TablePagination from '@material-ui/core/TablePagination';
import SearchInput from './search-input';
import { filterableFields } from './predicates';
import { FIELDS } from './fields';
import MembersList from './list';
import FieldPicker from './field-picker';
import locale from '../../../locale';

export default class MembersSearch extends React.PureComponent {
    static propTypes = {
        openMember: PropTypes.func.isRequired,
    };

    state = {
        searchField: 'nameOrCode',
        searchQuery: '',
        searchFilters: false,
        predicates: filterableFields(),
        selectedFields: MembersList.defaultSelectedFields(),
        submitted: false,
        fieldPickerOpen: false,
        list: null,
    };

    onSubmit = () => {
        this.setState({ submitted: true });
        // TODO: fetch
        setTimeout(() => {
            this.setState({ list: [] });
        }, 200);
    };

    onUnsubmit = () => {
        this.setState({ submitted: false, list: null });
    };

    render () {
        // TODO: use actual data
        const count = 123;
        const total = 456;
        const time = '789 µs';
        const filtered = this.state.predicates.filter(p => p.enabled).length;
        const statsText = locale.members.resultStats(count, filtered, total, time);

        const hasResults = !!this.state.list;

        return (
            <div className="members-list-page">
                <FieldPicker
                    open={this.state.fieldPickerOpen}
                    available={Object.keys(FIELDS)}
                    sortables={Object.keys(FIELDS).filter(f => FIELDS[f].sortable)}
                    permanent={['codeholderType']}
                    selected={this.state.selectedFields}
                    onChange={selectedFields => this.setState({ selectedFields })}
                    onClose={() => this.setState({ fieldPickerOpen: false })} />
                <SearchInput
                    field={this.state.searchField}
                    onFieldChange={searchField => {
                        if (searchField !== this.state.searchField) {
                            this.setState({ searchField, searchQuery: '' });
                        }
                    }}
                    query={this.state.searchQuery}
                    onQueryChange={searchQuery => this.setState({ searchQuery })}
                    submitted={this.state.submitted}
                    predicates={this.state.predicates}
                    onPredicatesChange={predicates => this.setState({ predicates })}
                    expanded={this.state.searchFilters}
                    onExpandedChange={searchFilters => this.setState({ searchFilters })}
                    onSubmit={this.onSubmit}
                    onUnsubmit={this.onUnsubmit} />
                {hasResults && <div className="stats-line">{statsText}</div>}
                {hasResults && <MembersList
                    selectedFields={this.state.selectedFields}
                    onFieldsChange={selectedFields => this.setState({ selectedFields })}
                    onEditFields={() => this.setState({ fieldPickerOpen: true })}
                    openMemberWithTransitionTitleNode={this.props.openMember} />}
                {hasResults && <TablePagination
                    className="table-pagination"
                    component="div"
                    count={10}
                    labelDisplayedRows={locale.members.pagination.displayedRows}
                    labelRowsPerPage={locale.members.pagination.rowsPerPage}
                    page={0}
                    rowsPerPage={10}
                    onChangePage={() => {}}
                    onChangeRowsPerPage={() => {}} />}
            </div>
        );
    }
}
