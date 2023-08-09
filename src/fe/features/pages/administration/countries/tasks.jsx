import { h } from 'preact';
import { TextField } from 'yamdl';
import TaskDialog from '../../../../components/tasks/task-dialog';
import ChangedFields from '../../../../components/tasks/changed-fields';
import { ValidatedTextField, Field } from '../../../../components/form';
import { routerContext } from '../../../../router';
import { countries as locale, countryGroups as groupsLocale } from '../../../../locale';

export default {
    update ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.update.title}
                actionLabel={locale.update.button}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields || []}
                    locale={locale.fields} />
            </TaskDialog>
        );
    },
    createGroup ({ open, task }) {
        const fixCodeValue = codeValue => {
            codeValue = codeValue || '';
            if (!codeValue.startsWith('x')) codeValue = 'x' + codeValue;
            codeValue = codeValue.toLowerCase().replace(/[^a-z0-9]/, '').substr(0, 3);
            return codeValue;
        };

        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={groupsLocale.create.title}
                        actionLabel={groupsLocale.create.button}
                        run={() => task.runOnce().then(() => {
                            routerContext.navigate(`/administrado/landaroj/${task.parameters.code}`);
                        })}>
                        <Field>
                            <ValidatedTextField
                                validate={value => {
                                    if (!value.match(/^x[a-z]{2}$/)) {
                                        return groupsLocale.create.invalidCode;
                                    }
                                }}
                                label={groupsLocale.fields.code}
                                value={fixCodeValue(task.parameters.code)}
                                onChange={v => task.update({ code: fixCodeValue(v) })} />
                        </Field>
                        <Field>
                            <TextField
                                required
                                label={groupsLocale.fields.name}
                                value={task.parameters.name || ''}
                                onChange={name => task.update({ name })} />
                        </Field>
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },
    updateGroup ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={groupsLocale.update.title}
                actionLabel={groupsLocale.update.button}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields || []}
                    locale={groupsLocale.fields} />
            </TaskDialog>
        );
    },
    deleteGroup ({ open, task }) {
        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={groupsLocale.delete.title}
                        actionLabel={groupsLocale.delete.button}
                        run={() => task.runOnce().then(() => {
                            routerContext.navigate(`/administrado/landaroj`);
                        })}>
                        {groupsLocale.delete.description}
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },
};
