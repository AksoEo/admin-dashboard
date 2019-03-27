import React from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';

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
        posHint: PosHint.NAME,
        yHint: 0
    },
    newCode: {
        weight: 2,
        posHint: PosHint.NAME,
        yHint: 0
    },
    codeholderType: {
        weight: 1,
        posHint: PosHint.LEFT,
        yHint: 0,
        fixedColWidth: 56
    }
};

/** The width of a single “weight” unit in pixels in the table layout. */
const WEIGHT_UNIT = 64;

/** The minimum weight scale--the inverse of the max. allowed squishing of table columns. */
const MIN_WEIGHT_SCALE = 0.6;

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
                .map(field => FIELDS[field].weight * WEIGHT_UNIT)
                .reduce((a, b) => a + b, 0);

            const fixedColWidth = fields
                .map(field => FIELDS[field].fixedColWidth)
                .filter(x => x)
                .reduce((a, b) => a + b, 0);

            const weightScale = (width - fixedColWidth) / flexWidth;

            if (fixedColWidth < width && weightScale > MIN_WEIGHT_SCALE) {
                const columns = fields.map(field => ({
                    id: field,
                    width: FIELDS[field].fixedColWidth
                        ? FIELDS[field].fixedColWidth
                        : weightScale * FIELDS[field].weight * WEIGHT_UNIT
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
        const members = [];

        if (this.state.template) {
            // TODO: fetch members list
            const EXAMPLE = {
                name: 'Example McExampleface',
                newCode: 'exampl',
                codeholderType: 'human'
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
                    {value[id]}
                </div>
            ));
        } else {
            className += ' flex-layout';
            contents = [
                <div className="item-left" key={0}>
                    {value[template.left]}
                </div>,
                <div className="item-center" key={1}>
                    <div className="item-name">
                        {template.name.map(f => value[f]).join(', ')}
                    </div>
                    {template.center.map(f => value[f]).join('<br/>')}
                </div>,
                <div className="item-right" key={2}>
                    {value[template.right]}
                </div>
            ];
        }

        return <div className={className}>{contents}</div>;
    }
}
