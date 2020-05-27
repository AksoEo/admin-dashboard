import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { LinearProgress } from '@cpsdqs/yamdl';
import moment from 'moment';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import Page from '../../../../components/page';
import OverviewList from '../../../../components/overview-list';
import CSVExport from '../../../../components/csv-export';
import DisplayError from '../../../../components/error';
import { currencyAmount, date } from '../../../../components/data';
import Meta from '../../../meta';
import { paymentIntents as locale, currencies } from '../../../../locale';
import { coreContext } from '../../../../core/connection';
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
            <div class="payments-balance-report-page">
                <Meta
                    title={locale.report.title}
                    actions={actions} />
                <TimeRangePicker
                    start={rangeStart}
                    end={rangeEnd}
                    onStartChange={rangeStart => this.setState({ rangeStart })}
                    onEndChange={rangeEnd => this.setState({ rangeEnd })} />

                <Totals
                    parameters={this.parameters} />

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

/// State machine for loading data
class LoadMachine {
    constructor (core, params, lock, hasLock) {
        this.core = core;
        this.params = params;
        this.lock = lock;
        this.hasLock = () => hasLock(this.lock);

        this.totals = Object.fromEntries(Object.keys(currencies).map(c => [c, 0]));
    }

    lastLoadedRow = 0;
    totalRows = 0;
    firstLoad = true;

    get progress () {
        return this.lastLoadedRow / this.totalRows;
    }

    get done () {
        return !this.hasLock() || !this.firstLoad && this.lastLoadedRow >= this.totalRows;
    }

    async tick () {
        const params = { ...this.params };
        params.offset = this.lastLoadedRow;
        params.limit = 100;
        const result = await this.core.createTask('payments/listIntents', {}, params).runOnceAndDrop();
        this.totalRows = result.total;
        this.firstLoad = false;
        this.lastLoadedRow += result.items.length;
        if (this.lastLoadedRow < this.totalRows && !result.items.length) {
            throw new Error('internal inconsistency');
        }

        for (const id of result.items) {
            const view = this.core.createDataView('payments/intent', {
                id,
                fields: ['totalAmount', 'amountRefunded', 'currency'],
                noFetch: true,
            });
            const item = await new Promise((r, j) => {
                view.on('update', r);
                view.on('error', j);
            });
            this.totals[item.currency] += item.totalAmount - item.amountRefunded;
        }
    }
}

class Totals extends PureComponent {
    static contextType = coreContext;

    state = {
        totals: null,
        error: null,
        progress: 0,
    };

    loadLock = 0;

    beginLoad () {
        this.loadLock++;

        this.loadMachine = new LoadMachine(
            this.context,
            this.props.parameters,
            this.loadLock,
            lock => this.loadLock === lock,
        );
        this.tickLoad();
        this.setState({ totals: null, error: null, progress: 0 });
    }

    tickLoad () {
        if (this.loadMachine && !this.loadMachine.done) {
            this.loadMachine.tick().then(() => {
                this.setState({ progress: this.loadMachine.progress });
                this.tickLoad();
            }).catch(error => {
                this.setState({ error });
                this.loadLock++;
                this.loadMachine = null;
            });
        } else if (this.loadMachine) {
            // done
            this.setState({ totals: this.loadMachine.totals });
            this.loadMachine = null;
            this.loadLock++;
        }
    }

    componentDidMount () {
        this.beginLoad();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.parameters.jsonFilter !== this.props.parameters.jsonFilter) {
            this.beginLoad();
        }
    }

    componentWillUnmount () {
        this.loadLock = -1;
    }

    render (_, { totals, error, progress }) {
        let contents = null;
        if (error) {
            contents = <DisplayError error={error} />;
        } else if (totals) {
            contents = (
                <ul>
                    {Object.keys(currencies).map(c => (
                        <li key={c}>
                            <currencyAmount.renderer value={totals[c]} currency={c} />
                        </li>
                    ))}
                </ul>
            );
        }

        return (
            <div class="report-totals">
                <div class="totals-title">
                    <span>{locale.report.totals}</span>
                    <LinearProgress progress={progress} />
                </div>
                {contents}
            </div>
        );
    }
}

function TimeRangePicker ({ start, end, onStartChange, onEndChange }) {
    return (
        <div class="report-time-range">
            <div class="range-field">
                <date.editor
                    label={locale.report.startTime}
                    outline
                    value={start}
                    onChange={onStartChange} />
            </div>
            <div class="range-field">
                <date.editor
                    label={locale.report.endTime}
                    outline
                    value={end}
                    onChange={onEndChange} />
            </div>
        </div>
    );
}
