import { h, Component } from 'preact';
import { TextField, AppBarProxy, Button, MenuIcon } from '@cpsdqs/yamdl';
import DoneIcon from '@material-ui/icons/Done';
import SavePerms from '../perms-editor/save';
import { adminGroups as locale } from '../../../../locale';
import { Field, Validator } from '../../../../components/form';
import TaskDialog from '../../../../components/task-dialog';
import ChangedFields from '../../../../components/changed-fields';
import { IdUEACode } from '../../../../components/data/uea-code';
import { apiKey } from '../../../../components/data';
import { routerContext } from '../../../../router';
import { ContextualAction } from '../../../../context-action';

export default {
    create ({ open, task }) {
        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={locale.add}
                        actionLabel={locale.addButton}
                        run={() => task.runOnce().then(id => {
                            routerContext.navigate(`/administrado/grupoj/${id}`);
                        })}>
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
                                onChange={e => task.update({ description: e.target.value })}
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
                title={locale.editGroup}
                actionLabel={locale.editUpdate}
                running={task.running}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields}
                    locale={locale.fields} />
            </TaskDialog>
        );
    },
    delete ({ open, task }) {
        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={locale.delete}
                        actionLabel={locale.deleteButton}
                        run={() => task.runOnce().then(() => {
                            routerContext.navigate('/administrado/grupoj');
                        })}>
                        {locale.deleteAreYouSure}
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },

    setPermissions ({ open, core, task }) {
        return (
            <SavePerms
                open={open}
                core={core}
                task={task}
                pxTask="adminGroups/setPermissionsPX"
                mrTask="adminGroups/setPermissionsMR" />
        );
    },
};
