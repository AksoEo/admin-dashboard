import config from '../config.val';
import * as store from './store';
import { LOGGED_IN, IS_ADMIN, TOTP_REQUIRED, TOTP_SETUP_REQUIRED } from './paths/login-keys';

/// runs GET /auth
const getAuth = () => {
    // this does not use akso-client so we can run this while akso-client is still loading
    return fetch(config.host + '/auth', {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
        },
    }).then(res => {
        if (res.ok) {
            return res.json();
        } else if (res.status === 404) {
            return false;
        } else {
            throw new Error('unexpected response from /auth');
        }
    });
};

/// Initial GET /auth result (may be an error!)
export const initialAuth = getAuth();

store.insert(LOGGED_IN, null); // we don’t know the login state yet
initialAuth.then(auth => {
    if (auth) {
        store.insert(LOGGED_IN, true);
        store.insert(IS_ADMIN, auth.isAdmin);
        store.insert(TOTP_REQUIRED, (auth.isAdmin || auth.totpSetUp) && !auth.totpUsed);
        store.insert(TOTP_SETUP_REQUIRED, auth.isAdmin && !auth.totpSetUp);
    } else {
        store.insert(LOGGED_IN, false);
    }
});

const lazyUserClient = import('akso-client/src/user-client').then(res => res.default);
export default lazyUserClient.then(UserClient => {
    const client = new UserClient({ host: config.host });
    return initialAuth.then(auth => {
        if (auth) {
            client.loggedIn = true;
            client.totpRequired = auth.isAdmin || auth.totpSetUp;
            client.csrfToken = auth.csrfToken;
        }
        return client;
    }).catch(() => client); // probably an network error; just return the client and handle that issue later
});
