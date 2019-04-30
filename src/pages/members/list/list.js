import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import ListAltIcon from '@material-ui/icons/ListAlt';
import MemberField from './field-views';
import locale from '../../../locale';
import { Link } from '../../../router';
import { Sorting } from './fields';

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
        /** Called when the selected fields change. */
        onFieldsChange: PropTypes.func.isRequired,
        /** Called when the field picker modal is requested. */
        onEditFields: PropTypes.func.isRequired,
        /** Called when a member was tapped. */
        openMemberWithTransitionTitleNode: PropTypes.func.isRequired,
        /** Should return the path for a member ID. */
        getMemberPath: PropTypes.func.isRequired,
    };

    /** Returns the default configuration. */
    static defaultSelectedFields () {
        return [
            {
                id: 'codeholderType',
                sorting: Sorting.NONE,
            },
            {
                id: 'name',
                sorting: Sorting.NONE,
            },
            {
                id: 'code',
                sorting: Sorting.DESC,
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
     * @param {number} index - the index of the member in the currently loaded list
     * @param {?Node} node - the transition title node
     */
    openMember (index, node) {
        const memberID = `abcdef`; // TODO: this
        this.setState({ opening: true });
        this.props.openMemberWithTransitionTitleNode(memberID, node);
    }

    changeSorting (id) {
        for (let i = 0; i < this.props.selectedFields.length; i++) {
            if (this.props.selectedFields[i].id === id) {
                const selected = this.props.selectedFields.slice();
                const current = selected[i].sorting;
                if (current === Sorting.NONE) selected[i].sorting = Sorting.ASC;
                else if (current === Sorting.ASC) selected[i].sorting = Sorting.DESC;
                else selected[i].sorting = Sorting.NONE;
                this.props.onFieldsChange(selected);
            }
        }
    }

    render () {
        const header = (
            <TableHead className="table-header">
                <TableRow>
                    {this.props.selectedFields.map(({ id, sorting }) => {
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
                                    key={id}
                                    sortDirection={sortDirection}>
                                    <TableSortLabel
                                        active={!!sortDirection}
                                        direction={sortDirection || 'asc'}
                                        onClick={() => this.changeSorting(id)}>
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

        // TODO: fetch members list
        const EXAMPLE = {
            name: {
                firstName: 'Max',
                firstNameLegal: 'Max',
                lastName: 'Mustermann',
                lastNameLegal: 'Mustermann',
            },
            oldCode: 'mxms-o',
            newCode: 'maxmus',
            codeholderType: 'human',
            feeCountry: 'NL',
            age: 35,
            agePrimo: 34,
            email: 'max.mustermann@ekzemplo.com',
            enabled: true,
            isDead: false,
            birthdate: '1983-01-23',
            addressLatin: {
                country: 'NL',
                countryArea: 'Zuid-Holland',
                city: 'Rotterdam',
                cityArea: null,
                postalCode: '3015 BJ',
                streetAddress: 'Nieuwe Binnenweg 176',
            },
        };

        for (let i = 0; i < 10; i++) {
            const index = i;
            members.push(
                <MemberTableRow
                    key={i}
                    value={EXAMPLE}
                    selectedFields={this.props.selectedFields}
                    onOpen={node => this.openMember(index, node)}
                    getMemberPath={this.props.getMemberPath} />
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
    };

    transitionTitleNode = null;

    onClick = e => {
        if (e.shiftKey || e.metaKey || e.ctrlKey) return;
        this.props.onOpen(this.transitionTitleNode);
        return false;
    };

    render () {
        const { selectedFields, value } = this.props;

        const memberPath = this.props.getMemberPath(value.newCode);

        const contents = selectedFields.map(({ id }) => (
            <TableCell className="members-li-column" key={id}>
                <Link target={memberPath} className="members-li-link">
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
                {contents}
            </TableRow>
        );
    }
}
