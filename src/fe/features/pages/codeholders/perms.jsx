import { h } from 'preact';
import { AppBarProxy, Button, MenuIcon, CircularProgress } from 'yamdl';
import PermsEditor from '../administration/perms-editor';
import DoneIcon from '@material-ui/icons/Done';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import Meta from '../../meta';
import { codeholders as locale } from '../../../locale';
import { coreContext } from '../../../core/connection';
import { usePerms } from '../../../perms';
import { useDataView } from '../../../core';
import { useContext, useEffect, useState } from 'preact/compat';
import DisplayError from '../../../components/utils/error';
import './perms.less';

export default function CodeholderPermsEditor ({ matches }) {
    const codeholder = +matches.codeholder[1];

    const userPerms = usePerms();
    const core = useContext(coreContext);
    const [loading, error, codeholderPerms] = useDataView('codeholders/permissions', { id: codeholder });

    const [history, setHistory] = useState([]);
    const [historyCursor, setHistoryCursor] = useState(0);

    useEffect(() => {
        // reset when upstream changes
        setHistory([codeholderPerms]);
        setHistoryCursor(0);
    }, [codeholderPerms]);

    const currentEdit = history[historyCursor] || codeholderPerms;

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

    const save = () => {
        core.createTask('codeholders/setPermissions', {
            id: codeholder,
        }, {
            permissions: currentEdit,
            original: codeholderPerms,
        });
    };

    const isEdited = historyCursor > 0;
    const isEditable = userPerms.hasPerm('codeholders.perms.update');

    let permsEditor;
    if (loading) {
        permsEditor = (
            <div class="loading-container"><CircularProgress indeterminate /></div>
        );
    } else if (error) {
        permsEditor = (
            <DisplayError error={error} />
        );
    } else if (codeholderPerms) {
        permsEditor = (
            <PermsEditor
                editable={isEditable}
                value={currentEdit}
                onChange={pushChange} />
        );
    }

    return (
        <div class="codeholders-perms-editor">
            <Meta title={locale.perms.title} />
            <AppBarProxy
                class="perms-editor-app-bar"
                priority={isEdited ? 9 : -Infinity}
                menu={(
                    <Button small icon onClick={() => {
                        if (isEdited) {
                            setHistory([codeholderPerms]);
                            setHistoryCursor(0);
                        } else this.props.pop();
                    }}>
                        <MenuIcon type="close" />
                    </Button>
                )}
                title={locale.perms.title}
                actions={[
                    { icon: <UndoIcon />, action: undo },
                    { icon: <RedoIcon />, action: redo },
                    { icon: <DoneIcon />, action: save },
                ]} />
            {permsEditor}
        </div>
    );
}
