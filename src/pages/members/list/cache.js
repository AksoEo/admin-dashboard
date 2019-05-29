import client from '../../../client';

function cachedRequest (endpoint, options = {}, handle = (result => result.body)) {
    let cached;
    return function getCached () {
        if (!cached) {
            cached = client.get(endpoint, options).then(handle);
        }
        return cached;
    };
}

export default {
    getCountries: cachedRequest('/countries', {
        limit: 300,
        fields: ['code', 'name_eo'],
        order: [['name_eo', 'asc']],
    }, result => {
        const map = {};
        for (const item of result.body) {
            map[item.code] = item.name_eo;
        }
        return map;
    }),
    getCountryGroups: cachedRequest('/country_groups', {
        limit: 100,
        fields: ['code', 'name', 'countries'],
        order: [['name', 'asc']],
    }, result => {
        const map = {};
        for (const item of result.body) {
            map[item.code] = item;
        }
        return map;
    }),
    getPerms: cachedRequest('/perms'),
    getMembershipCategories: cachedRequest('/membership_categories', {
        limit: 100,
        fields: ['id', 'nameAbbrev', 'name'],
    }, result => {
        const map = {};
        for (const item of result.body) {
            map[item.id] = item;
        }
        return map;
    }),
};
