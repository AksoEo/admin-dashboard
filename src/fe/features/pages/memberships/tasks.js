import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import TaskDialog from '../../../components/task-dialog';
import { Field } from '../../../components/form';
import ChangedFields from '../../../components/changed-fields';
import {
    membershipCategories as categoriesLocale,
    membershipOptions as optionsLocale,
    membershipEntries as entriesLocale,
} from '../../../locale';
import { routerContext } from '../../../router';
import { FIELDS as CATEGORY_FIELDS } from './categories/fields';

const CATEGORY_CREATE_FIELDS = ['nameAbbrev', 'name'];

export default {
    createCategory ({ open, task }) {
        const fields = CATEGORY_CREATE_FIELDS.map(id => {
            const Component = CATEGORY_FIELDS[id].component;
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

    createOptions ({ open, task }) {
        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={optionsLocale.create.title}
                        actionLabel={optionsLocale.create.button}
                        run={() => task.runOnce().then(id => {
                            routerContext.navigate(`/membreco/agordoj/${id}/redakti`);
                        })}>
                        <TextField
                            outline
                            label={optionsLocale.create.year}
                            value={task.parameters.year}
                            onChange={e => task.update({ year: e.target.value })} />
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },
    updateOptions ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={optionsLocale.update.title}
                actionLabel={optionsLocale.update.button}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields}
                    locale={optionsLocale.fields} />
            </TaskDialog>
        );
    },
    deleteOptions ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={optionsLocale.delete.title}
                actionLabel={optionsLocale.delete.button}
                run={() => task.runOnce()}>
                {optionsLocale.delete.description}
            </TaskDialog>
        );
    },

    updateEntry ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={entriesLocale.update.title}
                actionLabel={entriesLocale.update.button}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields}
                    locale={entriesLocale.fields} />
            </TaskDialog>
        );
    },
    deleteEntry ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={entriesLocale.delete.title}
                actionLabel={entriesLocale.delete.button}
                run={() => task.runOnce()}>
                {entriesLocale.delete.description}
            </TaskDialog>
        );
    },
};
