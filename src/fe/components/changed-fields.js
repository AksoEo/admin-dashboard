import { h } from 'preact';
import { detail as locale } from '../locale';
import './changed-fields.less';

/// Renders a list of changed fields for use in update task dialogs.
///
/// # Props
/// - changedFields: list of changed fields
/// - locale: localized field names
export default function ChangedFields ({ changedFields, locale: localizedFields }) {
    return (
        <div class="changed-fields">
            <span class="changed-fields-title">
                {locale.diff}
            </span>
            <ul class="changed-fields">
                {changedFields.map(field => (
                    <li key={field}>
                        {localizedFields[field]}
                    </li>
                ))}
            </ul>
        </div>
    );
}
