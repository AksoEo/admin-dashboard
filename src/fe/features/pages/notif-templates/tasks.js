import { h } from 'preact';
import TaskDialog from '../../../components/task-dialog';
import Segmented from '../../../components/segmented';
import Select from '../../../components/select';
import { TejoIcon, UeaIcon } from '../../../components/org-icon';
import { Field } from '../../../components/form';
import ChangedFields from '../../../components/changed-fields';
import { notifTemplates as locale } from '../../../locale';
import { connectPerms } from '../../../perms';
import { routerContext } from '../../../router';
import { FIELDS } from './fields';
import './tasks.less';

const CREATE_FIELDS = ['name', 'subject', 'from'];

export default {
    create: connectPerms(({ open, task, perms }) => {
        const fields = [];

        const createTejo = perms.hasPerm('notif_templates.create.tejo');
        const createUea = perms.hasPerm('notif_templates.create.uea');
        if (createTejo && createUea) {
            fields.push(
                <Field class="org-field" key="org">
                    <Segmented
                        selected={task.parameters.org}
                        onSelect={org => task.update({ org })}>
                        {[
                            { id: 'tejo', label: <TejoIcon /> },
                            { id: 'uea', label: <UeaIcon /> },
                        ]}
                    </Segmented>
                </Field>
            );
        } else if (!task.parameters.org) {
            task.update({ org: createTejo ? 'tejo' : 'uea' });
        }

        fields.push(
            <Field class="base-field" key="base">
                <Segmented
                    selected={task.parameters.base}
                    onSelect={base => {
                        task.update({ base });
                        if (base === 'raw') task.update({ html: '', text: '' });
                        else if (base === 'inherit') task.update({ modules: [{
                            type: 'text',
                            columns: null,
                            button: null,
                        }] });
                    }}>
                    {[
                        { id: 'raw', label: locale.bases.raw },
                        { id: 'inherit', label: locale.bases.inherit },
                    ]}
                </Segmented>
            </Field>
        );

        if (!task.parameters.intent) {
            // <select> will pretend it has a value even if it doesn't, so just add one
            // preemptively
            task.update({ intent: Object.keys(locale.intents)[0] });
        }

        fields.push(
            <Field key="intent">
                <Select
                    class="intent-picker"
                    value={task.parameters.intent}
                    onChange={intent => task.update({ intent })}
                    items={Object.keys(locale.intents).map(intent => ({
                        value: intent,
                        label: locale.intents[intent],
                    }))} />
            </Field>
        );

        for (const id of CREATE_FIELDS) {
            const Component = FIELDS[id].component;
            let label = null;
            if (FIELDS[id].wantsCreationLabel) {
                label = <label class="field-label">{locale.fields[id]}</label>;
            }
            fields.push(
                <Field key={id}>
                    {label}
                    <Component
                        editing slot="create"
                        item={task.parameters}
                        onItemChange={v => task.update({ v })}
                        value={task.parameters[id]}
                        onChange={value => task.update({ [id]: value })} />
                </Field>
            );
        }

        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        sheet
                        class="notif-templates-task-create"
                        open={open}
                        onClose={() => task.drop()}
                        title={locale.create.title}
                        actionLabel={locale.create.button}
                        run={() => task.runOnce().then(id => {
                            routerContext.navigate(`/amasmesaghoj/${id}/redakti`);
                        })}>
                        {fields}
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    }),
    duplicate ({ open, task }) {
        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={locale.duplicate.title}
                        actionLabel={locale.duplicate.button}
                        run={() => task.runOnce().then(id => {
                            routerContext.navigate(`/amasmesaghoj/${id}/redakti`);
                        })}>
                        {locale.duplicate.description}
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

    _sendCodeholderInfo ({ open, task }) {
        return (
            <TaskDialog
                class="notif-templates-task-send-codeholder-info"
                open={open}
                onClose={() => task.drop()}
                title={locale.sendCodeholder.title}
                actionLabel={locale.sendCodeholder.ok}
                run={() => task.drop()}>
                {locale.sendCodeholder.description}
            </TaskDialog>
        );
    },
};
