import { AbstractDataView } from '../view';
import asyncClient from '../client';
import * as log from '../log';
import * as store from '../store';

/// Data store path.
export const ROLES = 'codeholder_roles';
export const ROLES_P = [ROLES];

/// Loads all roles because there won’t be too many for that to be a problem
async function loadAllRoles () {
    if (store.get(ROLES_P)) return;

    const client = await asyncClient;
    let total = Infinity;
    const items = [];
    while (total > items.length) {
        const res = await client.get('/codeholder_roles', {
            offset: items.length,
            limit: 100,
            fields: [
                'id',
                'name',
                'description',
            ],
        });
        total = +res.res.headers.get('x-total-items');
        items.push(...res.body);

        if (res.body.length === 0) {
            log.error(
                `failed loading roles: we currently have ${items.length}`
                + ` and server reported total count ${total} but unexpectedly returned zero items;`
                + ` aborting and returning partial result`,
            );
            break;
        }
    }

    const roles = {};
    for (const item of items) {
        roles[item.id] = item;
    }

    store.insert(ROLES_P, roles);
}

export const views = {
    /// roles/roles: a view of all roles
    roles: class Roles extends AbstractDataView {
        constructor () {
            super();

            store.subscribe(ROLES_P, this.#onUpdate);
            if (store.get(ROLES_P)) this.#onUpdate();

            loadAllRoles().catch(err => this.emit('error', err));
        }

        #onUpdate = () => this.emit('update', store.get(ROLES_P));

        drop () {
            store.unsubscribe(ROLES_P, this.#onUpdate);
        }
    },
};
