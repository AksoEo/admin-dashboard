import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Button, Checkbox, Slider, TextField } from '@cpsdqs/yamdl';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import RearrangingList from '../rearranging-list';
import MdField from '../md-field';
import Select from '../select';
import TextArea from '../text-area';
import { currencyAmount } from '../data';
import { ScriptableValue, ScriptableBool } from './script-expr';
import { evalExpr } from './model';
import { data as dataLocale, formEditor as locale, currencies } from '../../locale';
import './input-item.less';

function Label ({ children, required, ...props }) {
    return (
        <label class="form-input-label" {...props}>
            {children}
            {required ? <span class="required-star"> *</span> : ''}
        </label>
    );
}
const FIELD_DESCRIPTION_RULES = ['emphasis', 'strikethrough', 'link', 'list', 'table', 'image'];
function Desc ({ value }) {
    if (!value) return;
    return (
        <MdField value={value} rules={FIELD_DESCRIPTION_RULES} />
    );
}

// TODO: resolve required state (run ASC code!), etc.
const TYPES = {
    boolean: {
        render ({ disabled, value, onChange }) {
            return (
                <div class="form-input-boolean">
                    <Checkbox
                        checked={value}
                        onChange={onChange}
                        disabled={disabled} />
                </div>
            );
        },
        settings: {},
    },
    number: {
        render ({ disabled, item, value, onChange }) {
            const input = (
                <div class="number-input">
                    <TextField
                        outline
                        placeholder={item.placeholder}
                        disabled={disabled}
                        type="number"
                        step={item.step}
                        min={item.min}
                        max={item.max} />
                </div>
            );
            if (item.variant === 'slider') {
                return (
                    <div class="form-input-number with-slider">
                        <div class="number-input-slider">
                            <Slider
                                disabled={disabled}
                                min={item.min}
                                max={item.max}
                                value={value}
                                onChange={value => {
                                    if (item.step) value = Math.round(value * item.step) / item.step;
                                    onChange(value);
                                }} />
                        </div>
                        {input}
                    </div>
                );
            } else {
                return (
                    <div class="form-input-number">
                        {input}
                    </div>
                );
            }
        },
        settings: {
            placeholder: true,
            step: true,
            min: true,
            max: true,
            variant: ['input', 'slider'],
        },
    },
    text: {
        render ({ disabled, item, value, onChange }) {
            let error = null;
            const compiledPattern = new RegExp(item.pattern);
            if (!compiledPattern.test(value)) {
                error = item.patternError;
            }

            let Component = TextField;
            let extra = null;
            let type = 'text';
            if (item.variant === 'textarea') {
                Component = TextArea;
                extra = <div class="form-input-text-error">{error}</div>;
            } else if (item.variant === 'email') {
                type = 'email';
            } else if (item.variant === 'tel') {
                type = 'tel';
            } else if (item.variant === 'uri') {
                type = 'url';
            }

            return (
                <div class="form-input-text">
                    <Component
                        outline
                        type={type}
                        disabled={disabled}
                        placeholder={item.placeholder}
                        value={value}
                        pattern={item.pattern}
                        minLength={item.minLength}
                        maxLength={item.maxLength}
                        onChange={e => onChange(e.target.value)}
                        error={error} />
                    {extra}
                </div>
            );
        },
        settings: {
            placeholder: true,
            pattern: true,
            patternError: true,
            minLength: true,
            maxLength: true,
            variant: ['text', 'textarea', 'email', 'tel', 'uri'],
            chAutofill: ['birthdate', 'email', 'officePhone', 'cellphone', 'landlinePhone', 'phone', 'website', 'profession', 'name', 'honorific', 'firstName', 'lastName', 'address', 'feeCountry', 'country', 'countryArea', 'city', 'cityArea', 'streetAddress', 'postalCode', 'sortingCode'],
        },
    },
    money: {
        render ({ item, value, onChange }) {
            // TODO: min, step, etc.
            return (
                <div class="form-input-money">
                    <currencyAmount.editor
                        outline
                        value={value}
                        onChange={onChange}
                        currency={item.currency} />
                </div>
            );
        },
        settings: {
            placeholder: true,
            step: 'money',
            min: true,
            max: true,
            currency: true,
        },
    },
    enum: {
        render ({ item, value, onChange }) {
            let options = item.options.map(opt => ({
                value: opt.value,
                label: opt.name,
                disabled: opt.disabled,
            }));

            let editor;
            if (item.variant === 'select') {
                if (!value || !item.required) options = [{ value: null, label: '—' }].concat(options);
                editor = (
                    <Select
                        outline
                        value={value}
                        onChange={onChange}
                        items={options} />
                );
            } else {
                const items = [];
                for (const opt of options) {
                    const inputId = `form-editor-enum-${item.name}->${opt.value}`;
                    // TODO: use MD radios
                    items.push(
                        <li key={opt.value}>
                            <input
                                type="radio"
                                disabled={opt.disabled}
                                id={inputId}
                                name={item.name}
                                value={opt.value} />
                            <label for={inputId}>
                                {opt.label}
                            </label>
                        </li>
                    );
                }
                editor = <ul class="form-input-radio-group">{items}</ul>;
            }

            return (
                <div class="form-input-enum">
                    {editor}
                </div>
            );
        },
        settings: {
            options: true,
            variant: ['select', 'radio'],
        },
    },
    // TODO: all of these
    country: {
        settings: {
            add: true,
            exclude: true,
            chAutofill: ['country', 'feeCountry'],
        },
    },
    date: {
        settings: {
            min: 'date',
            max: 'date',
            chAutofill: ['birthdate'],
        },
    },
    time: {
        settings: {
            min: 'time',
            max: 'time',
        },
    },
    datetime: {
        settings: {
            min: 'datetime',
            max: 'datetime',
        },
    },
    boolean_table: {
        settings: {
            cols: true,
            rows: true,
            minSelect: true,
            maxSelect: true,
            headerTop: true,
            headerLeft: true,
            excludeCells: true,
        },
    },
};

