import { h } from 'preact';
import { useEffect } from 'preact/compat';
import { TextField } from '@cpsdqs/yamdl';
import TaskDialog from '../../../components/task-dialog';
import { Field, Validator } from '../../../components/form';
import ChangedFields from '../../../components/changed-fields';
import Segmented from '../../../components/segmented';
import TejoIcon from '../../../components/tejo-icon';
import UeaIcon from '../../../components/uea-icon';
import {
    congresses as locale,
    congressInstances as instanceLocale,
    data as dataLocale,
} from '../../../locale';
import { connectPerms } from '../../../perms';
import { routerContext } from '../../../router';
import { FIELDS as INSTANCE_FIELDS } from './instances/fields';

const CREATE_INSTANCE_FIELDS = ['name', 'humanId', 'dateFrom', 'dateTo'];

export default {
    create: connectPerms(({ perms, open, task }) => {
        const hasTejo = perms.hasPerm('congresses.create.tejo');
        const hasUea = perms.hasPerm('congresses.create.uea');

        useEffect(() => {
            if (hasTejo !== hasUea) {
                if (hasTejo) task.update({ org: 'tejo' });
                else if (hasUea) task.update({ org: 'uea' });
            }
        });

        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={locale.create.title}
                        actionLabel={locale.create.button}
                        run={() => task.runOnce().then(id => {
                            routerContext.navigate(`/kongresoj/${id}`);
                        })}>
                        <Field>
                            <Validator
                                component={TextField}
                                validate={value => {
                                    if (!value) throw { error: dataLocale.requiredField };
                                }}
                                outline
                                label={locale.fields.name}
                                value={task.parameters.name || ''}
                                onChange={e => task.update({ name: e.target.value })} />
                        </Field>
                        {hasTejo && hasUea && (
                            <Field>
                                <Validator
                                    component={Segmented}
                                    validate={() => {
                                        if (!task.parameters.org) throw { error: dataLocale.requiredField };
                                    }}
                                    selected={task.parameters.org}
                                    onSelect={org => task.update({ org })}>
                                    {[
                                        {
                                            id: 'tejo',
                                            label: <TejoIcon />,
                                        },
                                        {
                                            id: 'uea',
                                            label: <UeaIcon />,
                                        },
                                    ]}
                                </Validator>
                            </Field>
                        )}
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    }),
    update ({ open, task }) {
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

    createInstance ({ open, task }) {
        const { congress } = task.options;

        const fields = CREATE_INSTANCE_FIELDS.map(id => {
            const Component = INSTANCE_FIELDS[id].component;
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
                        title={instanceLocale.create.title}
                        actionLabel={instanceLocale.create.button}
                        run={() => task.runOnce().then(id => {
                            routerContext.navigate(`/kongresoj/${congress}/okazigoj/${id}`);
                        })}>
                        {fields}
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },
};
