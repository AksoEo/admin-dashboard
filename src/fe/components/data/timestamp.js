import moment from 'moment';
import { timestampFormat } from '../../locale';

/// Renders a formatted timestamp (not editable). Use prop `value`.
function TimestampFormatter ({ value }) {
    return value ? moment(value).format(timestampFormat) : '';
}

export default {
    renderer: TimestampFormatter,
    inlineRenderer: TimestampFormatter,
    editor: () => 'unimplemented!',
};

