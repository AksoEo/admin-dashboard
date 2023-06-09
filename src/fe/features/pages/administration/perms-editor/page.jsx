import { h } from 'preact';
import { useEffect, useState } from 'preact/compat';
import { AppBarProxy, Button, MenuIcon, CircularProgress } from 'yamdl';
import PermsEditor from './editor';
import DoneIcon from '@material-ui/icons/Done';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import Meta from '../../../meta';
import DisplayError from '../../../../components/utils/error';
import './page.less';

export default function PermsEditorPage ({ loading, error, perms, save, title, ...extra }) {
    const [history, setHistory] = useState([]);
    const [historyCursor, setHistoryCursor] = useState(0);

    useEffect(() => {
        // reset when upstream changes
        setHistory([perms]);
        setHistoryCursor(0);
    }, [perms]);

    const currentEdit = history[historyCursor] || perms;

    const undo = () => {
        if (historyCursor === 0) return;
        setHistoryCursor(historyCursor - 1);
    };
    const redo = () => {
        if (historyCursor >= history.length - 1) return;
        setHistoryCursor(historyCursor + 1);
    };
    const pushChange = (perms) => {
        setHistory(history.concat([perms]));
        setHistoryCursor(historyCursor + 1);
    };

    const doSave = () => {
        save(currentEdit);
    };

    const isEdited = historyCursor > 0;

    let permsEditor;
    if (loading) {
        permsEditor = (
            <div class="loading-container"><CircularProgress indeterminate /></div>
        );
    } else if (error) {
        permsEditor = (
            <DisplayError error={error} />
        );
    } else if (perms) {
        permsEditor = (
            <PermsEditor
                {...extra}
                value={currentEdit}
                onChange={pushChange} />
        );
    }

    return (
        <div class="perms-editor-page">
            <Meta title={title} />
            <AppBarProxy
                class="perms-editor-app-bar"
                priority={isEdited ? 9 : -Infinity}
                menu={(
                    <Button small icon onClick={() => {
                        if (isEdited) {
                            setHistory([perms]);
                            setHistoryCursor(0);
                        } else this.props.pop();
                    }}>
                        <MenuIcon type="close" />
                    </Button>
                )}
                title={title}
                actions={[
                    { icon: <UndoIcon />, action: undo },
                    { icon: <RedoIcon />, action: redo },
                    { icon: <DoneIcon />, action: doSave },
                ]} />
            {permsEditor}
        </div>
    );
}
