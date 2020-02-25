import JSON5 from 'json5';
import { util } from '@tejo/akso-client';
import asyncClient from '../client';
import { AbstractDataView, createStoreObserver } from '../view';
import { makeParametersToRequestData, makeClientFromAPI, makeClientToAPI } from '../list';
import * as store from '../store';
import { deepMerge, deepEq } from '../../util';

/// Returns the value type-casted to be a float or fraction.
function enforceRational (value) {
    if (Array.isArray(value)) return value.map(x => +x);
    return +value;
}

const clientFields = {
    id: 'id',
    org: 'org',
    name: 'name',
    type: 'type',
    state: {
        apiFields: ['hasResults', 'usedTieBreaker', 'hasStarted', 'hasEnded', 'isActive'],
        fromAPI: vote => ({
            hasResults: vote.hasResults,
            usedTieBreaker: vote.usedTieBreaker,
            hasStarted: vote.hasStarted,
            hasEnded: vote.hasEnded,
            isActive: vote.isActive,
        }),
        toAPI: () => ({}),
    },
    description: 'description',
    voterCodeholders: {
        apiFields: ['voterCodeholders'],
        fromAPI: vote => JSON5.stringify(vote.voterCodeholders, undefined, 4),
        toAPI: value => ({ voterCodeholders: JSON5.parse(value) }),
    },
    voterCodeholdersMemberFilter: {
        apiFields: ['voterCodeholdersMemberFilter'],
        fromAPI: vote => JSON5.stringify(vote.voterCodeholdersMemberFilter, undefined, 4),
        toAPI: () => ({}),
    },
    viewerCodeholders: {
        apiFields: ['viewerCodeholders'],
        fromAPI: vote => JSON5.stringify(vote.viewerCodeholders, undefined, 4),
        toAPI: value => ({ viewerCodeholders: JSON5.parse(value) }),
    },
    viewerCodeholdersMemberFilter: {
        apiFields: ['viewerCodeholdersMemberFilter'],
        fromAPI: vote => JSON5.stringify(vote.viewerCodeholdersMemberFilter, undefined, 4),
        toAPI: () => ({}),
    },
    timespan: {
        apiFields: ['timeStart', 'timeEnd'],
        fromAPI: vote => ({
            start: vote.timeStart,
            end: vote.timeEnd,
        }),
        toAPI: value => ({
            timeStart: value.start,
            timeEnd: value.end,
        }),
    },
    ballotsSecret: 'ballotsSecret',
    config: {
        apiFields: [
            'type',
            'blankBallotsLimit',
            'blankBallotsLimitInclusive',
            'quorum',
            'quorumInclusive',
            'majorityBallots',
            'majorityBallotsInclusive',
            'majorityVoters',
            'majorityVotersInclusive',
            'majorityMustReachBoth',
            'numChosenOptions',
            'mentionThreshold',
            'mentionThresholdInclusive',
            'maxOptionsPerBallot',
            'tieBreakerCodeholder',
            'publishVoters',
            'publishVotersPercentage',
            'options',
        ],
        fromAPI: vote => {
            const value = {
                quorum: vote.quorum,
                quorumInclusive: vote.quorumInclusive,
                publishVoters: vote.publishVoters,
                publishVotersPercentage: vote.publishVotersPercentage,
            };

            if (vote.type === 'yn' || vote.type === 'ynb') {
                value.majorityBallots = vote.majorityBallots;
                value.majorityBallotsInclusive = vote.majorityBallotsInclusive;
                value.majorityVoters = vote.majorityVoters;
                value.majorityVotersInclusive = vote.majorityVotersInclusive;
                value.majorityMustReachBoth = vote.majorityMustReachBoth;
            }
            if (vote.type === 'ynb' || vote.type === 'rp' || vote.type === 'stv' || vote.type === 'tm') {
                value.blankBallotsLimit = vote.blankBallotsLimit;
                value.blankBallotsLimitInclusive = vote.blankBallotsLimitInclusive;
            }
            if (vote.type === 'rp' || vote.type === 'stv' || vote.type === 'tm') {
                value.numChosenOptions = vote.numChosenOptions;
                value.options = vote.options;
            }
            if (vote.type === 'rp' || vote.type === 'tm') {
                value.mentionThreshold = vote.mentionThreshold;
                value.mentionThresholdInclusive = vote.mentionThresholdInclusive;
            }
            if (vote.type === 'tm') {
                value.maxOptionsPerBallot = vote.maxOptionsPerBallot;
            }
            if (vote.type === 'rp' || vote.type === 'stv') {
                value.tieBreakerCodeholder = vote.tieBreakerCodeholder;
            }

            return value;
        },
        toAPI: (value, item) => {
            const vote = {
                quorum: enforceRational(value.quorum),
                quorumInclusive: !!value.quorumInclusive,
                publishVoters: !!value.publishVoters,
                publishVotersPercentage: !!value.publishVotersPercentage,
            };

            if (item.type === 'yn' || item.type === 'ynb') {
                vote.majorityBallots = enforceRational(value.majorityBallots);
                vote.majorityBallotsInclusive = !!value.majorityBallotsInclusive;
                vote.majorityVoters = enforceRational(value.majorityVoters);
                vote.majorityVotersInclusive = !!value.majorityVotersInclusive;
                vote.majorityMustReachBoth = !!value.majorityMustReachBoth;
            }
            if (item.type === 'ynb' || item.type === 'rp' || item.type === 'stv' || item.type === 'tm') {
                vote.blankBallotsLimit = enforceRational(value.blankBallotsLimit);
                vote.blankBallotsLimitInclusive = !!value.blankBallotsLimitInclusive;
            }
            if (item.type === 'rp' || item.type === 'stv' || item.type === 'tm') {
                vote.numChosenOptions = +value.numChosenOptions;
                vote.options = value.options.map(item => {
                    if (item.type === 'codeholder') {
                        return {
                            type: item.type,
                            codeholderId: item.codeholderId,
                            description: item.description || null,
                        };
                    } else {
                        return {
                            type: item.type,
                            name: item.name,
                            description: item.description || null,
                        };
                    }
                });
            }
            if (item.type === 'rp' || item.type === 'tm') {
                vote.mentionThreshold = enforceRational(value.mentionThreshold);
                vote.mentionThresholdInclusive = !!value.mentionThresholdInclusive;
            }
            if (item.type === 'tm') {
                vote.maxOptionsPerBallot = Number.isFinite(+value.maxOptionsPerBallot)
                    ? +vote.maxOptionsPerBallot
                    : vote.maxOptionsPerBallot;
            }
            if (item.type === 'rp' || item.type === 'stv') {
                vote.tieBreakerCodeholder = value.tieBreakerCodeholder;
            }

            return vote;
        },
    },
};

