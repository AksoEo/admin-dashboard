import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Checkbox, TextField } from '@cpsdqs/yamdl';
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

export default class FormEditorSettings extends PureComponent {
    render ({ value, onChange, previousNodes }) {
        return (
            <div class="form-editor-settings">
                <Flags
                    value={value}
                    onChange={onChange} />
                <Price
                    previousNodes={previousNodes}
                    value={value.price}
                    onChange={price => onChange({ ...value, price })} />
                <SequenceIds
                    value={value.sequenceIds}
                    onChange={sequenceIds => onChange({ ...value, sequenceIds })} />
            </div>
        );
    }
}

function Flags ({ value, onChange }) {
    const flags = FLAGS.map(flag => (
        <Flag
            key={flag}
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

function Flag ({ flag, value, onChange }) {
    const labelId = 'flag' + Math.random().toString(36);

    return (
        <div class="settings-flag">
            <Checkbox
                class="flag-checkbox"
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

function Price ({ value, onChange, previousNodes }) {
    const labelId = 'price' + Math.random().toString(36);
    const onChangeEnabled = enabled => {
        if (enabled) onChange({ currency: 'USD', var: null, minUpfront: null });
        else onChange(null);
    };

    const contents = [];
    if (value) {
        const knownVariables = new Set();
        const ascVariables = [];
        for (const item of previousNodes) {
            if (item && item.defs) {
                for (const name in item.defs) {
                    if (typeof name !== 'string' || name.startsWith('_')) continue;
                    knownVariables.add(name);
                    ascVariables.push({
                        value: name,
                        label: <RefNameView class="form-editor-settings-price-ref" name={name} />,
                    });
                }
            }
        }
        const varValue = knownVariables.has(value.var) ? value.var : null;
        contents.push(
            <div key="value" class="settings-item">
                <label class="price-var-title">
                    {locale.settings.price.variable}
                </label>
                <Select
                    rendered
                    emptyLabel={locale.settings.price.noVariableSelected}
                    outline
                    items={ascVariables}
                    value={varValue}
                    onChange={v => onChange({ ...value, var: v })} />
                <Select
                    class="currency-select"
                    outline
                    items={Object.keys(currencies).map(c => ({ value: c, label: currencies[c] }))}
                    value={value.currency}
                    onChange={currency => onChange({ ...value, currency })} />
            </div>
        );

        let priceValue = null;
        if (varValue) {
            priceValue = evalExpr({ t: 'c', f: 'id', a: [varValue] }, previousNodes);
        }

        contents.push(
            <div key="preview" class="settings-item">
                <span>{locale.settings.price.pricePreview}</span>
                {' '}
                {(typeof priceValue === 'number') ? (
                    <currencyAmount.renderer
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

function SequenceIds ({ value, onChange }) {
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
