import React from 'react';
import PropTypes from 'prop-types';
import { UEACode } from 'akso-client';
import TablePagination from '@material-ui/core/TablePagination';
import SearchInput from './search-input';
import MembersList, {
    FieldPicker, AVAILABLE_FIELDS, SORTABLE_FIELDS, PERMANENT_FIELDS,
} from './list';
import MemberDetail from './list/detail';
import locale from '../../locale';
import { routerContext } from '../../router';
import { cloneNodeInScreenSpace } from '../../components/dom-utils';
import './style';

/** The members’ page. */
export default class MembersPage extends React.PureComponent {
    static propTypes = {
        path: PropTypes.arrayOf(PropTypes.string).isRequired,
        setBackButtonVisible: PropTypes.func.isRequired,
    };

    static contextType = routerContext;

    state = {
        search: SearchInput.defaultValue(),
        fields: MembersList.defaultFields(),
        submitted: false,
        fieldPickerOpen: false,
    };

    pendingTransition = null;

    openMember = (id, titleNode) => {
        if (titleNode) {
            const transition = cloneNodeInScreenSpace(titleNode);
            this.pendingTransition = transition;
            document.body.appendChild(transition.node);
        }
        setTimeout(() => {
            this.context.navigate(`/membroj/${id}`);
        }, 100);
    };

    isDetailPage (props = this.props) {
        return UEACode.validate(props.path[0]);
    }

    updateBackButtonVisibility (props) {
        this.props.setBackButtonVisible(this.isDetailPage(props));
    }

    componentDidMount () {
        this.updateBackButtonVisibility();
    }

    componentWillUpdate (newProps) {
        this.updateBackButtonVisibility(newProps);
    }

    render () {
        const isDetailPage = this.isDetailPage();
        const searchInputSubmitted = isDetailPage || this.state.submitted;
        const fieldPickerOpen = !isDetailPage && this.state.fieldPickerOpen;

        let contents = null;

        if (isDetailPage) {
            contents = (
                <MemberDetail
                    ref={node => {
                        if (this.pendingTransition) {
                            node.transitionWith(this.pendingTransition);
                            this.pendingTransition = null;
                        }
                    }} />
            );
        } else if (this.state.submitted) {
            // TODO: use actual data
            const count = 123;
            const total = 456;
            const time = '789 µs';
            const filtered = this.state.search.predicates.filter(p => p.enabled).length;
            const text = locale.members.resultStats(count, filtered, total, time);
            contents = (
                <div className="app-subpage members-list-page">
                    <div key={0} className="stats-line">{text}</div>
                    <MembersList
                        key={1}
                        fields={this.state.fields}
                        onFieldsChange={fields => this.setState({ fields })}
                        onEditFields={() => this.setState({ fieldPickerOpen: true })}
                        openMemberWithTransitionTitleNode={this.openMember} />
                    <TablePagination
                        className="table-pagination"
                        component="div"
                        count={10}
                        labelDisplayedRows={locale.members.pagination.displayedRows}
                        labelRowsPerPage={locale.members.pagination.rowsPerPage}
                        page={0}
                        rowsPerPage={10}
                        onChangePage={() => {}}
                        onChangeRowsPerPage={() => {}} />
                </div>
            );
        }

        return (
            <div className="app-page members-page">
                <SearchInput
                    value={this.state.search}
                    onChange={search => this.setState({ search })}
                    submitted={searchInputSubmitted}
                    onSubmit={() => this.setState({ submitted: true })}
                    onUnsubmit={() => this.setState({ submitted: false })} />
                <FieldPicker
                    open={fieldPickerOpen}
                    available={AVAILABLE_FIELDS}
                    sortables={SORTABLE_FIELDS}
                    permanent={PERMANENT_FIELDS}
                    selected={this.state.fields}
                    onChange={fields => this.setState({ fields })}
                    onClose={() => this.setState({ fieldPickerOpen: false })} />
                {contents}
            </div>
        );
    }
}
