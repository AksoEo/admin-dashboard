import { h } from 'preact';
import moment from 'moment';
import { TextField } from '@cpsdqs/yamdl';
import TejoIcon from '../../../components/tejo-icon';
import UeaIcon from '../../../components/uea-icon';
import { votes as locale, timestampFormat } from '../../../locale';
import { timeStart as TimeStart, timeEnd as TimeEnd } from './config';

export default {
    org: {
        sortable: true,
        weight: 0.5,
        component ({ value }) {
            if (value === 'tejo') {
                return <TejoIcon />;
            } else if (value === 'uea') {
                return <UeaIcon />;
            }
            return null;
        },
        stringify (value) {
            return value;
        },
        shouldHide: () => true,
    },
    name: {
        sortable: true,
        component ({ value, onChange, editing }) {
            if (!editing) return value;
            return (
                <TextField
                    value={value}
                    onChange={e => onChange(e.target.value)} />
            );
        },
        stringify (value) {
            return value;
        },
        shouldHide: (_, editing) => !editing,
    },
    description: {
        sortable: true,
        component ({ value, onChange, editing }) {
            if (!editing) return value;
            return (
                <textarea
                    class="vote-description-editor"
                    value={value}
                    onChange={e => onChange(e.target.value)} />
            );
        },
        stringify (value) {
            return value;
        },
    },
    type: {
        component ({ value }) {
            return locale.types[value];
        },
        stringify (value) {
            return locale.types[value];
        },
    },
    state: (() => {
        const stringify = value => {
            if (value.hasResults) {
                return value.usedTieBreaker
                    ? locale.state.hasResultsTiebreaker
                    : locale.state.hasResults;
            }
            if (value.hasEnded) return locale.state.hasEnded;
            if (value.isActive) return locale.state.isActive;
            return locale.state.hasNotStarted;
        };

        return {
            component: ({ value }) => stringify(value),
            stringify,
        };
    })(),
    timespan: {
        sortable: true,
        component ({ value, onChange, editing, item }) {
            if (!value) return;
            return (
                <span class="vote-timespan">
                    <TimeStart value={value.start} onChange={start => onChange({ ...value, start })} editing={editing} item={item} />
                    {'–'}
                    <TimeEnd value={value.end} onChange={end => onChange({ ...value, end })} editing={editing} item={item} />
                </span>
            );
        },
        stringify (value) {
            return `${moment(value.start * 1000).format(timestampFormat)}–${moment(value.end * 1000).format(timestampFormat)}`;
        },
    },
};