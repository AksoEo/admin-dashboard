import { h } from 'preact';
import { useEffect } from 'preact/compat';
import { TextField } from '@cpsdqs/yamdl';
import TaskDialog from '../../../components/task-dialog';
import { Field, Validator } from '../../../components/form';
import ChangedFields from '../../../components/changed-fields';
import Segmented from '../../../components/segmented';
import TejoIcon from '../../../components/tejo-icon';
import UeaIcon from '../../../components/uea-icon';
import DynamicHeightDiv from '../../../components/dynamic-height-div';
import { timestamp } from '../../../components/data';
import {
    congresses as locale,
    congressInstances as instanceLocale,
    congressLocations as locationLocale,
    congressPrograms as programLocale,
    data as dataLocale,
} from '../../../locale';
import { connectPerms } from '../../../perms';
import { routerContext } from '../../../router';
import { FIELDS as INSTANCE_FIELDS } from './instances/fields';
import MapPicker from './map-picker';
import './tasks.less';

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
    updateInstance ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={instanceLocale.update.title}
                actionLabel={instanceLocale.update.button}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields}
                    locale={instanceLocale.fields} />
            </TaskDialog>
        );
    },
    deleteInstance ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={instanceLocale.delete.title}
                actionLabel={instanceLocale.delete.button}
                run={() => task.runOnce()}>
                {instanceLocale.delete.description}
            </TaskDialog>
        );
    },

    createLocation ({ open, task }) {
        const { congress, instance } = task.options;

        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        class="congresses-task-create-location"
                        open={open}
                        onClose={() => task.drop()}
                        title={locationLocale.create.title}
                        actionLabel={locationLocale.create.button}
                        run={() => task.runOnce().then(id => {
                            routerContext.navigate(`/kongresoj/${congress}/okazigoj/${instance}/lokoj/${id}`);
                        })}>
                        <Field>
                            <Validator
                                component={Segmented}
                                validate={() => {
                                    if (!task.parameters.type) throw { error: dataLocale.requiredField };
                                }}
                                selected={task.parameters.type}
                                onSelect={type => task.update({ type })}>
                                {Object.entries(locationLocale.fields.types).map(([k, v]) => ({
                                    id: k,
                                    label: v,
                                }))}
                            </Validator>
                        </Field>
                        <Field>
                            <Validator
                                component={TextField}
                                outline
                                label={locationLocale.fields.name}
                                validate={value => {
                                    if (!value) throw { error: dataLocale.requiredField };
                                }}
                                value={task.parameters.name || ''}
                                onChange={e => task.update({ name: e.target.value })} />
                        </Field>
                        <DynamicHeightDiv>
                            {(task.parameters.type === 'external') && (
                                <MapPicker
                                    value={task.parameters.ll}
                                    onChange={ll => task.update({ ll })} />
                            )}
                        </DynamicHeightDiv>
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },
    updateLocation ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locationLocale.update.title}
                actionLabel={locationLocale.update.button}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields}
                    locale={locationLocale.fields} />
            </TaskDialog>
        );
    },
    deleteLocation ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locationLocale.delete.title}
                actionLabel={locationLocale.delete.button}
                run={() => task.runOnce()}>
                {locationLocale.delete.description}
            </TaskDialog>
        );
    },

    createProgram ({ open, task }) {
        const { congress, instance } = task.options;

        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={programLocale.create.title}
                        actionLabel={programLocale.create.button}
                        run={() => task.runOnce().then(id => {
                            routerContext.navigate(`/kongresoj/${congress}/okazigoj/${instance}/programeroj/${id}`);
                        })}>
                        <Field>
                            <Validator
                                component={TextField}
                                outline
                                label={programLocale.fields.title}
                                validate={value => {
                                    if (!value) throw { error: dataLocale.requiredField };
                                }}
                                value={task.parameters.title || ''}
                                onChange={e => task.update({ title: e.target.value })} />
                        </Field>
                        <Field>
                            <Validator
                                component={timestamp.editor}
                                outline
                                label={programLocale.fields.timeFrom}
                                validate={value => {
                                    if (!value) throw { error: dataLocale.requiredField };
                                }}
                                value={task.parameters.timeFrom || null}
                                onChange={timeFrom => task.update({ timeFrom })} />
                        </Field>
                        <Field>
                            <Validator
                                component={timestamp.editor}
                                outline
                                label={programLocale.fields.timeTo}
                                validate={value => {
                                    if (!value) throw { error: dataLocale.requiredField };
                                }}
                                value={task.parameters.timeTo || null}
                                onChange={timeTo => task.update({ timeTo })} />
                        </Field>
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },
    updateProgram ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={programLocale.update.title}
                actionLabel={programLocale.update.button}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields}
                    locale={programLocale.fields} />
            </TaskDialog>
        );
    },
    deleteProgram ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={programLocale.delete.title}
                actionLabel={programLocale.delete.button}
                run={() => task.runOnce()}>
                {programLocale.delete.description}
            </TaskDialog>
        );
    },
};
