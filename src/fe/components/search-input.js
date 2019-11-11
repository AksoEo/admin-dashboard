import { h } from 'preact';
import NativeSelect from '@material-ui/core/NativeSelect';
import { Button } from '@cpsdqs/yamdl';
import SearchIcon from '@material-ui/icons/Search';
import './search-input.less';

/// Primary search field.
///
/// # Props
/// - value/onChange: request params -> search
///   looks like `{ field, query }`
/// - searchFields: string[] or null: available search fields
/// - expanded: bool
/// - localizedFields: object
/// - localizedPlaceholders: object, or string if no searchFields are given
/// - onSubmit: submit callback
export default function SearchInput ({
    value,
    onChange,
    searchFields,
    expanded,
    localizedFields,
    localizedPlaceholders,
    onSubmit,
}) {
    return (
        <div class="search-input">
            {!!searchFields && (
                <NativeSelect
                    className="search-field"
                    value={value.field || ''}
                    onClick={e => !expanded && e.stopPropagation()}
                    onChange={e => onChange({ ...value, field: e.target.value })}>
                    {searchFields.map(field => (
                        <option value={field} key={field}>
                            {localizedFields[field]}
                        </option>
                    ))}
                </NativeSelect>
            )}
            <div class="search-query-container">
                <input
                    autoFocus={true}
                    class="search-query"
                    value={value.query}
                    onChange={e => onChange({ ...value, query: e.target.value })}
                    onClick={e => !expanded && e.stopPropagation()}
                    placeholder={searchFields
                        ? localizedPlaceholders[value.field]
                        : localizedPlaceholders}
                    onKeyDown={e => {
                        if (e.key === 'Enter') onSubmit();
                    }} />
                <Button
                    icon
                    small
                    class="search-action search-submit"
                    tabIndex={-1} // submit with enter
                    onClick={onSubmit}>
                    <SearchIcon />
                </Button>
            </div>
        </div>
    );
}
