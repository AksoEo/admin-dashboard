import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import OverviewList from '../../../../components/lists/overview-list';
import OverviewPage from '../../../../components/overview/overview-page';
import { paymentIntents as intentsLocale, intermediaryReports as locale } from '../../../../locale';
import { FIELDS } from '../../payments/intents/fields';
import { FILTERS } from '../../payments/intents/filters';

export default class IntermediaryReports extends OverviewPage {
    state = {
        parameters: {
            fields: [
                { id: 'org', sorting: 'none', fixed: true },
                { id: 'intermediary', sorting: 'none', fixed: true },
                { id: 'status', sorting: 'none', fixed: true },
                { id: 'statusTime', sorting: 'desc', fixed: true },
            ],
            filters: {
                status: {
                    enabled: true,
                    value: ['pending', 'submitted', 'disputed', 'succeeded', 'refunded'],
                },
            },
            offset: 0,
            limit: 10,
        },
        expanded: true,
    };

    filters = {
        status: FILTERS.status,
    };
    locale = {
        ...locale,
        filters: intentsLocale.filters,
    };

    renderActions ({ perms }) {
        const actions = [];

        if (perms.hasPerm('pay.read.uea') || perms.hasPerm('pay.read.tejo')) {
            actions.push({
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.create.menuItem,
                action: () => this.props.push('krei'),
            });
        }

        return actions;
    }

    renderContents (_, { parameters }) {
        return (
            <OverviewList
                task="payments/listIntermediaryIntents"
                view="payments/intent"
                updateView={['payments/sigIntents']}
                parameters={parameters}
                fields={FIELDS}
                onGetItemLink={id => `/perantoj/spezfolioj/${id}`}
                onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                locale={intentsLocale.fields} />
        );
    }
}
