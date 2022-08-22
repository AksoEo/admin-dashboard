import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import OverviewList from '../../../../components/lists/overview-list';
import { countryLists as locale } from '../../../../locale';
import { FIELDS } from './fields';
import OverviewPage from '../../../../components/overview/overview-page';

export default class CountryListsPage extends OverviewPage {
    state = {
        parameters: {
            fields: [
                { id: 'name', sorting: 'asc', fixed: true },
            ],
            offset: 0,
            limit: 10,
        },
    };

    locale = locale;
    filters = {};

    renderActions ({ perms }) {
        const actions = [];

        if (perms.hasPerm('countries.lists.update')) {
            actions.push({
                label: locale.create.menuItem,
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                action: () => this.context.createTask('countryLists/createList', {}, {
                    list: {},
                }),
            });
        }

        return actions;
    }

    renderContents (_, { parameters }) {
        return (
            <OverviewList
                task="countryLists/list"
                view="countryLists/list"
                updateView={['countryLists/sigLists']}
                parameters={parameters}
                fields={FIELDS}
                onGetItemLink={id => `/administrado/landaj-asocioj/${id}`}
                onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                locale={locale.fields} />
        );
    }
}
