import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import OverviewPage from '../../../../components/overview/overview-page';
import OverviewList from '../../../../components/lists/overview-list';
import { orgLists as locale } from '../../../../locale';
import { FIELDS } from './fields';
import { connectPerms } from '../../../../perms';

export default connectPerms(class OrgListsPage extends OverviewPage {
    state = {
        parameters: {
            search: {},
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

        if (perms.hasPerm('org_lists.update')) {
            actions.push({
                label: locale.create.menuItem,
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                action: () => this.context.createTask('orgLists/createList', {}, {
                    list: {},
                }),
            });
        }

        return actions;
    }

    renderContents (_, { parameters }) {
        return (
            <OverviewList
                task="orgLists/list"
                view="orgLists/list"
                updateView={['orgLists/sigLists']}
                parameters={parameters}
                fields={FIELDS}
                onGetItemLink={id => `/administrado/fakaj-asocioj/${id}`}
                onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                locale={locale.fields} />
        );
    }
});
