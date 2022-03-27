import { h } from 'preact';
import { Fragment, useState, useEffect, PureComponent } from 'preact/compat';
import { Button } from 'yamdl';
import EditIcon from '@material-ui/icons/Edit';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import DetailPage from '../../../../components/detail/detail-page';
import DetailShell from '../../../../components/detail/detail-shell';
import { country, currencyAmount } from '../../../../components/data';
import DiffAuthor from '../../../../components/diff-author';
import MembershipChip from '../../../../components/membership-chip';
import { intermediaryReports as locale, membershipEntries as entriesLocale } from '../../../../locale';
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
        return [
            {
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
                action: this.onBeginEdit,
            },
        ];
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
                            'method',
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

class ReportEntries extends PureComponent {
    entryData = {};

    setEntryData (key, value) {
        this.entryData[key] = value;
        this.forceUpdate();
    }

    render ({ item }) {
        if (!item.purposes) return <TinyProgress />;
        const entries = item.purposes.filter(purpose => purpose.type === 'trigger'
            && purpose.triggers === 'registration_entry');
        if (!entries.length) return null;

        const { entryData } = this;

        let totalAmount = 0;
        const memberships = {};
        const magazines = {};
        for (const k in entryData) {
            const entry = entryData[k];
            for (const offer of (entry?.offers?.selected || [])) {
                if (offer.type === 'membership') {
                    const key = `${entry.year}-${offer.id}`;
                    if (!memberships[key]) memberships[key] = [];
                    memberships[key].push(offer);
                } else if (offer.type === 'magazine') {
                    const key = `${entry.year}-${offer.id}`;
                    if (!magazines[key]) magazines[key] = [];
                    magazines[key].push(offer);
                }
                totalAmount += offer.amount;
            }
        }

        const entryPrices = (item.method?.prices || {})[item.intermediary.year]?.registrationEntries || {};
        const categoryPrices = {};
        const magazinePrices = {};
        for (const category of (entryPrices.membershipCategories || [])) {
            categoryPrices[category.id] = category;
        }
        for (const magazine of (entryPrices.magazines || [])) {
            magazinePrices[magazine.id] = magazine;
        }

        const items = [];
        for (const k in memberships) {
            const offers = memberships[k];
            items.push({
                title: <CategoryName id={offers[0].id} abbrev />,
                count: offers.length,
                amount: offers.map(offer => offer.amount).reduce((a, b) => a + b, 0),
                commission: categoryPrices[offers[0].id]?.commission,
            });
        }
        for (const k in magazines) {
            const offers = magazines[k];
            const accessTypes = {};
            for (const item of offers) {
                const accessType = item.paperVersion ? 'paper' : 'access';
                if (!accessTypes[accessType]) accessTypes[accessType] = [];
                accessTypes[accessType].push(item);
            }
            for (const type in accessTypes) {
                const offers = accessTypes[type];
                items.push({
                    title: <MagazineName id={offers[0].id} />,
                    count: offers.length,
                    amount: offers.map(offer => offer.amount).reduce((a, b) => a + b, 0),
                    commission: (magazinePrices[offers[0].id]?.prices || {})[type]?.commission,
                });
            }
        }
        if (Object.keys(entryData).length < entries.length) {
            items.push({
                title: <TinyProgress />,
                count: ' ',
            });
        }

        return (
            <div class="report-entries">
                <div class="section-title">{locale.entries.title}</div>
                {entries.map((entry, i) => (
                    <ReportEntry
                        key={i}
                        entry={entry}
                        onData={data => {
                            this.setEntryData(entry.dataId, data);
                        }} />
                ))}
                <Totals
                    showCounts
                    showCommission
                    items={items}
                    currency={item.currency}
                    total={totalAmount} />
            </div>
        );
    }
}

function ReportEntry ({ entry, onData }) {
    return (
        <div class="report-entry">
            <ReportEntryData id={entry.dataId} onData={onData} />
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
    onData,
}) {
    const [collapsed, setCollapsed] = useState(true);

    if (error) {
        return <div class="report-entry-data is-error"><DisplayError error={error} /></div>;
    }

    if (!loaded) {
        return <div class="report-entry-data is-loading"><TinyProgress /></div>;
    }

    useEffect(() => {
        onData(data);
    }, [data]);

    let contents;
    if (!collapsed) {
        contents = (
            <div class="entry-expanded">
                <ENTRY_FIELDS.offers.component value={data.offers} item={data} />
            </div>
        );
    } else {
        contents = (
            <div class="entry-collapsed">
                {data.offers.selected.map((offer, i) => (
                    <EntrySelectedOffer key={i} offer={offer} />
                ))}
            </div>
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

export function EntrySelectedOffer ({ offer }) {
    let contents;
    if (offer.type === 'membership') {
        contents = <EntrySelectedMembership id={offer.id} />;
    } else if (offer.type === 'magazine') {
        contents = <EntrySelectedMagazine id={offer.id} paperVersion={offer.paperVersion} />;
    }
    return (
        <span class="intermediary-report-entry-selected-offer">
            {contents}
        </span>
    );
}

export const CategoryName = connect(({ id }) => [
    'memberships/category', { id },
])()(function CategoryName ({ name, nameAbbrev, abbrev }) {
    if (!name) return <TinyProgress />;
    return abbrev ? nameAbbrev : name;
});

export const MagazineName = connect(({ id }) => [
    'magazines/magazine', { id },
])()(function MagazineName ({ name }) {
    if (!name) return <TinyProgress />;
    return name;
});


export const EntrySelectedMembership = connect(({ id }) => ['memberships/category', { id }])(data => ({
    data,
}))(function EntrySelectedMembership ({ data }) {
    if (!data) return <TinyProgress />;
    return (
        <MembershipChip
            abbrev={data.nameAbbrev}
            name={data.name}
            givesMembership={data.givesMembership}
            lifetime={data.lifetime} />
    );
});

export const EntrySelectedMagazine = connect(({ id }) => ['magazines/magazine', { id }])(data => ({
    data,
}))(function EntrySelectedMagazine ({ data, paperVersion }) {
    if (!data) return <TinyProgress />;
    return (
        <span class="intermediary-report-entry-selected-magazine">
            {data.name}
            <span class="version-tag">
                {entriesLocale.offers.paperVersionLabels[(paperVersion || false).toString()]}
            </span>
        </span>
    );
});

export function Totals ({ items, total, currency, showCounts, showCommission, isFinal }) {
    return (
        <div class="intermediary-report-totals">
            {items.map((item, i) => (
                <div class="totals-item" key={i}>
                    {showCommission && (
                        <div class="item-commission">
                            {item.commission && (
                                <span>
                                    {Math.round(item.commission)} %
                                </span>
                            )}
                        </div>
                    )}
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
