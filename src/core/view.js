import EventEmitter from 'events';
import * as store from './store';

/// Abstract view container.
export default class DataView {
    isDropped = false;

    constructor (id, view, options) {
        this.id = id;
        this.inner = view.then(View => new View(options));

        this.inner.then(inner => {
            console.debug(`[core] data view ${id} loaded`);
            inner.on('update', this.#onUpdate);
            inner.on('error', this.#onError);
        }).catch(err => {
            console.debug(`[core] data view ${id} failed to load`, err);
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
export const createStoreObserver = path => class StoreObserverDataView extends AbstractDataView {
    constructor () {
        super();
        this.path = path;
        store.subscribe(this.path, this.#onUpdate);
        this.emit('update', store.get(this.path));
    }

    #onUpdate = () => {
        this.emit('update', store.get(this.path));
    };

    drop () {
        store.unsubscribe(this.path, this.#onUpdate);
    }
};
