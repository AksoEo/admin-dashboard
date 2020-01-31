import { util } from '@tejo/akso-client';
import { AbstractDataView } from '../view';
import * as store from '../store';
import * as log from '../log';
import asyncClient from '../client';
import { deepMerge } from '../../util';

/// Data store path.
export const COUNTRIES = 'countries';
export const COUNTRIES_LIST = [COUNTRIES, 'countries'];
export const COUNTRY_GROUPS_LIST = [COUNTRIES, 'countryGroups'];
export const CACHED_LOCALES = [COUNTRIES, 'cachedLocales'];

/// available localization languages
export const COUNTRY_LANGS = [
    'eo', 'en', 'fr', 'es', 'nl', 'pt', 'sk', 'zh', 'de',
];

async function loadCountries (locale) {
    if (!store.get(CACHED_LOCALES)) store.insert(CACHED_LOCALES, []);
    if (store.get(CACHED_LOCALES).includes(locale)) return;

    const client = await asyncClient;
    const res = await client.get('/countries', {
        limit: 300,
        fields: ['code', `name_${locale}`],
        order: [['name_eo', 'asc']],
    });

    for (const item of res.body) {
        const path = COUNTRIES_LIST.concat([item.code]);
        store.insert(path, deepMerge(store.get(path), item));
    }

    store.insert(CACHED_LOCALES, store.get(CACHED_LOCALES).concat([locale]));
}

async function loadAllCountryGroups () {
    if (store.get(COUNTRY_GROUPS_LIST)) return;

    const client = await asyncClient;
    let total = Infinity;
    const items = [];
    while (total > items.length) {
        const res = await client.get('/country_groups', {
            offset: items.length,
            limit: 100,
            fields: ['code', 'name', 'countries'],
            order: [['name', 'asc']],
        });
        total = +res.res.headers.get('x-total-items');
        items.push(...res.body);

        if (res.body.length === 0) {
            log.error(
                `failed loading country groups: we currently have ${items.length}`
                + ` and server reported total count ${total} but unexpectedly returned zero items;`
                + ` aborting and returning partial result`,
            );
            break;
        }
    }

    const groups = {};
    for (const item of items) {
        groups[item.code] = item;
    }

    store.insert(COUNTRY_GROUPS_LIST, groups);
}

export const tasks = {
    list: async (_, { search, offset, limit }) => {
        const client = await asyncClient;

        const options = {
            offset,
            limit,
            fields: [
                'code',
                'enabled',
                ...COUNTRY_LANGS.map(code => `name_${code}`),
            ],
            order: [['code', 'asc']],
        };
        if (search && search.query) {
            const transformedQuery = util.transformSearch(search.query);
            if (!util.isValidSearch(transformedQuery)) {
                throw { code: 'invalid-search-query', message: 'invalid search query' };
            }
            options.search = { cols: ['name_eo'], str: transformedQuery };
        }

        const res = await client.get('/countries', options);

        for (const item of res.body) {
            const path = COUNTRIES_LIST.concat([item.code]);
            store.insert(path, deepMerge(store.get(path), item));
        }

        return {
            items: res.body.map(item => item.code),
            total: +res.res.headers.get('x-total-items'),
            stats: {
                time: res.resTime,
                filtered: false,
            },
        };
    },

    country: async ({ id }) => {
        const client = await asyncClient;
        const res = await client.get(`/countries/${id}`, {
            fields: [
                'code',
                'enabled',
                ...COUNTRY_LANGS.map(code => `name_${code}`),
            ],
        });
        const item = res.body;
        const path = COUNTRIES_LIST.concat([item.code]);
        store.insert(path, deepMerge(store.get(path), item));
        return item;
    },

    update: async ({ id }, data) => {
        const client = await asyncClient;
        data = { ...data };

        delete data.code;

        await client.patch(`/countries/${id}`, data);

        const path = COUNTRIES_LIST.concat([id]);
        store.insert(path, deepMerge(store.get(path), data));
    },
};

export const views = {
    country: class Country extends AbstractDataView {
        constructor ({ id, noFetch }) {
            super();
            this.id = id;
            store.subscribe(COUNTRIES_LIST.concat([id]), this.#onUpdate);
            if (store.get(COUNTRIES_LIST.concat([id]))) this.#onUpdate();

            if (!noFetch) {
                tasks.country({ id }).catch(err => this.emit('error', err));
            }
        }
        #onUpdate = () => this.emit('update', store.get(COUNTRIES_LIST.concat([this.id])));
        drop () {
            store.unsubscribe(COUNTRIES_LIST.concat([this.id]));
        }
    },
    /// countries/countries: lists all countries
    ///
    /// # Options
    /// - locales: array of locales to fetch localized names in (e.g. `['eo', 'en']`)
    ///   defaults to eo
    ///
    /// Data is an object mapping country codes to an object containing localized names, e.g.
    /// `nl` ↦ `{ eo: 'Nederlando', en: 'Netherlands', ... }`
    countries: class Countries extends AbstractDataView {
        constructor ({ locales = ['eo'] } = {}) {
            super();
            this.locales = locales;
            store.subscribe(COUNTRIES_LIST, this.#onUpdate);
            if (store.get(COUNTRIES_LIST)) this.#onUpdate();

            const promises = [];
            for (const locale of locales) {
                promises.push(loadCountries(locale));
            }
            Promise.all(promises).catch(err => this.emit('error', err));
        }
        #onUpdate = () => this.emit('update', store.get(COUNTRIES_LIST));
        drop () {
            store.unsubscribe(COUNTRIES_LIST, this.#onUpdate);
        }
    },
    /// countries/countryGroups: lists all country groups
    countryGroups: class CountryGroups extends AbstractDataView {
        constructor () {
            super();
            store.subscribe(COUNTRY_GROUPS_LIST, this.#onUpdate);
            if (store.get(COUNTRY_GROUPS_LIST)) this.#onUpdate();

            loadAllCountryGroups().catch(err => this.emit('error', err));
        }
        #onUpdate = () => this.emit('update', store.get(COUNTRY_GROUPS_LIST));
        drop () {
            store.unsubscribe(COUNTRY_GROUPS_LIST, this.#onUpdate);
        }
    },
};
