import { h } from 'preact';
import moment from 'moment';

/// Renders a formatted date (not editable). Use prop `value`.
function DateFormatter ({ value }) {
    return value ? moment(value).format('D[-a de] MMMM Y') : '';
}

function RudimentaryDateEditor ({ value, onChange, ...props }) {
    return (
        <input
            type="date"
            value={value}
            onChange={e => onChange(e.target.value)}
            {...props} />
    );
}

export default {
    renderer: DateFormatter,
    inlineRenderer: DateFormatter,
    editor: RudimentaryDateEditor,
};

