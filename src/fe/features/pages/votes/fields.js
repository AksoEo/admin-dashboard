import { h } from 'preact';
import moment from 'moment';
import MdField from '../../../components/md-field';
import LimitedTextField from '../../../components/limited-text-field';
import OrgIcon from '../../../components/org-icon';
import { votes as locale, timestampFormat } from '../../../locale';
import { timeStart as TimeStart, timeEnd as TimeEnd } from './config';

export default {
    org: {
        sortable: true,
        weight: 0.5,
        slot: 'title',
        component ({ value }) {
            return <OrgIcon org={value} />;
        },
        stringify (value) {
            return value;
        },
        shouldHide: () => true,
    },
    name: {
        sortable: true,
        slot: 'title',
        component ({ value, onChange, editing }) {
            if (!editing) return value;
            return (
                <LimitedTextField
                    class="name-field"
                    outline
                    maxLength={100}
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
        component ({ value, onChange, editing, slot }) {
            return (
                <MdField
                    rules={['emphasis', 'strikethrough', 'link', 'list', 'table', 'image']}
                    value={value}
                    editing={editing}
                    inline={slot !== 'detail'}
                    onChange={onChange}
                    maxLength={10000} />
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
            component: ({ value }) => (
                <div>
                    {stringify(value).split('\n').map((x, i) => <div key={i}>{x}</div>)}
                </div>
            ),
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
