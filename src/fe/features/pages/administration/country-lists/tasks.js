import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import TaskDialog from '../../../../components/task-dialog';
import ChangedFields from '../../../../components/changed-fields';
import { Field } from '../../../../components/form';
import { countryLists as locale } from '../../../../locale';
import { routerContext } from '../../../../router';

export default {
    createList: ({ open, task }) => {
        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={locale.create.title}
                        actionLabel={locale.create.button}
                        run={() => task.runOnce().then(id => {
                            routerContext.navigate(`/administrado/landaj-organizoj/${id}`);
                        })}>
                        <Field>
                            <TextField
                                outline
                                label={locale.fields.name}
                                value={task.parameters.name}
                                onChange={e => task.update({ name: e.target.value })} />
                        </Field>
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },
    updateList: ({ open, task }) => {
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
    deleteList: ({ open, task }) => {
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
};
