import { h } from 'preact';
import { Suspense, useEffect } from 'preact/compat';
import { Checkbox } from '@cpsdqs/yamdl';
import PaperList from './paper-list';
import SearchInput from './search-input';
import Segmented from './segmented';
import DisclosureArrow from './disclosure-arrow';
import { search as locale } from '../locale';
import './search-filters.less';

function JSONEditor () {
    // TODO
    return 'todo: json editor';
}

/// This component encapsulates search and filters and serves to abstract dealing with field search,
/// json filters, regular filters, saved filters, etc. for the core APIs.
///
/// # Props
/// - value/onChange: core parameters (see e.g. docs for codeholders/list for details)
/// - searchFields: string[] or null
/// - fields: array of all available field ids
/// - filters: object mapping all available filter ids to their editor spec. An editor spec
///   contains:
///   - `default() -> Filter` where `typedef Filter { enabled: bool, value: any, ...other }`
///   - `serialize(Filter) -> string` to serialize the filter for the URL;
///     with invariant `enabled == true`
///   - `deserialize(string) -> Filter` to deserialize the filter from the URL
///   - `editor: Component { filter: Filter, onFilterChange }` editor component
///     May return a fragment. First fragment item may be displayed inline.
///     Additional convenience props: `value`, `onChange`, `enabled`, `onEnabledChange`
///   - `applyConstraints(Filter, filters: Filter[]) -> Filter` applies constraints given the other
///     filters. Optional.
///   - `needsSwitch: bool` if true, the filter will have an on/off switch that controls its
///     `enabled` property
///
///   Serialize and deserialize may be omitted for simple filter value types (i.e. primitives).
/// - expanded/onExpandedChange: bool
/// - locale: object with `{ searchFields, searchPlaceholders, filters }`
/// - category: category id for saved filters
export default function SearchFilters ({
    value,
    onChange,
    searchFields,
    fields,
    filters,
    expanded,
    onExpandedChange,
    locale: searchLocale,
    category,
}) {
    const items = [];

    items.push({
        node: <div class="top-padding" />,
        hidden: !expanded,
    });

    items.push({
        node: <SearchInput
            value={value.search}
            onChange={search => onChange({ ...value, search })}
            searchFields={searchFields}
            expanded={expanded}
            onSubmit={() => {
                onExpandedChange(false);
                // TODO: submit
            }}
            localizedFields={searchLocale.searchFields}
            localizedPlaceholders={searchLocale.searchPlaceholders} />,
        paper: true,
        zIndex: 3,
        staticHeight: true,
    });

    items.push({
        node: <FiltersDisclosure
            expanded={expanded}
            onExpandedChange={onExpandedChange} />,
        paper: true,
        staticHeight: true,
    });

    items.push({
        node: <FiltersBar
            category={category}
            value={value}
            onChange={onChange} />,
        hidden: !expanded,
        paper: true,
    });

    const jsonFilterEnabled = value.jsonFilter && !value.jsonFilter._disabled;

    items.push({
        node: jsonFilterEnabled ? (
            <Suspense fallback={<div class="json-filter-loading">
                {locale.loadingJSONEditor}
            </div>}>
                <JSONEditor
                    value={value.jsonFilter}
                    onChange={jsonFilter => onChange({ ...value, jsonFilter })}
                    expanded={expanded}
                    onCollapse={() => onExpandedChange(false)} />
            </Suspense>
        ) : null,
        paper: true,
        hidden: !jsonFilterEnabled,
    });

    useEffect(() => {
        const newValue = { ...value };
        if (!newValue.filters) newValue.filters = {};
        let didChange = false;
        for (const filterId in filters) {
            if (!(filterId in newValue.filters)) {
                didChange = true;
                newValue.filters[filterId] = filters[filterId].default();
            }
        }
        for (const filterId of [...Object.keys(newValue.filters)]) {
            if (filterId === '_disabled') continue;
            if (!(filterId in filters)) {
                didChange = true;
                delete newValue.filters[filterId];
            }
        }
        if (didChange) onChange(newValue);
    });

    const filtersEnabled = value.filters && !value.filters._disabled;
    for (const filterId in filters) {
        // TODO: filter constaints
        if (!value.filters[filterId]) continue; // handled above
        const isEnabled = value.filters[filterId].enabled;
        items.push({
            node: <Filter
                id={filterId}
                spec={filters[filterId]}
                filter={value.filters[filterId]}
                onFilterChange={filter => onChange({
                    ...value,
                    filters: {
                        ...value.filters,
                        [filterId]: filter,
                    },
                })}
                locale={searchLocale} />,
            paper: true,
            hidden: !filtersEnabled || (!isEnabled && !expanded),
        });
    }

    items.push({
        node: <div class="bottom-padding" />,
        hidden: !expanded,
        flush: true,
    });

    return <PaperList class="search-filters">{items}</PaperList>;
}

function FiltersDisclosure ({ expanded, onExpandedChange }) {
    return (
        <div class="filters-disclosure" onClick={() => onExpandedChange(!expanded)}>
            {locale.filtersDisclosure}

            <DisclosureArrow dir={expanded ? 'up' : 'down'} />
        </div>
    );
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
                ...(value.jsonFilter || {}),
                _disabled: !json,
            },
            filters: {
                ...(value.filters || {}),
                _disabled: json,
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

function Filter ({ id, spec, filter, onFilterChange, locale }) {
    const FilterEditor = spec.editor;

    let filterSwitch;
    if (spec.needsSwitch) {
        filterSwitch = (
            <div class="filter-switch-container">
                <Checkbox
                    checked={filter.enabled}
                    onChange={enabled => onFilterChange({ ...filter, enabled })} />
            </div>
        );
    } else {
        filterSwitch = <div class="filter-switch-placeholder" />;
    }

    return (
        <div class="filter">
            <div class="filter-header">
                {filterSwitch}
                {locale.filters[id]}
            </div>
            <FilterEditor
                filter={filter}
                onFilterChange={onFilterChange}
                value={filter.value}
                // SUPER HACKY: allow batched calls to onChange/onEnabledChange by also writing
                // to the filter prop
                onChange={value => onFilterChange(filter = { ...filter, value })}
                enabled={filter.enabled}
                onEnabledChange={enabled => onFilterChange(filter = { ...filter, enabled })} />
        </div>
    );
}
