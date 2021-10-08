import { crudList, crudCreate, crudGet, crudUpdate, crudDelete, simpleDataView } from '../templates';
import { createStoreObserver } from '../view';
import { CODEHOLDER_DELEGATIONS } from './codeholders';

export const DELEGATION_SUBJECTS = 'delegationSubjects';
export const SIG_SUBJECTS = '!subjects';

export const tasks = {
    listDelegates: crudList({
        apiPath: () => `/delegations/delegates`,
        fields: [
            'codeholderId',
            'org',
            'approvedBy',
            'approvedTime',
            'cities',
            'countries',
            'subjects',
            'hosting.maxDays',
            'hosting.maxPersons',
        ],
        // TODO: filters
        storePath: (_, item) => [CODEHOLDER_DELEGATIONS, item.codeholderId, item.org],
        map: item => {
            item.id = item.codeholderId + '~' + item.org;
        },
    }),

    listSubjects: crudList({
        apiPath: () => `/delegations/subjects`,
        fields: ['id', 'org', 'name', 'description'],
        // TODO: filters
        storePath: (_, item) => [DELEGATION_SUBJECTS, item.id],
    }),
    subject: crudGet({
        apiPath: ({ id }) => `/delegations/subjects/${id}`,
        fields: ['id', 'org', 'name', 'description'],
        storePath: ({ id }) => [DELEGATION_SUBJECTS, id],
    }),
    createSubject: crudCreate({
        apiPath: () => `/delegations/subjects`,
        fields: ['org', 'name', 'description'],
        storePath: (_, id) => [DELEGATION_SUBJECTS, id],
        signalPath: () => [DELEGATION_SUBJECTS, SIG_SUBJECTS],
    }),
    updateSubject: crudUpdate({
        apiPath: ({ id }) => `/delegates/subjects/${id}`,
        storePath: ({ id }) => [DELEGATION_SUBJECTS, id],
    }),
    deleteSubject: crudDelete({
        apiPath: ({ id }) => `/delegates/subjects/${id}`,
        storePath: ({ id }) => [DELEGATION_SUBJECTS, id],
        signalPath: () => [DELEGATION_SUBJECTS, SIG_SUBJECTS],
    }),
};

export const views = {
    subject: simpleDataView({
        storePath: ({ id }) => [DELEGATION_SUBJECTS, id],
        get: ({ id }) => tasks.subject({ id }),
        canBeLazy: true,
    }),
    sigSubjects: createStoreObserver([DELEGATION_SUBJECTS, SIG_SUBJECTS]),
};
