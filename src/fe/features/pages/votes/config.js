import { h, Component } from 'preact';
import JSON5 from 'json5';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import RemoveIcon from '@material-ui/icons/Remove';
import { Button, Checkbox, TextField } from '@cpsdqs/yamdl';
import Segmented from '../../../components/segmented';
import JSONEditor from '../../../components/json-editor';
import CodeholderPicker from '../../../components/codeholder-picker';
import RearrangingList from '../../../components/rearranging-list';
import { timestamp } from '../../../components/data';
import { Validator } from '../../../components/form';
import { IdUEACode } from '../../../components/data/uea-code';
import { votes as locale } from '../../../locale';
import Rational from './rational';
import './config.less';

function validateJSON (value) {
    try {
        JSON5.parse(value);
    } catch {
        throw { error: true };
    }
}

export function voterCodeholders ({ value, onChange, editing, item }) {
    if (editing && item.state.isActive) return locale.cannotEditActive;
    return (
        <Validator
            component={JSONEditor}
            validatorProps={{ class: 'block-validator' }}
            value={value}
            onChange={onChange}
            disabled={!editing}
            validate={validateJSON} />
    );
}

export function viewerCodeholders ({ value, onChange, editing }) {
    return (
        <div class="viewer-codeholders">
            <div class="viewer-codeholders-switch">
                {editing ? (
                    <Checkbox
                        checked={value === 'null'}
                        onChange={checked => {
                            if (checked) onChange('null');
                            else onChange('{}');
                        }} />
                ) : null}
                {' '}
                <label>
                    {(editing || value === 'null') ? locale.viewerCodeholdersSame : null}
                </label>
            </div>
            {value !== 'null' ? (
                <Validator
                    component={JSONEditor}
                    validatorProps={{ class: 'block-validator' }}
                    value={value}
                    onChange={onChange}
                    disabled={!editing}
                    validate={validateJSON} />
            ) : ''}
        </div>
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
        <Validator
            component={timestamp.editor}
            value={value}
            onChange={onChange}
            validate={value => {
                if (!Number.isFinite(new Date(value * 1000).getDate())) {
                    throw { error: true };
                }
            }} />
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

const requiredRationalInclusive = (field, relation) => function reqRational ({
    value,
    onChange,
    config,
    onConfigChange,
    editing,
}) {
    let relationLabel = null;
    let inclusiveCheckbox = null;
    const inclusive = config[field];

    if (relation === '<') {
        relationLabel = inclusive ? '≤' : '<';
    } else if (relation === '>') {
        relationLabel = inclusive ? '≥' : '>';
    }

    if (editing) {
        inclusiveCheckbox = (
            <div class="inclusive-checkbox">
                <Checkbox
                    checked={inclusive}
                    onChange={checked => {
                        onConfigChange({ ...config, [field]: checked });
                    }} />
                {' '}
                <label>
                    {locale.inclusive}
                </label>
            </div>
        );
    }

    return (
        <div class="vote-config-inclusive-rational">
            {relationLabel && (
                <span class="inclusive-relation">
                    {relationLabel}
                </span>
            )}
            {relationLabel && ' '}
            <Validator
                component={Rational}
                value={value}
                onChange={onChange}
                editing={editing}
                validate={value => {
                    if (Array.isArray(value)) {
                        if (!Number.isFinite(+value[0]) || !Number.isFinite(+value[1])) {
                            throw { error: true };
                        }
                    } else if (!Number.isFinite(+value)) {
                        throw { error: true };
                    }
                }} />
            {inclusiveCheckbox}
        </div>
    );
};

export const ballotsSecret = inactiveBool;
export const blankBallotsLimit = requiredRationalInclusive('blankBallotsLimitInclusive', '<');
export const quorum = requiredRationalInclusive('quorumInclusive', '>');
export const majorityBallots = requiredRationalInclusive('majorityBallotsInclusive', '>');
export const majorityVoters = requiredRationalInclusive('majorityVotersInclusive', '>');
export const majorityMustReachBoth = bool;

export function numChosenOptions ({ value, onChange, editing }) {
    if (!editing) return '' + value;

    return (
        <Validator
            component={TextField}
            type="number"
            value={value}
            onChange={e => onChange(e.target.value)}
            validate={value => {
                if (!Number.isFinite(+value)) {
                    throw { error: locale.numberRequired };
                }
            }} />
    );
}

export const mentionThreshold = requiredRationalInclusive('mentionThresholdInclusive', '>');

export function maxOptionsPerBallot ({ value, onChange, editing, item }) {
    if (!editing) return value === null ? locale.config.noMaxOptions : '' + value;

    if (item.state.isActive) return locale.cannotEditActive;

    return (
        <Validator
            component={TextField}
            type="number"
            value={value || ''}
            placeholder={locale.config.noMaxOptions}
            onChange={e => onChange(e.target.value || null)}
            validate={value => {
                if (!Number.isFinite(+value)) {
                    throw { error: locale.numberRequired };
                }
            }} />
    );
}

export function tieBreakerCodeholder ({ value, onChange, editing }) {
    if (!editing) return <IdUEACode id={value} />;
    return (
        <Validator
            component={CodeholderPicker}
            value={[value].filter(x => x !== null)}
            onChange={value => onChange(value[0] || null)}
            validate={() => {
                if (value === null) {
                    throw { error: true };
                }
            }}
            limit={1} />
    );
}

export const publishVoters = inactiveBool;
export const publishVotersPercentage = bool;

function ErrorableDiv ({ error, children, ...props }) {
    return (
        <div {...props}>
            {children}
            <div class="error-message-container">
                {error}
            </div>
        </div>
    );
}

export const options = class OptionsEditor extends Component {
    /// These keys are used to identify options while editing the list.
    /// This is necessary to enable rearranging that doesn’t look confusing.
    optionKeys = [];

    render ({ value, onChange, editing }) {
        const items = [];

        for (let i = 0; i < value.length; i++) {
            if (!this.optionKeys[i]) {
                this.optionKeys[i] = 'o' + Math.random();
            }

            const item = value[i];
            const index = i;

            let selector;
            if (item.type === 'codeholder') {
                selector = (
                    <CodeholderPicker
                        limit={1}
                        value={[item.codeholderId || null].filter(x => x !== null)}
                        onChange={items => {
                            const newValue = [...value];
                            newValue[index] = { ...item, codeholderId: items[0] || null };
                            onChange(newValue);
                        }} />
                );
            } else {
                selector = (
                    <TextField
                        outline
                        label={locale.options.name}
                        value={item.name}
                        onChange={e => {
                            const newValue = [...value];
                            newValue[index] = { ...item, name: e.target.value };
                            onChange(newValue);
                        }} />
                );
            }

            if (editing) {
                items.push(
                    <div class="options-item" key={this.optionKeys[index]}>
                        <div class="option-header">
                            <Button class="option-remove-button" icon small onClick={e => {
                                e.preventDefault();
                                const newValue = [...value];
                                newValue.splice(index, 1);
                                onChange(newValue);
                            }}>
                                <RemoveIcon />
                            </Button>
                            <Segmented
                                class="minimal"
                                selected={item.type}
                                onSelect={type => {
                                    const newValue = [...value];
                                    newValue[index] = { ...item, type };
                                    onChange(newValue);
                                }}>
                                {[
                                    {
                                        id: 'simple',
                                        label: locale.options.simple,
                                    },
                                    {
                                        id: 'codeholder',
                                        label: locale.options.codeholder,
                                    },
                                ]}
                            </Segmented>
                        </div>
                        {selector}
                        <textarea
                            class="option-description-editor"
                            value={item.description}
                            placeholder={locale.options.descriptionPlaceholder}
                            onChange={e => {
                                const newValue = [...value];
                                newValue[index] = { ...item, description: e.target.value };
                                onChange(newValue);
                            }} />
                    </div>
                );
            } else {
                items.push(
                    <div class="options-item" key={index}>
                        <div class="option-name">
                            {item.type === 'codeholder' ? (
                                <IdUEACode id={item.codeholderId} />
                            ) : item.name}
                        </div>
                        <div class="option-description">
                            {item.description}
                        </div>
                    </div>
                );
            }
        }

        if (editing) {
            items.push(
                <div class="options-add-item" key="add">
                    <Button icon onClick={e => {
                        e.preventDefault();
                        const newValue = [...value];
                        newValue.push({
                            type: 'simple',
                            name: '',
                            codeholderId: null,
                            description: '',
                        });
                        onChange(newValue);
                    }}>
                        <AddIcon />
                    </Button>
                </div>
            );

            return (
                <Validator
                    component={ErrorableDiv}
                    validate={() => {
                        if (!value.length) {
                            throw { error: locale.optionsRequired };
                        }
                    }}>
                    <RearrangingList
                        class="vote-options is-editing"
                        itemHeight={196}
                        isItemDraggable={index => index < value.length}
                        canMove={(toIndex) => toIndex < value.length}
                        onMove={(fromIndex, toIndex) => {
                            const newValue = [...value];
                            const item = newValue.splice(fromIndex, 1)[0];
                            newValue.splice(toIndex, 0, item);
                            const itemKey = this.optionKeys.splice(fromIndex, 1)[0];
                            this.optionKeys.splice(toIndex, 0, itemKey);
                            onChange(newValue);
                        }}>
                        {items}
                    </RearrangingList>
                </Validator>
            );
        }

        return (
            <div class="vote-options">
                {items}
            </div>
        );
    }
};

const CONFIG_FIELDS = {
    quorum: [quorum],
    majorityBallots: [majorityBallots, ['yn', 'ynb']],
    majorityVoters: [majorityVoters, ['yn', 'ynb']],
    majorityMustReachBoth: [majorityMustReachBoth, ['yn', 'ynb']],
    blankBallotsLimit: [blankBallotsLimit, ['ynb', 'rp', 'stv', 'tm']],
    numChosenOptions: [numChosenOptions, ['rp', 'stv', 'tm']],
    mentionThreshold: [mentionThreshold, ['rp', 'tm']],
    maxOptionsPerBallot: [maxOptionsPerBallot, ['tm']],
    tieBreakerCodeholder: [tieBreakerCodeholder, ['rp', 'stv']],
    publishVoters: [publishVoters],
    publishVotersPercentage: [publishVotersPercentage],
    options: [options, ['rp', 'stv', 'tm'], true],
};

export function config ({ value, onChange, editing, item }) {
    const { type } = item;

    const fields = [];
    for (const f in CONFIG_FIELDS) {
        const field = CONFIG_FIELDS[f];
        if (!field[1] || field[1].includes(type)) {
            const Field = field[0];
            const forceVertical = field[2];
            fields.push(
                <div class={'config-field' + (forceVertical ? ' is-vertical' : '')} key={f}>
                    <div class="config-field-label">
                        {locale.config[f]}
                    </div>
                    <div class="config-field-value">
                        <Field
                            value={value[f]}
                            onChange={v => onChange({
                                ...value,
                                [f]: v,
                            })}
                            editing={editing}
                            item={item}
                            config={value}
                            onConfigChange={onChange} />
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
