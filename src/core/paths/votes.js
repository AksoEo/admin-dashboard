import asyncClient from '../client';
import { AbstractDataView, createStoreObserver } from '../view';
import { makeParametersToRequestData, makeClientFromAPI, makeClientToAPI } from '../list';
import * as store from '../store';
import { deepMerge } from '../../util';

const clientFields = {
    id: 'id',
    org: 'org',
    name: 'name',
    state: {
        apiFields: ['hasResults', 'usedTieBreaker', 'hasStarted', 'hasEnded', 'isActive'],
        fromAPI: vote => ({
            hasResults: vote.hasResults,
            usedTieBreaker: vote.usedTieBreaker,
            hasStarted: vote.hasStarted,
            hasEnded: vote.hasEnded,
            isActive: vote.isActive,
        }),
        toAPI: value => ({
            hasResults: value.hasResults,
            usedTieBreaker: value.usedTieBreaker,
            hasStarted: value.hasStarted,
            hasEnded: value.hasEnded,
            isActive: value.isActive,
        }),
    },
    description: 'description',
    voterCodeholders: 'voterCodeholders',
    voterCodeholdersMemberFilter: 'voterCodeholdersMemberFilter',
    viewerCodeholders: 'viewerCodeholders',
    viewerCodeholdersMemberFilter: 'viewerCodeholdersMemberFilter',
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
                type: vote.type,
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
        toAPI: value => {
            const vote = {
                type: value.type,
                quorum: value.quorum,
                quorumInclusive: value.quorumInclusive,
                publishVoters: value.publishVoters,
                publishVotersPercentage: value.publishVotersPercentage,
            };

            if (value.type === 'yn' || value.type === 'ynb') {
                vote.majorityBallots = value.majorityBallots;
                vote.majorityBallotsInclusive = value.majorityBallotsInclusive;
                vote.majorityVoters = value.majorityVoters;
                vote.majorityVotersInclusive = value.majorityVotersInclusive;
                vote.majorityMustReachBoth = value.majorityMustReachBoth;
            }
            if (value.type === 'ynb' || value.type === 'rp' || value.type === 'stv' || value.type === 'tm') {
                vote.blankBallotsLimit = value.blankBallotsLimit;
                vote.blankBallotsLimitInclusive = value.blankBallotsLimitInclusive;
            }
            if (value.type === 'rp' || value.type === 'stv' || value.type === 'tm') {
                vote.numChosenOptions = value.numChosenOptions;
                vote.options = value.options;
            }
            if (value.type === 'rp' || value.type === 'tm') {
                vote.mentionThreshold = value.mentionThreshold;
                vote.mentionThresholdInclusive = value.mentionThresholdInclusive;
            }
            if (value.type === 'tm') {
                vote.maxOptionsPerBallot = value.maxOptionsPerBallot;
            }
            if (value.type === 'rp' || value.type === 'stv') {
                vote.tieBreakerCodeholder = value.tieBreakerCodeholder;
            }

            return vote;
        },
    },
};
const clientFilters = {
    // TODO
};

const parametersToRequestData = makeParametersToRequestData({ clientFields, clientFilters });
const clientFromAPI = makeClientFromAPI(clientFields);
const clientToAPI = makeClientToAPI(clientFields);

export const VOTES = 'votes';
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
                tasks.vote({}, {
                    id,
                    fields: fields.map(field => ({ id: field, sorting: 'none' })),
                }).catch(err => this.emit('error', err));
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

    sigVotes: createStoreObserver([VOTES, SIG_VOTES]),
};
