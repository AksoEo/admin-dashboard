import React from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';
import IconButton from '@material-ui/core/IconButton';
import ListAltIcon from '@material-ui/icons/ListAlt';
import MemberField, { Position } from './fields';
import locale from '../../../locale';
import { Sorting, SortingControl } from './field-picker';
export FieldPicker from './field-picker';

const PosHint = {
    LEFT: 0,
    NAME: 1,
    CENTER: 2,
    RIGHT: 3
};

const FIELDS = {
    name: {
        weight: 3,
        colWeight: 2,
        posHint: PosHint.NAME,
        sortable: true
    },
    code: {
        weight: 2,
        colWeight: 2,
        posHint: PosHint.NAME,
        sortable: true
    },
    codeholderType: {
        weight: 1,
        fixedColWidth: 56,
        posHint: PosHint.LEFT,
        omitTHead: true,
        permanent: true,
        sortable: true
    },
    country: {
        weight: 1,
        colWeight: 2,
        posHint: PosHint.RIGHT,
        sortable: true
    },
    age: {
        weight: 2,
        colWeight: 1,
        posHint: PosHint.RIGHT,
        sortable: true
    },
    email: {
        weight: 2,
        colWeight: 2,
        posHint: PosHint.CENTER
    },
    addressLatin: {
        weight: 1,
        colWeight: 3,
        posHint: PosHint.CENTER,
        sortable: true
    },
    addressCity: {
        weight: 1,
        colWeight: 2,
        posHint: PosHint.CENTER,
        sortable: true
    },
    addressCountryArea: {
        weight: 1,
        colWeight: 2,
        posHint: PosHint.CENTER,
        sortable: true
    }
};

export const AVAILABLE_FIELDS = Object.keys(FIELDS);
export const PERMANENT_FIELDS = AVAILABLE_FIELDS.filter(field => FIELDS[field].permanent);
export const SORTABLE_FIELDS = AVAILABLE_FIELDS.filter(field => FIELDS[field].sortable);

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

export default class MembersList extends React.PureComponent {
    static propTypes = {
        fields: PropTypes.arrayOf(PropTypes.object).isRequired,
        onFieldsChange: PropTypes.func.isRequired,
        onEditFields: PropTypes.func.isRequired,
        openMemberWithTransitionTitleNode: PropTypes.func.isRequired
    };

    static defaultFields () {
        return [
            {
                id: 'codeholderType',
                sorting: Sorting.NONE
            },
            {
                id: 'name',
                sorting: Sorting.NONE
            },
            {
                id: 'code',
                sorting: Sorting.DESC
            },
            {
                id: 'age',
                sorting: Sorting.NONE
            },
            {
                id: 'country',
                sorting: Sorting.NONE
            }
        ];
    }

    state = {
        template: null,
        opening: false
    };

    node = null;
    resizeObserver = null;
    currentWidth = null;

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
                    omitHeader: !!FIELDS[field].omitTHead
                }));

                this.setState({
                    template: {
                        table: true,
                        columns
                    }
                });
                return;
            }
        }

        // otherwise, use non-table layout

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
                    weight: (fields.length - index) * FIELDS[field].weight
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
                right
            }
        });
    }

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
                    lastNameLegal: 'McExampleface'
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
                    streetAddress: 'Idontknow 12'
                }
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

class MemberLi extends React.PureComponent {
    static propTypes = {
        template: PropTypes.object.isRequired,
        value: PropTypes.object.isRequired,
        onOpen: PropTypes.func.isRequired
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
                ...template.center
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
                </div>
            ];
        }

        return <div className={className} onClick={this.onClick}>{contents}</div>;
    }
}

class TableHeader extends React.PureComponent {
    static propTypes = {
        template: PropTypes.object.isRequired,
        selected: PropTypes.arrayOf(PropTypes.object).isRequired,
        onSelectedChange: PropTypes.func.isRequired,
        onEditFields: PropTypes.func.isRequired
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
