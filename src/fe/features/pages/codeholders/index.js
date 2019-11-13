import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import PropTypes from 'prop-types';
import { UEACode, util } from '@tejo/akso-client';
import JSON5 from 'json5';
import AddIcon from '@material-ui/icons/Add';
import { AppBarProxy, Spring } from '@cpsdqs/yamdl';
import { routerContext } from '../../../router';
import SearchFilters from '../../../components/search-filters';
import OverviewList from '../../../components/overview-list';
import FieldPicker from '../../../components/field-picker';
import Page from '../../../components/page';
import { coreContext } from '../../../core/connection';
import { codeholders as locale } from '../../../locale';
import FILTERS from './filters';
import FIELDS from './table-fields';
import detailFields from './detail-fields';
import AddMemberDialog from './add-member';
import AddrLabelGen from './addr-label-gen';
import './style';

function ListView () {
    return 'todo: remove this behemoth';
}
const Sorting = {};
const Title = () => 'title';

// TODO: use core api properly

const SEARCHABLE_FIELDS = [
    'nameOrCode',
    'email',
    'landlinePhone',
    'cellphone',
    'officePhone',
    'searchAddress',
    'notes',
];

/// The codeholders list page.
///
/// # Props
/// - query/onQueryChange: url query handling
export default class CodeholdersPage extends Page {
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

