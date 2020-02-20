import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import Page from '../../../../components/page';
import SearchFilters from '../../../../components/search-filters';
import OverviewList from '../../../../components/overview-list';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../../components/list-url-coding';
import Meta from '../../../meta';
import { countryGroups as locale } from '../../../../locale';
import { coreContext } from '../../../../core/connection';
import { FIELDS } from './fields';
import './style';

export default class CountryGroupsPage extends Page {
    static contextType = coreContext;

    state = {
        parameters: {
            search: {
                field: 'name',
                query: '',
            },
            fields: [
                { id: 'code', sorting: 'none', fixed: true },
                { id: 'name', sorting: 'none', fixed: true },
            ],
            offset: 0,
            limit: 10,
        },
    };

    #searchInput;
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

        this.#searchInput.focus(500);
    }

    componentDidUpdate (prevProps, prevState) {
        if (prevProps.query !== this.props.query && this.props.query !== this.#currentQuery) {
            this.decodeURLQuery();
        }
        if (prevState.parameters !== this.state.parameters) {
            this.encodeURLQuery();
        }
    }

    render (_, { parameters }) {
        const actions = [];

        actions.push({
            icon: <AddIcon />,
            label: locale.create.menuItem,
            action: () => this.context.createTask('countries/createGroup'),
        });

        return (
            <div class="country-groups-page">
                <Meta
                    title={locale.title}
                    actions={actions} />
                <SearchFilters
                    value={parameters}
                    onChange={parameters => this.setState({ parameters })}
                    locale={{
                        searchPlaceholders: locale.search.placeholders,
                    }}
                    inputRef={view => this.#searchInput = view} />
                <OverviewList
                    task="countries/listGroups"
                    view="countries/group"
                    updateView={['countries/sigCountryGroups']}
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/administrado/landaroj/${id}`}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />
            </div>
        );
    }
}
