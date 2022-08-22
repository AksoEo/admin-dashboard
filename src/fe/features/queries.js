//! Task views for queries.
import { h } from 'preact';
import { TextField } from 'yamdl';
import TaskDialog from '../components/tasks/task-dialog';
import { Field } from '../components/form';
import { search as locale } from '../locale';
import './queries.less';

function makeQuerySaveDialog (type) {
    return ({ task, open }) => {
        return (
            <TaskDialog
                class="queries-task-update"
                open={open}
                onClose={() => task.drop()}
                title={type === 'add' ? locale.addFilterTitle : locale.saveFilterTitle}
                actionLabel={locale.saveFilter}
                running={task.running}
                run={() => task.runOnce()}>
                <Field>
                    <TextField
                        outline
                        required
                        class="form-field text-field"
                        label={locale.savedFilterName}
                        value={task.parameters.name}
                        onChange={e => task.update({ name: e.target.value })} />
                </Field>
                <Field>
                    <TextField
                        outline
                        class="form-field text-field"
                        label={locale.savedFilterDesc}
                        value={task.parameters.description}
                        onChange={e => task.update({ description: e.target.value })} />
                </Field>
            </TaskDialog>
        );
    };
}

export default {
    add: makeQuerySaveDialog('add'),
    update: makeQuerySaveDialog('update'),
};
