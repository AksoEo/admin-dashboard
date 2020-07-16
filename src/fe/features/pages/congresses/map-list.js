import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { CircularProgress } from '@cpsdqs/yamdl';
import L from 'leaflet';
import { coreContext } from '../../../core/connection';
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
export default class MapList extends PureComponent {
    state = {
        /// If not null, then this is an instanceof DataLoader, loading data.
        loading: null,
        /// If not null, then an error has occurred while loading.
        error: null,
        /// List of loaded items, by id.
        items: [],

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
                this.setState({}, () => {
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

    render ({ item, itemToMarker }, { items, loading, error }) {
        const markers = [];
        for (const item of this.#itemData.values()) {
            const m = itemToMarker(item);
            if (m) markers.push(m);
        }

        return (
            <div class="map-list">
                <div class="inner-list-container">
                    <InnerList
                        item={item}
                        items={items}
                        loading={loading}
                        error={error} />
                </div>
                <div class="inner-map-container">
                    <CircularProgress
                        onClick={() => this.load()}
                        indeterminate={loading && loading.progress === null}
                        progress={loading && +loading.progress} />
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

function InnerList ({ items, item, loading, error }) {
    const Item = item;

    return (
        <div class="inner-list">
            <div class="list-search">
                meow
            </div>
            <div class="list-items">
                {items.map(id => <Item key={id} id={id} />)}
            </div>
        </div>
    );
}
