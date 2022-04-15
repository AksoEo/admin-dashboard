import { h } from 'preact';
import { PureComponent, Fragment } from 'preact/compat';
import { LinearProgress } from 'yamdl';
import PaymentIcon from '@material-ui/icons/Payment';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Page from '../../../components/page';
import DisplayError from '../../../components/utils/error';
import { IdUEACode } from '../../../components/data/uea-code';
import Tabs from '../../../components/controls/tabs';
import {
    index as locale,
    paymentIntents as intentLocale,
    intermediaryReports as reportsLocale,
    membershipEntries as registrationLocale,
    codeholderChgReqs as chgReqLocale,
} from '../../../locale';
import { country, currencyAmount } from '../../../components/data';
import { connect, coreContext } from '../../../core/connection';
import { LinkButton } from '../../../router';
import Notices from './notices';
import './index.less';

export default class HomePage extends Page {
    render () {
        return (
            <div class="home-page">
                <HomeTasks />
                <Notices />
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

class HomeTasks extends PureComponent {
    static contextType = coreContext;

    state = {
        loading: false,
        items: null,
        tasks: null,
        error: null,
        tab: Object.keys(locale.tasks.tabs)[0],
    };

    load () {
        this.setState({ loading: true });
        this.context.createTask('tasks/list', {}).runOnceAndDrop().then(tasks => {
            const resPromises = [Promise.resolve(tasks)];
            if (tasks.aksopay) {
                const params = {
                    fields: [
                        { id: 'customer', sorting: 'none' },
                        { id: 'statusTime', sorting: 'asc' },
                        { id: 'status', sorting: 'none' },
                        { id: 'totalAmount', sorting: 'none' },
                        { id: 'amountRefunded', sorting: 'none' },
                        { id: 'currency', sorting: 'none' },
                        { id: 'intermediary', sorting: 'none' },
                    ],
                    offset: 0,
                    limit: 10,
                };
                resPromises.push(this.context.createTask('payments/listIntents', {}, {
                    ...params,
                    jsonFilter: {
                        filter: {
                            intermediaryCountryCode: null,
                            status: { $in: ['disputed', 'submitted'] },
                        },
                    },
                }).runOnceAndDrop().then(data => ({ aksopay: data.items })));

                resPromises.push(this.context.createTask('payments/listIntents', {}, {
                    ...params,
                    jsonFilter: {
                        filter: {
                            $not: { intermediaryCountryCode: null },
                            status: { $in: ['disputed', 'submitted'] },
                        },
                    },
                }).runOnceAndDrop().then(data => ({ intermediary: data.items })));
            }
            if ('registration' in tasks) {
                resPromises.push(this.context.createTask('memberships/listEntries', {}, {
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
                }).runOnceAndDrop().then(data => ({ registration: data.items })));
            }
            if (tasks.codeholderChangeRequests) {
                resPromises.push(this.context.createTask('codeholders/changeRequests', {}, {
                    fields: [
                        { id: 'time', sorting: 'asc' },
                    ],
                    jsonFilter: {
                        filter: {
                            status: 'pending',
                        },
                    },
                    offset: 0,
                    limit: 10,
                }).runOnceAndDrop().then(data => ({ changeRequests: data.items })));
            }
            const res = Promise.all(resPromises);

            res.then(([tasks, ...items]) => {
                const itemsJoined = {};
                for (const i of items) Object.assign(itemsJoined, i);

                this.setState({
                    loading: false,
                    tasks,
                    items: itemsJoined,
                    error: null,
                });
            }).catch(error => {
                this.setState({ loading: false, items: null, error });
            });
        });
    }

    componentDidMount () {
        this.load();
    }

    render (_, { loading, tasks, items, error }) {
        if (items && !Object.keys(items).length) {
            // no tabs visible
            return null;
        }

        let contents = null;
        if (error) {
            contents = <DisplayError error={error} />;
        } else if (items) {
            const renderTabItems = (key, Component) => {
                if (!(key in items)) {
                    // no permission
                    return null;
                }
                const tabItems = [];
                for (const id of (items[key] || [])) {
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
                intermediary: renderTabItems('intermediary', IntermediaryTaskItem),
                registration: renderTabItems('registration', RegistrationTaskItem),
                changeRequests: renderTabItems('changeRequests', ChangeRequestTaskItem),
            };

            const countTaskItems = k => {
                if (!tasks || !tasks[k]) return 0;
                return Object.values(tasks[k]).reduce((a, b) => a + b, 0);
            };

            const tabItemCounts = {
                aksopay: tasks?.aksopay?.submitted + tasks?.aksopay?.disputed,
                intermediary: tasks?.aksopay?.intermediary,
                registration: countTaskItems('registration'),
                changeRequests: countTaskItems('codeholderChangeRequests'),
            };

            contents = (
                <Fragment>
                    <Tabs
                        class="task-tabs"
                        tabs={Object.fromEntries(Object.keys(locale.tasks.tabs).filter(k => k in items).map(k => [k, (
                            <span class="task-tab-label" key={k}>
                                <span class="inner-label">{locale.tasks.tabs[k]}</span>
                                <span class="task-badge" data-n={tabItemCounts[k]}>{tabItemCounts[k]}</span>
                            </span>
                        )]))}
                        value={this.state.tab}
                        onChange={tab => this.setState({ tab })} />
                    {tabs[this.state.tab]}
                </Fragment>
            );
        }

        return (
            <div class="home-card">
                <div class="hc-title">
                    {locale.tasks.title}
                </div>
                <div class="home-tasks">
                    <LinearProgress style={{ width: '100%' }} indeterminate={loading} hideIfNone />
                    {contents}
                </div>
            </div>
        );
    }
}

const PaymentTaskItem = connect(({ id }) => ['payments/intent', {
    id,
    fields: ['customer', 'status', 'totalAmount', 'amountRefunded', 'currency', 'intermediary'],
    lazyFetch: true,
}])(data => ({ data }))(function PaymentTaskItem ({ id, data, intermediary }) {
    if (!data) return null;
    const target = intermediary
        ? `/perantoj/spezfolioj/${id}`
        : `/aksopago/pagoj/${id}`;
    return (
        <LinkButton class="home-task" target={target}>
            <div class="task-icon">
                <PaymentIcon />
            </div>
            <div class="task-details">
                <div class="task-title">
                    {intermediary ? (
                        <span>
                            {intentLocale.fields.intermediaryIdFmt(
                                data.intermediary?.year,
                                data.intermediary?.number,
                            )}
                            {' '}
                            {intentLocale.fields.intermediaryIdCountryInfix}
                            {' '}
                            <country.renderer value={data.intermediary?.country} />
                        </span>
                    ) : (
                        data.customer.name
                    )}
                    {': '}
                    <currencyAmount.renderer value={data.totalAmount - data.amountRefunded} currency={data.currency} />
                </div>
                <span class="task-badge">
                    {intermediary ? (
                        reportsLocale.intentStatuses[data.status]
                    ) : (
                        intentLocale.fields.statuses[data.status]
                    )}
                </span>
            </div>
            <div class="task-alt-icon">
                <ChevronRightIcon />
            </div>
        </LinkButton>
    );
});

const IntermediaryTaskItem = (props) => <PaymentTaskItem {...props} intermediary />;

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

const ChangeRequestTaskItem = connect(({ id }) => ['codeholders/changeRequest', {
    id,
    lazyFetch: true,
}])(data => ({ data }))(function ChangeRequestTaskItem ({ id, data }) {
    if (!data) return null;

    return (
        <LinkButton class="home-task" target={`/shanghopetoj/${id}`}>
            <div class="task-details">
                <div class="task-title">
                    <IdUEACode id={data.codeholderId} />
                </div>
                <span class="task-badge">
                    {chgReqLocale.fields.statuses[data.status]}
                </span>
            </div>
            <div class="task-alt-icon">
                <ChevronRightIcon />
            </div>
        </LinkButton>
    );
});
