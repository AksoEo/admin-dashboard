import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import Page from '../../../components/page';
import SearchFilters from '../../../components/search-filters';
import OverviewList from '../../../components/overview-list';
import Meta from '../../meta';
import { lists as locale } from '../../../locale';
import { coreContext } from '../../../core/connection';
import { connectPerms } from '../../../perms';

export const FIELDS = {
    name: {
        component ({ value }) {
            return value;
        },
    },
    description: {
        component ({ value }) {
            return value;
        },
    },
};

export default connectPerms(class Lists extends Page {
    state = {
        parameters: {
            search: {
                field: 'name',
                query: '',
            },
            fields: [
                { id: 'name', sorting: 'none', fixed: true },
                { id: 'description', sorting: 'none', fixed: true },
            ],
            offset: 0,
            limit: 10,
        },
    };

    static contextType = coreContext;

    render ({ perms }, { parameters }) {
        const actions = [];
        if (perms.hasPerm('lists.create') && perms.hasPerm('codeholders.read')) {
            actions.push({
                icon: <AddIcon />,
                label: locale.add,
                action: () => this.context.createTask('lists/create'),
            });
        }

        return (
            <div class="lists-page">
                <Meta
                    title={locale.title}
                    actions={actions} />
                <SearchFilters
                    value={parameters}
                    searchFields={[
                        'name',
                        'description',
                    ]}
                    onChange={parameters => this.setState({ parameters })}
                    locale={{
                        searchPlaceholders: locale.search.placeholders,
                        searchFields: locale.fields,
                    }} />
                <OverviewList
                    task="lists/list"
                    view="lists/list"
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/listoj/${id}`}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />
            </div>
        );
    }
});
