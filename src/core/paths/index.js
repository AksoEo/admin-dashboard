import { createStoreObserver } from '../view';
import { TASKS } from '../store';

/// Turns a path lazy by making it a function that returns a promise with the actual object when
/// called.
///
/// - f: the () => import(...) closure
/// - map: maps on the result of f
const lazyPath = (f, map) => {
    let promise;
    function lazy () {
        if (!promise) {
            promise = f().then(map).catch(err => {
                promise = null;
                throw { type: 'chunk-load-failed', message: 'failed to load chunk: ' + err.toString() };
            });
        }
        return promise;
    }
    lazy.isLazy = true; // this marks the function as a lazy path instead of a regular object
    return lazy;
};
const mapTasks = res => res.tasks;
const mapViews = res => res.views;

const clients = () => import(/* webpackChunkName: 'core-clients', webpackPrefetch: true */ './clients');
const codeholders = () => import(/* webpackChunkName: 'core-codeholders', webpackPrefetch: true */ './codeholders');
const countries = () => import(/* webpackChunkName: 'core-countries', webpackPrefetch: true */ './countries');
const adminGroups = () => import(/* webpackChunkName: 'core-admin', webpackPrefetch: true */ './admin-groups');
const httpLog = () => import(/* webpackChunkName: 'core-admin', webpackPrefetch: true */ './http-log');
const login = () => import(/* webpackChunkName: 'core-login', webpackPrefetch: true */ './login');
const lists = () => import(/* webpackChunkName: 'core-lists', webpackPrefetch: true */ './lists');
const perms = () => import(/* webpackChunkName: 'core-login', webpackPrefetch: true */ './perms');
const memberships = () => import(/* webpackChunkName: 'core-memberships', webpackPrefetch: true */ './memberships');
const payments = () => import(/* webpackChunkName: 'core-payments', webpackPrefetch: true */ './payments');
const roles = () => import(/* webpackChunkName: 'core-codeholders', webpackPrefetch: true */ './roles');
const queries = () => import(/* webpackChunkName: 'core-queries', webpackPrefetch: true */ './queries');
const tasks_ = () => import(/* webpackChunkName: 'core-tasks', webpackPrefetch: true */ './tasks');
const votes = () => import(/* webpackChunkName: 'core-votes', webpackPrefetch: true */ './votes');
const debug = () => import(/* webpackChunkName: 'core-debug' */ './debug');

/// Task definitions.
export const tasks = {
    // generic tasks for generic dialogs, which will be dropped as soon as they’re run
    /// info: takes title and message options (strings probably)
    info: async () => {},

    clients: lazyPath(clients, mapTasks),
    codeholders: lazyPath(codeholders, mapTasks),
    countries: lazyPath(countries, mapTasks),
    adminGroups: lazyPath(adminGroups, mapTasks),
    httpLog: lazyPath(httpLog, mapTasks),
    login: lazyPath(login, mapTasks),
    lists: lazyPath(lists, mapTasks),
    queries: lazyPath(queries, mapTasks),
    perms: lazyPath(perms, mapTasks),
    payments: lazyPath(payments, mapTasks),
    tasks: lazyPath(tasks_, mapTasks),
    votes: lazyPath(votes, mapTasks),
    debug: lazyPath(debug, mapTasks),
};

/// View definitions.
export const views = {
    clients: lazyPath(clients, mapViews),
    codeholders: lazyPath(codeholders, mapViews),
    countries: lazyPath(countries, mapViews),
    adminGroups: lazyPath(adminGroups, mapViews),
    httpLog: lazyPath(httpLog, mapViews),
    login: lazyPath(login, mapViews),
    lists: lazyPath(lists, mapViews),
    memberships: lazyPath(memberships, mapViews),
    roles: lazyPath(roles, mapViews),
    perms: lazyPath(perms, mapViews),
    payments: lazyPath(payments, mapViews),
    tasks: lazyPath(tasks_, mapViews),
    votes: lazyPath(votes, mapViews),
    debug: lazyPath(debug, mapViews),

    /// #tasks: a map of all current tasks to their paths; used for task views in the FE
    [TASKS]: createStoreObserver([TASKS], tasks => {
        const data = {};
        for (const id in tasks) {
            data[id] = tasks[id].path;
        }
        return data;
    }),
};
