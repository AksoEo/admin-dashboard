import { h } from 'preact';
import { Fragment, PureComponent } from 'preact/compat';
import { Button } from '@cpsdqs/yamdl';
import MapIcon from '@material-ui/icons/Map';
import BusinessIcon from '@material-ui/icons/Business';
import SearchFilters from '../../../../../components/search-filters';
import OverviewList from '../../../../../components/overview-list';
import OverviewListItem from '../../../../../components/overview-list-item';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../../../components/list-url-coding';
import { congressLocations as locale } from '../../../../../locale';
import { routerContext } from '../../../../../router';
import { FIELDS } from './fields';
import { FILTERS } from './filters';
import MapList from '../../map-list';
import './index.less';

/// Shows an overview over locations, with a map
///
/// # Props
/// - congress: congress id
/// - congressAddress: optional congress address
/// - congressLocation: optional congress location
/// - instance: instance id
/// - query/onQueryChange: query
/// - push: proxy for navigation API
export default class LocationsView extends PureComponent {
    state = {
        parameters: {
            search: {
                field: 'name',
                query: '',
            },
            filters: {},
            jsonFilter: {
                _disabled: true,
                filter: {},
            },
            fields: [
                { id: 'type', sorting: 'none', fixed: true },
                { id: 'name', sorting: 'asc', fixed: true },
                { id: 'description', sorting: 'none', fixed: true },
            ],
            offset: 0,
            limit: 10,
        },
        expanded: false,
        listView: false,
        tToListView: false, // transition to list view
        tFromListView: false,
    };

    static contextType = routerContext;

    #searchInput;
    #currentQuery = '';

    decodeURLQuery () {
        if (!this.props.query) {
            this.setState({ listView: false });
        } else {
            this.setState({
                listView: true,
                parameters: applyDecoded(decodeURLQuery(this.props.query, FILTERS), this.state.parameters),
            });
        }
        this.#currentQuery = this.props.query;
    }

    encodeURLQuery () {
        const encoded = this.state.listView
            ? encodeURLQuery(this.state.parameters, FILTERS)
            : '';
        if (encoded === this.#currentQuery) return;
        this.#currentQuery = encoded;
        this.props.onQueryChange(encoded);
    }

    componentDidMount () {
        this.decodeURLQuery();
        if (this.#searchInput) this.#searchInput.focus(500);
    }

    componentDidUpdate (prevProps, prevState) {
        if (prevProps.query !== this.props.query && this.props.query !== this.#currentQuery) {
            this.decodeURLQuery();
        }
        if (prevState.parameters !== this.state.parameters
            || prevState.listView !== this.state.listView) {
            this.encodeURLQuery();
        }
    }

    #node = null;
    #mapListLeft = null;

    updateMapListLeftSize () {
        if (this.#mapListLeft) {
            this.mapListLeftSize = this.#mapListLeft.offsetWidth;
        } else if (!this.mapListLeftSize) {
            this.mapListLeftSize = 300;
        }
    }

    openMap = () => {
        this.updateMapListLeftSize();
        this.targetSize = this.#node.offsetWidth;
        this.setState({ tFromListView: true });
        setTimeout(() => {
            this.setState({ listView: false });
        }, 500);
        setTimeout(() => {
            this.setState({ tFromListView: false });
        }, 1000);
    };

    closeMap = () => {
        this.updateMapListLeftSize();
        this.targetSize = this.#node.offsetWidth;
        this.setState({ tToListView: true });
        setTimeout(() => {
            this.setState({ listView: true });
        }, 500);
        setTimeout(() => {
            this.setState({ tToListView: false });
        }, 1000);
    };

    render ({ congress, instance, congressAddress, congressLocation }, { parameters, listView, expanded }) {
        let header;
        const markers = [];
        if (congressAddress) {
            header = (
                <div class="congress-address">
                    <label>{locale.congressAddress}</label>
                    <div>
                        {congressAddress.split('\n').map((l, i) => <div key={i}>{l}</div>)}
                    </div>
                </div>
            );
        }
        if (congressLocation) {
            markers.push({
                location: congressLocation,
                icon: <BusinessIcon />,
            });
        }

        const IconField = FIELDS.icon.component;

        let contents;
        if (listView) {
            contents = (
                <Fragment>
                    <div class="show-map-container">
                        <Button icon small onClick={this.openMap}>
                            <MapIcon style={{ verticalAlign: 'middle' }} />
                        </Button>
                    </div>
                    <SearchFilters
                        value={parameters}
                        searchFields={[
                            'name',
                            'description',
                        ]}
                        filters={FILTERS}
                        onChange={parameters => this.setState({ parameters })}
                        locale={{
                            searchPlaceholders: locale.search.placeholders,
                            searchFields: locale.fields,
                            filters: locale.search.filters,
                        }}
                        expanded={expanded}
                        onExpandedChange={expanded => this.setState({ expanded })}
                        inputRef={node => this.#searchInput = node} />
                    <OverviewList
                        expanded={expanded}
                        useDeepCmp options={{ congress, instance }}
                        viewOptions={{ congress, instance }}
                        task="congresses/listLocations"
                        view="congresses/location"
                        updateView={['congresses/sigLocations', { congress, instance }]}
                        parameters={parameters}
                        fields={FIELDS}
                        onGetItemLink={id => `/kongresoj/${congress}/okazigoj/${instance}/lokoj/${id}`}
                        onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                        onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                        onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                        locale={locale.fields}
                        userData={{ congress, instance }} />
                </Fragment>
            );
        } else {
            contents = (
                <MapList
                    task="congresses/listLocations"
                    options={{ congress, instance }}
                    view="congresses/location"
                    viewOptions={{ congress, instance, noFetch: true }}
                    updateView={['congresses/sigLocations', { congress, instance }]}
                    item={listItemConstructor({ congress, instance })}
                    itemToMarker={item => item.type === 'internal' ? null : ({
                        key: item.id,
                        location: item.ll,
                        icon: item.icon === 'GENERIC' ? null : <IconField value={item.icon} />,
                        onClick: () => {
                            this.context.navigate(`/kongresoj/${congress}/okazigoj/${instance}/lokoj/${item.id}`);
                        },
                    })}
                    onItemClick={id => {
                        this.props.push('lokoj/' + id);
                    }}
                    header={header}
                    itemParent={item => item.type === 'internal' ? item.externalLoc : null}
                    searchFields={['name', 'description']}
                    markers={markers}
                    listContainerRef={node => this.#mapListLeft = node}
                    onCloseMap={this.closeMap} />
            );
        }

        let transition = null;
        if (this.state.tToListView || this.state.tFromListView) {
            transition = (
                <div class={'list-view-transition' + (this.state.tFromListView ? ' to-map' : '')}>
                    <div class="transition-left" style={{
                        width: this.mapListLeftSize,
                        '--scale-dest': this.targetSize / this.mapListLeftSize,
                    }}></div>
                </div>
            );
        }

        return (
            <div class="congresses-instance-locations" ref={node => this.#node = node}>
                {transition}
                {contents}
            </div>
        );
    }
}

const listItemConstructor = ({ congress, instance }) => function ListItem ({ id }) {
    const fields = [
        { id: 'icon' },
        { id: 'name' },
        { id: 'description' },
    ];

    return (
        <div class="location-item">
            <OverviewListItem
                compact
                view="congresses/location"
                options={{ congress, instance }}
                id={id}
                selectedFields={fields}
                fields={FIELDS}
                locale={locale.fields} />
        </div>
    );
};
