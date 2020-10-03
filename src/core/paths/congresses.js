import { util } from '@tejo/akso-client';
import asyncClient from '../client';
import { AbstractDataView, createStoreObserver } from '../view';
import * as store from '../store';
import { fieldsToOrder, fieldDiff, filtersToAPI, addJSONFilter } from '../list';
import { deepMerge } from '../../util';

export const CONGRESSES = 'congresses';
export const DATA = 'data';
export const DATA_MAP = 'map';
export const INSTANCES = 'instances';
export const LOC_TAGS = 'location_tags';
export const LOCATIONS = 'locations';
export const PROG_TAGS = 'program_tags';
export const PROGRAMS = 'programs';
export const REG_FORM = 'registration_form';
export const SIG_CONGRESSES = '!congresses';
export const SIG_INSTANCES = '!instances';
export const SIG_LOC_TAGS = '!location_tags';
export const SIG_LOCATIONS = '!locations';
export const SIG_PROG_TAGS = '!program_tags';
export const SIG_PROGRAMS = '!programs';

const locClientFilters = {
    type: {
        toAPI: type => ({ type }),
    },
    externalLoc: {
        toAPI: locations => ({ externalLoc: { $in: locations } }),
    },
};
const progClientFilters = {
    timeSlice: {
        toAPI: ([from, to]) => (from && to) ? ({
            $and: [
                { timeTo: { $gt: from } },
                { timeFrom: { $lt: to } },
            ],
        }) : from ? ({
            timeTo: { $gt: from },
        }) : to ? ({
            timeFrom: { $lt: to },
        }) : ({}),
    },
    location: {
        toAPI: locations => ({ location: { $in: locations } }),
    },
};


// FIXME: needs a lot more DRY