export default class InputItem extends PureComponent {
    /// Evaluates any AKSO Script exprs in the item value.
    resolveValues () {
        // TODO: cache?
        const item = this.props.item;

        // only these properties can be AKSO Script expressions
        const props = ['default', 'required', 'disabled'];
        const resolved = {};
        for (const prop of props) {
            if (item[prop] && typeof item[prop] === 'object') {
                // this is an AKSO Script expression (probably)
                resolved[prop] = evalExpr(item[prop], this.props.previousNodes);
            } else {
                resolved[prop] = item[prop];
            }
        }
        return resolved;
    }

    render ({ editing, item, onChange, value, onValueChange, previousNodes }) {
        let contents = null;
        if (editing) {
            contents = <InputSettings
                item={item}
                onChange={onChange}
                scriptCtx={{ previousNodes }}
                key="settings" />;
        } else {
            const resolved = this.resolveValues();
            const Renderer = TYPES[item.type].render;
            // TODO: show more details about the field
            contents = (
                <div class="input-rendered">
                    <div class="input-details">
                        <Label required={resolved.required}>{item.label}</Label>
                        <Desc value={item.description} />
                    </div>
                    <Renderer
                        required={resolved.required}
                        disabled={resolved.disabled}
                        default={resolved.default}
                        item={item}
                        value={value}
                        onChange={onValueChange} />
                </div>
            );
        }

        return (
            <div class="form-editor-input-item">
                {contents}
            </div>
        );
    }
}

const DEFAULT_SETTINGS = [
    'name',
    'oldName',
    'label',
    'description',
    'default',
    'required',
    'disabled',
    'editable',
];

class InputSettings extends PureComponent {
    render ({ item, onChange, scriptCtx }) {
        const type = TYPES[item.type];
        if (!type) return null;

        const controls = [];
        for (const k of DEFAULT_SETTINGS.concat(Object.keys(type.settings))) {
            controls.push(
                <InputSetting
                    key={k}
                    scriptCtx={scriptCtx}
                    setting={k}
                    options={type.settings[k]}
                    item={item}
                    value={item[k]}
                    onChange={v => onChange({ ...item, [k]: v })}/>
            );
        }

        return (
            <div class="form-editor-input-settings">
                {controls}
            </div>
        );
    }
}

const NAME_PATTERN = '^[\\w\\-:ĥŝĝĉĵŭĤŜĜĈĴŬ]+$';
const NAME_REGEX = new RegExp(NAME_PATTERN);

function Setting ({ label, stack, desc, children }) {
    let description = null;
    if (desc) {
        description = <div class="setting-description">{desc}</div>;
    }

    let className = 'form-editor-setting';
    if (stack) className += ' is-stack';

    if (!label) {
        return (
            <div class={className}>
                <div class="form-editor-setting-inner">
                    {children}
                </div>
                {description}
            </div>
        );
    }
    return (
        <div class={className + ' is-labeled'}>
            <div class="form-editor-setting-inner">
                <label class="form-editor-setting-label">{label}</label>
                {children}
            </div>
            {description}
        </div>
    );
}

