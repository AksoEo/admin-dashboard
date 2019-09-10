import moment from 'moment';

/// Renders a formatted date (not editable). Use prop `value`.
function DateFormatter ({ value }) {
    return value ? moment(value).format('D[-a de] MMMM Y') : '';
}

export default {
    renderer: DateFormatter,
    inlineRenderer: DateFormatter,
    editor: () => 'unimplemented!',
};

