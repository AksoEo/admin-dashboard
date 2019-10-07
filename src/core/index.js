import { insert, get, remove, TASKS, VIEWS } from './store';
import { tasks, views } from './paths';
import Task from './task';
import DataView from './view';
import './client';

/// Handlers for messages from the FE.
const messageHandlers = {
    'create-task' ({ id, task: taskPath, options, parameters = {} }) {
        if (get([TASKS, id])) {
            self.postMessage({ type: 'task-create-error', message: 'task ID is taken' });
            return;
        }

        console.debug(`[core] creating task ${id} with path ${taskPath}`);

        const task = new Task(id, taskPath, options, parameters);

        const loadTask = async () => {
            const path = taskPath.split('/');
            let o = tasks;
            for (let i = 0; i < path.length; i++) {
                const p = path[i];
                if (!(p in o)) throw { code: 'task-not-found', message: 'task does not exist' };
                o = o[p];
                if (o.isLazy) o = await o();
                if (i === path.length - 1) {
                    return o;
                }
            }
        };

        task.run = (...args) => loadTask().then(run => run(...args));

        insert([TASKS, id], task);
    },
    'update-task' ({ id, parameters }) {
        const task = get([TASKS, id]);
        if (task) {
            task.update(parameters);
            insert([TASKS, id], task); // trigger update
        } else {
            console.error(`[core] attempt to update nonexistent task with ID ${id}`);
        }
    },
    'run-task' ({ id }) {
        const task = get([TASKS, id]);
        if (task) {
            console.debug(`[core] running task ${id}`);
            task.$run();
            insert([TASKS, id], task); // trigger update
        } else {
            console.error(`[core] attempt to run nonexistent task with ID ${id}`);
        }
    },
    'drop-task' ({ id }) {
        const task = remove([TASKS, id]);
        if (task) {
            console.debug(`[core] dropping task ${id}`);
            task.drop();
        }
    },
    'create-data-view' ({ id, view: viewPath, options }) {
        if (get([VIEWS, id])) {
            self.postMessage({ type: 'data-view-create-error', message: 'view ID is taken' });
            return;
        }

        console.debug(`[core] creating view ${id} with path ${viewPath}`);

        const loadView = async () => {
            const path = viewPath.split('/');
            let o = views;
            for (let i = 0; i < path.length; i++) {
                const p = path[i];
                if (!(p in o)) throw { code: 'view-not-found', message: 'view does not exist' };
                o = o[p];
                if (o.isLazy) o = await o();
                if (i === path.length - 1) {
                    return o;
                }
            }
        };

        insert([VIEWS, id], new DataView(id, loadView(), options));
    },
    'drop-data-view' ({ id }) {
        const view = remove([VIEWS, id]);
        if (view) {
            console.debug(`[core] dropping view ${id}`);
            view.drop();
        }
    },
};

self.onmessage = ({ data }) => messageHandlers[data.type](data);
