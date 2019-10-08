import EventEmitter from 'events';
import * as store from './store';
import * as log from './log';

/// Abstract view container.
export default class DataView {
    isDropped = false;

    constructor (id, view, options) {
        this.id = id;
        this.inner = view.then(View => new View(options));

        this.inner.then(inner => {
            log.debug(`data view ${id} loaded`);
            inner.on('update', this.#onUpdate);
            inner.on('error', this.#onError);
        }).catch(err => {
            log.debug(`data view ${id} failed to load`, err);
            this.onError(err);
        });
    }

    #onUpdate = data => {
        if (this.isDropped) return;
        self.postMessage({
            type: 'data-view-update',
            id: this.id,
            data,
        });
    };

    #onError = error => {
        if (this.isDropped) return;
        self.postMessage({
            type: 'data-view-error',
            id: this.id,
            error: {
                code: error.code,
                message: error.message || error.toString(),
            },
        });
    };

    drop () {
        this.isDropped = true;
        this.inner.then(inner => inner.drop());
    }
}

export class AbstractDataView extends EventEmitter {
    drop () {}
}

/// Creates a data view that just shows the given data store path verbatim.
export const createStoreObserver = (path, map = (id => id)) => class StoreObserverDataView extends AbstractDataView {
    constructor () {
        super();
        this.path = path;
        store.subscribe(this.path, this.#onUpdate);
        setImmediate(() => this.emit('update', map(store.get(this.path))));
    }

    #onUpdate = () => {
        this.emit('update', map(store.get(this.path)));
    };

    drop () {
        store.unsubscribe(this.path, this.#onUpdate);
    }
};
