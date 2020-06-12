import { h, render } from 'preact';
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
import reportPrintStyles from './report-print.noextract.css';

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

    print = () => {
        const printWindow = window.open('', 'paymentBalanceReportPopout');
        if (!printWindow) {
            this.context.createTask('info', {
                message: locale.report.failedToOpenPrintWindow,
            });
            return;
        }
        render(
            <coreContext.Provider value={this.context}>
                <PrintAction window={printWindow} />
                <ReportRender
                    data={this.state.data}
                    currency={this.state.currency}
                    print />
                <style>{reportPrintStyles}</style>
            </coreContext.Provider>,
            printWindow.document.body,
        );
    };

    render (_, { rangeStart, rangeEnd, currency, loading, data, error }) {
        const actions = [];

        if (!error && data) {
            actions.push({
                icon: <PrintIcon />,
                action: this.print,
            });
        }

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

class PrintAction extends PureComponent {
    componentDidMount () {
        this.props.window.print();
    }

    render ({ window }) {
        return (
            <div class="print-action-container">
                <button onClick={() => window.print()}>{locale.report.print}</button>
            </div>
        );
    }
}

/// This function should be pure because we're also using it to render the printed version
function ReportRender ({ data, currency, print }) {
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
                    <CurrencyTable totals={data.totals} print={print} />
                </div>
            </div>
        </div>
    );
}

function CurrencyTable ({ totals, print }) {
    const currencyKeys = Object.keys(totals.currency);

    const table = {};
    const tableIndex1 = {};
    const tableIndex2 = {};

    for (const c of currencyKeys) tableIndex2[c] = currencies[c];

    {
        const k = 'sum';
        const sumTotals = totals.currency;
        table[k] = {};
        tableIndex1[k] = locale.report.totalHeader;
        for (const c of currencyKeys) {
            table[k][c] = sumTotals[c];
        }
    }

    for (const org in totals.paymentMethod) {
        for (const method in totals.paymentMethod[org]) {
            const k = `${org}-${method}`;

            table[k] = {};
            if (print) {
                tableIndex1[k] = <MethodName
                    org={org}
                    method={method}
                    useCache />;
            } else {
                tableIndex1[k] = <MethodName org={org} method={method} />;
            }

            const methodTotals = totals.paymentMethod[org][method].totals;

            for (const c of currencyKeys) {
                table[k][c] = methodTotals[c];
            }
        }
    }

    if (print) {
        return (
            <div class="currency-table-unrolled">
                {Object.keys(tableIndex1).map(i => (
                    <div class="unrolled-method" key={i}>
                        <div class="unrolled-title">{tableIndex1[i]}</div>
                        <table class="unrolled-contents">
                            <tbody>
                                {Object.keys(tableIndex2).map(j => (
                                    <tr key={j}>
                                        <th>{tableIndex2[j]}</th>
                                        <td>
                                            <ReportCell value={table[i][j]} currency={j} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <table class="currency-table">
            <thead>
                <tr>
                    <th key="method">{locale.report.methodHeader}</th>
                    {Object.entries(tableIndex1).map(([i, j]) => <th key={i}>{j}</th>)}
                </tr>
            </thead>
            <tbody>
                {Object.keys(tableIndex2).map(i => (
                    <tr key={i}>
                        <th>{tableIndex2[i]}</th>
                        {Object.keys(tableIndex1).map(j => (
                            <td key={j}>
                                <ReportCell value={table[j][i]} currency={i} />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
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

// used to instantly determine names in printing dialog
const globalMethodNameCache = {};

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

            globalMethodNameCache[`${this.props.org}-${this.props.method}`] = name;
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

    render ({ org, method, useCache }, { name, error }) {
        if (useCache) name = globalMethodNameCache[`${org}-${method}`];

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
