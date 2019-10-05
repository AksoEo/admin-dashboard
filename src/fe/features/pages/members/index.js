import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { UEACode, util } from 'akso-client';
import JSON5 from 'json5';
import AddIcon from '@material-ui/icons/Add';
import { AppBarProxy } from 'yamdl';
import { routerContext } from '../../../router';
import { Spring } from '../../../animation';
import ListView, { Sorting } from '../../../components/list';
import ListViewURLHandler from '../../../components/list/url-handler';
import locale from '../../../locale';
import client from '../../../client';
import FILTERS from './filters';
import FIELDS from './table-fields';
import detailFields from './detail-fields';
import AddMemberDialog from './add-member';
import AddrLabelGen from './addr-label-gen';
import './style';

const SEARCHABLE_FIELDS = [
    'nameOrCode',
    'email',
    'landlinePhone',
    'cellphone',
    'officePhone',
    'address',
    'notes',
];

/// The members list page.
export default class MembersList extends PureComponent {
    static propTypes = {
        path: PropTypes.string.isRequired,
        query: PropTypes.string.isRequired,
    };

    static contextType = routerContext;

    state = {
        /// The member ID of the currently open detail view.
        detail: null,
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

        this.urlHandler = new ListViewURLHandler('/membroj', true);
        this.urlHandler.on('navigate', target => this.context.navigate(target));
        this.urlHandler.on('decodeURLQuery', query => this.listView.decodeURLQuery(query));
        this.urlHandler.on('detail', detail => this.setState({ detail }));
    }

    scrollToTop = () => {
        if (this.node.scrollTop > 0) {
            this.scrollSpring.value = this.node.scrollTop;
            this.scrollSpring.start();
        }
    };

    componentDidMount () {
        this.urlHandler.update(this.props.path, this.props.query);
    }

    componentDidUpdate () {
        this.urlHandler.update(this.props.path, this.props.query);
    }

    componentWillUnmount () {
        this.scrollSpring.stop();
    }

