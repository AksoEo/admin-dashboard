import { h, Component } from 'preact';
import './select.less';

/// A <select>.
///
/// # Props
/// - `value`: currently selected value
/// - `onChange`: (value) => void
/// - `items`: select items
/// - `outline`: pass true for outline style
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

    render ({ value, outline, onChange, items, ...extra }, { focused }) {
        const props = extra;
        props.class = (props.class || '') + ' paper-select';
        if (focused) props.class += ' is-focused';
        if (outline) props.class += ' p-outline';

        return (
            <span {...props}>
                <select
                    value={value}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    onChange={e => {
                        onChange(e.target.value);
                    }}>
                    {(items || []).map((item, i) => (
                        <option key={i} value={item.value}>{item.label}</option>
                    ))}
                </select>
                <svg class="p-select-icon" width="24" height="24">
                    <path d="M7 10h10l-5 5z" />
                </svg>
            </span>
        );
    }
}
