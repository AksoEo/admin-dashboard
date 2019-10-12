import EventEmitter from 'events';
import uuidv4 from 'uuid/v4';

/// A data view provides asynchronous access to API objects.
/// It is initialized with a set of immutable options and will receive updates and errors
/// as the data loads.
///
/// This object **must be dropped manually** because it subscribes to an object in another thread.
export default class DataView extends EventEmitter {
    data = null;

    constructor (worker, type, options) {
        super();
        this.id = uuidv4();
        this.type = type;
        this.worker = worker;
        this.options = options;

        this.worker.registerDataView(this);
    }

    onUpdate (data) {
        this.data = data;
        this.emit('update', data);
    }

    onError ({ code, message }) {
        this.emit('error', { code, message, valueOf: () => `Error (${code}): ${message}` });
    }

    drop () {
        this.worker.deregisterDataView(this);
    }
}
