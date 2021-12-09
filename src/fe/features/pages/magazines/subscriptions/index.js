import { h } from 'preact';
import { Fragment } from 'preact/compat';
import OverviewPage from '../../../../components/overview/overview-page';
import OverviewList from '../../../../components/lists/overview-list';
import { FIELDS } from './fields';
import { magazineSubs as locale } from '../../../../locale';
import AddIcon from '@material-ui/icons/Add';
import DetailShell from '../../../../components/detail/detail-shell';

export default class SubscriptionsPage extends OverviewPage {
    state = {
        parameters: {
            search: {
                field: 'internalNotes',
                query: '',
            },
            fields: [
                { id: 'createdTime', sorting: 'desc', fixed: true },
                { id: 'codeholderId', sorting: 'none', fixed: true },
                { id: 'year', sorting: 'desc', fixed: true },
            ],
            offset: 0,
            limit: 10,
        },
        org: null,
    };

    locale = locale;
    filters = {};
    searchFields = ['internalNotes'];

    get magazine () {
        return +this.props.matches.magazine[1];
    }

    renderActions ({ perms }) {
        const actions = [];

        if (perms.hasPerm(`magazines.subscriptions.create.${this.org}`) && perms.hasPerm('codeholders.read')) {
            actions.push({
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.create.menuItem,
                action: () => this.context.createTask('magazines/createSubscription', {
                    magazine: this.magazine,
                }),
            });
        }

        return actions;
    }

    renderContents (_, { parameters }) {
        return (
            <Fragment>
                <OverviewList
                    task="magazines/listSubscriptions"
                    view="magazines/subscription"
                    updateView={['magazines/sigSubscriptions', { magazine: this.magazine }]}
                    useDeepCmp
                    options={{ magazine: this.magazine }}
                    viewOptions={{ magazine: this.magazine }}
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/revuoj/${this.magazine}/simplaj-abonoj/${id}`}
                    onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />

                <DetailShell
                    view="magazines/magazine"
                    id={this.magazine}
                    fields={{}} locale={{}}
                    onData={data => data && this.setState({ org: data.org })} />
            </Fragment>
        );
    }
}
