import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Checkbox from '@material-ui/core/Checkbox';
import ListAltIcon from '@material-ui/icons/ListAlt';
import SearchIcon from '@material-ui/icons/Search';
import MemberField from './field-views';
import locale from '../../../locale';
import { Link } from '../../../router';
import { Sorting } from './fields';
import './style';

/** Column whose title will be replaced with the Pick Fields button. */
const FIELDS_BTN_COLUMN = 'codeholderType';

/**
 * Renders the list of members.
 *
 * This list has two possible layouts: the table layout and the flex layout (for lack of a
 * better term).
 * In the table layout, selected fields will be shown as columns in order, as expected.
 * In the flex layout, fields will be arranged in three columns to form a more
 * small-screen-friendly layout.
 * The table layout is preferred for large screens but will fall back to the flex layout if
 * there is insufficient space.
 */
export default class MembersList extends React.PureComponent {
    static propTypes = {
        /** List of selected fields. See `defaultFields` for an example. */
        selectedFields: PropTypes.arrayOf(PropTypes.object).isRequired,
        /** List of temporary selected fields which are only there because of the search query. */
        tmpSelectedFields: PropTypes.arrayOf(PropTypes.string).isRequired,
        /** Called when the selected fields change. */
        onFieldsChange: PropTypes.func.isRequired,
        /** Called when the field picker modal is requested. */
        onEditFields: PropTypes.func.isRequired,
        /** Called when a member was tapped. */
        openMemberWithTransitionTitleNode: PropTypes.func.isRequired,
        /** Should return the path for a member ID. */
        getMemberPath: PropTypes.func.isRequired,
        /** The list of members. */
        list: PropTypes.arrayOf(PropTypes.object).isRequired,
    };

    /** Returns the default configuration. */
    static defaultSelectedFields () {
        return [
            {
                id: 'codeholderType',
                sorting: Sorting.NONE,
            },
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
        ];
    }

    state = {
        template: null,
        opening: false,
    };

    node = null;

    /**
     * Opens a member’s page.
     * @param {string} id - the id of the member
     * @param {?Node} node - the transition title node
     */
    openMember (id, node) {
        this.setState({ opening: true });
        this.props.openMemberWithTransitionTitleNode(id, node);
    }

    changeSorting (id) {
        for (let i = 0; i < this.props.selectedFields.length; i++) {
            if (this.props.selectedFields[i].id === id) {
                const selected = this.props.selectedFields.slice();
                selected[i] = { ...selected[i] };
                const current = selected[i].sorting;
                if (current === Sorting.NONE) selected[i].sorting = Sorting.ASC;
                else if (current === Sorting.ASC) selected[i].sorting = Sorting.DESC;
                else selected[i].sorting = Sorting.NONE;
                this.props.onFieldsChange(selected);
                break;
            }
        }
    }

    selectTmpField (id) {
        const selected = this.props.selectedFields.slice();
        selected.splice(1, 0, { id, sorting: Sorting.NONE });
        this.props.onFieldsChange(selected);
    }

    render () {
        const selectedFields = this.props.selectedFields.slice();
        const selectedFieldIds = selectedFields.map(x => x.id);
        for (const tmpId of this.props.tmpSelectedFields) {
            if (!selectedFieldIds.includes(tmpId)) {
                selectedFieldIds.push(tmpId);
                // hacky: insert after codeholderType
                // (unchecked invariant: codeholderType is in selected fields)
                selectedFields.splice(1, 0, { id: tmpId, sorting: Sorting.NONE, isTmp: true });
            }
        }

        const header = (
            <TableHead className="table-header">
                <TableRow>
                    <TableCell className="members-select-column">
                        <Checkbox
                            // TODO: this
                            checked={false}
                            onChange={() => {}} />
                    </TableCell>
                    {selectedFields.map(({ id, sorting, isTmp }) => {
                        if (id === FIELDS_BTN_COLUMN) {
                            return (
                                <TableCell key={id} className="table-header-fields-btn-container">
                                    <IconButton
                                        key={id}
                                        className="table-header-fields-btn"
                                        aria-label={locale.members.fieldPicker.title}
                                        title={locale.members.fieldPicker.title}
                                        onClick={this.props.onEditFields}>
                                        <ListAltIcon />
                                    </IconButton>
                                </TableCell>
                            );
                        } else {
                            const sortDirection = sorting === Sorting.NONE
                                ? false
                                : sorting === Sorting.ASC ? 'asc' : 'desc';

                            return (
                                <TableCell
                                    className={isTmp ? 'tmp-field' : ''}
                                    key={id}
                                    sortDirection={sortDirection}>
                                    {isTmp && <SearchIcon className="tmp-field-icon" />}
                                    <TableSortLabel
                                        active={!!sortDirection}
                                        direction={sortDirection || 'asc'}
                                        onClick={() => {
                                            if (isTmp) this.selectTmpField(id);
                                            else this.changeSorting(id);
                                        }}>
                                        {locale.members.fields[id]}
                                    </TableSortLabel>
                                </TableCell>
                            );
                        }
                    })}
                </TableRow>
            </TableHead>
        );

        const members = [];

        for (const item of this.props.list) {
            members.push(
                <MemberTableRow
                    key={item.id}
                    value={item}
                    selectedFields={selectedFields}
                    onOpen={node => this.openMember(item.id, node)}
                    getMemberPath={this.props.getMemberPath}
                    // TODO: this
                    isSelected={false}
                    onSelectChange={() => {}} />
            );
        }

        let className = 'members-list';
        if (this.state.opening) className += ' opening';

        return (
            <Table className={className} ref={node => this.node = node}>
                {header}
                <TableBody>
                    {members}
                </TableBody>
            </Table>
        );
    }
}

/** Renders a member table row. */
class MemberTableRow extends React.PureComponent {
    static propTypes = {
        selectedFields: PropTypes.array.isRequired,
        value: PropTypes.object.isRequired,
        onOpen: PropTypes.func.isRequired,
        getMemberPath: PropTypes.func.isRequired,
        isSelected: PropTypes.bool.isRequired,
        onSelectChange: PropTypes.func.isRequired,
    };

    transitionTitleNode = null;

    onClick = () => {
        this.props.onOpen(this.transitionTitleNode);
    };

    onLinkClick = e => {
        if (e.shiftKey || e.metaKey || e.ctrlKey) return;
        return false;
    };

    render () {
        const { selectedFields, value } = this.props;

        const memberPath = this.props.getMemberPath(value.id);

        const contents = selectedFields.map(({ id }) => (
            <TableCell className="members-li-column" key={id}>
                <Link target={memberPath} className="members-li-link" onClick={this.onLinkClick}>
                    <MemberField
                        field={id}
                        value={value[id]}
                        member={value}
                        selectedFields={selectedFields.map(field => field.id)}
                        transitionTitleRef={node => this.transitionTitleNode = node} />
                </Link>
            </TableCell>
        ));

        return (
            <TableRow className="members-list-item" onClick={this.onClick}>
                <TableCell className="members-li-column members-select-column" onClick={e => {
                    e.stopPropagation();
                }}>
                    <Checkbox
                        checked={this.props.isSelected}
                        onChange={this.props.onSelectChange} />
                </TableCell>
                {contents}
            </TableRow>
        );
    }
}