const SETTINGS = {
    name ({ value, onChange }) {
        // TODO: use oldName
        return (
            <Setting label={locale.inputFields.name} desc={locale.inputFields.nameDesc}>
                <TextField
                    outline
                    value={value}
                    pattern={NAME_PATTERN}
                    error={!NAME_REGEX.test(value) && locale.inputFields.namePatternError}
                    maxLength={20}
                    onChange={e => onChange(e.target.value)} />
            </Setting>
        );
    },
    label ({ value, onChange }) {
        return (
            <Setting label={locale.inputFields.label} desc={locale.inputFields.labelDesc}>
                <TextField
                    outline
                    value={value}
                    onChange={e => onChange(e.target.value)} />
            </Setting>
        );
    },
    description ({ value, onChange }) {
        return (
            <Setting stack label={locale.inputFields.description}>
                <MdField
                    value={value || ''}
                    onChange={v => onChange(v || null)}
                    editing
                    rules={FIELD_DESCRIPTION_RULES} />
            </Setting>
        );
    },
    default ({ value, onChange, scriptCtx }) {
        return (
            <Setting label={locale.inputFields.default}>
                <ScriptableValue
                    ctx={scriptCtx}
                    value={value}
                    onChange={onChange} />
            </Setting>
        );
    },
    required ({ value, onChange, scriptCtx }) {
        return (
            <Setting label={locale.inputFields.required}>
                <ScriptableBool
                    ctx={scriptCtx}
                    value={value}
                    onChange={onChange} />
            </Setting>
        );
    },
    disabled ({ value, onChange, scriptCtx }) {
        return (
            <Setting label={locale.inputFields.disabled}>
                <ScriptableBool
                    ctx={scriptCtx}
                    value={value}
                    onChange={onChange} />
            </Setting>
        );
    },
    editable ({ value, onChange }) {
        return (
            <Setting label={locale.inputFields.editable} desc={locale.inputFields.editableDesc}>
                <Checkbox
                    checked={value}
                    onChange={onChange} />
            </Setting>
        );
    },

    placeholder ({ value, onChange }) {
        return (
            <Setting label={locale.inputFields.placeholder}>
                <TextField
                    outline
                    value={value || ''}
                    maxLength={50}
                    onChange={e => onChange(e.target.value || null)} />
            </Setting>
        );
    },
    step ({ value, onChange, options }) {
        return (
            <Setting label={locale.inputFields.step}>
                <TextField
                    outline
                    placeholder={locale.inputFields.stepEmpty}
                    type="number"
                    value={value || ''}
                    step={options === 'money' ? '1' : '0.000000000000001'}
                    min={options === 'money' ? '1' : '0'}
                    onChange={e => onChange(+e.target.value || null)} />
            </Setting>
        );
    },
    min ({ value, onChange, item }) {
        return (
            <Setting label={locale.inputFields.min}>
                <TextField
                    outline
                    placeholder={locale.inputFields.minEmpty}
                    required={item.variant === 'slider'}
                    error={(item.variant === 'slider' && !Number.isFinite(value)) && dataLocale.requiredField}
                    type="number"
                    value={Number.isFinite(value) ? value : ''}
                    step={item.step}
                    max={item.max}
                    onChange={e => onChange(+e.target.value || null)} />
            </Setting>
        );
    },
    max ({ value, onChange, item }) {
        return (
            <Setting label={locale.inputFields.min}>
                <TextField
                    outline
                    placeholder={locale.inputFields.maxEmpty}
                    required={item.variant === 'slider'}
                    error={(item.variant === 'slider' && !Number.isFinite(value)) && dataLocale.requiredField}
                    type="number"
                    value={Number.isFinite(value) ? value : ''}
                    step={item.step}
                    min={item.min}
                    onChange={e => onChange(Number.isFinite(+e.target.value) ? +e.target.value : null)} />
            </Setting>
        );
    },
    variant ({ value, onChange, options }) {
        return (
            <Setting label={locale.inputFields.variant}>
                <Select
                    outline
                    value={value}
                    onChange={onChange}
                    items={options.map(option => ({
                        value: option,
                        label: locale.inputFields.variants[option],
                    }))} />
            </Setting>
        );
    },
    pattern ({ value, onChange }) {
        return (
            <Setting label={locale.inputFields.pattern}>
                <TextField
                    outline
                    value={value || ''}
                    onChange={e => onChange(e.target.value || null)} />
            </Setting>
        );
    },
    patternError ({ value, onChange }) {
        return (
            <Setting label={locale.inputFields.patternError}>
                <TextField
                    outline
                    value={value || ''}
                    onChange={e => onChange(e.target.value || null)} />
            </Setting>
        );
    },
    minLength ({ value, onChange, item }) {
        return (
            <Setting label={locale.inputFields.minLength}>
                <TextField
                    outline
                    placeholder={locale.inputFields.minLengthEmpty}
                    type="number"
                    value={value || ''}
                    min={0}
                    max={item.maxLength}
                    onChange={e => onChange(+e.target.value || null)} />
            </Setting>
        );
    },
    maxLength ({ value, onChange, item }) {
        return (
            <Setting label={locale.inputFields.maxLength}>
                <TextField
                    outline
                    placeholder={locale.inputFields.maxLengthEmpty}
                    type="number"
                    value={value || ''}
                    min={item.minLength || 0}
                    onChange={e => onChange(+e.target.value || null)} />
            </Setting>
        );
    },
    chAutofill ({ value, onChange, options }) {
        return (
            <Setting label={locale.inputFields.chAutofill}>
                <Select
                    outline
                    value={value}
                    onChange={v => onChange(v || null)}
                    items={[{ value: null, label: '—' }].concat(options.map(option => ({
                        value: option,
                        label: locale.inputFields.chAutofillFields[option],
                    })))} />
            </Setting>
        );
    },
    currency ({ value, onChange }) {
        return (
            <Setting label={locale.inputFields.currency}>
                <Select
                    outline
                    value={value}
                    onChange={v => onChange(v || null)}
                    items={Object.keys(currencies).map(currency => ({
                        value: currency,
                        label: currencies[currency],
                    }))} />
            </Setting>
        );
    },
    options ({ value, onChange }) {
        return (
            <Setting stack label={locale.inputFields.options}>
                <OptionsEditor value={value} onChange={onChange} />
            </Setting>
        );
    },
};

