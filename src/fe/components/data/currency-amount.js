import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { stdlib, currencies } from '@tejo/akso-script';
import { TextField } from '@cpsdqs/yamdl';
import { data as locale } from '../../locale';

function stringify (value, currency) {
    return stdlib.currency_fmt.apply(null, [currency || '?', value | 0]);
}

/// Displays a currency amount.
///
/// - value: amount in smallest currency unit
/// - currency: currency id
function CurrencyAmount ({ value, currency }) {
    return stringify(value, currency);
}

/// Edits a currency value.
///
/// # Props
/// - value/onChange: currency value
/// - min/max/step
/// - currency: currency id
class CurrencyEditor extends PureComponent {
    state = {
        // is the editor focused?
        editing: false,
        // current input string being edited (may not be a valid number). Exists only while editing
        editingValue: null,
        error: false,
    };

    onFocus = () => this.setState({ editing: true, editingValue: this.format(this.props.value) });
    onBlur = () => this.setState({ editing: false, error: false });

    onInputChange = (e) => {
        this.setState({ editingValue: e.target.value });

        const v = parseFloat(e.target.value.replace(/,/g, '.'));
        if (Number.isNaN(v) || !this.props.currency) {
            this.setState({ error: true });
        } else {
            this.setState({ error: false });
            const value = v * currencies[this.props.currency];
            this.props.onChange(this.clamp(value));
        }
    };

    getStep () {
        if (Number.isFinite(this.props.step)) return this.props.step;
        return 1;
    }

    onKeyDown = e => {
        if (e.ctrlKey || e.metaKey) return;
        if (e.key === 'ArrowUp') {
            // step up
            e.preventDefault();
            const value = this.props.value + this.getStep();
            this.setState({ editingValue: this.format(this.clamp(value)), error: false });
            this.props.onChange(value);
        } else if (e.key === 'ArrowDown') {
            // step down
            e.preventDefault();
            const value = this.props.value - this.getStep();
            this.setState({ editingValue: this.format(this.clamp(value)), error: false });
            this.props.onChange(value);
        } else if (e.key.length == 1 && !e.key.match(/[-\d,.]/)) {
            // not a valid character; don't do anything
            e.preventDefault();
        }
    };

    /// Restricts the given value according to min, max, and step.
    clamp (value) {
        if (Number.isFinite(this.props.min)) {
            value = Math.max(value, this.props.min);
        }
        if (Number.isFinite(this.props.max)) {
            value = Math.min(value, this.props.max);
        }
        if (Number.isFinite(this.props.step)) {
            value = Math.round(value / this.props.step) * this.props.step;
        }
        return value;
    }

    /// Formats the given value for the user according to the current currency (e.g. 102 -> "1,02")
    format (value) {
        const { currency } = this.props;
        const fractValue = currency ? (value | 0) / currencies[currency] : (value | 0);
        const minimumFractionDigits = Math.log10(currencies[currency]) | 0;
        return fractValue.toLocaleString('fr-FR', {
            minimumFractionDigits,
        });
    }

    render ({ value, currency, ...extra }, { editing }) {
        return (
            <TextField
                {...extra}
                autocomplete="off"
                error={this.state.error ? locale.invalidCurrencyAmount : null}
                value={editing ? this.state.editingValue : this.format(value)}
                onChange={this.onInputChange}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onKeyDown={this.onKeyDown}
                inputMode="numeric"
                style={{ textAlign: 'right' }}
                trailing={currency} />
        );
    }
}

export default {
    renderer: CurrencyAmount,
    inlineRenderer: CurrencyAmount,
    editor: CurrencyEditor,
    stringify,
};
