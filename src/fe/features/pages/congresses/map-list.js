import { h } from 'preact';
import { PureComponent, useState } from 'preact/compat';
import { CircularProgress } from '@cpsdqs/yamdl';
import SearchIcon from '@material-ui/icons/Search';
import L from 'leaflet';
import fuzzaldrin from 'fuzzaldrin';
import DisplayError from '../../../components/error';
import { coreContext } from '../../../core/connection';
import { data as locale } from '../../../locale';
import LMap from './map';
import './map-list.less';

class DataLoader {
    constructor (core, task, options, push, done, error) {
        this.core = core;
        this.task = task;
        this.options = options;
        this.push = push;
        this.done = done;
        this.error = error;
    }

    totalItems = null;
    loadedItems = 0;

    get progress () {
        if (this.totalItems === null) return null;
        return this.loadedItems / this.totalItems;
    }

    async loadLoop () {
        if (this.dropped) return;

        const result = await this.core.createTask(this.task, this.options, {
            offset: this.loadedItems,
            limit: 100,
        }).runOnceAndDrop();

        if (this.dropped) return;

        this.totalItems = result.total;
        this.loadedItems += result.items.length;
        if (this.loadedItems < this.totalItems && result.items.length === 0) {
            // bad server
            this.dropped = true;
        }
        this.push(result.items);

        if (this.loadedItems < this.totalItems) {
            await this.loadLoop();
        } else this.done();
    }

    start () {
        if (this.started) return;
        this.started = true;

        this.loadLoop().catch(this.onerror);
    }

    onerror = error => {
        this.error(error);
        this.dropped = true;
    };

    drop () {
        this.dropped = true;
    }
}

/// A list with a map, for items that each have a location.
///
/// # Props
/// - task: task name
/// - options: task options
/// - view: item view
/// - viewOptions: view options
/// - item: item component. Will be passed the following props: { id }
/// - detail: if not none, will display an overlay over the list
/// - itemToMarker: should either turn an item into a marker or return something falsy
/// - searchFields: array of fields to use for searching
/// - itemParent: (item_data) => id or null. Use to create sub-items. Only supports one level.
/// - onItemClick: (id) => void
export default class MapList extends PureComponent {
    state = {
        /// If not null, then this is an instanceof DataLoader, loading data.
        loading: null,
        /// If not null, then an error has occurred while loading.
        error: null,
        /// List of loaded items, by id.
        items: [],

        /// If not null, the id of a highlighted item.
        highlighted: null,

        /// hacky way of coalescing force updates by incrementing this variable
        coalescedForceUpdate: 0,
    };

    static contextType = coreContext;

    // a ref to the leaflet map
    #map;

    #itemViews = new Map();
    #itemData = new Map();