export const tasks = {
    list: async (_, { search, offset, fields, limit }) => {
        const client = await asyncClient;

        const opts = {
            offset,
            limit,
            fields: ['id', 'name', 'abbrev', 'org'],
            order: fieldsToOrder(fields),
        };

        if (search && search.query) {
            const transformedQuery = util.transformSearch(search.query);
            if (!util.isValidSearch(transformedQuery)) {
                throw { code: 'invalid-search-query', message: 'invalid search query' };
            }
            opts.search = { cols: [search.field], str: transformedQuery };
        }

        const res = await client.get('/congresses', opts);

        for (const item of res.body) {
            const existing = store.get([CONGRESSES, item.id, DATA]);
            store.insert([CONGRESSES, item.id, DATA], deepMerge(existing, item));
        }

        return {
            items: res.body.map(item => item.id),
            total: +res.res.headers.get('x-total-items'),
            stats: {
                filtered: false,
                time: res.resTime,
            },
        };
    },

    congress: async ({ id }) => {
        const client = await asyncClient;

        const res = await client.get(`/congresses/${id}`, {
            fields: ['id', 'name', 'abbrev', 'org'],
        });
        const item = res.body;

        const existing = store.get([CONGRESSES, item.id, DATA]);
        store.insert([CONGRESSES, item.id, DATA], deepMerge(existing, item));

        return store.get([CONGRESSES, item.id, DATA]);
    },

    create: async (_, params) => {
        const client = await asyncClient;
        const res = await client.post('/congresses', params);
        const id = +res.res.headers.get('x-identifier');
        store.insert([CONGRESSES, id, DATA], params);
        store.signal([CONGRESSES, SIG_CONGRESSES]);
        return id;
    },
    delete: async ({ id }) => {
        const client = await asyncClient;
        await client.delete(`/congresses/${id}`);
        store.remove([CONGRESSES, id, DATA]);
        store.remove([CONGRESSES, id]);
        store.signal([CONGRESSES, SIG_CONGRESSES]);
    },
    update: async ({ id }, params) => {
        const client = await asyncClient;
        const existing = store.get([CONGRESSES, id, DATA]);
        await client.patch(`/congresses/${id}`, fieldDiff(existing, params));
        store.insert([CONGRESSES, id, DATA], deepMerge(existing, params));
    },

    // MARK - instances

    listInstances: async ({ congress }, { offset, limit, fields, search }) => {
        const client = await asyncClient;

        const opts = {
            offset,
            limit,
            fields: ['id', 'name', 'humanId', 'dateFrom', 'dateTo', 'locationName'],
            order: fieldsToOrder(fields),
        };

        if (search && search.query) {
            const transformedQuery = util.transformSearch(search.query);
            if (!util.isValidSearch(transformedQuery)) {
                throw { code: 'invalid-search-query', message: 'invalid search query' };
            }
            opts.search = { cols: [search.field], str: transformedQuery };
        }

        const res = await client.get(`/congresses/${congress}/instances`, opts);

        for (const item of res.body) {
            const existing = store.get([CONGRESSES, congress, INSTANCES, item.id, DATA]);
            store.insert([CONGRESSES, congress, INSTANCES, item.id, DATA], deepMerge(existing, item));
        }

        return {
            items: res.body.map(item => item.id),
            total: +res.res.headers.get('x-total-items'),
            stats: { filtered: false, time: res.resTime },
        };
    },
    instance: async ({ congress, id }) => {
        const client = await asyncClient;
        const res = await client.get(`/congresses/${congress}/instances/${id}`, {
            fields: [
                'id', 'name', 'humanId', 'dateFrom', 'dateTo', 'locationName', 'locationNameLocal',
                'locationCoords', 'locationAddress', 'tz',
            ],
        });
        const item = res.body;
        const existing = store.get([CONGRESSES, congress, INSTANCES, item.id, DATA]);
        store.insert([CONGRESSES, congress, INSTANCES, item.id, DATA], deepMerge(existing, item));
        return store.get([CONGRESSES, congress, INSTANCES, item.id, DATA]);
    },
    createInstance: async ({ congress }, params) => {
        const client = await asyncClient;
        const res = await client.post(`/congresses/${congress}/instances`, params);
        const id = +res.res.headers.get('x-identifier');
        store.insert([CONGRESSES, congress, INSTANCES, id, DATA], params);
        store.signal([CONGRESSES, congress, SIG_INSTANCES]);
        return id;
    },
    deleteInstance: async ({ congress, id }) => {
        const client = await asyncClient;
        await client.delete(`/congresses/${congress}/instances/${id}`);
        store.remove([CONGRESSES, congress, INSTANCES, id, DATA]);
        store.remove([CONGRESSES, congress, INSTANCES, id]);
        store.signal([CONGRESSES, congress, SIG_INSTANCES]);
    },
    updateInstance: async ({ congress, id }, params) => {
        const client = await asyncClient;
        const existing = store.get([CONGRESSES, congress, INSTANCES, id, DATA]);
        await client.patch(`/congresses/${congress}/instances/${id}`, fieldDiff(existing, params));
        store.insert([CONGRESSES, congress, INSTANCES, id, DATA], deepMerge(existing, params));
    },
    instanceMap: async ({ congress, id }) => {
        const client = await asyncClient;
        const res = await client.get(`/congresses/${congress}/instances/${id}/map`, {
            fields: ['boundSW', 'boundNE'],
        });
        const item = res.body;
        const existing = store.get([CONGRESSES, congress, INSTANCES, item.id, DATA_MAP]);
        store.insert([CONGRESSES, congress, INSTANCES, item.id, DATA_MAP], deepMerge(existing, item));
        return store.get([CONGRESSES, congress, INSTANCES, item.id, DATA_MAP]);
    },

    // MARK - location tags

    listLocationTags: async ({ congress, instance }, { offset, limit, fields, search }) => {
        const client = await asyncClient;
        const opts = {
            offset,
            limit,
            fields: ['id', 'name'],
            order: fieldsToOrder(fields),
        };
        if (search && search.query) {
            const transformedQuery = util.transformSearch(search.query);
            if (!util.isValidSearch(transformedQuery)) {
                throw { code: 'invalid-search-query', message: 'invalid search query' };
            }
            opts.search = { cols: ['name'], str: transformedQuery };
        }
        const res = await client.get(`/congresses/${congress}/instances/${instance}/location_tags`, opts);
        for (const item of res.body) {
            const existing = store.get([CONGRESSES, congress, INSTANCES, instance, LOC_TAGS, item.id]);
            store.insert([CONGRESSES, congress, INSTANCES, instance, LOC_TAGS, item.id], deepMerge(existing, item));
        }
        return {
            items: res.body.map(item => item.id),
            total: +res.res.headers.get('x-total-items'),
            stats: { filtered: false, time: res.resTime },
        };
    },
    locationTag: async ({ congress, instance, id }) => {
        const client = await asyncClient;
        const res = await client.get(`/congresses/${congress}/instances/${instance}/location_tags/${id}`, {
            fields: ['id', 'name'],
        });
        const item = res.body;
        const existing = store.get([CONGRESSES, congress, INSTANCES, instance, LOC_TAGS, item.id]);
        store.insert([CONGRESSES, congress, INSTANCES, instance, LOC_TAGS, item.id], deepMerge(existing, item));
        return store.get([CONGRESSES, congress, INSTANCES, instance, LOC_TAGS, item.id]);
    },
    createLocationTag: async ({ congress, instance }, { name }) => {
        const client = await asyncClient;
        const res = await client.post(`/congresses/${congress}/instances/${instance}/location_tags`, { name });
        const id = +res.res.headers.get('x-identifier');
        store.insert([CONGRESSES, congress, INSTANCES, instance, LOC_TAGS, id], { name });
        store.signal([CONGRESSES, congress, INSTANCES, instance, SIG_LOC_TAGS]);
        return id;
    },
    deleteLocationTag: async ({ congress, instance, id }) => {
        const client = await asyncClient;
        await client.delete(`/congresses/${congress}/instances/${instance}/location_tags/${id}`);
        store.remove([CONGRESSES, congress, INSTANCES, instance, LOC_TAGS, id]);
        store.signal([CONGRESSES, congress, INSTANCES, instance, SIG_PROG_TAGS]);
    },
    updateLocationTag: async ({ congress, instance, id }, { name }) => {
        const client = await asyncClient;
        await client.patch(`/congresses/${congress}/instances/${instance}/location_tags/${id}`, { name });
        const existing = store.get([CONGRESSES, congress, INSTANCES, instance, LOC_TAGS, id]);
        store.insert([CONGRESSES, congress, INSTANCES, instance, LOC_TAGS, id], deepMerge(existing, { name }));
    },

    // MARK - locations

    listLocations: async ({ congress, instance, externalOnly }, { offset, limit, fields, filters, search }) => {
        const client = await asyncClient;
        const opts = {
            offset,
            limit,
            fields: ['id', 'name', 'description', 'll', 'icon', 'address', 'type', 'externalLoc'],
            order: fieldsToOrder(fields),
        };
        const apiFilter = filtersToAPI(locClientFilters, filters);
        if (apiFilter) opts.filter = apiFilter;
        if (externalOnly) {
            if (opts.filter) opts.filter = { $and: [opts.filter, { type: 'external' }] };
            else opts.filter = { type: 'external' };
        }
        if (search && search.query) {
            const transformedQuery = util.transformSearch(search.query);
            if (!util.isValidSearch(transformedQuery)) {
                throw { code: 'invalid-search-query', message: 'invalid search query' };
            }
            opts.search = { cols: [search.field], str: transformedQuery };
        }
        const res = await client.get(`/congresses/${congress}/instances/${instance}/locations`, opts);
        for (const item of res.body) {
            const existing = store.get([CONGRESSES, congress, INSTANCES, instance, LOCATIONS, item.id, DATA]);
            store.insert([CONGRESSES, congress, INSTANCES, instance, LOCATIONS, item.id, DATA], deepMerge(existing, item));
        }
        return {
            items: res.body.map(item => item.id),
            total: +res.res.headers.get('x-total-items'),
            stats: { filtered: false, time: res.resTime },
        };
    },
    location: async ({ congress, instance, id }) => {
        const client = await asyncClient;
        const res = await client.get(`/congresses/${congress}/instances/${instance}/locations/${id}`, {
            fields: ['id', 'name', 'description', 'll', 'icon', 'address', 'type', 'externalLoc',
                'rating.rating', 'rating.max', 'rating.type'],
        });
        const item = res.body;
        const existing = store.get([CONGRESSES, congress, INSTANCES, instance, LOCATIONS, item.id, DATA]);
        store.insert([CONGRESSES, congress, INSTANCES, instance, LOCATIONS, item.id, DATA], deepMerge(existing, item));
        return store.get([CONGRESSES, congress, INSTANCES, instance, LOCATIONS, item.id, DATA]);
    },
    createLocation: async ({ congress, instance }, params) => {
        const client = await asyncClient;
        const res = await client.post(`/congresses/${congress}/instances/${instance}/locations`, params);
        const id = +res.res.headers.get('x-identifier');
        store.insert([CONGRESSES, congress, INSTANCES, instance, LOCATIONS, id, DATA], { name });
        store.signal([CONGRESSES, congress, INSTANCES, instance, SIG_LOCATIONS]);
        return id;
    },
    deleteLocation: async ({ congress, instance, id }) => {
        const client = await asyncClient;
        await client.delete(`/congresses/${congress}/instances/${instance}/locations/${id}`);
        store.remove([CONGRESSES, congress, INSTANCES, instance, LOCATIONS, id, DATA]);
        store.remove([CONGRESSES, congress, INSTANCES, instance, LOCATIONS, id]);
        store.signal([CONGRESSES, congress, INSTANCES, instance, SIG_LOCATIONS]);
    },
    updateLocation: async ({ congress, instance, id }, params) => {
        const client = await asyncClient;
        const existing = store.get([CONGRESSES, congress, INSTANCES, instance, LOCATIONS, id, DATA]);
        await client.patch(`/congresses/${congress}/instances/${instance}/locations/${id}`, fieldDiff(existing, params));
        store.insert([CONGRESSES, congress, INSTANCES, instance, LOCATIONS, id, DATA], deepMerge(existing, params));
    },
    locationThumbnail: async ({ congress, instance, id }, { size }) => {
        const client = await asyncClient;
        const res = await fetch(client.client.createURL(`/congresses/${congress}/instances/${instance}/locations/${id}/thumbnail/${size}`), {
            credentials: 'include',
            mode: 'cors',
        });
        if (res.status === 404) return null;
        if (!res.ok) throw { statusCode: res.status };
        return await res.blob();
    },
    updateLocationThumbnail: async ({ congress, instance, id }, { thumbnail }) => {
        const client = await asyncClient;
        await client.put(`/congresses/${congress}/instances/${instance}/locations/${id}/thumbnail`, null, {}, [{
            name: 'thumbnail',
            type: thumbnail.type,
            value: thumbnail,
        }]);
    },
    deleteLocationThumbnail: async ({ congress, instance, id }) => {
        const client = await asyncClient;
        await client.delete(`/congresses/${congress}/instances/${instance}/locations/${id}/thumbnail`);
    },

    // MARK - tags of a location

    listTagsOfLocation: async ({ congress, instance, location }, { offset, limit, fields, search }) => {
        const client = await asyncClient;
        const opts = {
            offset,
            limit,
            fields: ['id', 'name'],
            order: fieldsToOrder(fields),
        };
        if (search && search.query) {
            const transformedQuery = util.transformSearch(search.query);
            if (!util.isValidSearch(transformedQuery)) {
                throw { code: 'invalid-search-query', message: 'invalid search query' };
            }
            opts.search = { cols: ['name'], str: transformedQuery };
        }
        const res = await client.get(`/congresses/${congress}/instances/${instance}/locations/${location}/tags`, opts);
        for (const item of res.body) {
            const existing = store.get([CONGRESSES, congress, INSTANCES, instance, LOC_TAGS, item.id]);
            store.insert([CONGRESSES, congress, INSTANCES, instance, LOC_TAGS, item.id], deepMerge(existing, item));
        }
        return {
            items: res.body.map(item => item.id),
            total: +res.res.headers.get('x-total-items'),
            stats: { filtered: false, time: res.resTime },
        };
    },
    addTagToLocation: async ({ congress, instance, location, id }) => {
        const client = await asyncClient;
        await client.put(`/congresses/${congress}/instances/${instance}/locations/${location}/tags/${id}`);
        store.signal([CONGRESSES, congress, INSTANCES, instance, LOCATIONS, location, SIG_LOC_TAGS]);
    },
    removeTagFromLocation: async ({ congress, instance, location, id }) => {
        const client = await asyncClient;
        await client.delete(`/congresses/${congress}/instances/${instance}/locations/${location}/tags/${id}`);
        store.signal([CONGRESSES, congress, INSTANCES, instance, LOCATIONS, location, SIG_LOC_TAGS]);
    },

    // MARK - program tags

    listProgramTags: async ({ congress, instance }, { offset, limit, fields, search }) => {
        const client = await asyncClient;
        const opts = {
            offset,
            limit,
            fields: ['id', 'name'],
            order: fieldsToOrder(fields),
        };
        if (search && search.query) {
            const transformedQuery = util.transformSearch(search.query);
            if (!util.isValidSearch(transformedQuery)) {
                throw { code: 'invalid-search-query', message: 'invalid search query' };
            }
            opts.search = { cols: ['name'], str: transformedQuery };
        }
        const res = await client.get(`/congresses/${congress}/instances/${instance}/program_tags`, opts);
        for (const item of res.body) {
            const existing = store.get([CONGRESSES, congress, INSTANCES, instance, PROG_TAGS, item.id]);
            store.insert([CONGRESSES, congress, INSTANCES, instance, PROG_TAGS, item.id], deepMerge(existing, item));
        }
        return {
            items: res.body.map(item => item.id),
            total: +res.res.headers.get('x-total-items'),
            stats: { filtered: false, time: res.resTime },
        };
    },
    programTag: async ({ congress, instance, id }) => {
        const client = await asyncClient;
        const res = await client.get(`/congresses/${congress}/instances/${instance}/program_tags/${id}`, {
            fields: ['id', 'name'],
        });
        const item = res.body;
        const existing = store.get([CONGRESSES, congress, INSTANCES, instance, PROG_TAGS, item.id]);
        store.insert([CONGRESSES, congress, INSTANCES, instance, PROG_TAGS, item.id], deepMerge(existing, item));
        return store.get([CONGRESSES, congress, INSTANCES, instance, PROG_TAGS, item.id]);
    },
    createProgramTag: async ({ congress, instance }, { name }) => {
        const client = await asyncClient;
        const res = await client.post(`/congresses/${congress}/instances/${instance}/program_tags`, { name });
        const id = +res.res.headers.get('x-identifier');
        store.insert([CONGRESSES, congress, INSTANCES, instance, PROG_TAGS, id], { name });
        store.signal([CONGRESSES, congress, INSTANCES, instance, SIG_PROG_TAGS]);
        return id;
    },
    deleteProgramTag: async ({ congress, instance, id }) => {
        const client = await asyncClient;
        await client.delete(`/congresses/${congress}/instances/${instance}/program_tags/${id}`);
        store.remove([CONGRESSES, congress, INSTANCES, instance, PROG_TAGS, id]);
        store.signal([CONGRESSES, congress, INSTANCES, instance, SIG_PROG_TAGS]);
    },
    updateProgramTag: async ({ congress, instance, id }, { name }) => {
        const client = await asyncClient;
        await client.patch(`/congresses/${congress}/instances/${instance}/program_tags/${id}`, { name });
        const existing = store.get([CONGRESSES, congress, INSTANCES, instance, PROG_TAGS, id]);
        store.insert([CONGRESSES, congress, INSTANCES, instance, PROG_TAGS, id], deepMerge(existing, { name }));
    },

    // MARK - programs

    listPrograms: async ({ congress, instance }, { offset, limit, fields, filters, jsonFilter, search }) => {
        const client = await asyncClient;
        const opts = {
            offset,
            limit,
            fields: ['id', 'title', 'description', 'owner', 'timeFrom', 'timeTo', 'location'],
            order: fieldsToOrder(fields),
        };
        const apiFilter = addJSONFilter(filtersToAPI(progClientFilters, filters), jsonFilter);
        if (apiFilter) opts.filter = apiFilter;
        if (search && search.query) {
            const transformedQuery = util.transformSearch(search.query);
            if (!util.isValidSearch(transformedQuery)) {
                throw { code: 'invalid-search-query', message: 'invalid search query' };
            }
            opts.search = { cols: [search.field], str: transformedQuery };
        }
        const res = await client.get(`/congresses/${congress}/instances/${instance}/programs`, opts);
        for (const item of res.body) {
            const existing = store.get([CONGRESSES, congress, INSTANCES, instance, PROGRAMS, item.id, DATA]);
            store.insert([CONGRESSES, congress, INSTANCES, instance, PROGRAMS, item.id, DATA], deepMerge(existing, item));
        }
        return {
            items: res.body.map(item => item.id),
            total: +res.res.headers.get('x-total-items'),
            stats: { filtered: false, time: res.resTime },
        };
    },
    program: async ({ congress, instance, id }) => {
        const client = await asyncClient;
        const res = await client.get(`/congresses/${congress}/instances/${instance}/programs/${id}`, {
            fields: ['id', 'title', 'description', 'owner', 'timeFrom', 'timeTo', 'location'],
        });
        const item = res.body;
        const existing = store.get([CONGRESSES, congress, INSTANCES, instance, PROGRAMS, item.id, DATA]);
        store.insert([CONGRESSES, congress, INSTANCES, instance, PROGRAMS, item.id, DATA], deepMerge(existing, item));
        return store.get([CONGRESSES, congress, INSTANCES, instance, PROGRAMS, item.id, DATA]);
    },
    createProgram: async ({ congress, instance }, params) => {
        const client = await asyncClient;
        const res = await client.post(`/congresses/${congress}/instances/${instance}/programs`, params);
        const id = +res.res.headers.get('x-identifier');
        store.insert([CONGRESSES, congress, INSTANCES, instance, PROGRAMS, id, DATA], { name });
        store.signal([CONGRESSES, congress, INSTANCES, instance, SIG_PROGRAMS]);
        return id;
    },
    deleteProgram: async ({ congress, instance, id }) => {
        const client = await asyncClient;
        await client.delete(`/congresses/${congress}/instances/${instance}/programs/${id}`);
        store.remove([CONGRESSES, congress, INSTANCES, instance, PROGRAMS, id, DATA]);
        store.remove([CONGRESSES, congress, INSTANCES, instance, PROGRAMS, id]);
        store.signal([CONGRESSES, congress, INSTANCES, instance, SIG_PROGRAMS]);
    },
    updateProgram: async ({ congress, instance, id }, params) => {
        const client = await asyncClient;
        const existing = store.get([CONGRESSES, congress, INSTANCES, instance, PROGRAMS, id, DATA]);
        await client.patch(`/congresses/${congress}/instances/${instance}/programs/${id}`, fieldDiff(existing, params));
        store.insert([CONGRESSES, congress, INSTANCES, instance, PROGRAMS, id, DATA], deepMerge(existing, params));
    },

    // MARK - tags of a program

    listTagsOfProgram: async ({ congress, instance, program }, { offset, limit, fields, search }) => {
        const client = await asyncClient;
        const opts = {
            offset,
            limit,
            fields: ['id', 'name'],
            order: fieldsToOrder(fields),
        };
        if (search && search.query) {
            const transformedQuery = util.transformSearch(search.query);
            if (!util.isValidSearch(transformedQuery)) {
                throw { code: 'invalid-search-query', message: 'invalid search query' };
            }
            opts.search = { cols: ['name'], str: transformedQuery };
        }
        const res = await client.get(`/congresses/${congress}/instances/${instance}/programs/${program}/tags`, opts);
        for (const item of res.body) {
            const existing = store.get([CONGRESSES, congress, INSTANCES, instance, PROG_TAGS, item.id]);
            store.insert([CONGRESSES, congress, INSTANCES, instance, PROG_TAGS, item.id], deepMerge(existing, item));
        }
        return {
            items: res.body.map(item => item.id),
            total: +res.res.headers.get('x-total-items'),
            stats: { filtered: false, time: res.resTime },
        };
    },
    addTagToProgram: async ({ congress, instance, program, id }) => {
        const client = await asyncClient;
        await client.put(`/congresses/${congress}/instances/${instance}/programs/${program}/tags/${id}`);
        store.signal([CONGRESSES, congress, INSTANCES, instance, PROGRAMS, program, SIG_PROG_TAGS]);
    },
    removeTagFromProgram: async ({ congress, instance, program, id }) => {
        const client = await asyncClient;
        await client.delete(`/congresses/${congress}/instances/${instance}/programs/${program}/tags/${id}`);
        store.signal([CONGRESSES, congress, INSTANCES, instance, PROGRAMS, program, SIG_PROG_TAGS]);
    },

    // MARK - registration
    registrationForm: async ({ congress, instance }) => {
        const client = await asyncClient;
        let res;
        try {
            res = await client.get(`/congresses/${congress}/instances/${instance}/registration_form`);
        } catch (err) {
            if (err.statusCode === 404) {
                store.insert([CONGRESSES, congress, INSTANCES, instance, REG_FORM], null);
                return null;
            }
        }
        store.insert([CONGRESSES, congress, INSTANCES, instance, REG_FORM], res.body);
        return res.body;
    },
    deleteRegistrationForm: async ({ congress, instance }) => {
        const client = await asyncClient;
        await client.delete(`/congresses/${congress}/instances/${instance}/registration_form`);
        store.delete([CONGRESSES, congress, INSTANCES, instance, REG_FORM]);
    },
    setRegistrationForm: async ({ congress, instance }, { data }) => {
        const client = await asyncClient;
        await client.put(`/congresses/${congress}/instances/${instance}/registration_form`, data);
        store.insert([CONGRESSES, congress, INSTANCES, instance, REG_FORM], data);
    },
};

