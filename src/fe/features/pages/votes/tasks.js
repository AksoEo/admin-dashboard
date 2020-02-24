import { h } from 'preact';
import TaskDialog from '../../../components/task-dialog';
import ChangedFields from '../../../components/changed-fields';
import { votes as locale } from '../../../locale';
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
                actionLabel={locale.delete.button}>
                {locale.delete.description}
            </TaskDialog>
        );
    },
};
