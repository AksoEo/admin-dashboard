import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import moment from 'moment';
import { CircularProgress } from '@cpsdqs/yamdl';
import PrintIcon from '@material-ui/icons/Print';
import Page from '../../../../components/page';
import Select from '../../../../components/select';
import DisplayError from '../../../../components/error';
import TinyProgress from '../../../../components/tiny-progress';
import { currencyAmount, date } from '../../../../components/data';
import Meta from '../../../meta';
import { paymentIntents as locale, currencies } from '../../../../locale';
import { Link } from '../../../../router';
import { coreContext } from '../../../../core/connection';
import './report.less';

export default class Report extends Page {
    state = {
        rangeStart: moment().subtract(1, 'month').format('YYYY-MM-DD'),
        rangeEnd: moment().format('YYYY-MM-DD'),
        loading: false,
        data: null,
        error: null,
        currency: Object.keys(currencies)[0],
        useFilter: false,
    };

    static contextType = coreContext;

    constructor (props) {
        super(props);
    }

    loadLock = 0;

    load () {
        const lock = ++this.loadLock;

        this.setState({ loading: true, error: null, data: null });

        const lowerTimeBound = +new Date(this.state.rangeStart) / 1000;
        const upperTimeBound = +new Date(this.state.rangeEnd) / 1000 + 86400;

        this.context.createTask('payments/report', {}, {
            time: [lowerTimeBound, upperTimeBound],
            currency: this.state.currency,
        }).runOnceAndDrop().then(data => {
            if (this.loadLock !== lock) return;
            this.setState({ loading: false, error: null, data });
        }).catch(error => {
            if (this.loadLock !== lock) return;
            this.setState({ loading: false, error, data: null });
        });
    }

    componentDidMount () {
        this.load();
    }

    componentDidUpdate (prevProps, prevState) {
        if (this.state.rangeStart !== prevState.rangeStart
            || this.state.rangeEnd !== prevState.rangeEnd
            || this.state.currency !== prevState.currency) {
            this.load();
        }
    }

