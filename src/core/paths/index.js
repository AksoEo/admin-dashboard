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

const codeholders = () => import(/* webpackChunkName: 'core-codeholders' */ './codeholders');
const login = () => import(/* webpackChunkName: 'core-login' */ './login');

/// Task definitions.
export const tasks = {
    codeholders: lazyPath(codeholders, mapTasks),
    login: lazyPath(login, mapTasks),
};

/// View definitions.
export const views = {
    login: lazyPath(login, mapViews),

    '#tasks': createStoreObserver(['#tasks'], tasks => {
        const data = {};
        for (const id in tasks) {
            data[id] = tasks[id].path;
        }
        return data;
    }),
};
