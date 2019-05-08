// shared global akso instance

import { UserClient } from 'akso-client';
import EventEmitter from 'events';

const HOST = 'https://apitest.akso.org';

const instance = new UserClient({ host: HOST });
export default instance;
export const activeRequests = {};
export const activeRequestsEmitter = new EventEmitter();

function addActiveRequest (id) {
    activeRequests[id] = Date.now();
    activeRequestsEmitter.emit('update');
}

function removeActiveRequest (id) {
    delete activeRequests[id];
    activeRequestsEmitter.emit('update');
}

// proxy to keep track of requests
instance.req = function (...args) {
    const requestID = Math.random().toString(36);
    addActiveRequest(requestID);
    return UserClient.prototype.req.apply(instance, args).then(value => {
        removeActiveRequest(requestID);
        return value;
    }).catch(err => {
        removeActiveRequest(requestID);
        throw err;
    });
};
