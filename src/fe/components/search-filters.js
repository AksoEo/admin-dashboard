import { h } from 'preact';
import PaperList from './paper-list';
import SearchInput from './search-input';
import Segmented from './segmented';
import { search as locale } from '../locale';

/// This component encapsulates search and filters and serves to abstract dealing with field search,
/// json filters, regular filters, saved filters, etc. for the core APIs.
///
/// # Props
/// - value/onChange: core parameters (see e.g. docs for codeholders/list for details)
/// - searchFields: string[] or null
/// - fields: array of all available field ids
/// - filters: object mapping all available filter ids to their editor components
/// - expanded/onExpandedChange: bool
/// - locale: object with `{ searchFields, searchPlaceholders }`
/// - category: category id for saved filters
export default function SearchFilters ({
    value,
    onChange,
    searchFields,
    fields,
    filters,
    expanded,
    onExpandedChange,
    locale,
    category,
}) {
    const items = [];

    items.push({
        node: <SearchInput
            value={value.search}
            onChange={search => onChange({ ...value, search })}
            searchFields={searchFields}
            expanded={expanded}
            onExpandedChange={onExpandedChange}
            localizedFields={locale.searchFields}
            localizedPlaceholders={locale.searchPlaceholders} />,
        paper: true,
        zIndex: 3,
    });

    items.push({
        node: <FiltersBar
            category={category}
            value={value}
            onChange={onChange} />,
        hidden: !expanded,
    });

    if (value.jsonFilter && !value.jsonFilter._disabled) {
        items.push({
            node: (
                <Suspense fallback={<div class="json-filter-loading">
                    {loadingJSONLocalizedTODO}
                </div>}>
                    <JSONEditor
                        value={props.jsonFilter}
                        onChange={props.onJSONChange}
                        submitted={props.submitted}
                        onSubmit={props.onSubmit} />
                </Suspense>
            ),
        });
    }

    if (value.filters && !value.filters._disabled) {
        // TODO: add filters
    }

    items.push({
        node: <div class="bottom-padding" />,
        hidden: !expanded,
        flush: true,
    });

    return <PaperList class="search-filters-container">{items}</PaperList>;
}

/// Renders the json/normal switch and saved filters stuff
function FiltersBar ({
    category,
    value,
    onChange,
}) {
    const filterType = value.filters._disabled ? 'json' : 'normal';
    const onFilterTypeChange = type => {
        const json = type === 'json';
        onChange({
            ...value,
            jsonFilter: {
                _disabled: !json,
                ...(value.jsonFilter || {}),
            },
            filters: {
                _disabled: json,
                ...(value.filters || {}),
            },
        });
    };

    return (
        <div class="filters-bar">
            <Segmented selected={filterType} onSelect={onFilterTypeChange}>
                {[
                    {
                        id: 'normal',
                        label: locale.normalFilter,
                    },
                    {
                        id: 'json',
                        label: locale.jsonFilter,
                    },
                ]}
            </Segmented>
            todo: saved filters
        </div>
    );
}
