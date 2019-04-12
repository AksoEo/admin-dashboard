import React from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';
import IconButton from '@material-ui/core/IconButton';
import ListAltIcon from '@material-ui/icons/ListAlt';
import MemberField, { Position } from './field-views';
import locale from '../../../locale';
import { SortingControl } from './field-picker';
import { FIELDS, PosHint, Sorting } from './fields';
export FieldPicker from './field-picker';
export * from './fields';

/** Column whose title will be replaced with the Pick Fields button. */
const FIELDS_BTN_COLUMN = 'codeholderType';

/** The width of a single “weight” unit in pixels in the table layout. */
const WEIGHT_UNIT = 64;

/** The minimum weight scale--the inverse of the max. allowed squishing of table columns. */
const MIN_WEIGHT_SCALE = 0.8;

/** The max. allowed stretching of table columns. */
const MAX_WEIGHT_SCALE = 3;

/** Min width for the members list to be a table. */
const MIN_TABLE_WIDTH = 600;

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
        fields: PropTypes.arrayOf(PropTypes.object).isRequired,
        /** Called when the selected fields change. */
        onFieldsChange: PropTypes.func.isRequired,
        /** Called when the field picker modal is requested. */
        onEditFields: PropTypes.func.isRequired,
        /** Called when a member was tapped. */
        openMemberWithTransitionTitleNode: PropTypes.func.isRequired,
    };

    /** Returns the default configuration. */
    static defaultFields () {
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
    resizeObserver = null;
    currentWidth = null;

    /**
     * Builds a layout template for the member items.
     */
    buildTemplate () {
        const fields = this.props.fields.map(field => field.id);
        const width = this.currentWidth;

        // try using table layout if min width is exceeded
        if (width > MIN_TABLE_WIDTH) {
            const flexWidth = fields
                .filter(field => !FIELDS[field].fixedColWidth)
                .map(field => FIELDS[field].colWeight * WEIGHT_UNIT)
                .reduce((a, b) => a + b, 0);

            const fixedColWidth = fields
                .map(field => FIELDS[field].fixedColWidth)
                .filter(x => x)
                .reduce((a, b) => a + b, 0);

            const weightScale = Math.min(MAX_WEIGHT_SCALE, (width - fixedColWidth) / flexWidth);

            if (fixedColWidth < width && weightScale > MIN_WEIGHT_SCALE) {
                const columns = fields.map(field => ({
                    id: field,
                    width: FIELDS[field].fixedColWidth
                        ? FIELDS[field].fixedColWidth
                        : weightScale * FIELDS[field].colWeight * WEIGHT_UNIT,
                    omitHeader: !!FIELDS[field].omitTHead,
                }));

                this.setState({
                    template: {
                        table: true,
                        columns,
                    },
                });
                return;
            }
        }

        // otherwise, use flex layout

        let left = null;
        const name = [];
        const center = [];
        let right = null;

        let index = 0;
        for (const field of fields) {
            if (FIELDS[field].posHint === PosHint.LEFT && !left) {
                left = field;
            } else if (FIELDS[field].posHint === PosHint.RIGHT && !right) {
                right = field;
            } else if (FIELDS[field].posHint === PosHint.NAME) {
                name.push(field);
            } else {
                center.push({
                    id: field,
                    weight: (fields.length - index) * FIELDS[field].weight,
                });
            }
            index++;
        }

        center.sort((a, b) => b.weight - a.weight);

        this.setState({
            template: {
                table: false,
                left,
                name,
                center: center.map(field => field.id),
                right,
            },
        });
    }

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

    onResize (width) {
        if (width === this.currentWidth) return;
        this.currentWidth = width;
        this.buildTemplate();
    }

    componentDidMount () {
        this.resizeObserver = new ResizeObserver(entries => {
            const entry = entries[0];
            this.onResize(entry.contentRect.width);
        });
        this.resizeObserver.observe(this.node);
        this.onResize(this.node.offsetWidth);
    }

    componentDidUpdate (prevProps) {
        if (prevProps.fields !== this.props.fields) {
            this.buildTemplate();
        }
    }

    render () {
        let header = null;
        const members = [];

        if (this.state.template) {
            if (this.state.template.table) {
                // add table header
                header = <TableHeader
                    template={this.state.template}
                    selected={this.props.fields}
                    onSelectedChange={this.props.onFieldsChange}
                    onEditFields={this.props.onEditFields} />;
            } else {
                // add Edit Fields button
                header = (
                    <div className="flex-layout-header">
                        <IconButton
                            onClick={this.props.onEditFields}
                            aria-label={locale.members.fieldPicker.title}
                            title={locale.members.fieldPicker.title}>
                            <ListAltIcon />
                        </IconButton>
                    </div>
                );
            }

            // TODO: fetch members list
            const EXAMPLE = {
                name: {
                    firstName: 'Example',
                    firstNameLegal: 'Example',
                    lastName: 'McExampleface',
                    lastNameLegal: 'McExampleface',
                },
                oldCode: 'exam-l',
                newCode: 'exampl',
                codeholderType: 'human',
                feeCountry: 'NL',
                age: 35,
                email: 'exam@ple.example',
                addressLatin: {
                    country: 'NL',
                    countryArea: 'Holland',
                    city: 'Amsterdam',
                    cityArea: 'Idontknow',
                    postalCode: '12345',
                    streetAddress: 'Idontknow 12',
                },
            };

            for (let i = 0; i < 10; i++) {
                const index = i;
                members.push(
                    <MemberLi
                        key={i}
                        value={EXAMPLE}
                        template={this.state.template}
                        onOpen={node => this.openMember(index, node)} />
                );
            }
        }

        let className = 'members-list';
        if (this.state.opening) className += ' opening';

        return (
            <div className={className} ref={node => this.node = node}>
                {header}
                {members}
            </div>
        );
    }
}

