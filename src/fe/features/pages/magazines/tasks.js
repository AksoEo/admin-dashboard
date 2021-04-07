import { h } from 'preact';
import TaskDialog from '../../../components/task-dialog';
import ChangedFields from '../../../components/changed-fields';
import { Field } from '../../../components/form';
import {
    magazines as magazinesLocale,
    magazineEditions as editionsLocale,
    magazineToc as tocLocale,
} from '../../../locale';
import { routerContext } from '../../../router';
import { FIELDS as MAGAZINE_FIELDS } from './fields';
import { FIELDS as EDITION_FIELDS } from './editions/fields';
import { FIELDS as TOC_FIELDS } from './editions/toc//fields';
import './tasks.less';

// TODO: move this elsewhere
function createDialog ({ locale, fieldNames, fields: fieldDefs, className, onCompletion }) {
    return ({ open, task }) => {
        const fields = fieldNames.map(id => {
            const Component = fieldDefs[id].component;
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
                        class={className}
                        open={open}
                        onClose={() => task.drop()}
                        title={locale.title}
                        actionLabel={locale.button}
                        run={() => task.runOnce().then(id => {
                            onCompletion(task, routerContext, id);
                        })}>
                        {fields}
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    };
}
function updateDialog ({ locale, fields }) {
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
function deleteDialog ({ locale }) {
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

export default {
    createMagazine: createDialog({
        locale: magazinesLocale.create,
        fieldNames: ['org', 'name', 'description'],
        fields: MAGAZINE_FIELDS,
        className: 'magazines-task-create',
        onCompletion: (task, routerContext, id) => routerContext.navigate(`/revuoj/${id}`),
    }),
    updateMagazine: updateDialog({ locale: magazinesLocale.update, fields: magazinesLocale.fields }),
    deleteMagazine: deleteDialog({ locale: magazinesLocale.delete }),
    createEdition: createDialog({
        locale: editionsLocale.create,
        fieldNames: ['id', 'idHuman', 'date'],
        fields: EDITION_FIELDS,
        className: 'magazines-task-create-edition',
        onCompletion: (task, routerContext, id) => routerContext.navigate(`/revuoj/${task.options.magazine}/__editions__/${id}`),
    }),
    updateEdition: updateDialog({ locale: editionsLocale.update, fields: editionsLocale.fields }),
    deleteEdition: deleteDialog({ locale: editionsLocale.delete }),
    createTocEntry: createDialog({
        locale: tocLocale.create,
        fieldNames: ['page', 'title'],
        fields: TOC_FIELDS,
        className: 'magazines-task-create-toc-entry',
        onCompletion: (task, routerContext, id) => routerContext
            .navigate(`/revuoj/${task.options.magazine}/__editions__/${task.options.edition}/__toc__/${id}/redakti`),
    }),
    updateTocEntry: updateDialog({ locale: tocLocale.update, fields: tocLocale.fields }),
    deleteTocEntry: deleteDialog({ locale: tocLocale.delete }),
};
