import moment from 'moment';

/// Renders a formatted timestamp (not editable). Use prop `value`.
function TimestampFormatter ({ value }) {
    return value ? moment(value).format('LLL') : '';
}

export default {
    renderer: TimestampFormatter,
    inlineRenderer: TimestampFormatter,
    editor: () => 'unimplemented!',
};

