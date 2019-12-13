import asyncClient from '../client';
import { AbstractDataView } from '../view';
import * as store from '../store';

const PERMS = ['perms'];

export const tasks = {
    /// perms/perms: fetches perms
    perms: async () => {
        const client = await asyncClient;
        const res = await client.get('/perms');
        const perms = res.body;
        store.insert(PERMS, perms);
        return perms;
    },
};

export const views = {
    /// perms/perms: fetches and views perms
    perms: class Perms extends AbstractDataView {
        constructor () {
            super();
            store.subscribe(PERMS, this.#onUpdate);
            if (store.get(PERMS)) this.#onUpdate();
            else tasks.perms().catch(err => this.emit('error', err));
        }
        #onUpdate = () => this.emit('update', store.get(PERMS));
        drop () {
            store.unsubscribe(PERMS, this.#onUpdate);
        }
    },
};
