import { h } from 'preact';
import { useState, useEffect } from 'preact/compat';
import { Dialog } from 'yamdl';

export default function FieldHistory ({ fields, locale, itemId, id, onClose, onFetchFieldHistory }) {
    const [currentId, setCurrentId] = useState(null);
    const [mods, setMods] = useState(null);

    if (id && currentId !== id) {
        setCurrentId(id);
    }

    useEffect(() => {
        if (currentId) {
            onFetchFieldHistory(itemId, currentId).then(setMods).catch(err => {
                // TODO: handle error
                console.error('Failed to fetch field history', err); // eslint-disable-line no-console
                setMods([]);
            });
        }
    }, [currentId]);

    const title = currentId && locale.historyTitle(locale.fields[currentId]);

    return (
        <Dialog
            open={!!id}
            onClose={onClose}
            title={title}
            backdrop>

        </Dialog>
    );
}
