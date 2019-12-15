import { h } from 'preact';
import { Dialog } from '@cpsdqs/yamdl';
import AddIcon from '@material-ui/icons/Add';
import SortIcon from '@material-ui/icons/Sort';
import SaveIcon from '@material-ui/icons/Save';
import ContactMailIcon from '@material-ui/icons/ContactMail';
import SearchFilters from '../../../components/search-filters';
import OverviewList from '../../../components/overview-list';
import FieldPicker from '../../../components/field-picker';
import ObjectViewer from '../../../components/object-viewer';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../components/list-url-coding';
import Page from '../../../components/page';
import { codeholders as locale, search as searchLocale } from '../../../locale';
import { connect, coreContext } from '../../../core/connection';
import { connectPerms } from '../../../perms';
import CSVExport from '../../../components/csv-export';
import Meta from '../../meta';
import FILTERS from './filters';
import FIELDS from './table-fields';
import AddrLabelGen from './addr-label-gen';
import './style';

const SEARCHABLE_FIELDS = [
    'nameOrCode',
    'email',
    'landlinePhone',
    'cellphone',
    'officePhone',
    'searchAddress',
    'notes',
];

const connectToEverything = a => connect('codeholders/fields')(fields => ({
    fields,
}))(connect('codeholders/filters')(filters => ({
    filters,
}))(connectPerms(a)));

