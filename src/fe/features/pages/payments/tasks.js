import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import TaskDialog from '../../../components/task-dialog';
import Segmented from '../../../components/segmented';
import { Validator, Field } from '../../../components/form';
import { connectPerms } from '../../../perms';
import { routerContext } from '../../../router';
import {
    paymentOrgs as orgLocale,
    paymentAddons as addonLocale,
    paymentMethods as methodLocale,
} from '../../../locale';

export default {
    createOrg: connectPerms(({ perms, open, task }) => {
        let orgSelector;

        const hasTejo = perms.hasPerm('pay.payment_orgs.create.tejo');
        const hasUea = perms.hasPerm('pay.payment_orgs.create.uea');

        if (hasTejo && hasUea) {
            orgSelector = (
                <Validator
                    component={Segmented}
                    value={task.parameters.org}
                    validate={value => {
                        if (!value) throw {};
                    }}
                    selected={task.parameters.org}
                    onSelect={org => task.update({ org })}>
                    {Object.entries(orgLocale.create.orgs).map(([k, v]) => ({ id: k, label: v }))}
                </Validator>
            );
        } else if (!task.parameters.org) {
            task.update({ org: hasTejo ? 'tejo' : 'uea' });
        }

        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={orgLocale.create.title}
                        actionLabel={orgLocale.create.button}
                        run={() => task.runOnce().then(id => {
                            routerContext.navigate(`/pagoj/organizoj/${id}`);
                        })}>
                        {orgSelector}
                        <Field>
                            <Validator
                                component={TextField}
                                validate={value => {
                                    if (!value) throw { error: orgLocale.create.nameRequired };
                                }}
                                label={orgLocale.fields.name}
                                value={task.parameters.name || ''}
                                onChange={e => task.update({ name: e.target.value })} />
                        </Field>
                        <Field>
                            <TextField
                                label={orgLocale.fields.description}
                                value={task.parameters.description || ''}
                                onChange={e => task.update({ description: e.target.value || null })} />
                        </Field>
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    }),

    deleteOrg ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={orgLocale.delete.title}
                actionLabel={orgLocale.delete.button}
                run={() => task.runOnce()}>
                {orgLocale.delete.description}
            </TaskDialog>
        );
    },
    deleteAddon ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={addonLocale.delete.title}
                actionLabel={addonLocale.delete.button}
                run={() => task.runOnce()}>
                {addonLocale.delete.description}
            </TaskDialog>
        );
    },
    deleteMethod ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={methodLocale.delete.title}
                actionLabel={methodLocale.delete.button}
                run={() => task.runOnce()}>
                {methodLocale.delete.description}
            </TaskDialog>
        );
    },
};
