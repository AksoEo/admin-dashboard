import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import TaskDialog from '../../../../components/task-dialog';
import ChangedFields from '../../../../components/changed-fields';
import { Validator } from '../../../../components/form';
import { clients as locale } from '../../../../locale';
import { routerContext } from '../../../../router';

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
                            core.createTask('info', {
                                title: locale.secret.title,
                                message: [
                                    locale.secret.description,
                                    secret,
                                ].join('\n'),
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
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={locale.delete}
                        actionLabel={locale.deleteButton}
                        run={() => task.runOnce().then(() => {
                            routerContext.navigate('/administrado/klientoj');
                        })}>
                        {locale.deleteAreYouSure}
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },

    setPermissions ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.perms.setTitle}
                actionLabel={locale.perms.setButton}
                run={() => task.runOnce()}>
                todo: summary of changes
            </TaskDialog>
        );
    },
};
