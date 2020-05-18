import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import Page from '../../../../components/page';
import SearchFilters from '../../../../components/search-filters';
import OverviewList from '../../../../components/overview-list';
import Meta from '../../../meta';
import { coreContext } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';
import { paymentIntents as locale } from '../../../../locale';
import { FIELDS } from './fields';

const SEARCHABLE_FIELDS = ['customerEmail', 'customerName', 'internalNotes', 'customerNotes'];

export default connectPerms(class Intents extends Page {
    state = {
        parameters: {
            search: {
                field: SEARCHABLE_FIELDS[0],
                query: '',
            },
            fields: [
                { id: 'customer', sorting: 'none' },
                { id: 'statusTime', sorting: 'desc' },
            ],
            offset: 0,
            limit: 10,
        },
        expanded: false,
    };

    static contextType = coreContext;

    render ({ perms }, { parameters, expanded }) {
        const actions = [];

        if (perms.hasPerm('pay.payment_intents.create.tejo')
            || perms.hasPerm('pay.payment_intents.create.uea')) {
            actions.push({
                icon: <AddIcon />,
                label: locale.create.menuItem,
                action: () => this.context.createTask('payments/createIntent'),
            });
        }

        return (
            <div class="payment-orgs-page">
                <Meta
                    title={locale.title}
                    actions={actions} />
                <SearchFilters
                    value={parameters}
                    onChange={parameters => this.setState({ parameters })}
                    expanded={expanded}
                    onExpandedChange={expanded => this.setState({ expanded })}
                    searchFields={SEARCHABLE_FIELDS}
                    locale={{
                        searchPlaceholders: locale.search.placeholders,
                        searchFields: locale.search.fields,
                    }} />
                <OverviewList
                    expanded={expanded}
                    task="payments/listIntents"
                    view="payments/intent"
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/aksopago/pagoj/${id}`}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields}
                    updateView={['payments/sigIntents']} />
            </div>
        );
    }
});