    render (_, { rangeStart, rangeEnd, currency, loading, data, error }) {
        const actions = [];

        actions.push({
            icon: <PrintIcon />,
            action: () => alert('todo'),
        });

        let contents = null;

        if (loading) {
            contents = (
                <div class="report-loading">
                    <CircularProgress indeterminate />
                </div>
            );
        } else if (error) {
            contents = <DisplayError error={error} />;
        } else if (data) {
            contents = <ReportRender data={data} currency={currency} />;
        }

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

                <div class="report-total-currency">
                    <Select
                        value={currency}
                        onChange={currency => this.setState({ currency })}
                        outline
                        items={Object.keys(currencies).map(c => ({
                            value: c,
                            label: currencies[c],
                        }))} />
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

/// This function must be pure because we're also using it to render the printed version
function ReportRender ({ data, currency }) {
    const rows = [];

    const currencyKeys = Object.keys(data.totals.currency);

    for (const org in data.totals.paymentMethod) {
        for (const method in data.totals.paymentMethod[org]) {
            const cells = [];

            cells.push(
                <th key="id">
                    <MethodName org={org} method={method} />
                </th>
            );

            const methodTotals = data.totals.paymentMethod[org][method].totals;
            for (const c of currencyKeys) {
                cells.push(
                    <td key={c}>
                        <ReportCell
                            value={methodTotals[c]}
                            currency={c} />
                    </td>
                );
            }

            rows.push(<tr key={`${org}-${method}`}>{cells}</tr>);
        }
    }

    const sumTotals = data.totals.currency;
    const sumCells = [
        <th key="id">{locale.report.totalHeader}</th>,
    ];
    for (const c of currencyKeys) {
        sumCells.push(
            <td key={c}>
                <ReportCell
                    value={sumTotals[c]}
                    currency={c} />
            </td>
        );
    }
    rows.push(<tr class="currency-totals" key="total">{sumCells}</tr>);

    return (
        <div class="payments-report">
            <div class="report-section">
                <div class="section-title">{locale.report.total}</div>
                <div class="section-contents">
                    <div class="report-total-total">
                        <currencyAmount.renderer
                            value={data.converted.total}
                            currency={currency} />
                    </div>
                    <div class="report-total-sub">
                        <div class="report-total-earned">
                            <currencyAmount.renderer
                                value={data.converted.earned}
                                currency={currency} />
                            {' '}
                            {locale.report.totalEarned}
                        </div>
                        <div class="report-total-refunded">
                            <currencyAmount.renderer
                                value={data.converted.refunded}
                                currency={currency} />
                            {' '}
                            {locale.report.totalRefunded}
                        </div>
                    </div>
                </div>
            </div>
            <div class="report-section">
                <div class="section-title">{locale.report.byMethodAndCurrency}</div>
                <div class="section-contents">
                    <table class="currency-table">
                        <thead>
                            <tr>
                                <th key="method">{locale.report.methodHeader}</th>
                                {currencyKeys.map(c => (
                                    <th key={c}>
                                        {currencies[c]}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ReportCell ({ value, currency }) {
    if (!value) return null;
    const c = currency;
    return (
        <div class="totals-set">
            <currencyAmount.renderer value={value.total} currency={c} />
            <div class="totals-sub">
                <span class="totals-subfield">
                    {locale.report.totals.earned} <currencyAmount.renderer value={value.earned} currency={c} />
                </span>
                <span class="totals-subfield">
                    {locale.report.totals.refunded} <currencyAmount.renderer value={value.refunded} currency={c} />
                </span>
            </div>
            <div class="totals-sub">
                <span class="totals-subfield">
                    {locale.report.totals.count(value.count)}
                </span>
                <span class="totals-subfield">
                    {locale.report.totals.refunds(value.refunds)}
                </span>
            </div>
        </div>
    );
}

let batchLoadCore = null;
const batchLoadOrgs = new Map();
function batchFlushOrg (org) {
    if (!batchLoadOrgs.has(org)) return;
    const methods = [...batchLoadOrgs.get(org)];
    batchLoadOrgs.delete(org);

    batchLoadCore.createTask('payments/listMethods', { org }, {
        offset: 0,
        limit: methods.size,
        jsonFilter: { filter: { id: { $in: methods.map(x => x.method) } } },
        _skipMapHack: true,
    }).runOnceAndDrop().then(res => {
        const namesById = {};
        for (const item of res.items) namesById[item.id] = item.name;
        for (const { method, listener } of methods) {
            listener(null, namesById[method]);
        }
    }).catch(err => {
        for (const { listener } of methods) listener(err);
    });
}
function batchLoadMethodName (org, method) {
    let schedule = false;
    if (batchLoadOrgs.has(org)) {
        if (batchLoadOrgs.get(org).size > 50) batchFlushOrg(org);
        batchLoadOrgs.set(org, new Set());
        schedule = true;
    } else {
        batchLoadOrgs.set(org, new Set());
        schedule = true;
    }

    return new Promise((resolve, reject) => {
        batchLoadOrgs.get(org).add({
            method,
            listener: (error, data) => {
                if (error) reject(error);
                else resolve(data);
            },
        });
        if (schedule) setTimeout(() => batchFlushOrg(org), 100);
    });
}

class MethodName extends PureComponent {
    state = {
        name: null,
        error: null,
    };

    static contextType = coreContext;

    loadLock = 0;
    load () {
        const lock = ++this.loadLock;
        this.setState({ name: null });

        batchLoadCore = this.context;
        batchLoadMethodName(this.props.org, this.props.method).then(name => {
            if (this.loadLock !== lock) return;
            this.setState({ name, error: null });
        }).catch(error => {
            if (this.loadLock !== lock) return;
            this.setState({ name: null, error });
        });
    }

    componentDidMount () {
        this.load();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.org !== this.props.org || prevProps.method !== this.props.method) {
            this.load();
        }
    }

    render ({ org, method }, { name, error }) {
        let contents = null;
        if (error) contents = '?';
        else if (!name) contents = <TinyProgress />;
        else contents = name;

        return (
            <Link class="method-id" target={`/aksopago/organizoj/${org}/metodoj/${method}`}>
                {contents}
            </Link>
        );
    }
}