let templateFields = new Set(Object.values(clientFields).flatMap(item => item.apiFields));
templateFields.delete('org');
templateFields = [...templateFields];

const clientFilters = {
    org: {
        toAPI: value => ({ org: value }),
    },
    timeStart: {
        toAPI: value => ({ timeStart: { $range: value } }),
    },
    timeEnd: {
        toAPI: value => ({ timeEnd: { $range: value } }),
    },
    state: {
        toAPI: value => {
            if (value === 'pending') return {
                $not: {
                    $or: [{ hasStarted: true }, { isActive: true }, { hasEnded: true }],
                },
            };
            else if (value === 'started') return { hasStarted: true };
            else if (value === 'active') return { isActive: true };
            else if (value === 'ended') return { hasEnded: true };
            return {};
        },
    },
    type: {
        toAPI: type => ({ type }),
    },
};

const parametersToRequestData = makeParametersToRequestData({ clientFields, clientFilters });
const clientFromAPI = makeClientFromAPI(clientFields);
const clientToAPI = makeClientToAPI(clientFields);

export const VOTES = 'votes';
export const VOTE_TEMPLATES = 'voteTemplates';
export const SIG_VOTES = '!votes';

export const tasks = {
    list: async (_, parameters) => {
        const client = await asyncClient;

        const { options, usedFilters, transientFields } = parametersToRequestData(parameters);

        const result = await client.get('/votes', options);
        let list = result.body;
        const totalItems = +result.res.headers.get('x-total-items');

        for (const item of list) {
            const existing = store.get([VOTES, item.id]);
            store.insert([VOTES, item.id], deepMerge(existing, clientFromAPI(item)));
        }

        list = list.map(item => item.id);

        return {
            items: list,
            total: totalItems,
            transientFields,
            stats: {
                time: result.resTime,
                filtered: usedFilters,
            },
        };
    },
    vote: async (_, { id, fields }) => {
        const client = await asyncClient;
        const res = await client.get(`/votes/${+id}`, {
            fields: ['id'].concat(fields.flatMap(id => typeof clientFields[id] === 'string'
                ? [clientFields[id]]
                : clientFields[id].apiFields)),
        });

        const existing = store.get([VOTES, +id]);
        store.insert([VOTES, +id], deepMerge(existing, clientFromAPI(res.body)));

        return +id;
    },

    create: async (_, data) => {
        const client = await asyncClient;
        const res = await client.post('/votes', clientToAPI(data));
        const id = +res.res.headers.get('x-identifier');
        store.insert([VOTES, +id], data);
        store.signal([VOTES, SIG_VOTES]);
        return id;
    },

    update: async ({ id }, data) => {
        const client = await asyncClient;
        const existing = store.get([VOTES, +id]);
        const currentData = clientToAPI(existing);
        const newData = clientToAPI(data);
        const diff = {};

        for (const k in newData) {
            if (!deepEq(currentData[k], newData[k])) {
                diff[k] = newData[k];
            }
        }
        await client.patch(`/votes/${id}`, diff);
        store.insert([VOTES, +id], deepMerge(existing, data));
    },

    delete: async ({ id }) => {
        const client = await asyncClient;
        await client.delete(`/votes/${id}`);
        store.remove([VOTES, +id]);
        store.signal([VOTES, SIG_VOTES]);
    },

    listTemplates: async (_, { search, offset, limit }) => {
        const client = await asyncClient;

        const opts = { offset, limit };
        if (search && search.query) {
            const transformedQuery = util.transformSearch(search.query);
            if (!util.isValidSearch(transformedQuery)) {
                throw { code: 'invalid-search-query', message: 'invalid search query' };
            }
            opts.search = { cols: [search.field], str: transformedQuery };
        }

        const res = await client.get('/vote_templates', {
            fields: ['id', 'org', 'name', 'description'],
            ...opts,
        });

        let list = res.body;
        const totalItems = +res.res.headers.get('x-total-items');

        for (const item of list) {
            const existing = store.get([VOTE_TEMPLATES, item.id]);
            store.insert([VOTE_TEMPLATES, item.id], deepMerge(existing, item));
        }

        list = list.map(item => item.id);

        return {
            items: list,
            total: totalItems,
            stats: {
                time: res.resTime,
                filtered: false,
            },
        };
    },
    voteTemplate: async (_, { id, fields }) => {
        const client = await asyncClient;
        const res = await client.get(`/vote_templates/${+id}`, {
            fields: [
                'id',
                'org',
                'name',
                'description',
                ...templateFields.map(field => `vote.${field}`),
            ],
        });

        const existing = store.get([VOTE_TEMPLATES, +id]);
        store.insert([VOTE_TEMPLATES, +id], deepMerge(existing, clientFromAPI(res.body)));

        return +id;
    },
};

