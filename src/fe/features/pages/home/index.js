import { h, Component } from 'preact';
import { LinearProgress } from '@cpsdqs/yamdl';
import PaymentIcon from '@material-ui/icons/Payment';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Page from '../../../components/page';
import DisplayError from '../../../components/error';
import { index as locale, paymentIntents as intentLocale } from '../../../locale';
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
    };

    load () {
        this.setState({ loading: true });
        const task = this.context.createTask('payments/listIntents', {}, {
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
        });

        task.runOnceAndDrop().then(res => {
            this.setState({ loading: false, items: res.items, error: null });
        }).catch(error => {
            this.setState({ loading: false, data: null, error });
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
            contents = [];
            for (const id of items) {
                contents.push(<HomeTmpTaskItem key={id} id={id} />);
            }

            if (!contents.length) contents.push(
                <div class="tasks-empty">
                    {locale.tasks.empty}
                </div>
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

const HomeTmpTaskItem = connect(({ id }) => ['payments/intent', {
    id,
    fields: ['customer', 'status', 'totalAmount', 'amountRefunded', 'currency'],
    lazyFetch: true,
}])(data => ({ data }))(function HomeTmpTaskItem ({ id, data }) {
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