        /// If true, the add member dialog is open.
        addMemberOpen: false,
        /// If true, the address label generator dialog is open.
        addrLabelGenOpen: false,
        /// Derived from list view state.
        lvJSONFilterEnabled: false,
        lvSubmitted: false,
    };

    /// Used to animate the scroll position when the page changes.
    scrollSpring = new Spring(1, 0.4);

    constructor (props) {
        super(props);

        this.scrollSpring.on('update', value => this.node.scrollTop = value);
    }

    scrollToTop = () => {
        if (this.node.scrollTop > 0) {
            this.scrollSpring.value = this.node.scrollTop;
            this.scrollSpring.start();
        }
    };

    componentDidMount () {
        // TODO: url query handling
    }

    componentDidUpdate () {
        // TODO: url query handling
    }

    componentWillUnmount () {
        this.scrollSpring.stop();
    }

    render () {
        // overflow menu
        const menu = [];

        menu.push({
            label: '[[pick fields]]',
            action: () => this.setState({ fieldPickerOpen: true }),
            overflow: true,
        });

        // TODO
        /*
        menu.push({
            label: this.state.lvJSONFilterEnabled
                ? locale.listView.json.disable
                : locale.listView.json.enable,
            action: () => this.listView.setJSONFilterEnabled(!this.state.lvJSONFilterEnabled),
            overflow: true,
        });
        */
        if (this.state.lvSubmitted) {
            menu.push({
                label: locale.listView.csvExport.menuItem,
                action: () => this.listView.openCSVExport(),
                overflow: true,
            });
            menu.push({
                label: locale.members.addrLabelGen.menuItem,
                action: () => this.setState({ addrLabelGenOpen: true }),
                overflow: true,
            });
        }
        // TODO: this one
        /*
        if (this.props.permissions.hasPermission('codeholders.create')) {
            menu.push({
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.members.addMember.menuItem,
                action: () => this.setState({ addMemberOpen: true }),
            });
        }
        */
        menu.push({
            label: locale.search.resetFilters,
            action: () => this.listView.resetFilters(),
            overflow: true,
        });

        const { options, expanded } = this.state;

        return (
            <div class="codeholders-page" ref={node => this.node = node}>
                <AppBarProxy title={locale.title} actions={menu} priority={1} />
                <SearchFilters
                    value={options}
                    onChange={options => this.setState({ options })}
                    searchFields={SEARCHABLE_FIELDS}
                    // TODO: use core views
                    fields={Object.keys(FIELDS)}
                    filters={FILTERS}
                    expanded={expanded}
                    onExpandedChange={expanded => this.setState({ expanded })}
                    locale={{
                        searchFields: locale.search.fields,
                        searchPlaceholders: locale.search.placeholders,
                        filters: locale.search.filters,
                    }}
                    category="codeholders" />
                <FieldPicker
                    open={this.state.fieldPickerOpen}
                    onClose={() => this.setState({ fieldPickerOpen: false })}
                    // TODO: use core views
                    available={Object.keys(FIELDS)}
                    sortables={Object.keys(FIELDS).filter(x => FIELDS[x].sortable)}
                    selected={options.fields}
                    onChange={fields => this.setState({ options: { ...options, fields } })}
                    locale={locale.fields} />
                <OverviewList
                    task="codeholders/list"
                    parameters={options}
                    expanded={expanded}
                    fields={FIELDS}
                    onGetItemLink={id => `/membroj/${id}`} />
                <ListView
                    ref={view => this.listView = view}
                    defaults={{
                        searchField: 'nameOrCode',
                        fixedFields: [{
                            id: 'type',
                            sorting: Sorting.NONE,
                        }],
                        fields: [
                            {
                                id: 'code',
                                sorting: Sorting.ASC,
                            },
                            {
                                id: 'name',
                                sorting: Sorting.NONE,
                            },
                            {
                                id: 'age',
                                sorting: Sorting.NONE,
                            },
                            {
                                id: 'membership',
                                sorting: Sorting.NONE,
                            },
                            {
                                id: 'country',
                                sorting: Sorting.NONE,
                            },
                        ],
                    }}
                    title={<Title />}
                    searchFields={SEARCHABLE_FIELDS}
                    filters={FILTERS}
                    fields={FIELDS}
                    fieldConfigColumn={'codeholderType'}
                    // onRequest={handleRequest(core)}
                    isRestrictedByGlobalFilter={!!(
                        // TODO: this
                        // Object.keys(this.props.permissions.memberFilter).length
                        false
                    )}
                    locale={{
                        searchFields: locale.search.fields,
                        placeholders: locale.search.placeholders,
                        filters: locale.search.filters,
                        fields: locale.fields,
                        csvFields: locale.csvFields,
                        csvFilename: locale.csvFilename,
                        detail: locale.detail,
                    }}
                    detailView={this.state.detail}
                    // onURLQueryChange={this.urlHandler.onURLQueryChange}
                    // onDetailClose={this.urlHandler.onDetailClose}
                    // getLinkTarget={this.urlHandler.getLinkTarget}
                    detailFields={detailFields.fields}
                    detailHeader={detailFields.header}
                    detailFooter={detailFields.footer}
                    // onDetailRequest={handleDetailRequest(core)}
                    //onDetailPatch={this.props.permissions.hasPermission('codeholders.update')
                    //    && handleDetailPatch(core)}
                    //onDetailDelete={this.props.permissions.hasPermission('codeholders.delete')
                    //    && (id => core.createTask('codeholders/delete', { id }).runOnceAndDrop())}
                    //onFetchFieldHistory={
                    //    this.props.permissions.hasPermission('codeholders_hist.read')
                    //        && handleFieldHistory(core)
                    //}
                    onChangePage={this.scrollToTop}
                    csvExportOptions={{
                        countryLocale: {
                            name: locale.csvOptions.countryLocale,
                            type: 'select',
                            options: Object.entries(locale.csvOptions.countryLocales),
                            default: 'eo',
                        },
                    }}
                    //canSaveFilters={this.props.permissions.hasPermission('queries.create')}
                    savedFilterCategory={'codeholders'}
                    onStateChange={state => {
                        if (state.jsonFilter.enabled !== this.state.lvJSONFilterEnabled) {
                            this.setState({ lvJSONFilterEnabled: state.jsonFilter.enabled });
                        }
                        if (state.list.submitted !== this.state.lvSubmitted) {
                            this.setState({ lvSubmitted: state.list.submitted });
                        }
                        if (state.results.stats.cursed !== this.state.lvIsCursed) {
                            this.setState({ lvIsCursed: state.results.stats.cursed });
                        }
                        // deliberately not a state field to avoid frequent updates
                        this.reduxState = state;
                    }}
                    userData={{ permissions: this.props.permissions }} />

                <AddMemberDialog
                    open={this.state.addMemberOpen}
                    onClose={() => this.setState({ addMemberOpen: false })} />
                <AddrLabelGen
                    open={this.state.addrLabelGenOpen}
                    lvIsCursed={this.state.lvIsCursed}
                    getRequestData={() => stateToRequestData(this.reduxState)}
                    onClose={() => this.setState({ addrLabelGenOpen: false })} />
            </div>
        );
    }
}

