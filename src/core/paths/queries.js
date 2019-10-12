import asyncClient from '../client';

export const tasks = {
    /// queries/list: lists available queries
    ///
    /// # Parameters
    /// - limit, offset
    /// - category: category id
    ///
    /// # Returns
    /// - items: list of queries
    /// - total: total item count
    list: async (_, { limit, offset, category }) => {
        const client = await asyncClient;
        const res = await client.get('/queries', {
            offset,
            limit,
            fields: ['id', 'name', 'description', 'query'],
            order: [['name', 'asc']],
            filter: { category: category },
        });

        return {
            total: +res.res.headers.get('x-total-items'),
            items: res.body,
        };
    },

    /// queries/add: adds a query
    ///
    /// # Options and Parameters
    /// - category
    /// - name
    /// - description
    /// - query
    add: async ({ category }, { name, description, query }) => {
        const client = await asyncClient;
        await client.post('/queries', {
            category,
            name,
            description: description || null,
            query,
        });
    },

    /// queries/delete: deletes a query
    ///
    /// # Options
    /// - id: query to delete
    delete: async ({ id }) => {
        const client = await asyncClient;
        await client.delete(`/queries/${id}`);
    },
};
