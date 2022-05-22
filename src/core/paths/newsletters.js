import { crudList, crudCreate, crudGet, crudUpdate, crudDelete, simpleDataView } from '../templates';
import { createStoreObserver } from '../view';
import asyncClient from '../client';
import * as store from '../store';

const NEWSLETTERS = 'newsletters';
const SIG_NEWSLETTERS = '!newsletters';

export const tasks = {
    list: crudList({
        apiPath: () => `/newsletters`,
        fields: [
            'id',
            'org',
            'name',
            'description',
            'public',
            'numSubscribers',
        ],
        storePath: (_, item) => [NEWSLETTERS, item.id],
    }),
    newsletter: crudGet({
        apiPath: ({ id }) => `/newsletters/${id}`,
        fields: [
            'id',
            'org',
            'name',
            'description',
            'public',
            'numSubscribers',
        ],
        storePath: ({ id }) => [NEWSLETTERS, id],
    }),
    create: crudCreate({
        apiPath: () => `/newsletters`,
        fields: ['org', 'name', 'description', 'public'],
        storePath: (_, id) => [NEWSLETTERS, id],
        signalPath: () => [NEWSLETTERS, SIG_NEWSLETTERS],
    }),
    update: crudUpdate({
        apiPath: ({ id }) => `/newsletters/${id}`,
        storePath: ({ id }) => [NEWSLETTERS, id],
    }),
    delete: crudDelete({
        apiPath: ({ id }) => `/newsletters/${id}`,
        storePath: ({ id }) => [NEWSLETTERS, id],
        signalPath: () => [NEWSLETTERS, SIG_NEWSLETTERS],
    }),
};

export const views = {
    newsletter: simpleDataView({
        storePath: ({ id }) => [NEWSLETTERS, id],
        get: ({ id }) => tasks.newsletter({ id }),
        canBeLazy: true,
    }),
    sigNewsletters: createStoreObserver([NEWSLETTERS, SIG_NEWSLETTERS]),
};
