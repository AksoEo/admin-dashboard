import { delegationSubjects as subjectsLocale } from '../../../locale';
import { createDialog, updateDialog, deleteDialog } from '../../../components/task-templates';
import { FIELDS as SUBJECT_FIELDS } from './subjects/fields';

export default {
    createSubject: createDialog({
        locale: subjectsLocale,
        fieldNames: ['org', 'name', 'description'],
        fields: SUBJECT_FIELDS,
        className: 'delegation-subjects-task-create',
        onCompletion: (task, routerContext, id) => routerContext.navigate(`/delegitoj/fakoj/${id}`),
    }),
    updateSubject: updateDialog({ locale: subjectsLocale.update, fields: subjectsLocale.fields }),
    deleteSubject: deleteDialog({ locale: subjectsLocale.delete }),
};

