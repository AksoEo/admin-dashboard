import client from './client';

function cachedRequest (endpoint, options = {}, handle = (result => result.body)) {
    let cached;
    return function getCached () {
        if (!cached) {
            cached = client.get(endpoint, options).then(handle);
        }
        return cached;
    };
}

let getCountriesLocalized;
{
    const cachedValue = {};
    const cachedVariants = {};

    getCountriesLocalized = function (variant = 'eo') {
        if (!(variant in cachedVariants)) {
            cachedVariants[variant] = client.get('/countries', {
                limit: 300,
                fields: ['code', `name_${variant}`],
                order: [['name_eo', 'asc']],
            }).then(result => {
                for (const item of result.body) {
                    if (cachedValue[item.code]) {
                        Object.assign(cachedValue[item.code], item);
                    } else {
                        cachedValue[item.code] = item;
                    }
                }
                const localized = {};
                for (const k in cachedValue) localized[k] = cachedValue[k][`name_${variant}`];
                return localized;
            });
        }
        return cachedVariants[variant];
    };
}

export default {
    getCountries: () => getCountriesLocalized('eo'),
    getCountriesLocalized,
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
