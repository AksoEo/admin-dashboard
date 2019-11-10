import { h } from 'preact';
import NativeSelect from '@material-ui/core/NativeSelect';
import { Button } from '@cpsdqs/yamdl';
import SearchIcon from '@material-ui/icons/Search';

/// Primary search field.
///
/// # Props
/// - value/onChange: request params -> search
///   looks like `{ field, query }`
/// - searchFields: string[] or null: available search fields
/// - expanded/onChangeExpanded: bool
/// - localizedFields: object
/// - localizedPlaceholders: object, or string if no searchFields are given
export default function SearchInput ({
    value,
    onChange,
    searchFields,
    expanded,
    onChangeExpanded,
    localizedFields,
    localizedPlaceholders,
}) {
    return (
        <div className="search-input">
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
            <input
                autoFocus={true}
                className="search-query"
                value={value.query}
                onChange={e => onChange({ ...value, query: e.target.value })}
                onClick={e => !expanded && e.stopPropagation()}
                placeholder={searchFields
                    ? localizedPlaceholders[value.field]
                    : localizedPlaceholders}
                onKeyDown={e => {
                    if (e.key === 'Enter') this.props.onSubmit();
                }} />
            <Button
                icon
                class="search-action search-submit"
                tabIndex={-1}
                onClick={this.props.onSubmit}>
                <SearchIcon />
            </Button>
        </div>
    );
}
