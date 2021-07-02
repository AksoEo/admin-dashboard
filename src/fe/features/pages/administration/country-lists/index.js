import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import Page from '../../../../components/page';
import OverviewList from '../../../../components/overview-list';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../../components/list-url-coding';
import Meta from '../../../meta';
import { countryLists as locale } from '../../../../locale';
import { FIELDS } from './fields';
import { coreContext } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';

export default connectPerms(class CountryListsPage extends Page {
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

    static contextType = coreContext;

    #currentQuery = '';

    decodeURLQuery () {
        this.setState({
            parameters: applyDecoded(decodeURLQuery(this.props.query, {}), this.state.parameters),
        });
        this.#currentQuery = this.props.query;
    }

    encodeURLQuery () {
        const encoded = encodeURLQuery(this.state.parameters, {});
        if (encoded === this.#currentQuery) return;
        this.#currentQuery = encoded;
        this.props.onQueryChange(encoded);
    }

    componentDidMount () {
        this.decodeURLQuery();
    }

    componentDidUpdate (prevProps, prevState) {
        if (prevProps.query !== this.props.query && this.props.query !== this.#currentQuery) {
            this.decodeURLQuery();
        }
        if (prevState.parameters !== this.state.parameters) {
            this.encodeURLQuery();
        }
    }

    render ({ perms }, { parameters }) {
        const actions = [];

        if (perms.hasPerm('countries.lists.create')) {
            actions.push({
                label: locale.create.menuItem,
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                action: () => this.context.createTask('countryLists/createList', {}, {
                    list: {},
                }),
            });
        }

        return (
            <div class="country-lists-page">
                <Meta
                    title={locale.title}
                    actions={actions} />
                <OverviewList
                    task="countryLists/list"
                    view="countryLists/list"
                    updateView={['countryLists/sigLists']}
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/administrado/landaj-organizoj/${id}`}
                    onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />
            </div>
        );
    }
});
