import { h } from 'preact';
import TaskDialog from './task-dialog';
import ChangedFields from './changed-fields';
import { Field } from '../form';
import { routerContext } from '../../router';
import './task-templates.less';

export function createDialog ({ locale, fieldNames, fields: fieldDefs, className, onCompletion }) {
    return ({ open, task }) => {
        if (task.options._noGUI) return null;

        const fields = fieldNames.map(id => {
            const def = fieldDefs[id];
            const Component = def.component;
            return (
                <Field key={id} data-field={id} validate={() => {
                    if (def.validate) return def.validate({
                        value: task.parameters[id],
                        item: task.parameters,
                    });
                }}>
                    {def.wantsCreationLabel && (
                        <label class="creation-label">
                            {locale.fields[id]}
                        </label>
                    )}
                    <Component
                        slot="create"
                        editing value={task.parameters[id]}
                        onChange={value => task.update({ [id]: value })}
                        item={task.parameters}
                        onItemChange={item => task.update(item)} />
                </Field>
            );
        });

        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        class={(className || '') + ' creation-task'}
                        open={open}
                        onClose={() => task.drop()}
                        title={locale.create.title}
                        actionLabel={locale.create.button}
                        run={() => task.runOnce().then(id => {
                            onCompletion(task, routerContext, id);
                        })}>
                        {locale.create.description ? (
                            <div class="creation-description">
                                {locale.create.description}
                            </div>
                        ) : null}
                        {fields}
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    };
}
export function updateDialog ({ locale, fields }) {
    return ({ open, task }) => {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.title}
                actionLabel={locale.button}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields}
                    locale={fields} />
            </TaskDialog>
        );
    };
}
export function deleteDialog ({ locale }) {
    return ({ open, task }) => {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.title}
                actionLabel={locale.button}
                run={() => task.runOnce()}>
                {locale.description}
            </TaskDialog>
        );
    };
}