function InputSetting ({ setting, scriptCtx, options, item, value, onChange }) {
    const Renderer = SETTINGS[setting];
    if (!Renderer) return null;
    return <Renderer options={options} item={item} value={value} onChange={onChange} scriptCtx={scriptCtx} />;
}

class OptionsEditor extends PureComponent {
    addOption = () => {
        const value = this.props.value.slice();
        const item = {
            value: '',
            name: '',
            disabled: false,
        };
        value.push(item);
        this.props.onChange(value);
    };
    onMove = (fromPos, toPos) => {
        const value = this.props.value.slice();
        value.splice(toPos, 0, value.splice(fromPos, 1)[0]);
        this.props.onChange(value);
    };
    removeOption = opt => {
        const value = this.props.value.slice();
        value.splice(value.indexOf(opt), 1);
        this.props.onChange(value);
    };
    changeOption = (opt, newOpt) => {
        const value = this.props.value.slice();
        value[value.indexOf(opt)] = newOpt;
        this.optIds.set(newOpt, this.getOptId(opt));
        this.props.onChange(value);
    };

    optIds = new WeakMap();

    getOptId (opt) {
        if (!this.optIds.has(opt)) {
            this.optIds.set(opt, Math.random().toString(36));
        }
        return this.optIds.get(opt);
    }

    render ({ value }) {
        const items = [];
        for (const opt of value) {
            const optId = this.getOptId(opt);
            items.push(
                <OptionsEditorItem
                    key={optId}
                    onRemove={() => this.removeOption(opt)}
                    value={opt}
                    onChange={newOpt => this.changeOption(opt, newOpt)} />
            );
        }
        items.push(
            <div class="options-add-item" key="add-item">
                <Button icon small onClick={() => this.addOption()}>
                    <AddIcon style={{ verticalAlign: 'middle' }} />
                </Button>
            </div>
        );

        return (
            <RearrangingList
                isItemDraggable={pos => pos < value.length}
                canMove={pos => pos < value.length}
                onMove={this.onMove}>
                {items}
            </RearrangingList>
        );
    }
}

function OptionsEditorItem ({ onRemove, value, onChange }) {
    return (
        <div class="options-item">
            <Button icon small onClick={onRemove}>
                <RemoveIcon style={{ verticalAlign: 'middle' }} />
            </Button>
            <TextField
                outline
                label={locale.inputFields.optionsName}
                value={value.name}
                onChange={e => onChange({ ...value, name: e.target.value })} />
            <TextField
                outline
                label={locale.inputFields.optionsValue}
                required
                error={!value.value && dataLocale.requiredField}
                value={value.value}
                onChange={e => onChange({ ...value, value: e.target.value })} />
            <Select
                value={value.disabled.toString()}
                onChange={disabled => onChange({
                    ...value,
                    disabled: disabled === 'true' ? true : disabled === 'false' ? false : disabled,
                })}
                items={['true', 'onlyExisting', 'false'].map(k => ({
                    value: k,
                    label: locale.inputFields.optionsDisabled[k],
                }))} />
            {value.disabled === 'onlyExisting' ? (
                <div class="option-description">
                    {locale.inputFields.optionsOnlyExisting}
                </div>
            ) : null}
        </div>
    );
}
