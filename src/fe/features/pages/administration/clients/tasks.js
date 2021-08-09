import { h } from 'preact';
import { TextField } from 'yamdl';
import TaskDialog from '../../../../components/task-dialog';
import SavePerms from '../perms-editor/save';
import ChangedFields from '../../../../components/changed-fields';
import { Validator } from '../../../../components/form';
import { clients as locale } from '../../../../locale';
import { routerContext } from '../../../../router';
import './tasks.less';

export default {
    create ({ open, core, task }) {
        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={locale.add}
                        actionLabel={locale.addButton}
                        run={() => task.runOnce().then(({ id, secret }) => {
                            routerContext.navigate(`/administrado/klientoj/${id}`);
                            core.createTask('clients/_createdSecret', {
                                secret,
                            });
                        })}>
                        <Validator
                            component={TextField}
                            label={locale.fields.name}
                            value={task.parameters.name || ''}
                            onChange={e => task.update({ name: e.target.value })}
                            validate={name => {
                                if (!name) throw { error: locale.nameRequired };
                            }} />
                        <Validator
                            component={TextField}
                            label={locale.fields.ownerName}
                            value={task.parameters.ownerName || ''}
                            onChange={e => task.update({ ownerName: e.target.value })}
                            validate={name => {
                                if (!name) throw { error: locale.ownerNameRequired };
                            }} />
                        <Validator
                            component={TextField}
                            label={locale.fields.ownerEmail}
                            value={task.parameters.ownerEmail || ''}
                            onChange={e => task.update({ ownerEmail: e.target.value })}
                            validate={email => {
                                if (!email) throw { error: locale.ownerEmailRequired };
                            }} />
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },
    _createdSecret ({ open, task }) {
        return (
            <TaskDialog
                class="admin-client-secret-dialog"
                open={open}
                onClose={() => {}} // prevent accidental closing
                title={locale.secret.title}
                actionLabel={locale.secret.done}
                run={() => task.runOnce()}>
                <p class="secret-api-key-description">
                    {locale.secret.description}
                </p>
                <textarea
                    readOnly
                    class="secret-api-key-container"
                    value={task.options ? task.options.secret : '???'} />
            </TaskDialog>
        );
    },
    update ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.update}
                actionLabel={locale.updateButton}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields}
                    locale={locale.fields} />
            </TaskDialog>
        );
    },
    delete ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.delete}
                actionLabel={locale.deleteButton}
                run={() => task.runOnce()}>
                {locale.deleteAreYouSure}
            </TaskDialog>
        );
    },

    setPermissions ({ open, core, task }) {
        return (
            <SavePerms
                open={open}
                core={core}
                task={task}
                pxTask="clients/setPermissionsPX"
                mrTask="clients/setPermissionsMR" />
        );
    },
};
