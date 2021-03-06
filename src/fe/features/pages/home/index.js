import { h, Component } from 'preact';
import { Fragment } from 'preact/compat';
import { LinearProgress } from '@cpsdqs/yamdl';
import PaymentIcon from '@material-ui/icons/Payment';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Page from '../../../components/page';
import DisplayError from '../../../components/error';
import { IdUEACode } from '../../../components/data/uea-code';
import Tabs from '../../../components/tabs';
import { index as locale, paymentIntents as intentLocale, membershipEntries as registrationLocale } from '../../../locale';
import { currencyAmount } from '../../../components/data';
import { connect, coreContext } from '../../../core/connection';
import { LinkButton } from '../../../router';
import './index.less';

export default class HomePage extends Page {
    render () {
        return (
            <div class="home-page">
                <div class="home-card">
                    <div class="hc-title">
                        {locale.tasks.title}
                    </div>
                    <HomeTmpTasks />
                </div>
                <div class="home-card">
                    <div class="hc-title">
                        {locale.admin.title}
                    </div>
                    <div style={{ padding: '16px' }}>
                        {locale.admin.description}
                    </div>
                </div>
            </div>
        );
    }
}

class HomeTmpTasks extends Component {
    static contextType = coreContext;

    state = {
        loading: false,
        items: null,
        error: null,
        tab: Object.keys(locale.tasks.tabs)[0],
    };

    load () {
        this.setState({ loading: true });
        const res = Promise.all([
            this.context.createTask('payments/listIntents', {}, {
                fields: [
                    { id: 'customer', sorting: 'none' },
                    { id: 'statusTime', sorting: 'asc' },
                    { id: 'status', sorting: 'none' },
                    { id: 'totalAmount', sorting: 'none' },
                    { id: 'amountRefunded', sorting: 'none' },
                    { id: 'currency', sorting: 'none' },
                ],
                jsonFilter: {
                    filter: {
                        status: { $in: ['disputed', 'submitted'] },
                    },
                },
                offset: 0,
                limit: 10,
            }).runOnceAndDrop(),
            this.context.createTask('memberships/listEntries', {}, {
                fields: [
                    { id: 'codeholderData', sorting: 'none' },
                    { id: 'year', sorting: 'none' },
                    { id: 'timeSubmitted', sorting: 'asc' },
                    { id: 'status', sorting: 'none' },
                ],
                jsonFilter: {
                    filter: {
                        status: 'pending',
                    },
                },
                offset: 0,
                limit: 10,
            }).runOnceAndDrop(),
        ]);

        res.then(([pay, reg]) => {
            this.setState({
                loading: false,
                items: { aksopay: pay.items, registration: reg.items },
                error: null,
            });
        }).catch(error => {
            this.setState({ loading: false, items: null, error });
        });
    }

    componentDidMount () {
        this.load();
    }

    render (_, { loading, items, error }) {
        let contents = null;
        if (error) {
            contents = <DisplayError error={error} />;
        } else if (items) {
            const renderTabItems = (key, Component) => {
                const tabItems = [];
                for (const id of items[key]) {
                    tabItems.push(<Component key={id} id={id} />);
                }
                if (!tabItems.length) tabItems.push(
                    <div class="tasks-empty">
                        {locale.tasks.empty}
                    </div>
                );
                return tabItems;
            };

            const tabs = {
                aksopay: renderTabItems('aksopay', PaymentTaskItem),
                registration: renderTabItems('registration', RegistrationTaskItem),
            };

            contents = (
                <Fragment>
                    <Tabs
                        class="task-tabs"
                        tabs={Object.fromEntries(Object.keys(locale.tasks.tabs).map(k => [k, (
                            <span class="task-tab-label" key={k}>
                                <span class="inner-label">{locale.tasks.tabs[k]}</span>
                                <span class="task-badge" data-n={tabs[k].length}>{tabs[k].length}</span>
                            </span>
                        )]))}
                        value={this.state.tab}
                        onChange={tab => this.setState({ tab })} />
                    {tabs[this.state.tab]}
                </Fragment>
            );
        }

        return (
            <div class="home-tasks">
                <LinearProgress style={{ width: '100%' }} indeterminate={loading} hideIfNone />
                {contents}
            </div>
        );
    }
}

const PaymentTaskItem = connect(({ id }) => ['payments/intent', {
    id,
    fields: ['customer', 'status', 'totalAmount', 'amountRefunded', 'currency'],
    lazyFetch: true,
}])(data => ({ data }))(function PaymentTaskItem ({ id, data }) {
    if (!data) return null;
    return (
        <LinkButton class="home-task" target={`/aksopago/pagoj/${id}`}>
            <div class="task-icon">
                <PaymentIcon />
            </div>
            <div class="task-details">
                <div class="task-title">
                    {data.customer.name}
                    {': '}
                    <currencyAmount.renderer value={data.totalAmount - data.amountRefunded} currency={data.currency} />
                </div>
                <span class="task-badge">
                    {intentLocale.fields.statuses[data.status]}
                </span>
            </div>
            <div class="task-alt-icon">
                <ChevronRightIcon />
            </div>
        </LinkButton>
    );
});

const RegistrationTaskItem = connect(({ id }) => ['memberships/entry', {
    id,
    fields: ['timeSubmitted', 'codeholderData', 'year', 'status'],
    lazyFetch: true,
}])(data => ({ data }))(function RegistrationTaskItem ({ id, data }) {
    if (!data) return null;

    let codeholderName;
    if (typeof data.codeholderData !== 'object') {
        codeholderName = <IdUEACode id={data.codeholderData} />;
    } else {
        const name = data.codeholderData.name;
        codeholderName = [
            name.honorific,
            name.first || name.firstLegal,
            name.last || name.lastLegal,
        ].filter(x => x).join(' ');
    }

    return (
        <LinkButton class="home-task" target={`/membreco/alighoj/${id}`}>
            <div class="task-details">
                <div class="task-title">
                    <span class="task-title-item">{data.year}</span> {codeholderName}
                </div>
                <span class="task-badge">
                    {registrationLocale.fields.statusTypes[data.status.status]}
                </span>
            </div>
            <div class="task-alt-icon">
                <ChevronRightIcon />
            </div>
        </LinkButton>
    );
});
