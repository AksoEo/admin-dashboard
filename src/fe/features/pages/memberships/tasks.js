import { h } from 'preact';
import TaskDialog from '../../../components/task-dialog';
import { Field } from '../../../components/form';
import ChangedFields from '../../../components/changed-fields';
import { membershipCategories as categoriesLocale } from '../../../locale';
import { routerContext } from '../../../router';
import { FIELDS } from './categories/fields';

const CREATE_FIELDS = ['nameAbbrev', 'name'];

export default {
    createCategory ({ open, task }) {
        const fields = CREATE_FIELDS.map(id => {
            const Component = FIELDS[id].component;
            return (
                <Field key={id}>
                    <Component
                        slot="create"
                        editing value={task.parameters[id]}
                        onChange={value => task.update({ [id]: value })} />
                </Field>
            );
        });

        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={categoriesLocale.create.title}
                        actionLabel={categoriesLocale.create.button}
                        run={() => task.runOnce().then(id => {
                            routerContext.navigate(`/membreco/kategorioj/${id}`);
                        })}>
                        {fields}
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },
    updateCategory ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={categoriesLocale.update.title}
                actionLabel={categoriesLocale.update.button}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields}
                    locale={categoriesLocale.fields} />
            </TaskDialog>
        );
    },
    deleteCategory ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={categoriesLocale.delete.title}
                actionLabel={categoriesLocale.delete.button}
                run={() => task.runOnce()}>
                {categoriesLocale.delete.description}
            </TaskDialog>
        );
    },
};
