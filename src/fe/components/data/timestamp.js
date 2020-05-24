import { h } from 'preact';
import moment from 'moment';
import { timestampFormat, timestampFormatToday } from '../../locale';
import date from './date';
import './style';

/// Renders a formatted timestamp (not editable). Use prop `value`.
function TimestampFormatter ({ value }) {
    if (value) {
        const m = moment(value).utc();
        const now = moment().utc();
        if (m.year() === now.year() && m.dayOfYear() === now.dayOfYear()) {
            // is today
            return m.format(timestampFormatToday);
        }
        return m.format(timestampFormat);
    }
    return null;
}

// FIXME: hacky; should be replaced with a proper datetime editor
function TimestampEditor ({ value, onChange }) {
    const m = moment(Number.isFinite(value) ? value * 1000 : value).utc();

    const dateValue = value === null ? null : m.format('YYYY-MM-DD');
    const timeValue = m.format('HH:mm:ss');

    return (
        <span class="timestamp-editor">
            <date.editor value={dateValue} onChange={v => {
                const newDate = moment.utc(v + '$' + timeValue, 'YYYY-MM-DD$HH:mm:ss');
                onChange(newDate.unix());
            }} />
            <input type="time" value={timeValue} onChange={e => {
                const v = e.target.value;
                const newDate = moment.utc(dateValue + '$' + v, 'YYYY-MM-DD$HH:mm:ss');
                onChange(newDate.unix());
            }} />
        </span>
    );
}

export default {
    renderer: TimestampFormatter,
    inlineRenderer: TimestampFormatter,
    editor: TimestampEditor,
};

