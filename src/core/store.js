//! Global data store.

const UpdateType = {
    UPDATE: 'update',
    DELETE: 'delete',
};

/// The data store object.
const dataStore = {};

/// Subscribers to data store scopes: Map<subscriber key => Set<fn(UpdateType) -> ()>>
const subscribers = new Map();

const toSubscriberKey = path => path.join('~');

/// Because multiple objects in the data store are often modified at the same time, updates are
/// batched to avoid unnecessary IPC.
const batchedUpdates = new Map();
let updateBatchTimeout;

/// Emits an update at the specified path.
function emitUpdate (path, type = UpdateType.UPDATE) {
    const key = toSubscriberKey(path);
    // override the previous batched update. this is fine because
    // - if it was UPDATE and now it’s UPDATE, ... that’s why we have this thing
    // - if it was DELETE and now it’s UPDATE, this means it’s been recreated so we can pretend
    //   it was never deleted
    // - if it was UPDATE and now it’s DELETE, all previous updates are irrelevant because it’s gone
    batchedUpdates.set(key, type);
    if (updateBatchTimeout) return; // already scheduled an update
    updateBatchTimeout = setTimeout(() => {
        // drain updates and dispatch to subscribers
        for (const [key, type] of batchedUpdates) {
            for (const sub of (subscribers.get(key) || [])) {
                sub(type);
            }
        }
        batchedUpdates.clear();
        updateBatchTimeout = null;
    }, 16);
}

/// Inserts a value at the given path. Will act like mkdir -p and create all intermediate objects.
///
/// Under assumption that the data store is mostly additive, this doesn’t emit updates for any
/// subpaths that might have been deleted or something due to the new value not including them
/// anymore.
export function insert (path, value) {
    let o = dataStore;
    for (const i of path.slice(0, path.length - 1)) {
        if (!(i in o)) o[i] = {};
        o = o[i];
    }

    o[path[path.length - 1]] = value;

    for (let i = 1; i <= path.length; i++) {
        emitUpdate(path.slice(0, i));
    }
}

/// Returns a value if it exists. Returns undefined otherwise.
export function get (path) {
    let o = dataStore;
    for (const i of path.slice(0, path.length - 1)) {
        if (!(i in o)) return undefined;
        o = o[i];
    }

    return o[path[path.length - 1]];
}

/// Removes a value (if it exists) and returns it (or undefined otherwise).
///
/// Under assumption that the data store is mostly additive, this doesn’t emit updates for any
/// subpaths.
export function remove (path) {
    let o = dataStore;
    for (const i of path.slice(0, path.length - 1)) {
        if (!(i in o)) return;
        o = o[i];
    }

    const value = o[path[path.length - 1]];
    delete o[path[path.length - 1]];

    for (let i = 1; i <= path.length; i++) {
        emitUpdate(path.slice(0, i), UpdateType.DELETE);
    }

    return value;
}

/// Purges the entire data store.
export function purge () {
    for (const k in dataStore) {
        remove([k]);
    }
}

/// Subscribes to a scope in the data store.
export function subscribe (path, callback) {
    const key = toSubscriberKey(path);
    if (!subscribers.has(key)) subscribers.set(key, new Set());
    subscribers.get(key).add(callback);
}

/// Removes a subscription.
export function unsubscribe (path, callback) {
    const key = toSubscriberKey(path);
    if (!subscribers.has(key)) return;
    subscribers.get(key).delete(callback);
}

/// The data store path for tasks.
export const TASKS = '#tasks';
/// The data store path for views.
export const VIEWS = '#views';