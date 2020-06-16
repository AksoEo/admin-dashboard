import { h, Component } from 'preact';
import CheckIcon from '@material-ui/icons/Check';
import { Menu, globalAnimator } from '@cpsdqs/yamdl';
import './select.less';

// appending directly to document.body causes weird glitches when a select is inside
// a dialog
const selectPortalContainer = document.createElement('div');
selectPortalContainer.id = 'select-portal-container';
document.body.appendChild(selectPortalContainer);

/// A <select>.
///
/// # Props
/// - `value`: currently selected value
/// - `onChange`: (value) => void
/// - `items`: select items { value, label, shortLabel?, disabled? }
/// - `outline`: pass true for outline style
/// - `multi`: pass true for multi-select. Value must be an array
/// - `emptyLabel`: label to use in multi-select mode when empty
export default class Select extends Component {
    state = {
        focused: false,
    };

    onFocus = () => {
        this.setState({ focused: true });
    };
    onBlur = () => {
        this.setState({ focused: false });
    };

    render ({ value, outline, multi, onChange, emptyLabel, items, disabled, ...extra }, { focused }) {
        const props = extra;
        props.class = (props.class || '') + ' paper-select';
        if (focused) props.class += ' is-focused';
        if (outline) props.class += ' p-outline';

        const selectIcon = (
            <svg class="p-select-icon" width="24" height="24">
                <path d="M7 10h10l-5 5z" />
            </svg>
        );

        if (multi) {
            return (
                <span {...props}>
                    <MultiSelect
                        disabled={disabled}
                        value={value}
                        items={items}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        onChange={onChange}
                        emptyLabel={emptyLabel} />
                    {selectIcon}
                </span>
            );
        } else {
            return (
                <span {...props}>
                    <select
                        disabled={disabled}
                        value={value}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        onChange={e => {
                            onChange(e.target.value);
                        }}>
                        {(items || []).map((item, i) => (
                            <option
                                key={i}
                                value={item.value}
                                disabled={item.disabled}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                    {selectIcon}
                </span>
            );
        }
    }
}

class MultiSelect extends Component {
    state = {
        open: false,
        clientX: 0,
        clientY: 0,
    };

    #open = () => {
        this.setState({ open: true });
        this.update(0);
        globalAnimator.register(this);
    };
    #close = () => {
        this.setState({ open: false });
        globalAnimator.deregister(this);
    };

    componentWillUnmount () {
        globalAnimator.deregister(this);
    }

    update () {
        if (!this.node) return;
        const nodeRect = this.node.getBoundingClientRect();
        this.setState({
            clientX: nodeRect.left,
            clientY: nodeRect.top,
        });
    }

    render ({ value, onChange, items, emptyLabel, disabled }, { open, clientX, clientY }) {
        const keyedItems = {};
        for (const item of items) {
            keyedItems[item.value] = item;
        }

        const label = value.length
            ? value.map(v => keyedItems[v].shortLabel || keyedItems[v].label).join(', ')
            : emptyLabel || '';

        return (
            <span
                class="multi-select"
                tabIndex={disabled ? -1 : 0}
                onClick={this.#open}
                ref={node => this.node = node}>
                {label}

                <Menu
                    open={open}
                    persistent
                    onClose={this.#close}
                    container={selectPortalContainer}
                    selectionIcon={<CheckIcon style={{ verticalAlign: 'middle' }} />}
                    position={[clientX, clientY]}
                    items={items.map(item => ({
                        ...item,
                        selected: value.includes(item.value),
                        action: () => {
                            const v = new Set(value);
                            if (v.has(item.value)) v.delete(item.value);
                            else v.add(item.value);
                            onChange([...v]);
                        },
                    }))} />
            </span>
        );
    }
}
