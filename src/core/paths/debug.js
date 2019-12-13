import asyncClient from '../client';
import * as store from '../store';
import { AbstractDataView } from '../view';

export const tasks = {
    request: async ({ method, endpoint, options, body }) => {
        const res = await (await asyncClient)[method](endpoint, options, body);

        return {
            body: res.body,
            headers: Object.fromEntries(res.res.headers.entries()),
            resTime: res.resTime,
            ok: res.ok,
            bodyOk: res.bodyOk,
            status: res.res.status,
        };
    },
};

export const views = {
    store: class StoreView extends AbstractDataView {
        constructor ({ path }) {
            super();
            this.path = path;
            store.subscribe(path, this.#onUpdate);
            if (store.get(path)) this.#onUpdate();
        }
        #onUpdate = () => this.emit('update', store.get(this.path));
        drop () {
            store.unsubscribe(this.path, this.#onUpdate);
        }
    },
};