export const views = {
    congress: class CongressView extends AbstractDataView {
        constructor (options) {
            super();
            this.id = options.id;

            store.subscribe([CONGRESSES, this.id, DATA], this.#onUpdate);
            const current = store.get([CONGRESSES, this.id, DATA]);
            if (current) setImmediate(this.#onUpdate);

            if (!options.noFetch) {
                tasks.congress({ id: this.id }).catch(err => this.emit('error', err));
            }
        }

        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) {
                this.emit('update', store.get([CONGRESSES, this.id, DATA]), 'delete');
            } else {
                this.emit('update', store.get([CONGRESSES, this.id, DATA]));
            }
        };

        drop () {
            store.unsubscribe([CONGRESSES, this.id, DATA], this.#onUpdate);
        }
    },

    instance: class InstanceView extends AbstractDataView {
        constructor (options) {
            super();
            this.congress = options.congress;
            this.id = options.id;

            this.path = [CONGRESSES, this.congress, INSTANCES, this.id, DATA];

            store.subscribe(this.path, this.#onUpdate);
            const current = store.get(this.path);
            if (current) setImmediate(this.#onUpdate);

            if (!options.noFetch) {
                tasks.instance({ congress: this.congress, id: this.id }).catch(err => this.emit('error', err));
            }
        }
        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) this.emit('update', store.get(this.path), 'delete');
            else this.emit('update', store.get(this.path));
        };
        drop () {
            store.unsubscribe(this.path, this.#onUpdate);
        }
    },

    locationTag: class LocationTagView extends AbstractDataView {
        constructor (options) {
            super();
            this.congress = options.congress;
            this.instance = options.instance;
            this.id = options.id;
            this.path = [CONGRESSES, this.congress, INSTANCES, this.instance, LOC_TAGS, this.id];
            store.subscribe(this.path, this.#onUpdate);
            const current = store.get(this.path);
            if (current) setImmediate(this.#onUpdate);
            if (!options.noFetch) {
                tasks.locationTag({
                    congress: this.congress,
                    instance: this.instance,
                    id: this.id,
                }).catch(err => this.emit('error', err));
            }
        }
        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) this.emit('update', store.get(this.path), 'delete');
            else this.emit('update', store.get(this.path));
        };
        drop () {
            store.unsubscribe(this.path, this.#onUpdate);
        }
    },

    location: class LocationView extends AbstractDataView {
        constructor (options) {
            super();
            this.congress = options.congress;
            this.instance = options.instance;
            this.id = options.id;
            this.path = [CONGRESSES, this.congress, INSTANCES, this.instance, LOCATIONS, this.id, DATA];
            store.subscribe(this.path, this.#onUpdate);
            const current = store.get(this.path);
            if (current) setImmediate(this.#onUpdate);
            if (!options.noFetch) {
                tasks.location({
                    congress: this.congress,
                    instance: this.instance,
                    id: this.id,
                }).catch(err => this.emit('error', err));
            }
        }
        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) this.emit('update', store.get(this.path), 'delete');
            else this.emit('update', store.get(this.path));
        };
        drop () {
            store.unsubscribe(this.path, this.#onUpdate);
        }
    },

    programTag: class ProgramTagView extends AbstractDataView {
        constructor (options) {
            super();
            this.congress = options.congress;
            this.instance = options.instance;
            this.id = options.id;
            this.path = [CONGRESSES, this.congress, INSTANCES, this.instance, PROG_TAGS, this.id];
            store.subscribe(this.path, this.#onUpdate);
            const current = store.get(this.path);
            if (current) setImmediate(this.#onUpdate);
            if (!options.noFetch) {
                tasks.programTag({
                    congress: this.congress,
                    instance: this.instance,
                    id: this.id,
                }).catch(err => this.emit('error', err));
            }
        }
        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) this.emit('update', store.get(this.path), 'delete');
            else this.emit('update', store.get(this.path));
        };
        drop () {
            store.unsubscribe(this.path, this.#onUpdate);
        }
    },

    program: class ProgramView extends AbstractDataView {
        constructor (options) {
            super();
            this.congress = options.congress;
            this.instance = options.instance;
            this.id = options.id;
            this.path = [CONGRESSES, this.congress, INSTANCES, this.instance, PROGRAMS, this.id, DATA];
            store.subscribe(this.path, this.#onUpdate);
            const current = store.get(this.path);
            if (current) setImmediate(this.#onUpdate);
            if (!options.noFetch) {
                tasks.program({
                    congress: this.congress,
                    instance: this.instance,
                    id: this.id,
                }).catch(err => this.emit('error', err));
            }
        }
        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) this.emit('update', store.get(this.path), 'delete');
            else this.emit('update', store.get(this.path));
        };
        drop () {
            store.unsubscribe(this.path, this.#onUpdate);
        }
    },

    registrationForm: class ProgramView extends AbstractDataView {
        constructor (options) {
            super();
            this.congress = options.congress;
            this.instance = options.instance;
            this.path = [CONGRESSES, this.congress, INSTANCES, this.instance, REG_FORM];
            store.subscribe(this.path, this.#onUpdate);
            const current = store.get(this.path);
            if (current) setImmediate(this.#onUpdate);
            if (!options.noFetch) {
                tasks.registrationForm({
                    congress: this.congress,
                    instance: this.instance,
                }).catch(err => this.emit('error', err));
            }
        }
        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) this.emit('update', store.get(this.path), 'delete');
            else this.emit('update', store.get(this.path));
        };
        drop () {
            store.unsubscribe(this.path, this.#onUpdate);
        }
    },

    sigCongresses: createStoreObserver([CONGRESSES, SIG_CONGRESSES]),
    sigInstances: createStoreObserver(({ congress }) => [CONGRESSES, congress, SIG_INSTANCES]),
    sigLocationTags: createStoreObserver(({ congress, instance }) => [CONGRESSES, congress, INSTANCES, instance, SIG_LOC_TAGS]),
    sigLocations: createStoreObserver(({ congress, instance }) => [CONGRESSES, congress, INSTANCES, instance, SIG_LOCATIONS]),
    sigTagsOfLocation: createStoreObserver(({ congress, instance, location }) => [CONGRESSES, congress, INSTANCES, instance, LOCATIONS, location, SIG_LOC_TAGS]),
    sigProgramTags: createStoreObserver(({ congress, instance }) => [CONGRESSES, congress, INSTANCES, instance, SIG_PROG_TAGS]),
    sigPrograms: createStoreObserver(({ congress, instance }) => [CONGRESSES, congress, INSTANCES, instance, SIG_PROGRAMS]),
    sigTagsOfProgram: createStoreObserver(({ congress, instance, program }) => [CONGRESSES, congress, INSTANCES, instance, PROGRAMS, program, SIG_PROG_TAGS]),
};
