import { h } from 'preact';
import SaveIcon from '@material-ui/icons/SaveAlt';
import Meta from '../../../../meta';
import Page from '../../../../../components/page';
import CSVExport from '../../../../../components/csv-export';
import Spreadsheet from '../../../../../components/spreadsheet';
import { currencyAmount, date, timestamp } from '../../../../../components/data';
import { coreContext } from '../../../../../core/connection';
import { congressParticipants as locale } from '../../../../../locale';
import { FIELDS } from './fields';
import './spreadsheet-view.less';

export default class SpreadsheetView extends Page {
    static contextType = coreContext;

    state = {
        fields: [],
        viewFields: [],
        rows: [],
        total: 1, // pretend we have at least 1 item to show a loading animation

        // for field rendering
        currency: null,
        registrationForm: [],

        exportOpen: false,
    };

    getListOptions () {
        return {
            congress: this.congress,
            instance: this.instance,
        };
    }
    getListParameters () {
        return {
            fields: this.state.fields.map(id => ({ id, sorting: 'none' })),
        };
    }

    loadFields () {
        const { congress, instance } = this;
        this.context.createTask('congresses/registrationForm', { congress, instance }).runOnceAndDrop().then(res => {
            const viewFields = Object.keys(FIELDS);
            const fields = Object.keys(FIELDS).filter(id => id !== 'data');
            for (const item of res.form) {
                if (item.el === 'input') {
                    fields.push('data.' + item.name);
                }
            }

            this.setState({
                fields,
                viewFields,
                currency: res.price && res.price.currency,
                registrationForm: res.form,
            }, () => this.load());
        }).catch(err => {
            console.error(err); // eslint-disable-line no-console
            // TODO: handle error somehow
        });
    }

    load () {
        this.context.createTask('congresses/listParticipants', this.getListOptions(), {
            ...this.getListParameters(),
            offset: this.state.rows.length,
            limit: 100,
        }).runOnceAndDrop().then(res => {
            if (!res.items.length) return;
            this.setState({
                rows: this.state.rows.concat(res.items),
                total: res.total,
            }, () => this.load());
        }).catch(err => {
            console.error(err); // eslint-disable-line no-console
            // TODO: handle error somehow
        });
    }

    componentDidMount () {
        this.loadFields();
    }

    get congress () {
        return +this.props.matches[this.props.matches.length - 5][1];
    }
    get instance () {
        return +this.props.matches[this.props.matches.length - 3][1];
    }

    columnNameForField = field => {
        if (field.startsWith('data.')) {
            const dataField = field.substr(5);
            return '@' + dataField;
        }
        return locale.fields[field];
    };

    cellViewsByField = {};
    getCellViewForField (field) {
        if (!this.cellViewsByField[field]) {
            let view;
            if (field.startsWith('data.')) {
                const dataField = field.substr(5);

                let renderData;
                for (const item of this.state.registrationForm) {
                    if (item.el === 'input' && item.name === dataField) {
                        renderData = DATA_RENDERERS[item.type];
                        if (renderData) renderData = renderData(item);
                    }
                }

                // TODO: better rendering
                view = ({ data }) => renderData ? renderData(data.data[dataField]) : '' + data.data[dataField];
            } else {
                const Component = FIELDS[field].component;
                view = ({ data }) => {
                    const { congress, instance } = this;
                    const { currency, registrationForm } = this.state;

                    return <Component
                        slot="table"
                        item={data}
                        value={data[field]}
                        userData={{ congress, instance, currency, registrationForm }} />;
                };
            }
            this.cellViewsByField[field] = view;
        }
        return this.cellViewsByField[field];
    }

    cellView = i => this.getCellViewForField(this.state.fields[i]);

    initialColumnSize = i => {
        const field = this.state.fields[i];
        if (FIELDS[field]) {
            return (FIELDS[field].weight || 1) * 100;
        }
        return 100;
    };

    getFieldStringifier = field => {
        if (field.startsWith('data.')) {
            const dataField = field.substr(5);

            let stringifyData;
            for (const item of this.state.registrationForm) {
                if (item.el === 'input' && item.name === dataField) {
                    stringifyData = DATA_STRINGIFIERS[item.type];
                    if (stringifyData) stringifyData = stringifyData(item);
                }
            }

            // TODO: better rendering
            return (_, item) => stringifyData ? stringifyData(item.data[dataField]) : '' + item.data[dataField];
        } else {
            const stringify = FIELDS[field].stringify;
            if (!stringify) throw new Error('no stringifier for ' + field);
            return stringify;
        }
    };

    render (_, { fields, rows, total }) {
        const { congress, instance } = this;

        const actions = [];
        actions.push({
            icon: <SaveIcon style={{ verticalAlign: 'middle' }} />,
            action: () => {
                this.setState({ exportOpen: true });
            },
        });

        return (
            <div class="congress-participants-spreadsheet-page">
                <Meta
                    title={locale.spreadsheet.title}
                    actions={actions} />
                <Spreadsheet
                    columnCount={fields.length}
                    rowCount={total}
                    rowData={row => ['congresses/participant', {
                        congress,
                        instance,
                        id: rows[row],
                        fields: this.state.viewFields,
                        noFetch: true,
                    }]}
                    onCellClick={(row, col, data, e) => {
                        const target = `/kongresoj/${congress}/okazigoj/${instance}/alighintoj/${data.dataId}`;

                        if (!e.ctrlKey && !e.metaKey) {
                            const a = document.createElement('a');
                            a.href = target;
                            a.target = '_blank';
                            a.click();
                        } else {
                            this.props.onNavigate(target);
                        }
                    }}
                    loadedRowCount={rows.length}
                    initialColumnSize={this.initialColumnSize}
                    cellView={this.cellView}
                    columnName={i => this.columnNameForField(this.state.fields[i])} />

                <CSVExport
                    open={this.state.exportOpen}
                    onClose={() => this.setState({ exportOpen: false })}
                    task="congresses/listParticipants"
                    options={this.getListOptions()}
                    extraOptions={{
                        currency: this.state.currency,
                    }}
                    parameters={this.getListParameters()}
                    detailView="congresses/participant"
                    detailViewOptions={id => ({
                        congress,
                        instance,
                        id,
                        fields: this.state.viewFields,
                        noFetch: true,
                    })}
                    compileFields={() => fields}
                    localizeFieldName={this.columnNameForField}
                    getFieldStringifier={this.getFieldStringifier}
                    filenamePrefix={locale.csvFilename} />
            </div>
        );
    }
}

const DATA_STRINGIFIERS = {
    boolean: () => value => locale.spreadsheet.bool['' + value],
    money: item => value => currencyAmount.stringify(value, item.currency),
    date: () => value => date.stringify(value),
    datetime: item => value => timestamp.stringify(value, item.tz),
    boolean_table: () => value => {
        return value
            .map(r => r.map(i => locale.spreadsheet.bool['' + i]).join(','))
            .join(';');
    },
};

const DATA_RENDERERS = {
    boolean: DATA_STRINGIFIERS.boolean,
    money: item => value => {
        return <currencyAmount.renderer value={value} currency={item.currency} />;
    },
    enum: item => value => {
        let label = '?';
        for (const option of item.options) {
            if (option.value === value) {
                label = option.name;
                break;
            }
        }

        return (
            <span class="enum-value">
                {label}
                {' '}
                (<code>{value}</code>)
            </span>
        );
    },
    date: () => value => {
        return <date.renderer value={value} />;
    },
    datetime: item => value => {
        return <timestamp.renderer value={value} zone={item.tz} />;
    },
    boolean_table: DATA_STRINGIFIERS.boolean_table,
};
