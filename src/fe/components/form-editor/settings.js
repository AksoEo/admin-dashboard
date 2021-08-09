import { h } from 'preact';
import { Fragment, PureComponent } from 'preact/compat';
import { Button, Checkbox, TextField } from 'yamdl';
import TuneIcon from '@material-ui/icons/Tune';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { formEditor as locale, currencies } from '../../locale';
import { currencyAmount } from '../data';
import { RefNameView } from './script-views';
import { evalExpr } from './model';
import Select from '../select';
import DynamicHeightDiv from '../dynamic-height-div';
import './settings.less';

const FLAGS = [
    'allowUse',
    'allowGuests',
    'editable',
    'cancellable',
    'manualApproval',
];

/// Renders a control with general form settings (TODO: generalize; this is for congresses!).
export default class FormEditorSettings extends PureComponent {
    state = { expanded: false };

    render ({ value, editing, onChange, previousNodes }, { expanded }) {
        let settings = null;
        if (expanded) {
            settings = (
                <Fragment>
                    <Flags
                        value={value}
                        editing={editing}
                        onChange={onChange} />
                    <Price
                        previousNodes={previousNodes}
                        editing={editing}
                        value={value.price}
                        onChange={price => onChange({ ...value, price })} />
                    <Variables
                        previousNodes={previousNodes}
                        editing={editing}
                        value={value}
                        onChange={onChange} />
                    <SequenceIds
                        value={value.sequenceIds}
                        editing={editing}
                        onChange={sequenceIds => onChange({ ...value, sequenceIds })} />
                </Fragment>
            );
        }

        return (
            <div class={'form-editor-settings' + (expanded ? ' is-expanded' : '')}>
                <div class="settings-title" onClick={() => this.setState({ expanded: !expanded })}>
                    <TuneIcon />
                    <span class="inner-title">{locale.settings.title}</span>
                    <Button icon small>
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Button>
                </div>
                {settings}
            </div>
        );
    }
}

function Flags ({ value, editing, onChange }) {
    const flags = FLAGS.map(flag => (
        <Flag
            key={flag}
            editing={editing}
            flag={flag}
            value={value[flag]}
            onChange={v => onChange({ ...value, [flag]: v })} />
    ));

    return (
        <div class="settings-flags">
            {flags}
        </div>
    );
}

function Flag ({ flag, editing, value, onChange }) {
    const labelId = 'flag' + Math.random().toString(36);

    return (
        <div class="settings-flag">
            <Checkbox
                class="flag-checkbox"
                disabled={!editing}
                id={labelId}
                checked={value}
                onChange={onChange} />
            <label for={labelId}>{locale.settings.flags[flag]}</label>
            <div class="flag-description">
                {locale.settings.flags[flag + 'Desc']}
            </div>
        </div>
    );
}

function Price ({ value, editing, onChange, previousNodes }) {
    const labelId = 'price' + Math.random().toString(36);
    const onChangeEnabled = enabled => {
        if (enabled) onChange({ currency: 'USD', var: null, minUpfront: null });
        else onChange(null);
    };

    const contents = [];
    if (value) {
        contents.push(
            <div key="value" class="settings-item">
                <label class="settings-item-title">
                    {locale.settings.price.variable}
                </label>
                <AscVarPicker
                    previousNodes={previousNodes}
                    editing={editing}
                    value={value.var}
                    onChange={v => onChange({ ...value, var: v })} />
                <Select
                    class="currency-select"
                    disabled={!editing}
                    outline
                    items={Object.keys(currencies).map(c => ({ value: c, label: currencies[c] }))}
                    value={value.currency}
                    onChange={currency => onChange({ ...value, currency })} />
            </div>
        );

        let priceValue = null;
        if (value.var) {
            priceValue = evalExpr({ t: 'c', f: 'id', a: [value.var] }, previousNodes);
        }

        contents.push(
            <div key="preview" class="settings-item">
                <span>{locale.settings.price.pricePreview}</span>
                {' '}
                {(typeof priceValue === 'number') ? (
                    <currencyAmount.renderer
                        disabled={!editing}
                        currency={value.currency}
                        value={priceValue} />
                ) : (
                    locale.settings.price.notANumber
                )}
            </div>
        );
        contents.push(
            <div key="min" class="settings-item">
                <currencyAmount.editor
                    outline
                    disabled={!editing}
                    currency={value.currency}
                    label={locale.settings.price.minUpfront}
                    value={value.minUpfront || 0}
                    onChange={v => onChange({ ...value, minUpfront: v || null })} />
            </div>
        );
    }

    return (
        <div class="settings-price">
            <div class="settings-flag">
                <Checkbox
                    id={labelId}
                    disabled={!editing}
                    class="flag-checkbox"
                    checked={!!value}
                    onChange={onChangeEnabled} />
                <label for={labelId}>{locale.settings.price.enabled}</label>
            </div>
            <DynamicHeightDiv class="settings-flag-options">
                {contents}
            </DynamicHeightDiv>
        </div>
    );
}

