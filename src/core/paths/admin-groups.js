import asyncClient from '../client';
import * as store from '../store';

export const ADMIN_GROUPS = 'adminGroups';

export const tasks = {
    /// adminGroups/list: lists admin groups
    list: async (_, { search, offset, limit }) => {
        const client = await asyncClient;

        const opts = { offset, limit };
        if (search && search.query) {
            opts.search = { cols: [search.field], str: search.query };
        }

        const res = await client.get('/admin_groups', {
            fields: ['id', 'name', 'description', 'memberRestrictions.filter', 'memberRestrictions.fields'],
            ...opts,
        });

        for (const item of res.body) {
            store.insert([ADMIN_GROUPS, item.id], item);
        }

        return {
            items: res.body.map(item => item.id),
            total: res.res.header.get('x-total-items'),
        };
    },
    create: async (_, { name, description, memberRestrictions }) => {
        const client = await asyncClient;

        await client.post('/admin_groups', {
            name,
            description,
            memberRestrictions,
        });
    },
    update: async ({ id }, { name, description, memberRestrictions }) => {
        const client = await asyncClient;

        await client.patch(`/admin_groups/${id}`, {
            name,
            description,
            memberRestrictions,
        });

        store.insert([ADMIN_GROUPS, id], { name, description, memberRestrictions });
    },
    delete: async (_, { id }) => {
        const client = await asyncClient;
        await client.delete(`/admin_groups/${id}`);
        store.remove([ADMIN_GROUPS, id]);
    },
};

export const views = {

};
