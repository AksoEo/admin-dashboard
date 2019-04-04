import React from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';
import IconButton from '@material-ui/core/IconButton';
import ListAltIcon from '@material-ui/icons/ListAlt';
import MemberField, { Position } from './fields';
import locale from '../../../locale';
import { Sorting } from './field-picker';
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
        posHint: PosHint.NAME
    },
    code: {
        weight: 2,
        colWeight: 1,
        posHint: PosHint.NAME
    },
    codeholderType: {
        weight: 1,
        fixedColWidth: 56,
        posHint: PosHint.LEFT,
        omitTHead: true,
        permanent: true
    },
    country: {
        weight: 1,
        colWeight: 1,
        posHint: PosHint.RIGHT
    },
    age: {
        weight: 2,
        colWeight: 1,
        posHint: PosHint.RIGHT
    },
    email: {
        weight: 2,
        colWeight: 2,
        posHint: PosHint.CENTER
    },
    addressLatin: {
        weight: 1,
        colWeight: 3,
        posHint: PosHint.CENTER
    }
};

export const AVAILABLE_FIELDS = Object.keys(FIELDS);
export const PERMANENT_FIELDS = AVAILABLE_FIELDS.filter(field => FIELDS[field].permanent);

/** Column whose title will be replaced with the Pick Fields button. */
const FIELDS_BTN_COLUMN = 'codeholderType';

/** The width of a single “weight” unit in pixels in the table layout. */
const WEIGHT_UNIT = 64;

/** The minimum weight scale--the inverse of the max. allowed squishing of table columns. */
const MIN_WEIGHT_SCALE = 0.6;

/** The max. allowed stretching of table columns. */
const MAX_WEIGHT_SCALE = 3;

/** Min width for the members list to be a table. */
const MIN_TABLE_WIDTH = 600;

export default class MembersList extends React.PureComponent {
    static propTypes = {
        fields: PropTypes.arrayOf(PropTypes.object).isRequired,
        onEditFields: PropTypes.func.isRequired
    };

    static defaultFields () {
        // TEMP
        return [
            {
                id: 'codeholderType',
                sorting: Sorting.NONE
            },
            {
                id: 'name',
                sorting: Sorting.ASC
            },
            {
                id: 'code',
                sorting: Sorting.NONE
            },
            {
                id: 'country',
                sorting: Sorting.NONE
            },
            {
                id: 'age',
                sorting: Sorting.NONE
            },
            {
                id: 'email',
                sorting: Sorting.NONE
            }
        ];
    }

    state = {
        template: null
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
                    onEditFields={this.props.onEditFields} />;
            } else {
                // add Edit Fields button
                header = (
                    <div className="flex-layout-header">
                        <IconButton onClick={this.props.onEditFields}>
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
                members.push(
                    <MemberLi
                        key={i}
                        value={EXAMPLE}
                        template={this.state.template} />
                );
            }
        }

        return (
            <div className="members-list" ref={node => this.node = node}>
                {header}
                {members}
            </div>
        );
    }
}

class MemberLi extends React.PureComponent {
    static propTypes = {
        template: PropTypes.object.isRequired,
        value: PropTypes.object.isRequired
    };

    render () {
        const { template, value } = this.props;

        let className = 'members-list-item';

        // TODO: properly render fields

        let contents;
        if (template.table) {
            className += ' table-layout';
            contents = template.columns.map(({ id, width }) => (
                <div className="members-li-column" key={id} style={{ width }}>
                    {<MemberField
                        field={id}
                        value={value[id]}
                        member={value}
                        position={Position.COLUMN} />}
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
                        position={Position.LEFT} />}
                </div>,
                <div className="item-center" key={1}>
                    <div className="item-name">
                        {template.name.map(f => (
                            <MemberField
                                key={f}
                                field={f}
                                value={value[f]}
                                member={value}
                                position={Position.NAME} />
                        ))}
                    </div>
                    {template.center.map(f => (
                        <div className="center-field-line" key={f}>
                            <MemberField
                                field={f}
                                value={value[f]}
                                member={value}
                                position={Position.CENTER} />
                        </div>
                    ))}
                </div>,
                <div className="item-right" key={2}>
                    {template.right && <MemberField
                        field={template.right}
                        value={value[template.right]}
                        member={value}
                        position={Position.RIGHT} />}
                </div>
            ];
        }

        return <div className={className}>{contents}</div>;
    }
}

class TableHeader extends React.PureComponent {
    static propTypes = {
        template: PropTypes.object.isRequired,
        onEditFields: PropTypes.func.isRequired
    };

    render () {
        return (
            <div className="table-header">
                {this.props.template.columns.map(({ id, width, omitHeader }) =>
                    FIELDS_BTN_COLUMN === id ? (
                        <IconButton
                            key={id}
                            className="table-header-fields-btn"
                            onClick={this.props.onEditFields}>
                            <ListAltIcon />
                        </IconButton>
                    ) : (
                        <div className="table-header-column" key={id} style={{ width }}>
                            {omitHeader ? null : locale.members.fields[id]}
                        </div>
                    ))}
            </div>
        );
    }
}
