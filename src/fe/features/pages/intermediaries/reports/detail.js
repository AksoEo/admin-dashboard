import { h } from 'preact';
import { Fragment, useState } from 'preact/compat';
import { Button } from 'yamdl';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import DetailPage from '../../../../components/detail/detail-page';
import DetailShell from '../../../../components/detail/detail-shell';
import { country, currencyAmount } from '../../../../components/data';
import DiffAuthor from '../../../../components/diff-author';
import { intermediaryReports as locale } from '../../../../locale';
import MdField from '../../../../components/controls/md-field';
import TinyProgress from '../../../../components/controls/tiny-progress';
import DisplayError from '../../../../components/utils/error';
import { FIELDS as ENTRY_FIELDS } from '../../memberships/entries/fields';
import { connect, coreContext } from '../../../../core/connection';
import './detail.less';

export default class IntermediaryReport extends DetailPage {
    locale = locale;

    get id () {
        return this.props.match[1];
    }

    createCommitTask (changedFields, edit) {
        return this.context.createTask('payments/updateIntent', {
            id: this.id,
            _changedFields: changedFields,
        }, edit);
    }

    renderActions () {
        return [];
    }

    renderContents ({ editing }, { edit }) {
        return (
            <Fragment>
                <DetailShell
                    view="payments/intent"
                    options={{
                        fields: [
                            'id',
                            'org',
                            'paymentOrg',
                            'currency',
                            'intermediary',
                            'purposes',
                            'status',
                            'timeCreated',
                            'statusTime',
                            'totalAmount',
                            'createdBy',
                        ],
                    }}
                    id={this.id}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    onDelete={this.onDelete}>
                    {data => (
                        <ReportDetail item={data} />
                    )}
                </DetailShell>
            </Fragment>
        );
    }
}

function ReportDetail ({ item }) {
    return (
        <div class="intermediary-report-detail">
            <div class="report-title">
                {locale.idFmt(item.intermediary?.year, item.intermediary?.number)}
                {' '}
                {locale.idCountryInfix}
                {' '}
                <country.renderer value={item.intermediary?.country} />
            </div>
            <div class="report-subtitle">
                {locale.createdBy}
                {' '}
                <DiffAuthor author={item.createdBy} interactive />
            </div>
            <div class="report-status">
                {locale.intentStatuses[item.status]}
            </div>
            <div class="report-actions">
                {item.status === 'submitted' ? (
                    <coreContext.Consumer>
                        {core => (
                            <Button onClick={() => core.createTask('payments/markIntentSucceeded', {
                                id: item.id,
                            })}>
                                {locale.markSucceeded}
                            </Button>
                        )}
                    </coreContext.Consumer>
                ) : null}
            </div>
            <ReportEntries item={item} />
            <ReportAddons item={item} />
            <ReportExpenses item={item} />
            <div class="report-final-total">
                <Totals
                    isFinal
                    items={[]}
                    currency={item.currency}
                    total={item.totalAmount} />
            </div>
        </div>
    );
}

function ReportEntries ({ item }) {
    if (!item.purposes) return <TinyProgress />;
    const entries = item.purposes.filter(purpose => purpose.type === 'trigger'
        && purpose.triggers === 'registration_entry');
    if (!entries.length) return null;

    return (
        <div class="report-entries">
            <div class="section-title">{locale.entries.title}</div>
            {entries.map((entry, i) => (
                <ReportEntry key={i} entry={entry} />
            ))}
        </div>
    );
}

function ReportEntry ({ entry }) {
    return (
        <div class="report-entry">
            <ReportEntryData id={entry.dataId} />
        </div>
    );
}

const ReportEntryData = connect(({ id }) => [
    'memberships/entry', {
        id,
        fields: ['year', 'status', 'offers', 'codeholderData', 'issue'],
    },
])((data, _, error, loaded) => ({ data, error, loaded }))(function ReportEntryData ({
    data,
    loaded,
    error,
}) {
    const [collapsed, setCollapsed] = useState(true);

    if (error) {
        return <div class="report-entry-data is-error"><DisplayError error={error} /></div>;
    }

    if (!loaded) {
        return <div class="report-entry-data is-loading"><TinyProgress /></div>;
    }

    let contents;
    if (!collapsed) {
        contents = (
            <div class="entry-expanded">
                <ENTRY_FIELDS.offers.component value={data.offers} item={data} />
            </div>
        );
    } else {
        contents = (
            null
        );
    }
    return (
        <div class="report-entry-data">
            <div class="entry-header">
                <div class="entry-header-info">
                    <ENTRY_FIELDS.codeholderData.component value={data.codeholderData} item={data} />
                    <div class="header-info-status">
                        <ENTRY_FIELDS.status.component value={data.status} item={data} />
                    </div>
                    <div class="header-info-issue">
                        <ENTRY_FIELDS.issue.component value={data.issue} item={data} />
                    </div>
                </div>
                <Button icon small onClick={() => setCollapsed(!collapsed)}>
                    {!collapsed ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Button>
            </div>
            {contents}
        </div>
    );
});

function ReportAddons ({ item }) {
    if (!item.purposes) return null;
    const addons = item.purposes.filter(purpose => purpose.type === 'addon');
    if (!addons.length) return null;

    return (
        <div class="report-addons">
            <div class="section-title">{locale.addons.title}</div>
            {addons.map((addon, i) => (
                <div class="entry-addon" key={i}>
                    <div class="addon-name">
                        {addon.invalid && <ErrorOutlineIcon className="addon-invalid" />}
                        {addon.paymentAddon?.name || '???'}
                    </div>
                    <div class="addon-amount">
                        <currencyAmount.renderer value={addon.amount} currency={item.currency} />
                    </div>
                </div>
            ))}
        </div>
    );
}

function ReportExpenses ({ item }) {
    if (!item.purposes) return null;
    const expenses = item.purposes.filter(purpose => purpose.type === 'manual');
    if (!expenses.length) return null;

    return (
        <div class="report-expenses">
            <div class="section-title">{locale.expenses.title}</div>
            {expenses.map((expense, i) => (
                <div class="entry-expense" key={i}>
                    <div class="expense-header">
                        <div class="expense-title">
                            {expense.invalid && <div class="expense-invalid"><ErrorOutlineIcon /></div>}
                            {expense.title}
                        </div>
                        <currencyAmount.renderer value={expense.amount} currency={item.currency} />
                    </div>
                    <div class="expense-description">
                        <MdField
                            value={expense.description}
                            rules={['emphasis', 'strikethrough', 'link', 'list', 'table']} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function Totals ({ items, total, currency, showCounts, isFinal }) {
    return (
        <div class="intermediary-report-totals">
            {items.map((item, i) => (
                <div class="totals-item" key={i}>
                    {showCounts && (
                        <div class="item-count">
                            {item.count || 1}
                        </div>
                    )}
                    <div class="item-title">
                        {item.title}
                    </div>
                    <div class="item-price">
                        <currencyAmount.renderer value={item.amount} currency={currency} />
                    </div>
                </div>
            ))}
            <hr />
            <div class="totals-item">
                <div class={'item-title' + (isFinal ? ' is-final' : '')}>
                    {isFinal ? locale.totals.final : locale.totals.sum}
                </div>
                <div class="item-price">
                    <currencyAmount.renderer value={total} currency={currency} />
                </div>
            </div>
        </div>
    );
}