/** Renders a member list item. */
class MemberLi extends React.PureComponent {
    static propTypes = {
        template: PropTypes.object.isRequired,
        value: PropTypes.object.isRequired,
        onOpen: PropTypes.func.isRequired,
    };

    transitionTitleNode = null;

    onClick = () => this.props.onOpen(this.transitionTitleNode);

    render () {
        const { template, value } = this.props;

        let className = 'members-list-item';

        const templateFields = template.table
            ? template.columns.map(field => field.id)
            : [
                template.left,
                template.right,
                ...template.name,
                ...template.center,
            ].filter(x => x);

        let contents;
        if (template.table) {
            className += ' table-layout';
            contents = template.columns.map(({ id, width }) => (
                <div className="members-li-column" key={id} style={{ width }}>
                    {<MemberField
                        field={id}
                        value={value[id]}
                        member={value}
                        position={Position.COLUMN}
                        templateFields={templateFields}
                        transitionTitleRef={node => this.transitionTitleNode = node} />}
                </div>
            ));
        } else {
            className += ' flex-layout';
            contents = [
                <div className="item-left" key={0}>
                    {template.left && <MemberField
                        field={template.left}
                        value={value[template.left]}
                        member={value}
                        position={Position.LEFT}
                        templateFields={templateFields}
                        transitionTitleRef={node => this.transitionTitleNode = node} />}
                </div>,
                <div className="item-center" key={1}>
                    <div className="item-name">
                        {template.name.map(f => (
                            <MemberField
                                key={f}
                                field={f}
                                value={value[f]}
                                member={value}
                                position={Position.NAME}
                                templateFields={templateFields}
                                transitionTitleRef={node => this.transitionTitleNode = node} />
                        ))}
                    </div>
                    {template.center.map(f => (
                        <div className="center-field-line" key={f}>
                            <MemberField
                                field={f}
                                value={value[f]}
                                member={value}
                                position={Position.CENTER}
                                templateFields={templateFields}
                                transitionTitleRef={node => this.transitionTitleNode = node} />
                        </div>
                    ))}
                </div>,
                <div className="item-right" key={2}>
                    {template.right && <MemberField
                        field={template.right}
                        value={value[template.right]}
                        member={value}
                        position={Position.RIGHT}
                        templateFields={templateFields}
                        transitionTitleRef={node => this.transitionTitleNode = node} />}
                </div>,
            ];
        }

        return <div className={className} onClick={this.onClick}>{contents}</div>;
    }
}

/** Renders the table header. */
class TableHeader extends React.PureComponent {
    static propTypes = {
        template: PropTypes.object.isRequired,
        selected: PropTypes.arrayOf(PropTypes.object).isRequired,
        onSelectedChange: PropTypes.func.isRequired,
        onEditFields: PropTypes.func.isRequired,
    };

    findSelectedIndex (id) {
        for (let i = 0; i < this.props.selected.length; i++) {
            if (this.props.selected[i].id === id) return i;
        }
        return -1;
    }

    render () {
        return (
            <div className="table-header">
                {this.props.template.columns.map(({ id, width, omitHeader }) => {
                    const selectedIndex = this.findSelectedIndex(id);

                    const sortingControl = FIELDS[id].sortable
                        ? (
                            <SortingControl
                                hideLabel
                                // it can happen that the template hasn’t updated yet after
                                // selected did, so this needs to check for existence
                                value={selectedIndex !== -1
                                    ? this.props.selected[selectedIndex].sorting
                                    : Sorting.NONE}
                                onChange={sorting => {
                                    const selected = this.props.selected.slice();
                                    selected[this.findSelectedIndex(id)].sorting = sorting;
                                    this.props.onSelectedChange(selected);
                                }} />
                        )
                        : <div className="sorting-control-none" />;

                    return (
                        FIELDS_BTN_COLUMN === id ? (
                            <IconButton
                                key={id}
                                className="table-header-fields-btn"
                                aria-label={locale.members.fieldPicker.title}
                                title={locale.members.fieldPicker.title}
                                onClick={this.props.onEditFields}>
                                <ListAltIcon />
                            </IconButton>
                        ) : (
                            <div className="table-header-column" key={id} style={{ width }}>
                                {sortingControl}
                                <span className="column-title">
                                    {omitHeader ? null : locale.members.fields[id]}
                                </span>
                            </div>
                        )
                    );
                })}
            </div>
        );
    }
}
