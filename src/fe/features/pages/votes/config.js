import { h } from 'preact';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import { TextField } from '@cpsdqs/yamdl';
import Segmented from '../../../components/segmented';
import JSONEditor from '../../../components/json-editor';
import { timestamp } from '../../../components/data';
import { votes as locale } from '../../../locale';
import Rational from './rational';

export function voterCodeholders ({ value, onChange, editing, item }) {
    if (editing && item.state.isActive) return locale.cannotEditActive;
    return (
        <JSONEditor
            value={value}
            onChange={onChange}
            disabled={!editing} />
    );
}

export function viewerCodeholders ({ value, onChange, editing }) {
    return (
        <JSONEditor
            value={value}
            onChange={onChange}
            disabled={!editing} />
    );
}

export function voterCodeholdersMemberFilter ({ value, onChange, editing }) {
    if (editing) return null;
    return (
        <JSONEditor
            value={value}
            onChange={onChange}
            disabled={true} />
    );
}

export function viewerCodeholdersMemberFilter ({ value, onChange, editing }) {
    if (editing) return null;
    return (
        <JSONEditor
            value={value}
            onChange={onChange}
            disabled={true} />
    );
}

export function timeStart ({ value, onChange, editing, item }) {
    if (!editing) return <timestamp.renderer value={value * 1000} />;
    if (item.state.isActive) return locale.cannotEditActive;
    return (
        <timestamp.editor
            value={value}
            onChange={onChange} />
    );
}
export const timeEnd = timeStart;

function bool ({ value, onChange, editing }) {
    if (!editing) {
        return value ? <CheckIcon /> : <CloseIcon />;
    }

    return (
        <Segmented
            selected={value ? 'yes' : 'no'}
            onSelect={value => onChange(value === 'yes')}>
            {[
                {
                    id: 'yes',
                    label: locale.bool.yes,
                },
                {
                    id: 'no',
                    label: locale.bool.no,
                },
            ]}
        </Segmented>
    );
}

function inactiveBool ({ value, onChange, editing, item }) {
    if (editing && item.state.isActive) return locale.cannotEditActive;
    const Bool = bool;
    return <Bool value={value} onChange={onChange} editing={editing} />;
}


export function type ({ value, onChange, editing, item }) {
    if (!editing) {
        return locale.types[value];
    }

    if (item.state.isActive) return locale.cannotEditActive;

    return (
        <Segmented
            selected={value}
            onSelect={value => onChange(value)}>
            {Object.keys(locale.types).map(type => ({
                id: type,
                label: locale.types[type],
            }))}
        </Segmented>
    );
}

export const ballotsSecret = inactiveBool;
export const blankBallotsLimit = Rational;
export const blankBallotsLimitInclusive = bool;
export const quorum = Rational;
export const quorumInclusive = bool;
export const majorityBallots = Rational;
export const majorityBallotsInclusive = bool;
export const majorityVoters = Rational;
export const majorityVotersInclusive = bool;
export const majorityMustReachBoth = bool;

export function numChosenOptions ({ value, onChange, editing }) {
    if (!editing) return '' + value;

    return (
        <TextField
            type="number"
            value={value}
            onChange={e => onChange(e.target.value)} />
    );
}

export const mentionThreshold = Rational;
export const mentionThresholdInclusive = bool;

export function maxOptionsPerBallot ({ value, onChange, editing, item }) {
    if (!editing) return value === null ? locale.noMaxOptions : '' + value;

    if (item.state.isActive) return locale.cannotEditActive;

    return (
        <TextField
            type="number"
            value={value || ''}
            onChange={e => onChange(e.target.value || null)} />
    );
}

export function tieBreakerCodeholder ({ value, onChange, editing }) {
    return 'todo: codeholder picker';
}

export const publishVoters = inactiveBool;
export const publishVotersPercentage = bool;

export function options ({ value, onChange, editing }) {
    return 'oh god why';
}

const CONFIG_FIELDS = {
    quorum: [quorum],
    quorumInclusive: [quorumInclusive],
    majorityBallots: [majorityBallots, ['yn', 'ynb']],
    majorityBallotsInclusive: [majorityBallotsInclusive, ['yn', 'ynb']],
    majorityVoters: [majorityVoters, ['yn', 'ynb']],
    majorityVotersInclusive: [majorityVotersInclusive, ['yn', 'ynb']],
    majorityMustReachBoth: [majorityMustReachBoth, ['yn', 'ynb']],
    numChosenOptions: [numChosenOptions, ['rp', 'stv', 'tm']],
    mentionThreshold: [mentionThreshold, ['rp', 'tm']],
    mentionThresholdInclusive: [mentionThresholdInclusive, ['rp', 'tm']],
    maxOptionsPerBallot: [maxOptionsPerBallot, ['tm']],
    tieBreakerCodeholder: [tieBreakerCodeholder, ['rp', 'stv']],
    publishVoters: [publishVoters],
    publishVotersPercentage: [publishVotersPercentage],
    options: [options, ['rp', 'stv', 'tm']],
};

export function config ({ value, onChange, editing, item }) {
    const { type } = item;

    const fields = [];
    for (const f in CONFIG_FIELDS) {
        const field = CONFIG_FIELDS[f];
        if (!field[1] || field[1].includes(type)) {
            const Field = field[0];
            fields.push(
                <div class="config-field" key={f}>
                    <div class="config-field-label">
                        {locale.config[f]}
                    </div>
                    <div class="config-field-value">
                        <Field value={value[f]} onChange={v => onChange({
                            ...value,
                            [f]: v,
                        })} editing={editing} item={item} />
                    </div>
                </div>
            );
        }
    }

    return (
        <div class="vote-config">
            {fields}
        </div>
    );
}
