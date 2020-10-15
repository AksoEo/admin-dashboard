import { h } from 'preact';
import Meta from '../../../../meta';
import Page from '../../../../../components/page';
import Spreadsheet from '../../../../../components/spreadsheet';
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
    };

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
        const { congress, instance } = this;
        this.context.createTask('congresses/listParticipants', { congress, instance }, {
            offset: this.state.rows.length,
            limit: 100,
            fields: this.state.fields.map(id => ({ id, sorting: 'none' })),
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

    columnName = i => {
        const field = this.state.fields[i];
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
                // TODO: better rendering
                view = ({ data }) => '' + data.data[dataField];
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

    render (_, { fields, rows, total }) {
        const { congress, instance } = this;

        return (
            <div class="congress-participants-spreadsheet-page">
                <Meta title={locale.spreadsheet.title} />
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
                    loadedRowCount={rows.length}
                    initialColumnSize={this.initialColumnSize}
                    cellView={this.cellView}
                    columnName={this.columnName} />
            </div>
        );
    }
}
