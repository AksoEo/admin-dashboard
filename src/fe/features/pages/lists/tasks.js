import { h } from 'preact';
import { TextField } from 'yamdl';
import TaskDialog from '../../../components/task-dialog';
import { Field, Validator } from '../../../components/form';
import { lists as locale } from '../../../locale';
import { routerContext } from '../../../router';
import './tasks.less';

export default {
    create ({ open, task }) {
        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        class="lists-task-create"
                        open={open}
                        onClose={() => task.drop()}
                        title={locale.create.title}
                        actionLabel={locale.create.button}
                        run={() => task.runOnce().then(id => {
                            routerContext.navigate(`/listoj/${id}`);
                        })}>
                        <p>
                            {locale.create.warning}
                        </p>
                        <Field>
                            <Validator
                                outline
                                component={TextField}
                                label={locale.fields.name}
                                value={task.parameters.name || ''}
                                onChange={e => task.update({ name: e.target.value })}
                                validate={name => {
                                    if (!name) throw { error: locale.nameRequired };
                                }} />
                        </Field>
                        <Field>
                            <Validator
                                outline
                                component={TextField}
                                label={locale.fields.description}
                                value={task.parameters.description || ''}
                                onChange={e => task.update({ description: e.target.value || null })}
                                validate={() => {}} />
                        </Field>
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },
    update ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.update.title}
                actionLabel={locale.update.button}
                run={() => task.runOnce()}>
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
};