// TODO: fix this
/*
const Title = connect(state => ({
    query: state.search.query,
    filters: state.filters.enabled,
}))(function SearchTitle (props) {
    let title = locale.members.search.titleFilter;
    if (!props.filters || props.query) {
        title = locale.members.search.title;
    }
    return <div className="members-search-title">{title}</div>;
});
*/

function stateToRequestData (state) {
    const useJSONFilters = state.jsonFilter.enabled;

    const options = {
        search: state.search,
        fields: state.fields.fixed.concat(state.fields.user),
        offset: state.list.page * state.list.itemsPerPage,
        limit: state.list.itemsPerPage,
    };

    let usedFilters = false;
    if (useJSONFilters) {
        usedFilters = true;
        try {
            options.jsonFilter = JSON5.parse(state.jsonFilter.filter);
        } catch (err) {
            err.id = 'invalid-json';
            throw err;
        }
    } else if (state.filters.enabled) {
        const filters = {};
        for (const id in state.filters.filters) {
            const filter = state.filters.filters[id];
            if (filter.enabled) filters[id] = filter.value;
        }

        if (Object.keys(filters).length) {
            options.filters = filters;
            usedFilters = true;
        }
    }

    return {
        options,
        usedFilters,
    };
}

const handleRequest = core => async function handleRequest (state) {
    const { options } = stateToRequestData(state);

    const res = await core.createTask('codeholders/list', {}, options).runOnceAndDrop();

    return {
        items: res.items,
        transientFields: res.transientFields,
        stats: {
            time: res.stats.time,
            total: res.total,
            filtered: res.stats.filtered,
            cursed: res.cursed,
        },
    };
};

const additionalDetailFields = [
    'id',
    'profilePictureHash',
    'address.country',
    'address.countryArea',
    'address.city',
    'address.cityArea',
    'address.streetAddress',
    'address.postalCode',
    'address.sortingCode',
];

const handleDetailRequest = core => function handleDetailRequest (id) {
    return core.createTask('codeholders/codeholder', {}, {
        id,
        fields: ['name', 'code'], // TODO: fix this
    }).runOnceAndDrop();
};

function deepEq (a, b) {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEq(a[i], b[i])) return false;
        }
        return true;
    }
    if (typeof a === 'object' && typeof b === 'object') {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        for (const k of aKeys) if (!bKeys.includes(k)) return false;
        for (const k of bKeys) if (!aKeys.includes(k)) return false;

        for (const k of aKeys) {
            if (!deepEq(a[k], b[k])) return false;
        }
        return true;
    }
    return false;
}

const handleDetailPatch = core => function handleDetailPatch (id, original, value, modCmt) {
    const diff = {};
    for (const key in value) {
        if (!deepEq(original[key], value[key])) {
            diff[key] = value[key] || null;
        }
    }

    const options = {};
    if (modCmt) options.modCmt = modCmt;

    throw new Error('todo');
    // return client.patch(`/codeholders/${id}`, diff, options);
};

const handleFieldHistory = core => async function handleFieldHistory (id, field, offset) {
    throw new Error('todo');

    /*const mappedFields = [field]; // TODO: map
    const history = new Map();

    for (const field of mappedFields) {
        const res = await client.get(`/codeholders/${id}/hist/${field}`, {
            fields: ['val', 'modId', 'modTime', 'modBy', 'modCmt'],
            limit: 100,
            offset,
        });
        for (const item of res.body) {
            let value = {};
            if (history.has(item.modId)) {
                value = history.get(item.modId).val;
            }
            Object.assign(value, item.val);
            item.val = value;
            history.set(item.modId, item);
        }
    }

    return [...history.values()].sort((a, b) => a.modTime - b.modTime);*/
};
