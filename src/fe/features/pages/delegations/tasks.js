import { delegationSubjects as subjectsLocale, delegationApplications as applicationsLocale } from '../../../locale';
import { createDialog, updateDialog, deleteDialog } from '../../../components/task-templates';
import { FIELDS as SUBJECT_FIELDS } from './subjects/fields';
import { FIELDS as APPLICATION_FIELDS } from './applications/fields';

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

    createApplication: createDialog({
        locale: applicationsLocale,
        fieldNames: [
            'org',
            'codeholderId',
            'cities',
            'subjects',
            'hosting',
            'tos',
            'applicantNotes',
            'internalNotes',
        ],
        fields: APPLICATION_FIELDS,
        className: 'delegation-applications-task-create',
        onCompletion: (task, routerContext, id) => routerContext.navigate(`/delegitoj/[[applications]]/${id}`),
    }),
    updateApplication: updateDialog({ locale: applicationsLocale.update, fields: applicationsLocale.fields }),
    deleteApplication: deleteDialog({ locale: applicationsLocale.delete }),
};

