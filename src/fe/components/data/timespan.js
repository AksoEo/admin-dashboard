import { h } from 'preact';
import { PureComponent, createRef } from 'preact/compat';
import { Spring, globalAnimator } from '@cpsdqs/yamdl';
import { data as locale } from '../../locale';

function TimespanRenderer ({ value }) {
    if (typeof value !== 'number') return null;

    const days = Math.floor(value / 86400);
    const hours = Math.floor((value % 86400) / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = Math.floor(value % 60);

    const out = [];
    if (days) out.push(locale.timespanUnits.days(days));
    if (hours) out.push(locale.timespanUnits.hours(hours));
    if (minutes) out.push(locale.timespanUnits.minutes(minutes));
    if (seconds || !out.length) out.push(locale.timespanUnits.seconds(seconds));

    return out.join(', ');
}

class TimespanUnitEditor extends PureComponent {
    state = {
        editing: false,
        editingValue: null,
    };

    inputNode = createRef(null);
    bounceY = new Spring(0.5, 0.4);

    update (dt) {
        this.bounceY.update(dt);
        if (!this.bounceY.wantsUpdate()) {
            this.bounceY.finish();
            globalAnimator.deregister(this);
        }
        this.forceUpdate();
    }

    onFocus = () => {
        this.setState({ editing: true, editingValue: this.getValue() }, () => {
            try {
                this.inputNode.current.selectionStart = 0;
                this.inputNode.current.selectionEnd = this.inputNode.current.value.length;
            } catch {
                // sometimes this fails with “attempt to use an object that is no longer usable”
                // TODO: find out why
            }
        });
    };
    onBlur = () => {
        if (this.commit()) this.committing = true;
    };

    componentDidUpdate (prevProps) {
        if (this.props.value !== prevProps.value) {
            if (this.state.editing) {
                this.setState({ editingValue: this.getValue() });
            }

            const oldVal = this.committing ? this.committedValue : this.getValue(prevProps.value);
            const newVal = this.getValue();
            if (!this.committing || (newVal !== this.committedValue)) {
                if (newVal < oldVal) {
                    this.bounceY.velocity += 200;
                    globalAnimator.register(this);
                } else if (newVal > oldVal) {
                    this.bounceY.velocity -= 200;
                    globalAnimator.register(this);
                }
            }
        }


        if (this.committing) {
            this.committing = false;
            this.setState({ editing: false });
        }
    }

    getValue (value = this.props.value) {
        const { fac, mod } = this.props;
        return Math.floor((mod ? ((value | 0) % mod) : (value | 0)) / fac);
    }

    commit () {
        const { fac } = this.props;
        const currentValue = this.getValue();
        const stringValue = this.state.editingValue;

        const intValue = parseInt(stringValue, 10);
        if (!Number.isFinite(intValue)) return false;
        this.committedValue = intValue;

        const extraFloored = (this.props.value | 0) - currentValue * fac;
        const baseValue = intValue * fac;
        const newValue = baseValue + extraFloored;

        this.props.onChange(newValue);
        return true;
    }

    onInputChange = e => {
        this.setState({ editingValue: e.target.value });
    };

    onKeyDown = e => {
        if (!e.metaKey && !e.ctrlKey && !e.altKey) {
            // technically not spec-compliant to have selection in type number but it works in some
            // browsers
            const sa = e.target.selectionStart;
            const sb = e.target.selectionEnd;
            const end = e.target.value.length;
            if (e.key === 'ArrowLeft' && sa === 0 && sb === 0) {
                // focus previous input
                let ps = e.target.parentNode.previousElementSibling;
                if (ps) ps = ps.querySelector('input');
                if (ps) {
                    ps.focus();
                    ps.setSelectionRange(ps.value.length, ps.value.length);
                    e.preventDefault();
                }
            } else if ((e.key === 'ArrowRight' || e.key === this.props.unit) && sa === end && sb === end) {
                // focus next input
                let ns = e.target.parentNode.nextElementSibling;
                if (ns) ns = ns.querySelector('input');
                if (ns) {
                    ns.focus();
                    ns.setSelectionRange(0, 0);
                    e.preventDefault();
                }
            }
        }
    };

    render ({ mod, fac, unit }, { editing, editingValue }) {
        const inputValue = (editing || this.committing) ? editingValue : this.getValue();

        const max = mod ? mod : Math.floor(2147483647 / fac);

        return (
            <span class="te-field" style={{ transform: `scale(${1 - this.bounceY.value / 30})` }}>
                <input
                    ref={this.inputNode}
                    class="te-field-input"
                    type="number"
                    min="0"
                    step="1"
                    max={max}
                    value={inputValue.toString()}
                    onKeyDown={this.onKeyDown}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    onChange={this.onInputChange} />
                <span class="te-field-unit">{unit}</span>
            </span>
        );
    }
}

function TimespanEditor ({ value, onChange }) {
    value = Math.max(0, Math.min(value, 2147483647));

    return (
        <span class="data timespan-editor">
            <TimespanUnitEditor
                value={value}
                onChange={onChange}
                fac={86400}
                mod={null}
                unit={locale.timespanUnits.d} />
            <TimespanUnitEditor
                value={value}
                onChange={onChange}
                fac={3600}
                mod={86400}
                unit={locale.timespanUnits.h} />
            <TimespanUnitEditor
                value={value}
                onChange={onChange}
                fac={60}
                mod={3600}
                unit={locale.timespanUnits.m} />
            <TimespanUnitEditor
                value={value}
                onChange={onChange}
                fac={1}
                mod={60}
                unit={locale.timespanUnits.s} />
        </span>
    );
}

export default {
    inlineRenderer: TimespanRenderer,
    renderer: TimespanRenderer,
    editor: TimespanEditor,
};
