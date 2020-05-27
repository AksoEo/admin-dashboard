import { h } from 'preact';
import moment from 'moment';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import Page from '../../../../components/page';
import OverviewList from '../../../../components/overview-list';
import CSVExport from '../../../../components/csv-export';
import { date } from '../../../../components/data';
import Meta from '../../../meta';
import { paymentIntents as locale } from '../../../../locale';
import { FIELDS } from './fields';
import './report.less';

export default class Report extends Page {
    state = {
        rangeStart: moment().subtract(1, 'month').format('YYYY-MM-DD'),
        rangeEnd: moment().format('YYYY-MM-DD'),
        offset: 0,
        limit: 10,
        csvExportOpen: false,

    };

    constructor (props) {
        super(props);

        this.updateParams();
    }

    updateParams () {
        const lowerTimeBound = +new Date(this.state.rangeStart) / 1000;
        const upperTimeBound = +new Date(this.state.rangeEnd) / 1000 + 86400;

        this.parameters = {
            fields: [
                { id: 'statusTime', sorting: 'desc' },
                { id: 'customer', sorting: 'none' },
                { id: 'status', sorting: 'none' },
                { id: 'totalAmount', sorting: 'none' },
                { id: 'amountRefunded', sorting: 'none' },
                { id: 'currency', sorting: 'none' },
            ],
            jsonFilter: {
                filter: {
                    statusTime: {
                        $range: [lowerTimeBound, upperTimeBound],
                    },
                    status: { $nin: ['canceled', 'disputed', 'abandoned'] },
                },
            },
            offset: this.state.offset,
            limit: this.state.limit,
        };
    }

    componentDidUpdate (prevProps, prevState) {
        if (this.state.offset !== prevState.offset
            || this.state.limit !== prevState.limit
            || this.state.rangeStart !== prevState.rangeStart
            || this.state.rangeEnd !== prevState.rangeEnd) {
            this.updateParams();
            this.forceUpdate();
        }
    }

    render (_, { rangeStart, rangeEnd, csvExportOpen }) {
        const actions = [];

        actions.push({
            icon: <SaveAltIcon />,
            action: () => this.setState({ csvExportOpen: true }),
        });

        return (
            <div class="payments-report-page">
                <Meta
                    title={locale.report.title}
                    actions={actions} />
                <TimeRangePicker
                    start={rangeStart}
                    end={rangeEnd}
                    onStartChange={rangeStart => this.setState({ rangeStart })}
                    onEndChange={rangeEnd => this.setState({ rangeEnd })} />

                <OverviewList
                    task="payments/listIntents"
                    view="payments/intent"
                    parameters={this.parameters}
                    fields={FIELDS}
                    onSetOffset={offset => this.setState({ offset })}
                    onSetLimit={limit => this.setState({ limit })}
                    locale={locale.fields} />

                <CSVExport
                    open={csvExportOpen}
                    onClose={() => this.setState({ csvExportOpen: false })}
                    task="payments/listIntents"
                    detailView="payments/intent"
                    detailViewOptions={id => ({
                        id,
                        fields: this.parameters.fields.map(({ id }) => id),
                        lazyFetch: true,
                    })}
                    fields={FIELDS}
                    parameters={this.parameters}
                    filenamePrefix={locale.report.csvFilename}
                    locale={locale} />
            </div>
        );
    }
}

function TimeRangePicker ({ start, end, onStartChange, onEndChange }) {
    return (
        <div class="report-time-range">
            <div class="range-field">
                <date.editor value={start} onChange={onStartChange} />
            </div>
            <div class="range-field">
                <date.editor value={end} onChange={onEndChange} />
            </div>
        </div>
    );
}
