import { AbstractDataView } from '../view';
import asyncClient from '../client';
import * as log from '../log';
import * as store from '../store';

export const MEMBERSHIPS = 'memberships';
export const MEMBERSHIP_CATEGORIES = [MEMBERSHIPS, 'categories'];

async function loadAllMembershipCategories () {
    if (store.get(MEMBERSHIP_CATEGORIES)) return;

    const client = await asyncClient;
    let total = Infinity;
    const items = [];
    while (total > items.length) {
        const res = await client.get('/membership_categories', {
            offset: items.length,
            limit: 100,
            fields: [
                'id',
                'nameAbbrev',
                'name',
                'description',
                'givesMembership',
                'lifetime',
                'availableFrom',
                'availableTo',
            ],
        });
        total = +res.res.headers.get('x-total-items');
        items.push(...res.body);

        if (res.body.length === 0) {
            log.error(
                `failed loading membership categories: we currently have ${items.length}`
                + ` and server reported total count ${total} but unexpectedly returned zero items;`
                + ` aborting and returning partial result`,
            );
            break;
        }
    }

    const categories = {};
    for (const item of items) {
        categories[item.id] = item;
    }

    store.insert(MEMBERSHIP_CATEGORIES, categories);
}

export const views = {
    categories: class Categories extends AbstractDataView {
        constructor () {
            super();

            store.subscribe(MEMBERSHIP_CATEGORIES, this.#onUpdate);
            if (store.get(MEMBERSHIP_CATEGORIES)) this.#onUpdate();

            loadAllMembershipCategories().catch(err => this.emit('error', err));
        }

        #onUpdate = () => this.emit('update', store.get(MEMBERSHIP_CATEGORIES));

        drop () {
            store.unsubscribe(MEMBERSHIP_CATEGORIES, this.#onUpdate);
        }
    },
};
