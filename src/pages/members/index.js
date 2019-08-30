import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { UEACode, util } from 'akso-client';
import JSON5 from 'json5';
import AddIcon from '@material-ui/icons/Add';
import { AppBarProxy } from 'yamdl';
import { appContext } from '../../router';
import { Spring } from '../../animation';
import ListView from '../../components/list';
import Sorting from '../../components/list/sorting';
import locale from '../../locale';
import client from '../../client';
import FILTERS from './filters';
import FIELDS from './table-fields';
import detailFields from './detail-fields';
import AddMemberDialog from './add-member';
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

export default class MembersList extends PureComponent {
    static propTypes = {
        path: PropTypes.string.isRequired,
        query: PropTypes.string.isRequired,
    };

    static contextType = appContext;

    state = {
        detail: null,
        addMemberOpen: false,
        lvJSONFilterEnabled: false,
        lvSubmitted: false,
    };

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

    isQueryUnchanged (query) {
        return this.currentQuery === query
            || decodeURIComponent(this.currentQuery) === decodeURIComponent(query);
    }

    onURLQueryChange = (query, force = false) => {
        if (this.isDetailView && !force) return;
        if (this.isQueryUnchanged(query) && !force) return;
        this.currentQuery = query;
        if (query) this.context.navigate('/membroj?q=' + query);
        else this.context.navigate('/membroj');
    };

    componentDidMount () {
        this.tryDecodePath();
        this.tryDecodeURLQuery();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.path !== this.props.path) {
            this.tryDecodePath();
        }
        if (prevProps.query !== this.props.query) {
            this.tryDecodeURLQuery();
        }
    }

    tryDecodeURLQuery () {
        if (this.isDetailView) return;
        if (!this.props.query && this.currentQuery) {
            this.currentQuery = '';
            this.listView.decodeURLQuery('');
            return;
        }
        if (!this.props.query.startsWith('?q=')) return;
        const query = this.props.query.substr(3);
        if (this.isQueryUnchanged(query)) return;
        this.currentQuery = query;

        try {
            this.listView.decodeURLQuery(query);
        } catch (err) {
            // TODO: error?
            console.error('Failed to decode URL query', err); // eslint-disable-line no-console
        }
    }

    tryDecodePath () {
        const detailView = this.props.path.match(/^\/membroj\/(\d+)(\/|$)/);
        this.isDetailView = !!detailView;
        if (detailView) {
            this.setState({ detail: +detailView[1] });
        } else {
            this.setState({ detail: null });
        }
    }

    componentWillUnmount () {
        this.scrollSpring.stop();
    }

    render () {
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
        }
        menu.push({
            icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
            label: locale.members.addMember.menuItem,
            action: () => this.setState({ addMemberOpen: true }),
        });
        menu.push({
            label: locale.members.search.resetFilters,
            action: () => this.listView.resetFilters(),
            overflow: true,
        });

        return (
            <div className="app-page members-page" ref={node => this.node = node}>
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
                        Object.keys(this.context.permissions.memberFilter).length
                    )}
                    onURLQueryChange={this.onURLQueryChange}
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
                    onDetailClose={() => this.onURLQueryChange(this.currentQuery, true)}
                    detailFields={detailFields.fields}
                    detailHeader={detailFields.header}
                    detailFooter={detailFields.footer}
                    onDetailRequest={handleDetailRequest}
                    onDetailPatch={handleDetailPatch}
                    onDetailDelete={id => client.delete(`/codeholders/${id}`)}
                    getLinkTarget={id => `/membroj/${id}`}
                    onChangePage={this.scrollToTop}
                    csvExportOptions={{
                        countryLocale: {
                            name: locale.members.csvOptions.countryLocale,
                            type: 'select',
                            options: Object.entries(locale.members.csvOptions.countryLocales),
                            default: 'eo',
                        },
                    }}
                    // TODO: move this into a prop instead of using a context
                    // so it updates when it changes/loads
                    canSaveFilters={this.context.hasPermission('queries.create')}
                    savedFilterCategory={'codeholders'}
                    onJSONFilterEnabledChange={enabled =>
                        this.setState({ lvJSONFilterEnabled: enabled })}
                    onSubmittedChange={submitted => this.setState({ lvSubmitted: submitted })} />
                <AddMemberDialog
                    open={this.state.addMemberOpen}
                    onClose={() => this.setState({ addMemberOpen: false })} />
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
        sort: ['lastNameLegal', 'firstNameLegal'], // FIXME: this is probably wrong
    },
    country: {
        fields: ['feeCountry', 'addressLatin.country'],
        sort: ['feeCountry', 'addressLatin.country'],
    },
    age: {
        fields: ['age', 'agePrimo'],
        sort: ['age'],
    },
    officePhone: {
        fields: ['officePhone', 'officePhoneFormatted'],
    },
    landlinePhone: {
        fields: ['landlinePhone', 'landlinePhoneFormatted'],
    },
    cellphone: {
        fields: ['cellphone', 'cellphoneFormatted'],
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

async function handleRequest (state) {
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
            searchField = 'name';

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

    let itemToPrepend = null;
    if (prependedUeaCodeSearch) {
        itemToPrepend = (await client.get('/codeholders', {
            filter: prependedUeaCodeSearch,
            // only need to know about its existence on later pages
            fields: options.offset === 0 ? options.fields : [],
            limit: 1,
        })).body[0];
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

    if (itemToPrepend) {
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
        },
    };
}

const additionalDetailFields = [
    'id',
    'hasProfilePicture',
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
            diff[key] = value[key];
        }
    }

    return client.patch(`/codeholders/${id}`, diff, { modCmt });
}
