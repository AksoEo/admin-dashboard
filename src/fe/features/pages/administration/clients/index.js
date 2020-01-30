import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import Page from '../../../../components/page';
import SearchFilters from '../../../../components/search-filters';
import OverviewList from '../../../../components/overview-list';
import { email } from '../../../../components/data';
import Meta from '../../../meta';
import { clients as locale } from '../../../../locale';
import { coreContext } from '../../../../core/connection';
import { connectContextualActions } from '../../../../context-action';
import { apiKey } from '../../../../components/data';

export const FIELDS = {
    name: {
        component ({ value }) {
            return value;
        },
    },
    apiKey: {
        component ({ value }) {
            return <apiKey.inlineRenderer value={value} />;
        },
    },
    ownerName: {
        component ({ value }) {
            return value;
        },
    },
    ownerEmail: {
        component ({ value }) {
            return <email.inlineRenderer value={value} />;
        },
    },
};

export default connectContextualActions(class Clients extends Page {
    state = {
        parameters: {
            search: {
                field: 'name',
                query: '',
            },
            fields: [
                { id: 'name', sorting: 'none', fixed: true },
                { id: 'apiKey', sorting: 'none', fixed: true },
                { id: 'ownerName', sorting: 'none', fixed: true },
                { id: 'ownerEmail', sorting: 'none', fixed: true },
            ],
            offset: 0,
            limit: 10,
        },
    };

    static contextType = coreContext;

    render ({ contextualAction }, { parameters }) {
        const actions = [];
        actions.push({
            icon: <AddIcon />,
            label: locale.add,
            action: () => this.context.createTask('clients/create'),
        });

        let selection = null;
        if (contextualAction && contextualAction.action === 'select-clients') {
            selection = contextualAction.selected;
        }

        return (
            <div class="clients-page">
                <Meta
                    title={locale.title}
                    actions={actions} />
                <SearchFilters
                    value={parameters}
                    searchFields={[
                        'name',
                        'apiKey',
                        'ownerName',
                        'ownerEmail',
                    ]}
                    onChange={parameters => this.setState({ parameters })}
                    locale={{
                        searchPlaceholders: locale.search.placeholders,
                        searchFields: locale.fields,
                    }} />
                <OverviewList
                    task="clients/list"
                    view="clients/client"
                    parameters={parameters}
                    selection={selection}
                    fields={FIELDS}
                    onGetItemLink={id => `/administrado/klientoj/${id}`}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />
            </div>
        );
    }
});
