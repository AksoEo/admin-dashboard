import { crudList, crudCreate, crudGet, crudUpdate, crudDelete, simpleDataView } from '../templates';
import { createStoreObserver } from '../view';

export const CODEHOLDER_DELEGATIONS = 'codeholderDelegations';
export const DELEGATION_SUBJECTS = 'delegationSubjects';
export const DELEGATION_APPLICATIONS = 'delegationApplications';
export const SIG_SUBJECTS = '!subjects';
export const SIG_APPLICATIONS = '!applications';

export const delegateFilters = {
    org: {
        toAPI: org => ({ org }),
    },
    approvedBy: {
        toAPI: codeholders => ({ approvedBy: { $in: codeholders } }),
    },
    approvedTime: {
        toAPI: () => {
            // TODO
            return {};
        },
    },
    hostingMaxDays: {
        toAPI: range => ({ 'hosting.maxDays': { $range: range } }),
    },
    hostingMaxPersons: {
        toAPI: range => ({ 'hosting.maxPersons': { $range: range } }),
    },
    subjects: {
        toAPI: items => ({ subjects: { $hasAny: items } }),
    },
    cities: {
        toAPI: items => ({ cities: { $hasAny: items } }),
    },
    countries: {
        toAPI: items => ({ $countries: { country: { $in: items } } }),
    },
    countryLevels: {
        toAPI: level => ({ $countries: { level } }),
    },
    // TODO: tos fields
};

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
        filters: delegateFilters,
        storePath: (_, item) => [CODEHOLDER_DELEGATIONS, item.codeholderId, item.org],
        map: item => {
            item.id = item.codeholderId + '~' + item.org;
        },
    }),

    listSubjects: crudList({
        apiPath: () => `/delegations/subjects`,
        fields: ['id', 'org', 'name', 'description'],
        filters: delegateFilters,
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
        apiPath: ({ id }) => `/delegations/subjects/${id}`,
        storePath: ({ id }) => [DELEGATION_SUBJECTS, id],
    }),
    deleteSubject: crudDelete({
        apiPath: ({ id }) => `/delegations/subjects/${id}`,
        storePath: ({ id }) => [DELEGATION_SUBJECTS, id],
        signalPath: () => [DELEGATION_SUBJECTS, SIG_SUBJECTS],
    }),

    listApplications: crudList({
        apiPath: () => `/delegations/applications`,
        fields: [
            'id', 'org', 'status', 'statusTime',
            'applicantNotes', 'internalNotes', 'time', 'subjects', 'cities',
            // 'countries', 'codeholderId',
            'codeholderId',

            'hosting',
        ],
        storePath: ({ id }) => [DELEGATION_APPLICATIONS, id],
    }),
    application: crudGet({
        apiPath: ({ id }) => `/delegations/applications/${id}`,
        fields: [
            'id', 'org', 'status', 'statusTime',
            'applicantNotes', 'internalNotes', 'time', 'subjects', 'cities',
            'countries', 'codeholderId',
            'hosting',
            'tos.docDataProtectionUEA',
            'tos.docDataProtectionUEATime',
            'tos.docDelegatesUEA',
            'tos.docDelegatesUEATime',
            'tos.docDelegatesDataProtectionUEA',
            'tos.docDelegatesDataProtectionUEATime',
            'tos.paperAnnualBook',
            'tos.paperAnnualBookTime',
        ],
        storePath: ({ id }) => [DELEGATION_APPLICATIONS, id],
    }),
    createApplication: crudCreate({
        apiPath: () => `/delegations/applications`,
        fields: [
            'org',
            'applicantNotes',
            'internalNotes',
            'subjects',
            'cities',
            'countries',
            'hosting',
            'codeholderId',
            'tos',
        ],
        storePath: (_, id) => [DELEGATION_APPLICATIONS, id],
        signalPath: () => [DELEGATION_APPLICATIONS, SIG_APPLICATIONS],
    }),
    updateApplication: crudUpdate({
        apiPath: ({ id }) => `/delegations/applications/${id}`,
        storePath: ({ id }) => [DELEGATION_APPLICATIONS, id],
    }),
    deleteApplication: crudDelete({
        apiPath: ({ id }) => `/delegations/applications/${id}`,
        storePath: ({ id }) => [DELEGATION_APPLICATIONS, id],
        signalPath: () => [DELEGATION_APPLICATIONS, SIG_APPLICATIONS],
    }),
};

export const views = {
    subject: simpleDataView({
        storePath: ({ id }) => [DELEGATION_SUBJECTS, id],
        get: ({ id }) => tasks.subject({ id }),
        canBeLazy: true,
    }),
    sigSubjects: createStoreObserver([DELEGATION_SUBJECTS, SIG_SUBJECTS]),

    application: simpleDataView({
        storePath: ({ id }) => [DELEGATION_APPLICATIONS, id],
        get: ({ id }) => tasks.application({ id }),
    }),
    sigApplications: createStoreObserver([DELEGATION_APPLICATIONS, SIG_APPLICATIONS]),
};