    #addItemViewForId = id => {
        if (!this.#itemViews.has(id)) {
            const view = this.context.createDataView(this.props.view, { ...this.props.viewOptions, id });
            let isFirstLoad = this.#isFirstLoad;
            view.on('update', data => {
                this.#itemData.set(id, data);
                this.setState({ coalescedForceUpdate: this.state.coalescedForceUpdate + 1 });
                if (isFirstLoad) {
                    this.#frameMarkers();
                    isFirstLoad = false;
                }
            });
            view.on('error', error => {
                console.error('error in map list view for id ' + id, error); // eslint-disable-line no-console
            });
            this.#itemViews.set(id, view);
        }
    };
    #flushItemViews = () => {
        for (const id of this.#itemViews.keys()) {
            if (!this.state.items.includes(id)) {
                this.#itemViews.get(id).drop();
                this.#itemViews.delete(id);
                this.#itemData.delete(id);
            }
        }
    };

    #isFirstLoad = true;

    /// update the map viewport to frame all markers, if this is the first load
    #frameMarkers = () => {
        if (!this.#map) return;
        const markers = [...this.#itemData.values()]
            .map(this.props.itemToMarker)
            .filter(x => x && x.location)
            .map(x => x.location);


        this.#map.fitBounds(L.latLngBounds(markers).pad(0.4));
    };

    load () {
        if (this.state.loading) this.state.loading.drop();

        const loader = new DataLoader(
            this.context,
            this.props.task,
            this.props.options || {},
            newItems => {
                this.setState({ items: this.state.items.concat(newItems) });
                for (const id of newItems) this.#addItemViewForId(id);
            },
            () => {
                // done
                this.setState({ loading: null }, () => {
                    // we need to delay flushing until after state has been set
                    this.#flushItemViews();

                    // if this is the first load, position the map
                    this.#isFirstLoad = false;
                });
            },
            error => this.setState({ error, loading: null }),
        );
        this.setState({
            loading: loader,
        }, () => this.state.loading.start());
    }

    componentDidMount () {
        this.load();
    }

    componentWillUnmount () {
        if (this.state.loading) this.state.loading.drop();
        for (const view of this.#itemViews.values()) view.drop();
    }

    #onItemClick = (id) => {
        if (this.props.onItemClick) this.props.onItemClick(id);
    };
    #onItemHover = (id) => {
        this.setState({ highlighted: id });
    };
    #onItemOut = () => {
        this.setState({ highlighted: null });
    };

    render ({ item, itemToMarker, itemParent, searchFields, detail }, { items, loading, error }) {
        const markers = [];
        for (const [id, item] of this.#itemData) {
            const m = itemToMarker(item);
            if (m) {
                if (this.state.highlighted === id) {
                    m.highlighted = true;
                }
                markers.push(m);
            }
        }

        return (
            <div class="map-list">
                <div class="inner-list-container">
                    <InnerList
                        item={item}
                        itemData={this.#itemData}
                        items={items}
                        loading={loading}
                        error={error}
                        itemParent={itemParent}
                        onItemClick={this.#onItemClick}
                        onItemHover={this.#onItemHover}
                        onItemOut={this.#onItemOut}
                        searchFields={searchFields} />
                    {detail ? (
                        <div class="inner-list-detail-overlay">
                            {detail}
                        </div>
                    ) : null}
                </div>
                <div class="inner-map-container">
                    <div class="map-loading-progress">
                        <CircularProgress
                            small
                            onClick={() => this.load()}
                            indeterminate={loading && loading.progress === null}
                            progress={loading && +loading.progress} />
                    </div>
                    <LMap
                        class="inner-map"
                        center={[0, 0]}
                        zoom={1}
                        whenReady={map => this.#map = map.target}
                        markers={markers}>
                    </LMap>
                </div>
            </div>
        );
    }
}

function InnerList ({
    items,
    itemData,
    item,
    loading,
    error,
    itemParent,
    searchFields,
    onItemClick,
    onItemHover,
    onItemOut,
}) {
    const [search, setSearch] = useState('');

    let filteredIds;
    if (search) {
        // multi-field fuzzy filter
        // TODO: extract this somewhere
        filteredIds = [];
        const scores = new Map();
        for (const id of items) {
            const data = itemData.get(id);
            if (!data) {
                if (!loading) loading = true;
                continue;
            }
            let score = 0;
            for (const field of searchFields) {
                score += Math.max(0, fuzzaldrin.score(data[field], search));
            }
            if (score > 0) {
                scores.set(id, score);
                filteredIds.push(id);
            }
        }
        filteredIds.sort((a, b) => scores.get(b) - scores.get(a));
    } else {
        filteredIds = items;
    }

    const topIds = new Map();
    for (const id of filteredIds) {
        const data = itemData.get(id);
        if (!data) {
            if (!loading) loading = true;
            topIds.set(id, { id, children: [] });
            continue;
        }

        const node = { id, children: [] };

        const parent = itemParent ? itemParent(data) : null;
        if (parent === null) {
            topIds.set(id, node);
        } else {
            if (!topIds.has(parent)) topIds.set(parent, { id: parent, children: [] });
            topIds.get(parent).children.push(node);
        }
    }

    return (
        <div class="inner-list">
            {searchFields ? (
                <div class="list-search">
                    <SearchIcon />
                    <input
                        value={search}
                        placeholder={locale.mapList.searchPlaceholder}
                        onChange={e => setSearch(e.target.value)} />
                </div>
            ) : null}
            <div class="list-items">
                {[...topIds.values()].map(node => (
                    <Item
                        key={node.id}
                        id={node.id}
                        subnodes={node.children}
                        item={item}
                        onItemClick={onItemClick}
                        onItemHover={onItemHover}
                        onItemOut={onItemOut} />
                ))}
                {error ? (
                    <div key="error" class="list-items-error">
                        <DisplayError error={error} />
                    </div>
                ) : loading ? (
                    <div key="loading" class="list-items-loading">
                        <CircularProgress indeterminate />
                    </div>
                ) : !items.length ? (
                    <div class="list-items-empty">
                        {locale.mapList.empty}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function Item ({ item, id, subnodes, onItemClick, onItemHover, onItemOut }) {
    const ItemComponent = item;

    const li = (
        <div
            class="list-item"
            onClick={e => onItemClick(id, e)}
            onpointerover={e => onItemHover(id, e)}
            onpointerout={e => onItemOut(id, e)}>
            <ItemComponent id={id} />
        </div>
    );

    if (subnodes.length) {
        return (
            <div class="list-item-container" data-id={id}>
                {li}
                <div class="list-item-children">
                    {subnodes.map(node => (
                        <Item
                            key={node.id}
                            id={node.id}
                            subnodes={node.children}
                            item={item}
                            onItemClick={onItemClick}
                            onItemHover={onItemHover}
                            onItemOut={onItemOut} />
                    ))}
                </div>
            </div>
        );
    }
    return li;
}
