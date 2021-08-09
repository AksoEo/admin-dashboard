import { h } from 'preact';
import { TextField } from 'yamdl';
import TaskDialog from '../../../../components/task-dialog';
import ChangedFields from '../../../../components/changed-fields';
import { Field } from '../../../../components/form';
import { countryLists as locale } from '../../../../locale';
import { routerContext } from '../../../../router';
import './tasks.less';

export default {
    createList: ({ open, task }) => {
        const dup = task.options._duplicate;

        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        class="country-org-lists-task-creeate-list"
                        open={open}
                        onClose={() => task.drop()}
                        title={dup ? locale.create.duplicateTitle : locale.create.title}
                        actionLabel={dup ? locale.create.duplicateButton : locale.create.button}
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
