import EventEmitter from 'events';
import Worker from 'worker-loader!../../core';
import DataView from './view';
import Task from './task';

export default class WorkerInterface extends EventEmitter {
    tasks = new Map();
    views = new Map();

    constructor () {
        super();
        this.worker = new Worker();
        this.worker.addEventListener('message', this.#onMessage);
        this.worker.addEventListener('unhandledrejection', this.#onUnhandledRejection);
    }

    /// Terminates the worker.
    drop () {
        this.worker.terminate();
    }

    getTask (id) {
        return this.tasks.get(id);
    }

    createDataView (...args) {
        return new DataView(this, ...args);
    }

    createTask (...args) {
        return new Task(this, ...args);
    }

    registerDataView (view) {
        this.views.set(view.id, view);
        this.worker.postMessage({
            type: 'create-data-view',
            id: view.id,
            view: view.type,
            options: view.options,
        });
    }
    deregisterDataView (view) {
        this.worker.postMessage({ type: 'drop-data-view', id: view.id });
    }
    registerTask (task) {
        this.tasks.set(task.id, task);
        this.worker.postMessage({
            type: 'create-task',
            id: task.id,
            task: task.type,
            options: task.options,
        });
    }
    updateTask (task, parameters) {
        this.worker.postMessage({
            type: 'update-task',
            id: task.id,
            parameters,
        });
    }
    runTask (task) {
        this.worker.postMessage({
            type: 'run-task',
            id: task.id,
        });
    }
    deregisterTask (task) {
        this.worker.postMessage({ type: 'drop-task', id: task.id });
    }

    #onMessage = ({ data }) => {
        if (data.type === 'task-error') {
            this.tasks.get(data.id).onError(data.error);
        } else if (data.type === 'task-success') {
            this.tasks.get(data.id).onSuccess(data.result);
        } else if (data.type === 'data-view-update') {
            this.views.get(data.id).onUpdate(data.data);
        } else if (data.type === 'data-view-error') {
            this.views.get(data.id).onError(data.error);
        }
    };

    #onUnhandledRejection = ({ promise, reason }) => {
        console.error('[core] unhandled rejection!', promise, reason); // eslint-disable-line no-console
    }
}
