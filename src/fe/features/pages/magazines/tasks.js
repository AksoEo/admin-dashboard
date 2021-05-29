import { h } from 'preact';
import TaskDialog from '../../../components/task-dialog';
import ChangedFields from '../../../components/changed-fields';
import { Field } from '../../../components/form';
import {
    magazines as magazinesLocale,
    magazineEditions as editionsLocale,
    magazineToc as tocLocale,
} from '../../../locale';
import { DocumentIcon } from '../../../components/icons';
import { FileSize } from '../../../components/files';
import { routerContext } from '../../../router';
import { FIELDS as MAGAZINE_FIELDS } from './fields';
import { FIELDS as EDITION_FIELDS } from './editions/fields';
import { FIELDS as TOC_FIELDS } from './editions/toc//fields';
import './tasks.less';

// TODO: move this elsewhere
function createDialog ({ locale, fieldNames, fields: fieldDefs, className, onCompletion }) {
    return ({ open, task }) => {
        const fields = fieldNames.map(id => {
            const def = fieldDefs[id];
            const Component = def.component;
            return (
                <Field key={id}>
                    {def.wantsCreationLabel && (
                        <label class="creation-label">
                            {locale.fields[id]}
                        </label>
                    )}
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
                        title={locale.create.title}
                        actionLabel={locale.create.button}
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
        locale: magazinesLocale,
        fieldNames: ['org', 'name', 'description'],
        fields: MAGAZINE_FIELDS,
        className: 'magazines-task-create',
        onCompletion: (task, routerContext, id) => routerContext.navigate(`/revuoj/${id}`),
    }),
    updateMagazine: updateDialog({ locale: magazinesLocale.update, fields: magazinesLocale.fields }),
    deleteMagazine: deleteDialog({ locale: magazinesLocale.delete }),
    createEdition: createDialog({
        locale: editionsLocale,
        fieldNames: ['idHuman', 'date'],
        fields: EDITION_FIELDS,
        className: 'magazines-task-create-edition',
        onCompletion: (task, routerContext, id) => routerContext.navigate(`/revuoj/${task.options.magazine}/numero/${id}`),
    }),
    updateEdition: updateDialog({ locale: editionsLocale.update, fields: editionsLocale.fields }),
    deleteEdition: deleteDialog({ locale: editionsLocale.delete }),
    createTocEntry: createDialog({
        locale: tocLocale,
        fieldNames: ['page', 'title'],
        fields: TOC_FIELDS,
        className: 'magazines-task-create-toc-entry',
        onCompletion: (task, routerContext, id) => routerContext
            .navigate(`/revuoj/${task.options.magazine}/numero/${task.options.edition}/enhavo/${id}/redakti`),
    }),
    updateTocEntry: updateDialog({ locale: tocLocale.update, fields: tocLocale.fields }),
    deleteTocEntry: deleteDialog({ locale: tocLocale.delete }),

    updateEditionFile: ({ open, task }) => {
        const fileName = (task.parameters.file?.name || '')
            .replace(/\.epub(\.zip)?$/, '')
            .replace(/\.pdf$/, '');

        return (
            <TaskDialog
                class="magazines-task-update-edition-file"
                open={open}
                onClose={() => !task.running && task.drop()}
                title={editionsLocale.files.update.title}
                actionLabel={editionsLocale.files.update.button}
                run={() => task.runOnce()}>
                <div class="file-preview">
                    <div class="file-icon-container">
                        <DocumentIcon />
                    </div>
                    <div class="file-info">
                        <div class="file-name">
                            {fileName}
                            <span class="file-type">
                                {task.parameters.format}
                            </span>
                        </div>
                        <FileSize bytes={task.parameters.file?.size} />
                    </div>
                </div>
            </TaskDialog>
        );
    },
    deleteEditionFile: deleteDialog({ locale: editionsLocale.files.delete }),

    updateTocRecitation: ({ open, task }) => {
        const fileName = (task.parameters.file?.name || '').replace(/\.(mp3|wav|flac)?$/, '');

        return (
            <TaskDialog
                class="magazines-task-update-edition-file"
                open={open}
                onClose={() => !task.running && task.drop()}
                title={tocLocale.recitations.update.title}
                actionLabel={tocLocale.recitations.update.button}
                run={() => task.runOnce()}>
                <div class="file-preview">
                    <div class="file-icon-container">
                        <DocumentIcon />
                    </div>
                    <div class="file-info">
                        <div class="file-name">
                            {fileName}
                            <span class="file-type">
                                {task.parameters.format}
                            </span>
                        </div>
                        <FileSize bytes={task.parameters.file?.size} />
                    </div>
                </div>
            </TaskDialog>
        );
    },
    deleteTocRecitation: deleteDialog({ locale: tocLocale.recitations.delete }),
};