/// The codeholders list page.
///
/// # Props
/// - query/onQueryChange: url query handling
/// - addrLabelGen: label gen state (see navigation)
export default connectToEverything(class CodeholdersPage extends Page {
    state = {
        options: {
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
                {
                    id: 'type',
                    sorting: 'none',
                    fixed: true,
                },
                {
                    id: 'code',
                    sorting: 'asc',
                },
                {
                    id: 'name',
                    sorting: 'none',
                },
                {
                    id: 'age',
                    sorting: 'none',
                },
                {
                    id: 'membership',
                    sorting: 'none',
                },
                {
                    id: 'country',
                    sorting: 'none',
                },
            ],
            offset: 0,
            limit: 10,
        },

        // whether the filters list is expanded
        expanded: false,
        fieldPickerOpen: false,
        csvExportOpen: false,
        globalFilterOpen: false,

        // for the addr label gen
        currentResultIsCursed: false,
    };

    static contextType = coreContext;

    #searchInput;

    // current url query state
    #currentQuery = '';

    decodeURLQuery () {
        this.setState({
            options: applyDecoded(decodeURLQuery(this.props.query, FILTERS), this.state.options),
        });
        this.#currentQuery = this.props.query;
    }

    encodeURLQuery () {
        const encoded = encodeURLQuery(this.state.options, FILTERS);
        if (encoded === this.#currentQuery) return;
        this.#currentQuery = encoded;
        this.props.onQueryChange(encoded);
    }

    componentDidMount () {
        const originalQuery = this.props.query;
        this.decodeURLQuery();

        if (!originalQuery) {
            // FIXME: extremely hacky: wait for state update
            setTimeout(() => {
                // fresh load; we can add default filters
                if (this.state.options.filters.enabled) {
                    this.setState({
                        options: {
                            ...this.state.options,
                            filters: {
                                ...this.state.options.filters,
                                enabled: {
                                    ...this.state.options.filters.enabled,
                                    enabled: true,
                                },
                            },
                        },
                    });
                }
            }, 10);
        }

        this.#searchInput.focus(500);
    }

    componentDidUpdate (prevProps, prevState) {
        if (prevProps.query !== this.props.query && this.props.query !== this.#currentQuery) {
            this.decodeURLQuery();
        }
        if (prevState.options !== this.state.options) {
            this.encodeURLQuery();
        }
    }

    render ({ addrLabelGen, perms, fields: availableFields, filters: availableFilters }) {
        const canCreate = perms.hasPerm('codeholders.create');

        availableFields = availableFields || Object.keys(FIELDS);
        availableFilters = availableFilters || Object.keys(FILTERS);

        const hasGlobalFilter = perms.perms
            ? !!Object.keys(perms.perms.memberFilter).length
            : false;

        let globalFilterNotice = null;
        if (hasGlobalFilter) {
            globalFilterNotice = (
                <span class="global-filter-notice">
                    {locale.globalFilterNotice[0]}
                    <a href="#" onClick={e => {
                        e.preventDefault();
                        this.setState({ globalFilterOpen: true });
                    }}>
                        {locale.globalFilterNotice[1]}
                    </a>
                    {locale.globalFilterNotice[2]}
                </span>
            );
        }

        // overflow menu
        const menu = [];

        if (canCreate) {
            menu.push({
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.create,
                action: () => this.context.createTask('codeholders/create'), // task view
            });
        }

        menu.push({
            icon: <SortIcon style={{ verticalAlign: 'middle' }} />,
            label: searchLocale.pickFields,
            action: () => this.setState({ fieldPickerOpen: true }),
        });

        if (!this.state.expanded) {
            menu.push({
                icon: <SaveIcon style={{ verticalAlign: 'middle' }} />,
                label: searchLocale.csvExport,
                action: () => this.setState({ csvExportOpen: true }),
                overflow: true,
            });
            if (!addrLabelGen) {
                menu.push({
                    icon: <ContactMailIcon style={{ verticalAlign: 'middle' }} />,
                    label: locale.addrLabelGen.menuItem,
                    action: () => this.props.onNavigate(`/membroj/etikedoj?${this.props.query}`),
                    overflow: true,
                });
            }
        }
        menu.push({
            label: searchLocale.resetFilters,
            action: () => this.setState({
                options: {
                    ...this.state.options,
                    filters: {},
                    jsonFilter: { _disabled: true },
                },
            }),
            overflow: true,
        });

        const filteredFilters = { ...FILTERS };
        for (const k in filteredFilters) {
            if (!availableFilters.includes(k)) delete filteredFilters[k];
        }

        const { options, expanded } = this.state;

        return (
            <div class="codeholders-page" ref={node => this.node = node}>
                <Meta title={locale.title} actions={menu} />
                <SearchFilters
                    value={options}
                    onChange={options => {
                        this.setState({
                            options: {
                                ...options,
                                fields: options.fields.filter(({ id }) => !FIELDS[id].hide),
                            },
                        });
                    }}
                    searchFields={SEARCHABLE_FIELDS}
                    fields={availableFields}
                    filters={filteredFilters}
                    expanded={expanded}
                    onExpandedChange={expanded => this.setState({ expanded })}
                    locale={{
                        searchFields: locale.search.fields,
                        searchPlaceholders: locale.search.placeholders,
                        filters: locale.search.filters,
                    }}
                    category="codeholders"
                    filtersToAPI="codeholders/filtersToAPI"
                    inputRef={view => this.#searchInput = view} />
                <FieldPicker
                    open={this.state.fieldPickerOpen}
                    onClose={() => this.setState({ fieldPickerOpen: false })}
                    // TODO: use core views
                    available={availableFields.filter(x => FIELDS[x] && !FIELDS[x].hide)}
                    sortables={Object.keys(FIELDS).filter(x => FIELDS[x].sortable)}
                    selected={options.fields}
                    onChange={fields => this.setState({ options: { ...options, fields } })}
                    locale={locale.fields} />
                <OverviewList
                    notice={globalFilterNotice}
                    task="codeholders/list"
                    view="codeholders/codeholder"
                    parameters={options}
                    expanded={expanded}
                    fields={FIELDS}
                    onGetItemLink={id => `/membroj/${id}`}
                    onSetOffset={offset => this.setState({ options: { ...options, offset }})}
                    onSetLimit={limit => this.setState({ options: { ...options, limit }})}
                    onResult={result => this.setState({ currentResultIsCursed: result.cursed })}
                    locale={locale.fields} />
                <CSVExport
                    open={this.state.csvExportOpen}
                    onClose={() => this.setState({ csvExportOpen: false })}
                    task="codeholders/list"
                    parameters={options}
                    fields={FIELDS}
                    detailView="codeholders/codeholder"
                    detailViewOptions={id => ({ id, noFetch: true })}
                    locale={{
                        fields: Object.assign({}, locale.fields, locale.csvFields),
                    }}
                    filenamePrefix={locale.csvFilename}
                    userOptions={{
                        countryLocale: {
                            name: locale.csvOptions.countryLocale,
                            type: 'select',
                            options: Object.entries(locale.csvOptions.countryLocales),
                            default: 'eo',
                        },
                    }} />
                <AddrLabelGen
                    open={addrLabelGen}
                    lvIsCursed={this.state.currentResultIsCursed}
                    options={this.state.options}
                    onClose={() => addrLabelGen.pop()} />

                <GlobalFilterViewer
                    open={this.state.globalFilterOpen}
                    onClose={() => this.setState({ globalFilterOpen: false })}
                    filter={perms.perms ? perms.perms.memberFilter : null} />
            </div>
        );
    }
});

function GlobalFilterViewer ({ open, onClose, filter }) {
    return (
        <Dialog
            class="codeholders-global-filter-viewer"
            backdrop
            open={open}
            onClose={onClose}
            title={locale.globalFilterTitle}
            fullScreen={width => width < 600}>
            <ObjectViewer value={filter} />
        </Dialog>
    );
}
