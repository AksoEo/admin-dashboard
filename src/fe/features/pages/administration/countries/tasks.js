import { h } from 'preact';
import { TextField } from 'yamdl';
import TaskDialog from '../../../../components/task-dialog';
import ChangedFields from '../../../../components/changed-fields';
import { Validator, Field } from '../../../../components/form';
import { routerContext } from '../../../../router';
import { countries as locale, countryGroups as groupsLocale, data as dataLocale } from '../../../../locale';

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

        // TODO: validators

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
                            <Validator
                                component={TextField}
                                validate={value => {
                                    if (!value.match(/^x[\w]{2}$/)) {
                                        throw { error: groupsLocale.create.invalidCode };
                                    }
                                }}
                                label={groupsLocale.fields.code}
                                value={fixCodeValue(task.parameters.code)}
                                onChange={e => task.update({ code: fixCodeValue(e.target.value) })} />
                        </Field>
                        <Field>
                            <Validator
                                component={TextField}
                                validate={value => {
                                    if (!value) throw { error: dataLocale.requiredField };
                                }}
                                label={groupsLocale.fields.name}
                                value={task.parameters.name || ''}
                                onChange={e => task.update({ name: e.target.value })} />
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
