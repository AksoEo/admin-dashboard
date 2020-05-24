import { h } from 'preact';
import { useRef } from 'preact/compat';
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

function TimespanUnitEditor ({ value, onChange, fac, mod, unit }) {
    const inputNode = useRef(null);
    const editingValue = Math.floor((mod ? (value | 0) % mod : (value | 0)) / fac);

    const onInputChange = e => {
        const stringValue = e.target.value;
        const extraFloored = (value | 0) - editingValue * fac;
        const baseValue = (stringValue | 0) * fac;
        const newValue = baseValue + extraFloored;
        onChange(newValue);
    };

    const onKeyDown = e => {
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
            } else if (e.key === 'ArrowRight' && sa === end && sb === end) {
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
    const onClick = () => {
        inputNode.current.focus();
    };

    const max = mod ? mod : Math.floor(2147483647 / fac);

    return (
        <span class="te-field" onClick={onClick}>
            <input
                ref={inputNode}
                class="te-field-input"
                type="number"
                min="0"
                step="1"
                max={max}
                value={editingValue.toString()}
                onKeyDown={onKeyDown}
                onChange={onInputChange} />
            <span class="te-field-unit">{unit}</span>
        </span>
    );
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
