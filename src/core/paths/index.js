import { createStoreObserver } from '../view';

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
    lazy.isLazy = true;
    return lazy;
};
const mapTasks = res => res.tasks;
const mapViews = res => res.views;

const codeholders = () => import(/* webpackChunkName: 'core-codeholders', webpackPrefetch: true */ './codeholders');
const countries = () => import(/* webpackChunkName: 'core-countries', webpackPrefetch: true */ './countries');
const login = () => import(/* webpackChunkName: 'core-login', webpackPrefetch: true */ './login');
const memberships = () => import(/* webpackChunkName: 'core-memberships', webpackPrefetch: true */ './memberships');
const queries = () => import(/* webpackChunkName: 'core-queries', webpackPrefetch: true */ './queries');

/// Task definitions.
export const tasks = {
    // generic tasks for generic dialogs, which will be dropped as soon as they’re run
    /// info: takes title and message options (strings probably)
    info: async () => {},

    codeholders: lazyPath(codeholders, mapTasks),
    login: lazyPath(login, mapTasks),
    queries: lazyPath(queries, mapTasks),
};

/// View definitions.
export const views = {
    codeholders: lazyPath(codeholders, mapViews),
    countries: lazyPath(countries, mapViews),
    login: lazyPath(login, mapViews),
    memberships: lazyPath(memberships, mapViews),

    '#tasks': createStoreObserver(['#tasks'], tasks => {
        const data = {};
        for (const id in tasks) {
            data[id] = tasks[id].path;
        }
        return data;
    }),
};