export const views = {
    vote: class Vote extends AbstractDataView {
        constructor (options) {
            super();
            const { id, fields } = options;
            this.id = id;
            this.fields = fields;

            store.subscribe([VOTES, this.id], this.#onUpdate);
            const current = store.get([VOTES, this.id]);
            if (current) setImmediate(this.#onUpdate);

            let shouldFetch = !options.noFetch;
            if (options.lazyFetch) {
                shouldFetch = false;
                for (const field of options.fields) {
                    if (!current || !current[field]) {
                        shouldFetch = true;
                        break;
                    }
                }
            }

            if (shouldFetch) {
                tasks.vote({}, { id, fields }).catch(err => this.emit('error', err));
            }
        }

        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) {
                this.emit('update', store.get([VOTES, this.id]), 'delete');
            } else {
                this.emit('update', store.get([VOTES, this.id]));
            }
        };

        drop () {
            store.unsubscribe([VOTES, this.id], this.#onUpdate);
        }
    },

    voteTemplate: class VoteTemplate extends AbstractDataView {
        constructor (options) {
            super();
            const { id, fields } = options;
            this.id = id;
            this.fields = fields;

            store.subscribe([VOTE_TEMPLATES, this.id], this.#onUpdate);
            const current = store.get([VOTE_TEMPLATES, this.id]);
            if (current) setImmediate(this.#onUpdate);

            if (!options.noFetch) {
                tasks.voteTemplate({}, { id, fields }).catch(err => this.emit('error', err));
            }
        }

        #onUpdate = (type) => {
            if (type === store.UpdateType.DELETE) {
                this.emit('update', store.get([VOTE_TEMPLATES, this.id]), 'delete');
            } else {
                this.emit('update', store.get([VOTE_TEMPLATES, this.id]));
            }
        };

        drop () {
            store.unsubscribe([VOTE_TEMPLATES, this.id], this.#onUpdate);
        }
    },

    sigVotes: createStoreObserver([VOTES, SIG_VOTES]),
    sigVoteTemplates: createStoreObserver([VOTE_TEMPLATES, SIG_VOTES]),
};
