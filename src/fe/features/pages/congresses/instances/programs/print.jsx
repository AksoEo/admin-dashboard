import { h, render } from 'preact';
import { useContext, useEffect, useState } from 'preact/compat';
import { Button,  CircularProgress } from 'yamdl';
import DialogSheet from '../../../../../components/tasks/dialog-sheet';
import { congressPrograms as locale } from '../../../../../locale';
import SearchFilters from '../../../../../components/overview/search-filters';
import DisplayError from '../../../../../components/utils/error';
import { coreContext } from '../../../../../core/connection';
import { FILTERS } from './filters';
import { layoutByColumns } from './timeline';
import printStyles from './print.noextract.css';
import './print.less';

export default function PrintProgram ({
    congress,
    instance,
    tz,
    open,
    onClose,
}) {
    const [params, setParams] = useState({});

    return (
        <DialogSheet
            class="congress-program-print-dialog"
            open={open}
            onClose={onClose}
            title={locale.print.dialog.title}>
            <SearchFilters
                expanded
                value={params}
                onChange={setParams}
                filters={FILTERS}
                locale={locale.search}
                userData={{ congress, instance, tz }} />
            <LoadPrograms
                congress={congress}
                instance={instance}
                tz={tz}
                params={params} />
        </DialogSheet>
    );
}

function LoadPrograms ({ congress, instance, tz, params }) {
    const core = useContext(coreContext);
    const [loading, setLoading] = useState(false);
    const [loadedPercent, setLoadedPercent] = useState(0);
    const [loaded, setLoaded] = useState(null);
    const [error, setError] = useState(null);

    const load = () => {
        const loadingParams = params;
        setLoading(true);
        setError(null);

        const gen = loadAllPrograms(core, congress, instance, params);

        (async () => {
            setLoadedPercent(0);

            let result;
            for await (const [res, p] of gen) {
                if (loadingParams !== params) return;
                result = res;
                setLoadedPercent(p);
            }
            return result;
        })().then(res => {
            if (!res || loadingParams !== params) return;
            setLoading(false);
            setLoaded(res);
        }).catch(err => {
            if (loadingParams !== params) return;
            setLoading(false);
            setLoaded(null);
            setError(err);
        });
    };

    useEffect(() => {
        setLoaded(null);
    }, [params]);

    const print = () => {
        const printWindow = window.open('', 'congressProgramPrintout');
        if (!printWindow) {
            this.context.createTask('info', {
                message: locale.print.failedToOpenPrintWindow,
            });
            return;
        }
        render(
            <coreContext.Provider value={core}>
                <PrintAction window={printWindow} />
                <PrintPrograms data={loaded} tz={tz} />
                <style>{printStyles}</style>
            </coreContext.Provider>,
            printWindow.document.body,
        );
    };

    if (loaded) {
        return (
            <div>
                <Button raised onClick={print}>
                    <span />
                    <span class="button-inner-label">
                        {locale.print.dialog.print}
                    </span>
                </Button>
            </div>
        );
    }

    return (
        <div>
            <Button raised class="print-load-button" onClick={load} disabled={loading}>
                {loading ? (
                    <span class="button-inner-progress">
                        <CircularProgress small value={loadedPercent} indeterminate={!loadedPercent} />
                    </span>
                ) : <span />}
                <span class="button-inner-label">
                    {locale.print.dialog.load}
                </span>
            </Button>
            {error && (
                <DisplayError error={error} />
            )}
        </div>
    );
}

async function* loadAllPrograms (core, congress, instance, params) {
    const items = [];
    const locationIdsToLoad = [];

    while (true) { // eslint-disable-line no-constant-condition
        const res = await core.createTask('congresses/listPrograms', {
            congress, instance,
        }, {
            offset: items.length,
            limit: 100,
            filters: params.filters,
            fields: [{ id: 'timeFrom', sorting: 'asc' }],
        }).runOnceAndDrop();

        for (const id of res.items) {
            const data = await core.viewData('congresses/program', { congress, instance, id });
            items.push(data);

            if (data.location && !locationIdsToLoad.includes(data.location)) {
                locationIdsToLoad.push(data.location);
            }
        }

        yield [null, items.length / res.total / 2];

        if (!res.items.length || items.length >= res.total) {
            break;
        }
    }

    const locations = {};
    for (let i = 0; i < locationIdsToLoad.length; i += 100) {
        const batch = locationIdsToLoad.slice(i, i + 100);

        const res = await core.createTask('congresses/listLocations', {
            congress, instance,
        }, {
            offset: 0,
            limit: batch.length,
            jsonFilter: {
                filter: { id: { $in: batch } },
            },
        }).runOnceAndDrop();

        for (const id of res.items) {
            const data = await core.viewData('congresses/location', { congress, instance, id });
            locations[id] = data;
        }

        yield [null, 0.5 + (i + batch.length) / locationIdsToLoad.length / 2];
    }

    yield [{ items, locations }, 1];
}

function PrintAction ({ window }) {
    useEffect(() => {
        window.print();
    }, []);

    return (
        <div class="print-action-container">
            <button onClick={() => window.print()}>{locale.print.print}</button>
        </div>
    );
}


function PrintPrograms ({ data, tz }) {
    const byId = new Map();
    for (const item of data.items) {
        byId.set(item.id, item);
    }

    const layout = layoutByColumns(data.items.map(x => x.id), id => {
        const item = byId.get(id);
        return {
            start: item.timeFrom,
            end: item.timeTo,
            location: item.location,
        };
    });

    return (
        <div>
            todo
        </div>
    );
}
