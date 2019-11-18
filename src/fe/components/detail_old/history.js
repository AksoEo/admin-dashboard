import { h } from 'preact';
import { useState, useEffect } from 'preact/compat';
import { Button, AppBarProxy, MenuIcon } from '@cpsdqs/yamdl';
import { CardStackItem } from '../card-stack';
import locale from '../../locale';

export default function FieldHistory ({ fields, locale: historyLocale, itemId, id, onClose, onFetchFieldHistory }) {
    const [currentId, setCurrentId] = useState(null);
    const [mods, setMods] = useState(null);
    const [error, setError] = useState(null);

    if (id && currentId !== id) {
        setCurrentId(id);
    }

    useEffect(() => {
        if (currentId) {
            onFetchFieldHistory(itemId, currentId).then(setMods).catch(err => {
                // TODO: handle error
                console.error('Failed to fetch field history', err); // eslint-disable-line no-console
                setMods([]);
                setError(err);
            });
        }
    }, [currentId]);

    const title = currentId && historyLocale.historyTitle(historyLocale.fields[currentId]);

    return (
        <CardStackItem
            open={!!id}
            onClose={onClose}
            depth={1}
            appBar={<AppBarProxy
                menu={<Button icon small onClick={onClose}><MenuIcon type="back" /></Button>}
                title={title}
                priority={13} />}>
            <div class="list-view-field-history">
                {error ? (
                    <div class="error-container">
                        {locale.listView.detail.history.error}
                    </div>
                ) : null}
            </div>
        </CardStackItem>
    );
}
