import { h } from 'preact';
import { delegationSubjects as subjectsLocale, delegationApplications as applicationsLocale } from '../../../locale';
import { createDialog, updateDialog, deleteDialog } from '../../../components/task-templates';
import TaskDialog from '../../../components/task-dialog';
import { routerContext } from '../../../router';
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
        onCompletion: (task, routerContext, id) => routerContext.navigate(`/delegitoj/kandidatighoj/${id}`),
    }),
    updateApplication: updateDialog({ locale: applicationsLocale.update, fields: applicationsLocale.fields }),
    deleteApplication: deleteDialog({ locale: applicationsLocale.delete }),

    approveApplication ({ open, task }) {
        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={applicationsLocale.approve.title}
                        actionLabel={applicationsLocale.approve.button}
                        run={() => task.runOnce().then(({ id, org }) => {
                            routerContext.navigate(`/delegitoj/${id}/${org}`);
                        })}>
                        {applicationsLocale.approve.description}
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },
    denyApplication ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={applicationsLocale.deny.title}
                actionLabel={applicationsLocale.deny.button}
                run={() => task.runOnce()}>
                {applicationsLocale.deny.description}
            </TaskDialog>
        );
    },
};

