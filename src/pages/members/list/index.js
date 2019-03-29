import React from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';
import MemberField, { Position } from './fields';
import locale from '../../../locale';

const Sorting = {
    NONE: 0,
    DESC: 1,
    ASC: 2
};

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
    newCode: {
        weight: 2,
        colWeight: 1,
        posHint: PosHint.NAME
    },
    codeholderType: {
        weight: 1,
        fixedColWidth: 56,
        posHint: PosHint.LEFT,
        omitTHead: true
    },
    feeCountry: {
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
    }
};

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
        fields: PropTypes.arrayOf(PropTypes.object).isRequired
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
                id: 'newCode',
                sorting: Sorting.NONE
            },
            {
                id: 'feeCountry',
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

    render () {
        let header = null;
        const members = [];

        if (this.state.template) {
            if (this.state.template.table) {
                // add table header
                header = <TableHeader template={this.state.template} />;
            }

            // TODO: fetch members list
            const EXAMPLE = {
                name: {
                    firstName: 'Example',
                    firstNameLegal: 'Example',
                    lastName: 'McExampleface',
                    lastNameLegal: 'McExampleface'
                },
                newCode: 'exampl',
                codeholderType: 'human',
                feeCountry: 'NL',
                age: 35,
                email: 'exam@ple.example'
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
                        position={Position.COLUMN} />}
                </div>
            ));
        } else {
            className += ' flex-layout';
            contents = [
                <div className="item-left" key={0}>
                    {<MemberField
                        field={template.left}
                        value={value[template.left]}
                        position={Position.LEFT} />}
                </div>,
                <div className="item-center" key={1}>
                    <div className="item-name">
                        {template.name.map(f => (
                            <MemberField
                                key={f}
                                field={f}
                                value={value[f]}
                                position={Position.NAME} />
                        ))}
                    </div>
                    {template.center.map(f => (
                        <MemberField
                            key={f}
                            field={f}
                            value={value[f]}
                            position={Position.CENTER} />
                    ))}
                </div>,
                <div className="item-right" key={2}>
                    {<MemberField
                        field={template.right}
                        value={value[template.right]}
                        position={Position.RIGHT} />}
                </div>
            ];
        }

        return <div className={className}>{contents}</div>;
    }
}

class TableHeader extends React.PureComponent {
    static propTypes = {
        template: PropTypes.object.isRequired
    };

    render () {
        return (
            <div className="table-header">
                {this.props.template.columns.map(({ id, width, omitHeader }) => (
                    <div className="table-header-column" key={id} style={{ width }}>
                        {omitHeader ? null : locale.members.fields[id]}
                    </div>
                ))}
            </div>
        );
    }
}
