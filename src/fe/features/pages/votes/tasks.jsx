import { h } from 'preact';
import { CircularProgress } from 'yamdl';
import TaskDialog from '../../../components/tasks/task-dialog';
import ChangedFields from '../../../components/tasks/changed-fields';
import { useDataView } from '../../../core';
import { votes as locale, notifTemplates as notifLocale } from '../../../locale';
import makeCreateTask from './tasks-create';
import './tasks.less';

export default {
    create: makeCreateTask(false),
    update ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.update.title}
                actionLabel={locale.update.button}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields}
                    locale={locale.fields} />
            </TaskDialog>
        );
    },
    delete ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.delete.title}
                actionLabel={locale.delete.button}
                run={() => task.runOnce()}>
                {locale.delete.description}
            </TaskDialog>
        );
    },
    createTemplate: makeCreateTask(true),
    updateTemplate ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.update.templateTitle}
                actionLabel={locale.update.button}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields}
                    locale={locale.fields} />
            </TaskDialog>
        );
    },
    deleteTemplate ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.delete.templateTitle}
                actionLabel={locale.delete.button}
                run={() => task.runOnce()}>
                {locale.delete.templateDescription}
            </TaskDialog>
        );
    },

    sendCastBallotNotif ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={notifLocale.send.send.title}
                actionLabel={notifLocale.send.send.confirm}
                run={() => task.runOnce()}>
                <NotifTemplateMessage vote={task.options.id} />
            </TaskDialog>
        );
    },
};

function NotifTemplateMessage ({ vote }) {
    const [loading, error, stats] = useDataView('votes/stats', { id: vote });

    if (loading) {
        return <CircularProgress small indeterminate />;
    } else if (stats) {
        return locale.sendCastBallotNotifMessage(stats.numVoters - stats.numBallots);
    }

    return null;
}