function SequenceIds ({ value, editing, onChange }) {
    const labelId = 'seqids' + Math.random().toString(36);
    const onChangeEnabled = enabled => {
        if (enabled) onChange({ startAt: 1, requireValid: true });
        else onChange(null);
    };

    const contents = [];
    if (value) {
        contents.push(
            <div key="startat" class="settings-item">
                <TextField
                    outline
                    disabled={!editing}
                    label={locale.settings.sequenceIds.startAt}
                    value={value.startAt | 0}
                    onChange={e => onChange({ ...value, startAt: +e.target.value | 0 })} />
            </div>
        );
        const validId = 'flag' + Math.random().toString(36);
        contents.push(
            <div key="reqvalid" class="settings-flag">
                <Checkbox
                    id={validId}
                    disabled={!editing}
                    class="flag-checkbox"
                    checked={value.requireValid}
                    onChange={requireValid => onChange({ ...value, requireValid })} />
                <label for={validId}>{locale.settings.sequenceIds.requireValid}</label>
                <div class="flag-description">
                    {locale.settings.sequenceIds.requireValidDesc}
                </div>
            </div>
        );
    }

    return (
        <div class="settings-seq-ids">
            <div class="settings-flag">
                <Checkbox
                    id={labelId}
                    disabled={!editing}
                    class="flag-checkbox"
                    checked={!!value}
                    onChange={onChangeEnabled} />
                <label for={labelId}>{locale.settings.sequenceIds.enabled}</label>
            </div>
            <DynamicHeightDiv class="settings-flag-options">
                {contents}
            </DynamicHeightDiv>
        </div>
    );
}

const VARIABLES = [
    { key: 'identifierName', required: true },
    { key: 'identifierEmail', required: true },
    { key: 'identifierCountryCode', required: false },
];

function Variables ({ previousNodes, editing, value, onChange }) {
    const variables = [];
    for (const v of VARIABLES) {
        variables.push(
            <div key={v.key} class="settings-item settings-variable">
                <label class="settings-item-title">
                    {locale.settings.variables[v.key]}
                    {v.required ? ' *' : ''}
                </label>
                <AscVarPicker
                    optional={!v.required}
                    previousNodes={previousNodes}
                    editing={editing}
                    value={value[v.key]}
                    onChange={x => onChange({ ...value, [v.key]: x })} />
            </div>
        );
    }

    return (
        <div class="settings-variables settings-flag-options">
            <div class="settings-section-title">
                {locale.settings.variables.title}
            </div>
            {variables}
        </div>
    );
}

function AscVarPicker ({ previousNodes, editing, value, onChange, optional }) {
    const knownVariables = new Set();
    const ascVariables = [];
    if (optional) {
        ascVariables.push({
            value: null,
            label: '—',
        });
    }
    for (const item of previousNodes) {
        if (item && item.defs) {
            for (const name in item.defs) {
                if (typeof name !== 'string' || name.startsWith('_')) continue;
                knownVariables.add(name);
                ascVariables.push({
                    value: name,
                    label: <RefNameView class="form-editor-settings-var-ref" name={name} />,
                });
            }
            for (const v of item.formVars) {
                if (!v.name || v.name.startsWith('@')) continue;
                const name = '@' + v.name;
                knownVariables.add(name);
                ascVariables.push({
                    value: name,
                    label: <RefNameView class="form-editor-settings-var-ref" name={name} />,
                });
            }
        }
    }
    const varValue = knownVariables.has(value) ? value : null;
    return (
        <Select
            rendered
            disabled={!editing}
            emptyLabel={locale.settings.variables.noVariableSelected}
            outline
            items={ascVariables}
            value={varValue}
            onChange={onChange} />
    );
}
