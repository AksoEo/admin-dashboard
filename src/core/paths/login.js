import asyncClient from '../client';
import * as store from '../store';
import { LOGIN, LOGGED_IN, IS_ADMIN, TOTP_REQUIRED, TOTP_SETUP_REQUIRED } from './login-keys';
import { createStoreObserver } from '../view';

export const tasks = {
    /// login/login: performs login
    login: async (_, { login, password }) => {
        const client = await asyncClient;
        if (client.loggedIn) {
            throw { code: 'already-logged-in', message: 'already logged in' };
        }
        const result = await client.logIn(login, password);

        store.insert(LOGGED_IN, true);
        store.insert(IS_ADMIN, result.isAdmin);
        if (client.totpRequired) {
            store.insert(TOTP_REQUIRED, client.totpRequired && !result.totpUsed);
            store.insert(TOTP_SETUP_REQUIRED, result.isAdmin && !result.totpSetUp);
        }

        return result;
    },
    /// login/logOut: logs the user out and purges the data store to get rid of PII and sensitive
    /// data (though it should be noted that this is by no means secure)
    logOut: async () => {
        const client = await asyncClient;
        if (!client.loggedIn) {
            throw { code: 'not-logged-in', message: 'not logged in' };
        }
        await client.logOut();
        store.purge();
        store.insert(LOGGED_IN, false);
    },
};

/// login: observes the entire login data store (it’s constant-sized that so this is fine)
export const views = createStoreObserver([LOGIN]);
