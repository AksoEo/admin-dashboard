import { h, Component } from 'preact';
import { Button } from '@cpsdqs/yamdl';
import SearchIcon from '@material-ui/icons/Search';
import Select from './select';
import './search-input.less';

export default class SearchInputFocusable extends Component {
    #node;
    #input;

    #scheduledFocus;

    focus (delay) {
        if (!this.#node) return;
        this.#node.classList.remove('focus-animation');
        clearTimeout(this.#scheduledFocus);
        this.#scheduledFocus = setTimeout(() => {
            this.#node.classList.add('focus-animation');
            this.#input.focus();
        }, delay);
    }

    componentWillUnmount () {
        clearTimeout(this.#scheduledFocus);
    }

    render (props) {
        return <SearchInput
            {...props}
            innerRef={node => this.#node = node}
            inputRef={input => this.#input = input} />;
    }
}

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
function SearchInput ({
    value,
    onChange,
    searchFields,
    expanded,
    localizedFields,
    localizedPlaceholders,
    onSubmit,
    innerRef,
    inputRef,
}) {
    return (
        <div class="search-input" ref={innerRef}>
            {!!searchFields && (
                <Select
                    class="search-field"
                    value={value.field || ''}
                    onClick={e => !expanded && e.stopPropagation()}
                    onChange={field => onChange({ ...value, field })}
                    items={searchFields.map(field => ({
                        value: field,
                        label: localizedFields[field],
                    }))} />
            )}
            <div class="search-query-container">
                <input
                    ref={inputRef}
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
