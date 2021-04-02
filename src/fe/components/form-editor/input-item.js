import { h } from 'preact';
import { createRef, PureComponent } from 'preact/compat';
import { Button, Checkbox, Slider, TextField } from '@cpsdqs/yamdl';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import RearrangingList from '../rearranging-list';
import DynamicHeightDiv from '../dynamic-height-div';
import CountryPicker from '../country-picker';
import TimeZoneEditor from '../time-zone';
import MdField from '../md-field';
import Select from '../select';
import TextArea from '../text-area';
import { FormContext } from '../form';
import { WithCountries } from '../data/country';
import { date, time, timestamp, currencyAmount } from '../data';
import { ScriptableValue, ScriptableBool } from './script-expr';
import { evalExpr, validateFormInput } from './model';
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

// TODO: better rendering (show/respect more fields)
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
                        value={value}
                        onChange={e => {
                            if (e.target.value) onChange(+e.target.value);
                            else onChange(null);
                        }}
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
            return (
                <div class="form-input-money">
                    <currencyAmount.editor
                        outline
                        min={item.min}
                        max={item.max}
                        step={item.step}
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
    country: {
        render ({ value, onChange, item }) {
            return (
                <WithCountries>
                    {countries => {
                        const options = [];
                        if (!item.required || !value) options.push({ value: null, label: '—' });

                        for (const c in countries) {
                            const country = countries[c];
                            if (item.exclude && item.exclude.includes(country.code)) continue;
                            options.push({ value: country.code, label: `${country.name_eo} (${country.code})` });
                        }

                        for (const add of (item.add || [])) {
                            options.push({ value: add, label: add });
                        }

                        return (
                            <Select
                                outline
                                value={value}
                                onChange={onChange}
                                items={options} />
                        );
                    }}
                </WithCountries>
            );
        },
        settings: {
            exclude: true,
            chAutofill: ['country', 'feeCountry'],
        },
    },
    date: {
        render ({ value, onChange }) {
            return (
                <div class="form-input-date">
                    <date.editor
                        outline
                        value={value}
                        onChange={onChange} />
                </div>
            );
        },
        settings: {
            min: 'date',
            max: 'date',
            chAutofill: ['birthdate'],
        },
    },
    time: {
        render ({ value, onChange }) {
            return (
                <div class="form-input-time">
                    <time.editor
                        outline
                        useFmtValue
                        value={value}
                        onChange={onChange} />
                </div>
            );
        },
        settings: {
            min: 'time',
            max: 'time',
        },
    },
    datetime: {
        render ({ value, onChange }) {
            return (
                <div class="form-input-datetime">
                    <timestamp.editor
                        outline
                        value={value}
                        onChange={onChange} />
                </div>
            );
        },
        settings: {
            min: 'datetime',
            max: 'datetime',
            tz: true,
        },
    },
    boolean_table: {
        render ({ item, value, onChange }) {
            const resizeValue = (value, rows, cols) => {
                if (!value) value = [];
                else value = value.slice();
                while (value.length < rows) value.push([]);
                while (value.length > rows) value.pop();
                for (let y = 0; y < rows; y++) {
                    const row = value[y].slice();
                    while (row.length < cols) row.push(false);
                    while (row.length > cols) row.pop();
                    value[y] = row;
                }
                return value;
            };

            const rows = [];
            if (item.headerTop) {
                const headerRow = [];
                if (item.headerLeft) headerRow.push(<th key="x"></th>);
                for (let x = 0; x < item.cols; x++) {
                    headerRow.push(<th key={x}>{item.headerTop[x]}</th>);
                }
                rows.push(<tr key="header">{headerRow}</tr>);
            }
            const excludedCells = (item.excludeCells || [])
                .map(([x, y]) => `${x},${y}`);
            for (let y = 0; y < item.rows; y++) {
                const row = [];
                if (item.headerLeft) {
                    row.push(<th key="x">{item.headerLeft[y]}</th>);
                }
                for (let x = 0; x < item.cols; x++) {
                    const isExcluded = excludedCells.includes(`${x},${y}`);
                    const cellValue = !isExcluded && value && value[y] && value[y][x];
                    const cellY = y;
                    const cellX = x;
                    const onCellChange = v => {
                        const newValue = resizeValue(value, item.rows, item.cols);
                        newValue[cellY][cellX] = v;
                        onChange(newValue);
                    };
                    row.push(
                        <td key={x}>
                            <Checkbox
                                disabled={isExcluded}
                                checked={cellValue}
                                onChange={onCellChange} />
                        </td>
                    );
                }
                rows.push(<tr key={y}>{row}</tr>);
            }

            return (
                <div class="form-input-boolean-table">
                    <table>
                        <tbody>
                            {rows}
                        </tbody>
                    </table>
                </div>
            );
        },
        settings: {
            booleanTable: true,
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
    static contextType = FormContext;

    state = {
        error: null,
        didInteract: false,
    };

    oldName = null;

    componentDidMount () {
        this.oldName = this.props.item.name || null;

        if (this.context) this.context.register(this);
    }

    componentWillUnmount () {
        if (this.context) this.context.deregister(this);
    }

    validate (submitting) {
        if (!this.props.editingData) {
            this.setState({ error: null });
            return true;
        }
        const error = validateFormInput(this.props.item, this.props.previousNodes, this.props.value);
        if (!error) {
            this.setState({ error: null });
        } else if (submitting || this.state.didInteract) {
            this.setState({ error, didInteract: true });
        }
        return !error;
    }

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
                oldName={this.oldName}
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
                    {this.state.error && (
                        <InputError>
                            {this.state.error}
                        </InputError>
                    )}
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

/// Just shows an error string. Scrolls itself into view when mounted in the DOM.
class InputError extends PureComponent {
    node = createRef();

    componentDidMount () {
        this.node.current.scrollIntoView({ behavior: 'smooth' });
    }

    render ({ children }) {
        return <div class="input-error" ref={this.node}>{children}</div>;
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
    render ({ item, onChange, scriptCtx, oldName }) {
        const type = TYPES[item.type];
        if (!type) return null;

        const controls = [];
        for (const k of DEFAULT_SETTINGS.concat(Object.keys(type.settings))) {
            controls.push(
                <InputSetting
                    key={k}
                    oldName={oldName}
                    scriptCtx={scriptCtx}
                    setting={k}
                    options={type.settings[k]}
                    item={item}
                    onItemChange={onChange}
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

// TODO: DRY
const SETTINGS = {
    name ({ value, item, onItemChange, oldName }) {
        let helperLabel = null;
        if (oldName && oldName !== value) {
            helperLabel = `${locale.inputFields.oldName}: ${oldName}`;
        }

        return (
            <Setting label={locale.inputFields.name} desc={locale.inputFields.nameDesc}>
                <TextField
                    outline
                    value={value}
                    pattern={NAME_PATTERN}
                    helperLabel={helperLabel}
                    error={!NAME_REGEX.test(value) && locale.inputFields.namePatternError}
                    maxLength={20}
                    onChange={e => {
                        const newItem = { ...item, name: e.target.value };
                        if (oldName) newItem.oldName = oldName;
                        onItemChange(newItem);
                    }} />
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
    min ({ value, onChange, item, options }) {
        let editor;
        if (options === 'date') {
            editor = (
                <date.editor
                    outline
                    placeholder={locale.inputFields.minEmpty}
                    value={value || null}
                    onChange={v => onChange(v || null)}/>
            );
        } else if (options === 'time') {
            editor = (
                <time.editor
                    outline nullable
                    placeholder={locale.inputFields.minEmpty}
                    value={value}
                    onChange={onChange} />
            );
        } else if (options === 'datetime') {
            editor = (
                <timestamp.editor
                    outline
                    placeholder={locale.inputFields.minEmpty}
                    value={value || null}
                    onChange={onChange} />
            );
        } else {
            editor = (
                <TextField
                    outline
                    placeholder={locale.inputFields.minEmpty}
                    required={item.variant === 'slider'}
                    error={(item.variant === 'slider' && !Number.isFinite(value)) && dataLocale.requiredField}
                    type="number"
                    value={Number.isFinite(value) ? value : ''}
                    step={item.step}
                    max={item.max}
                    onChange={e => Number.isFinite(parseFloat(e.target.value)) ? onChange(parseFloat(e.target.value)) : onChange(null)} />
            );
        }

        return (
            <Setting label={locale.inputFields.min}>
                {editor}
            </Setting>
        );
    },
    max ({ value, onChange, item, options }) {
        let editor;
        if (options === 'date') {
            editor = (
                <date.editor
                    outline
                    placeholder={locale.inputFields.maxEmpty}
                    value={value || null}
                    onChange={v => onChange(v || null)}/>
            );
        } else if (options === 'time') {
            editor = (
                <time.editor
                    outline nullable
                    placeholder={locale.inputFields.minEmpty}
                    value={value}
                    onChange={onChange} />
            );
        } else if (options === 'datetime') {
            editor = (
                <timestamp.editor
                    outline
                    placeholder={locale.inputFields.maxEmpty}
                    value={value || null}
                    onChange={onChange} />
            );
        } else {
            editor = (
                <TextField
                    outline
                    placeholder={locale.inputFields.maxEmpty}
                    required={item.variant === 'slider'}
                    error={(item.variant === 'slider' && !Number.isFinite(value)) && dataLocale.requiredField}
                    type="number"
                    value={Number.isFinite(value) ? value : ''}
                    step={item.step}
                    min={item.min}
                    onChange={e => Number.isFinite(parseFloat(e.target.value)) ? onChange(parseFloat(e.target.value)) : onChange(null)} />
            );
        }
        return (
            <Setting label={locale.inputFields.max}>
                {editor}
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
                <div class="ch-autofill-description">
                    {locale.inputFields.chAutofillDesc}
                </div>
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
    exclude ({ value, onChange }) {
        return (
            <Setting stack label={locale.inputFields.exclude}>
                <CountryPicker value={value} onChange={onChange} hideGroups />
            </Setting>
        );
    },
    tz ({ value, onChange }) {
        return (
            <Setting label={locale.inputFields.tz}>
                <TimeZoneEditor value={value} onChange={onChange} editing />
            </Setting>
        );
    },
    booleanTable ({ item, onItemChange }) {
        const resizeHeader = (header, size) => {
            if (!header || header.length === size) return header;
            if (header.length > size) return header.slice(0, size);
            return header.concat([...new Array(size - header.length)].map(() => ''));
        };

        const resizeItem = (rows, cols) => {
            const headerTop = resizeHeader(item.headerTop, cols);
            const headerLeft = resizeHeader(item.headerLeft, rows);
            let excludeCells = null;
            if (item.excludeCells) {
                excludeCells = [];
                for (const cell of item.excludeCells) {
                    if (cell[0] < cols && cell[1] < rows) excludeCells.push(cell);
                }
            }

            return {
                ...item,
                rows,
                cols,
                minSelect: Math.max(0, Math.min(item.minSelect, rows * cols)),
                maxSelect: Math.max(0, Math.min(item.maxSelect, rows * cols)),
                headerTop,
                headerLeft,
                excludeCells,
            };
        };

        const setRows = v => onItemChange(resizeItem(v, item.cols));
        const setCols = v => onItemChange(resizeItem(item.rows, v));
        const setMinSelect = v => onItemChange({ ...item, minSelect: v });
        const setMaxSelect = v => onItemChange({ ...item, maxSelect: v });

        const enableHeaderTop = enabled => {
            if (enabled) {
                onItemChange({ ...item, headerTop: [...new Array(item.cols)].map(() => '') });
            } else onItemChange({ ...item, headerTop: null });
        };
        const enableHeaderLeft = enabled => {
            if (enabled) {
                onItemChange({ ...item, headerLeft: [...new Array(item.rows)].map(() => '') });
            } else onItemChange({ ...item, headerLeft: null });
        };

        const headerTopItems = [];
        const headerLeftItems = [];

        if (item.headerTop) {
            for (let i = 0; i < item.headerTop.length; i++) {
                const index = i;
                headerTopItems.push(
                    <div key={index} class="boolean-table-header-item">
                        <TextField
                            value={item.headerTop[i]}
                            onChange={e => {
                                const headerTop = item.headerTop.slice();
                                headerTop[index] = e.target.value;
                                onItemChange({ ...item, headerTop });
                            }} />
                    </div>
                );
            }
        }
        if (item.headerLeft) {
            for (let i = 0; i < item.headerLeft.length; i++) {
                const index = i;
                headerLeftItems.push(
                    <div key={index} class="boolean-table-header-item">
                        <TextField
                            value={item.headerLeft[i]}
                            onChange={e => {
                                const headerLeft = item.headerLeft.slice();
                                headerLeft[index] = e.target.value;
                                onItemChange({ ...item, headerLeft });
                            }} />
                    </div>
                );
            }
        }

        const excludedCells = item.excludeCells
            ? item.excludeCells.map(([x, y]) => `${x},${y}`)
            : [];
        const excludeCellsRows = [];
        for (let y = 0; y < item.rows; y++) {
            const row = [];
            for (let x = 0; x < item.cols; x++) {
                const pos = [x, y];
                const isExcluded = excludedCells.includes(`${x},${y}`);
                const setExcluded = () => {
                    if (isExcluded) {
                        const i = excludedCells.indexOf(`${pos[0]},${pos[1]}`);
                        const excludeCells = item.excludeCells.slice();
                        excludeCells.splice(i, 1);
                        onItemChange({ ...item, excludeCells });
                    } else {
                        const excludeCells = item.excludeCells ? item.excludeCells.slice() : [];
                        excludeCells.push(pos);
                        onItemChange({ ...item, excludeCells });
                    }
                };
                row.push(
                    <td key={x}>
                        <Checkbox
                            checked={isExcluded}
                            onChange={setExcluded} />
                    </td>
                );
            }
            excludeCellsRows.push(<tr key={y}>{row}</tr>);
        }
        const excludeCells = (
            <table>
                <tbody>
                    {excludeCellsRows}
                </tbody>
            </table>
        );

        return (
            <div>
                <Setting label={locale.inputFields.rows}>
                    <TextField
                        type="number"
                        outline
                        value={item.rows | 0}
                        onChange={e => setRows(+e.target.value | 0)} />
                </Setting>
                <Setting label={locale.inputFields.cols}>
                    <TextField
                        type="number"
                        outline
                        value={item.cols | 0}
                        onChange={e => setCols(+e.target.value | 0)} />
                </Setting>
                <Setting label={locale.inputFields.minSelect}>
                    <TextField
                        type="number"
                        placeholder={locale.inputFields.minSelectEmpty}
                        outline
                        min={0}
                        max={item.maxSelect || (item.rows * item.cols)}
                        value={item.minSelect || ''}
                        onChange={e => setMinSelect(+e.target.value || null)} />
                </Setting>
                <Setting label={locale.inputFields.maxSelect}>
                    <TextField
                        type="number"
                        placeholder={locale.inputFields.maxSelectEmpty}
                        outline
                        min={item.minSelect | 0}
                        max={item.rows * item.cols}
                        value={item.maxSelect || ''}
                        onChange={e => setMaxSelect(+e.target.value || null)} />
                </Setting>
                <Setting label={locale.inputFields.headerTop}>
                    <Checkbox
                        checked={!!item.headerTop}
                        onChange={enableHeaderTop} />
                </Setting>
                <DynamicHeightDiv useFirstHeight>
                    {headerTopItems}
                </DynamicHeightDiv>
                <Setting label={locale.inputFields.headerLeft}>
                    <Checkbox
                        checked={!!item.headerLeft}
                        onChange={enableHeaderLeft} />
                </Setting>
                <DynamicHeightDiv useFirstHeight>
                    {headerLeftItems}
                </DynamicHeightDiv>
                <Setting stack label={locale.inputFields.excludeCells}>
                    {excludeCells}
                </Setting>
            </div>
        );
    },
};

function InputSetting ({ setting, ...extra }) {
    const Renderer = SETTINGS[setting];
    if (!Renderer) return null;
    return <Renderer {...extra} />;
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
