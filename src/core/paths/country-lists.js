import { createStoreObserver } from '../view';
import { crudList, crudCreate, crudGet, crudDelete, simpleDataView } from '../templates';

export const COUNTRY_ORG_LISTS = 'countryOrgLists';
export const SIG_LISTS = '!lists';

export const tasks = {
    list: crudList({
        apiPath: () => `/countries/lists`,
        fields: ['name'],
        storePath: (_, item) => [COUNTRY_ORG_LISTS, item.id],
        map: item => (item.id = item.name),
    }),
    createList: crudCreate({
        apiPath: (_, params) => `/countries/lists/${encodeURIComponent(params.name)}`,
        fields: ['list'],
        idField: 'name',
        storePath: (_, id) => [COUNTRY_ORG_LISTS, id],
        signalPath: () => [COUNTRY_ORG_LISTS, SIG_LISTS],
        methodName: 'put',
        parseId: (id, options, params) => encodeURIComponent(params.name),
    }),
    getList: crudGet({
        apiPath: ({ id }) => `/countries/lists/${id}`,
        fields: ['name', 'list'],
        map: item => (item.id = item.name),
        storePath: ({ id }) => [COUNTRY_ORG_LISTS, id],
    }),
    updateList: (...a) => tasks.createList(...a),
    deleteList: crudDelete({
        apiPath: ({ id }) => `/countries/lists/${id}`,
        storePath: ({ id }) => [COUNTRY_ORG_LISTS, id],
        signalPath: () => [COUNTRY_ORG_LISTS, SIG_LISTS],
    }),
};

export const views = {
    list: simpleDataView({
        storePath: ({ id }) => [COUNTRY_ORG_LISTS, id],
        get: ({ id }) => tasks.getList({ id }),
    }),
    sigLists: createStoreObserver([COUNTRY_ORG_LISTS, SIG_LISTS]),
};

