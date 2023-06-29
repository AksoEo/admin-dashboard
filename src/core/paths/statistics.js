import { crudList, simpleDataView } from '../templates';

const STATISTICS = 'statistics';

export const tasks = {
    listStatistics: crudList({
        apiPath: () => '/statistics',
        fields: ['date', 'data'],
        storePath: (_, item) => [STATISTICS, item.date],
        map: item => {
            item.id = item.date;
        },
    }),
};

export const views = {
    statistics: simpleDataView({
        storePath: ({ date }) => [STATISTICS, date],
        get: ({ date }) => tasks.listStatistics({ jsonFilter: { filter: { date } } }, {}),
        canBeLazy: true,
    }),
};