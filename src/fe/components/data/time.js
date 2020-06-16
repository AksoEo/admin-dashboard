import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { TextField } from '@cpsdqs/yamdl';
import { data as locale } from '../../locale';
import './style';

function mod (m, n) {
    return ((m % n) + n) % n;
}
function pad2 (n) {
    n = '' + n;
    return ('00' + n).substr(-2);
}
function hours (n) {
    return Math.floor(((n | 0) % 86400) / 3600);
}
function minutes (n) {
    return Math.floor(((n | 0) % 3600) / 60);
}

function formatTime (n) {
    return pad2(hours(n)) + locale.timeSeparator + pad2(minutes(n));
}

/// Renders time. Does not display seconds.
///
/// # Props
/// - value: number of seconds
function TimeRenderer ({ value }) {
    if (!value) return null;
    return formatTime(value);
}

/// Edits time. Does not edit seconds.
///
/// # Props
/// - value/onChange: number of seconds
class TimeEditor extends PureComponent {
    state = {
        editingValue: '',
    };

    deriveEditingValue = () => {
        this.setState({
            editingValue: Number.isFinite(this.props.value)
                ? formatTime(this.props.value)
                : '',
        });
    };

    commitEditing = () => {
        let value = 0;
        const input = this.state.editingValue;

        if (!input) {
            // assume unchanged
            this.deriveEditingValue();
            return;
        }

        const inputParts = input.split(/[.:;]/g).map(part => parseInt(part));
        if (Number.isFinite(inputParts[0])) value += inputParts[0] * 3600;
        if (Number.isFinite(inputParts[1])) value += inputParts[1] * 60;
        if (Number.isFinite(inputParts[2])) value += inputParts[2];

        // mod 86400
        value = mod(value, 86400);

        this.props.onChange && this.props.onChange(value);
    };

    onBlur = () => this.commitEditing();

    onKeyDown = e => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();

            let s = this.state.editingValue;
            let pos = this.input.inputNode.selectionStart;
            if (pos === s.length) pos--;

            let numberStart = pos;
            for (let i = pos; i >= 0; i--) {
                if (!s[i].match(/\d/)) break;
                numberStart = i;
            }
            let numberEnd = pos;
            for (let i = pos; i < s.length; i++) {
                if (!s[i].match(/\d/)) break;
                numberEnd = i + 1;
            }
            let number = parseInt(s.substring(numberStart, numberEnd));

            if (numberStart === numberEnd) return;

            const firstColonPos = s.indexOf(':');
            const max = numberEnd <= firstColonPos ? 24 : 60;

            const delta = e.shiftKey ? 10 : 1;
            if (e.key === 'ArrowUp') number = mod(number + delta, max);
            else number = mod(number - delta, max);

            number = pad2(number);

            s = s.substr(0, numberStart) + number + s.substr(numberEnd);
            this.setState({ editingValue: s }, () => {
                this.input.inputNode.selectionStart = numberStart;
                this.input.inputNode.selectionEnd = numberStart + number.length;
            });
        }
    };

    componentDidMount () {
        this.deriveEditingValue();
    }

    componentDidUpdate (prevProps) {
        const isEqual = !Number.isFinite(this.props.value)
            ? true // we pretend it's equal because otherwise we might get an infinite loop
            : prevProps.value === this.props.value;

        if (!isEqual) this.deriveEditingValue();
    }

    render (_, { editingValue }) {
        return (
            <TextField
                ref={view => this.input = view}
                class="data time-editor"
                onBlur={this.onBlur}
                value={editingValue}
                onKeyDown={this.onKeyDown}
                onChange={e => {
                    this.setState({ editingValue: e.target.value });
                }}/>
        );
    }
}

export default {
    renderer: TimeRenderer,
    inlineRenderer: TimeRenderer,
    editor: TimeEditor,
};
