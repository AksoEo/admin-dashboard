import { AbstractDataView } from '../view';
import * as store from '../store';
import * as log from '../log';
import asyncClient from '../client';

/// Data store path.
export const COUNTRIES = 'countries';
export const COUNTRIES_LIST = [COUNTRIES, 'countries'];
export const COUNTRY_GROUPS_LIST = [COUNTRIES, 'countryGroups'];
export const CACHED_LOCALES = [COUNTRIES, 'cachedLocales'];

async function loadCountries (locale) {
    if (!store.get(CACHED_LOCALES)) store.insert(CACHED_LOCALES, []);
    if (store.get(CACHED_LOCALES).includes(locale)) return;

    const client = await asyncClient;
    const res = await client.get('/countries', {
        limit: 300,
        fields: ['code', `name_${locale}`],
        order: [['name_eo', 'asc']],
    });

    const list = store.get(COUNTRIES_LIST) || {};

    for (const item of res.body) {
        list[item.code] = Object.assign(list[item.code] || {}, { [locale]: item[`name_${locale}`] });
    }

    store.insert(COUNTRIES_LIST, list);
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

export const views = {
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
