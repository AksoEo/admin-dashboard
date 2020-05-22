//! This refers to tasks in the AKSO API (not tasks in the core api).
import asyncClient from '../client';
import { AbstractDataView } from '../view';
import * as store from '../store';

export const TASKS = 'tasks';

export const tasks = {
    list: async () => {
        const client = await asyncClient;
        const res = await client.get('/tasks');
        store.insert([TASKS], res.body);
    },
};

// update every minute
const AUTO_UPDATE_INTERVAL = 60000;

export const views = {
    tasks: class TasksView extends AbstractDataView {
        constructor () {
            super();
            store.subscribe([TASKS], this.#onUpdate);
            if (store.get([TASKS])) setImmediate(this.#onUpdate);

            this.updateInterval = setInterval(this.#requestUpdate, AUTO_UPDATE_INTERVAL);
            this.#requestUpdate();
        }
        #requestUpdate = () => {
            tasks.list().catch(err => this.emit('error', err));
        };
        #onUpdate = () => {
            this.emit('update', store.get([TASKS]));
        };
        drop () {
            clearInterval(this.updateInterval);
            store.unsubscribe([TASKS], this.#onUpdate);
        }
    },
};
