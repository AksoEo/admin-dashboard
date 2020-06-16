import { h } from 'preact';
import moment from 'moment';
import { timestampFormat, timestampFormatToday } from '../../locale';
import date from './date';
import time from './time';
import './style';

/// Renders a formatted timestamp (not editable). Use prop `value`.
function TimestampFormatter ({ value }) {
    if (value) {
        const m = moment(value).utc();
        const mlt = moment(value);
        const now = moment().utc();
        if (m.year() === now.year() && m.dayOfYear() === now.dayOfYear()
            && mlt.dayOfYear() === moment().dayOfYear()) {
            // is today in both UTC and local time
            // we don't want to show “today” if it’s not today in local time to avoid confusion
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
    const timeValue = m.hour() * 3600 + m.minute() * 60 + m.second();

    return (
        <span class="timestamp-editor">
            <date.editor value={dateValue} onChange={v => {
                const newDate = moment.utc(v + '$' + timeValue, 'YYYY-MM-DD$HH:mm:ss');
                onChange(newDate.unix());
            }} />
            <time.editor value={timeValue} onChange={v => {
                const newDate = moment.utc(dateValue + '$00:00:00', 'YYYY-MM-DD$HH:mm:ss');
                newDate.seconds(v);
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

