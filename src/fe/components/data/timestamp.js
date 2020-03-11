import { h } from 'preact';
import moment from 'moment';
import { timestampFormat } from '../../locale';
import date from './date';

/// Renders a formatted timestamp (not editable). Use prop `value`.
function TimestampFormatter ({ value }) {
    return value ? moment(value).format(timestampFormat) : '';
}

// FIXME: hacky; should be replaced with a proper datetime editor
function TimestampEditor ({ value, onChange }) {
    const m = moment(Number.isFinite(value) ? value * 1000 : value).utc();

    const dateValue = m.format('YYYY-MM-DD');
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

