import { useContext, useEffect, useRef, useState } from 'preact/compat';
import { coreContext } from './connection';
import DataView from './view';
import Task from './task';
import Worker from './worker';
import { deepEq } from '../../util';

export { DataView, Task, Worker };

/**
 * React Hook for using data from a data view.
 *
 * - path: data view path
 * - options: data view options (will be deep-compared for changes)
 *
 * Returns [loading, error, data]
 */
export function useDataView (path, options) {
    const core = useContext(coreContext);
    const prevOptions = useRef(null);
    const dataView = useRef(null);

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const optionsChangeId = useRef(0);
    const optionsDidChange = options !== prevOptions.current
        && !deepEq(options, prevOptions.current);
    prevOptions.current = options;

    if (optionsDidChange) {
        optionsChangeId.current++;
    }

    useEffect(() => {
        if (!dataView.current || optionsDidChange) {
            if (dataView.current) dataView.current.drop();
            const view = dataView.current = core.createDataView(path, options);
            setLoading(true);

            view.on('update', data => {
                setLoading(false);
                setData(data);
            });
            view.on('error', err => {
                setLoading(false);
                setError(err);
            });
        }

        return () => {
            dataView.current?.drop();
            dataView.current = null;
        };
    }, [path, optionsChangeId]);

    return [loading, error, data];
}
