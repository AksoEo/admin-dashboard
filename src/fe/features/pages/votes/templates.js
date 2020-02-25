import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import SortIcon from '@material-ui/icons/Sort';
import TuneIcon from '@material-ui/icons/Tune';
import Page from '../../../components/page';
import SearchFilters from '../../../components/search-filters';
import OverviewList from '../../../components/overview-list';
import FieldPicker from '../../../components/field-picker';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../components/list-url-coding';
import Meta from '../../meta';
import { coreContext } from '../../../core/connection';
import { connectPerms } from '../../../perms';
import { votes as locale, search as searchLocale } from '../../../locale';
import FIELDS from './fields';

const SEARCHABLE_FIELDS = ['name', 'description'];

export default connectPerms(class Votes extends Page {
    state = {
        parameters: {
            search: {
                field: SEARCHABLE_FIELDS[0],
                query: '',
            },
            filters: {},
            jsonFilter: {
                _disabled: true,
                filter: {},
            },
            fields: [
                { id: 'org', sorting: 'none' },
                { id: 'name', sorting: 'none' },
                { id: 'timespan', sorting: 'desc' },
                { id: 'state', sorting: 'none' },
            ],
            offset: 0,
            limit: 10,
        },

        fieldPickerOpen: false,
    };

    static contextType = coreContext;

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

    render ({ perms }, { parameters, fieldPickerOpen }) {
        const actions = [];

        if (perms.hasPerm('votes.create.tejo') || perms.hasPerm('votes.create.uea')) {
            actions.push({
                label: locale.create.menuItem,
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                action: () => this.context.createTask('votes/create'),
            });
        }

        actions.push({
            label: searchLocale.pickFields,
            icon: <SortIcon style={{ verticalAlign: 'middle' }} />,
            action: () => this.setState({ fieldPickerOpen: true }),
        });

        actions.push({
            label: locale.templates.menuItem,
            icon: <TuneIcon style={{ verticalAlign: 'middle' }} />,
            action: () => this.props.push('shablonoj'),
        });

        return (
            <div class="votes-page templates-page">
                <Meta
                    title={locale.templatesTitle}
                    actions={actions} />
                <SearchFilters
                    value={parameters}
                    searchFields={SEARCHABLE_FIELDS}
                    onChange={parameters => this.setState({ parameters })}
                    locale={{
                        searchPlaceholders: locale.search.placeholders,
                        searchFields: locale.fields,
                    }}
                    inputRef={view => this.#searchInput = view} />
                <OverviewList
                    task="votes/listTemplates"
                    view="votes/voteTemplate"
                    updateView={['votes/sigVoteTemplates']}
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/vochdonado/${id}`}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />

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
