import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import SortIcon from '@material-ui/icons/Sort';
import Page from '../../../../components/page';
import SearchFilters from '../../../../components/search-filters';
import OverviewList from '../../../../components/overview-list';
import FieldPicker from '../../../../components/field-picker';
import Meta from '../../../meta';
import { coreContext } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';
import { paymentIntents as locale, search as searchLocale } from '../../../../locale';
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
                { id: 'statusTime', sorting: 'desc' },
                { id: 'customer', sorting: 'none' },
                { id: 'status', sorting: 'none' },
                { id: 'totalAmount', sorting: 'none' },
            ],
            offset: 0,
            limit: 10,
        },
        expanded: false,
        fieldPickerOpen: false,
    };

    static contextType = coreContext;

    render ({ perms }, { parameters, expanded, fieldPickerOpen }) {
        const actions = [];

        if (perms.hasPerm('pay.payment_intents.create.tejo')
            || perms.hasPerm('pay.payment_intents.create.uea')) {
            actions.push({
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.create.menuItem,
                action: () => this.context.createTask('payments/createIntent'),
            });
        }

        actions.push({
            label: searchLocale.pickFields,
            icon: <SortIcon style={{ verticalAlign: 'middle' }} />,
            action: () => this.setState({ fieldPickerOpen: true }),
        });

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

                <FieldPicker
                    available={Object.keys(FIELDS)}
                    sortables={Object.keys(FIELDS).filter(x => FIELDS[x].sortable)}
                    selected={parameters.fields}
                    onChange={fields => this.setState({ parameters: { ...parameters, fields }})}
                    open={fieldPickerOpen}
                    onClose={() => this.setState({ fieldPickerOpen: false })}
                    locale={locale.fields} />
            </div>
        );
    }
});
