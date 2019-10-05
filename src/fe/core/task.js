import EventEmitter from 'events';
import uuidv4 from 'uuid/v4';

export const TaskState = {
    IDLE: 'idle',
    RUNNING: 'running',
    ENDED: 'ended',
};

/// Represents a failable task, such as logging in or uploading a file.
///
/// Tasks are initialized with a set of immutable options. They also contain a set of mutable
/// parameters for the user to modify, and can then be run (or canceled). When a task is run, it may
/// either succeed or fail. If it fails, it goes back to being idle.
///
/// This object **must be dropped manually** because it subscribes to an object in another thread.
export default class Task extends EventEmitter {
    constructor (worker, type, options, parameters = {}) {
        super();
        this.id = uuidv4();
        this.type = type;
        this.worker = worker;
        this.options = options;
        this.parameters = parameters;

        this.state = TaskState.IDLE;

        this.worker.registerTask(this);
    }

    update (parameters) {
        Object.assign(this.parameters, parameters);
    }

    run () {
        if (this.state !== TaskState.IDLE) return;
        this.state = TaskState.RUNNING;
        this.worker.updateTask(this, this.parameters);
        this.worker.runTask(this);
    }

    onError ({ code, message }) {
        this.state = TaskState.IDLE;
        this.emit('error', { code, message, valueOf: () => `Error (${code}): ${message}` });
    }

    onSuccess (result) {
        this.state = TaskState.ENDED;
        this.emit('success', result);
    }

    drop () {
        this.worker.deregisterTask(this);
    }
}