    render () {
        // overflow menu
        const menu = [];
        menu.push({
            label: this.state.lvJSONFilterEnabled
                ? locale.listView.json.disable
                : locale.listView.json.enable,
            action: () => this.listView.setJSONFilterEnabled(!this.state.lvJSONFilterEnabled),
            overflow: true,
        });
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
        if (this.props.permissions.hasPermission('codeholders.create')) {
            menu.push({
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.members.addMember.menuItem,
                action: () => this.setState({ addMemberOpen: true }),
            });
        }
        menu.push({
            label: locale.members.search.resetFilters,
            action: () => this.listView.resetFilters(),
            overflow: true,
        });

        return (
            <div class="app-page members-page" ref={node => this.node = node}>
                <AppBarProxy actions={menu} priority={1} />
                <ListView
                    ref={view => this.listView = view}
                    defaults={{
                        searchField: 'nameOrCode',
                        fixedFields: [{
                            id: 'codeholderType',
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
                    onRequest={handleRequest}
                    isRestrictedByGlobalFilter={!!(
                        Object.keys(this.props.permissions.memberFilter).length
                    )}
                    locale={{
                        searchFields: locale.members.search.fields,
                        placeholders: locale.members.search.placeholders,
                        filters: locale.members.search.filters,
                        fields: locale.members.fields,
                        csvFields: locale.members.csvFields,
                        csvFilename: locale.members.csvFilename,
                        detail: locale.members.detail,
                    }}
                    detailView={this.state.detail}
                    onURLQueryChange={this.urlHandler.onURLQueryChange}
                    onDetailClose={this.urlHandler.onDetailClose}
                    getLinkTarget={this.urlHandler.getLinkTarget}
                    detailFields={detailFields.fields}
                    detailHeader={detailFields.header}
                    detailFooter={detailFields.footer}
                    onDetailRequest={handleDetailRequest}
                    onDetailPatch={this.props.permissions.hasPermission('codeholders.update')
                        && handleDetailPatch}
                    onDetailDelete={this.props.permissions.hasPermission('codeholders.delete')
                        && (id => client.delete(`/codeholders/${id}`))}
                    onFetchFieldHistory={
                        this.props.permissions.hasPermission('codeholders_hist.read')
                            && handleFieldHistory
                    }
                    onChangePage={this.scrollToTop}
                    csvExportOptions={{
                        countryLocale: {
                            name: locale.members.csvOptions.countryLocale,
                            type: 'select',
                            options: Object.entries(locale.members.csvOptions.countryLocales),
                            default: 'eo',
                        },
                    }}
                    canSaveFilters={this.props.permissions.hasPermission('queries.create')}
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

// maps client fields to api fields
const fieldMapping = {
    codeholderType: {
        fields: ['codeholderType', 'enabled', 'isDead'],
        sort: ['codeholderType'],
    },
    code: {
        fields: ['newCode', 'oldCode'],
        sort: ['newCode', 'oldCode'],
    },
    name: {
        fields: [
            'firstName',
            'lastName',
            'firstNameLegal',
            'lastNameLegal',
            'fullName',
            'fullNameLocal',
            'nameAbbrev',
            'honorific',
            'codeholderType',
            'isDead',
        ],
        sort: ['searchName'],
    },
    country: {
        fields: ['feeCountry', 'addressLatin.country'],
        sort: ['feeCountry', 'addressLatin.country'],
    },
    age: {
        fields: ['age', 'agePrimo'],
        sort: ['age'],
    },
    addressLatin: {
        fields: [
            'country',
            'countryArea',
            'city',
            'cityArea',
            'streetAddress',
            'postalCode',
            'sortingCode',
        ].map(x => 'addressLatin.' + x),
        sort: ['addressLatin.country', 'addressLatin.postalCode'],
    },
    addressCity: {
        fields: ['addressLatin.city', 'addressLatin.cityArea'],
        sort: ['addressLatin.city', 'addressLatin.cityArea'],
    },
    addressCountryArea: {
        fields: ['addressLatin.countryArea'],
        sort: ['addressLatin.countryArea'],
    },
};

/** Fields to additionally select when searching for a field. */
const searchFieldToSelectedFields = {
    nameOrCode: ['name', 'code'],
    address: ['addressLatin'],
};

function stateToRequestData (state) {
    const useJSONFilters = state.jsonFilter.enabled;

    const options = {};
    const transientFields = [];

    let prependedUeaCodeSearch = null;

    if (state.search.query) {
        let query = state.search.query;
        let searchField = state.search.field;

        // select search field as temporary field
        transientFields.push(...(searchFieldToSelectedFields[searchField] || [searchField]));

        if (searchField === 'nameOrCode') {
            searchField = 'searchName';

            try {
                // if the query is a valid UEA code; prepend search
                const code = new UEACode(query);
                if (code.type === 'new') prependedUeaCodeSearch = { newCode: query };
                else prependedUeaCodeSearch = { oldCode: query };
            } catch (invalidUeaCode) { /* only search for name otherwise */ }
        } else if (searchField === 'address') {
            searchField = 'searchAddress';
        } else if (['landlinePhone', 'officePhone', 'cellphone'].includes(searchField)) {
            // filter out non-alphanumeric characters because they might be interpreted as
            // search operators
            query = query.replace(/[^a-z0-9]/ig, '');
        }

        const transformedQuery = util.transformSearch(query);

        if (!util.isValidSearch(transformedQuery)) {
            const error = Error('invalid search query');
            error.id = 'invalid-search-query';
            throw error;
        }

        options.search = { str: transformedQuery, cols: [searchField] };
    }

    // list of all fields that have been selected
    const fields = state.fields.fixed.concat(
        state.fields.user,
        transientFields.map(field => ({ id: field, sorting: Sorting.NONE })),
    );

    options.order = fields
        .filter(({ sorting }) => sorting !== Sorting.NONE)
        .flatMap(({ id, sorting }) => fieldMapping[id]
            ? fieldMapping[id].sort.map(id => ({ id, sorting })) || []
            : [{id, sorting}])
        .map(({ id, sorting }) => sorting === Sorting.ASC ? [id, 'asc'] : [id, 'desc']);

    // order by relevance if no order is selected
    if (options.search && !options.order.length) {
        options.order = [['_relevance', 'desc']];
    }

    options.fields = fields.flatMap(({ id }) => fieldMapping[id] ? fieldMapping[id].fields : [id]);
    options.fields.push('id'); // also select the ID field

    options.offset = state.list.page * state.list.itemsPerPage;
    options.limit = state.list.itemsPerPage;

    let usedFilters = false;
    if (useJSONFilters) {
        usedFilters = true;
        try {
            options.filter = JSON5.parse(state.jsonFilter.filter);
        } catch (err) {
            err.id = 'invalid-json';
            throw err;
        }
    } else if (state.filters.enabled) {
        const filters = [];
        for (const id in state.filters.filters) {
            const filter = state.filters.filters[id];
            if (filter.enabled) {
                filters.push(FILTERS[id].toRequest
                    ? FILTERS[id].toRequest(filter.value)
                    : { [id]: filter.value });
            }
        }

        if (filters.length) {
            options.filter = { $and: filters };
            usedFilters = true;
        }
    }

    return {
        options,
        prependedUeaCodeSearch,
        usedFilters,
        transientFields,
    };
}

async function handleRequest (state) {
    const {
        options, prependedUeaCodeSearch, usedFilters, transientFields,
    } = stateToRequestData(state);

    let itemToPrepend = null;
    if (prependedUeaCodeSearch) {
        itemToPrepend = (await client.get('/codeholders', {
            filter: prependedUeaCodeSearch,
            // only need to know about its existence on later pages
            fields: options.offset === 0 ? options.fields : [],
            limit: 1,
        })).body[0];
        if (itemToPrepend) itemToPrepend.isCursed = true;
    }

    if (itemToPrepend) {
        // there’s an extra item at the front
        // on the first page, just reduce the limit to compensate
        if (state.list.page === 0) options.limit--;
        // and on any other page, reduce the offset to compensate
        else options.offset--;
    }

    const result = await client.get('/codeholders', options);
    const list = result.body;
    let totalItems = +result.res.headers.map['x-total-items'];
    let cursed = false;

    if (itemToPrepend) {
        cursed = true;
        let isDuplicate = false;
        for (const item of list) {
            if (item.id === itemToPrepend.id) {
                isDuplicate = true;
                break;
            }
        }
        if (!isDuplicate) {
            // prepend item on the first page if it’s not a duplicate
            if (state.list.page === 0) list.unshift(itemToPrepend);
            totalItems++;
        }
    }

    return {
        items: list,
        transientFields,
        stats: {
            time: result.resTime,
            total: totalItems,
            filtered: usedFilters,
            cursed,
        },
    };
}

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

async function handleDetailRequest (id) {
    const res = await client.get(`/codeholders/${id}`, {
        fields: Object.keys(FIELDS)
            .flatMap(id => fieldMapping[id] ? fieldMapping[id].fields : [id])
            .concat(additionalDetailFields),
    });
    return res.body;
}

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

function handleDetailPatch (id, original, value, modCmt) {
    const diff = {};
    for (const key in value) {
        if (!deepEq(original[key], value[key])) {
            diff[key] = value[key] || null;
        }
    }

    const options = {};
    if (modCmt) options.modCmt = modCmt;

    return client.patch(`/codeholders/${id}`, diff, options);
}

async function handleFieldHistory (id, field, offset) {
    const mappedFields = [field]; // TODO: map
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

    return [...history.values()].sort((a, b) => a.modTime - b.modTime);
}
