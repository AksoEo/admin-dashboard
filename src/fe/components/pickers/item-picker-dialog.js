import { h } from 'preact';
import { PureComponent, useState } from 'preact/compat';
import { Dialog } from 'yamdl';
import SearchIcon from '@material-ui/icons/Search';
import StaticOverviewList from '../lists/overview-list-static';
import { data as dataLocale } from '../../locale';
import './item-picker-dialog.less';

/// Picks items from a list
///
/// # Props
/// - open/onClose
/// - defaultWidth: default picker width, or 400
/// - fullScreenWidth: screen width at which picker will go full screen, or 400
/// - limit: max. selected items
/// - value/onChange: id[] selected items
/// - task: list task
/// - view: item view
/// - filter: JSON filter
/// - fields: field spec object
/// - locale: field names
/// - search: { field: string, placeholder: string } optional, to enable search
/// - sorting: optional object { [field]: string }
/// - emptyLabel: shown when no items exist
/// - extraListOptions: additional props that will be passed to OverviewList
/// - ...extra: additional props for the dialog
export default class ItemPicker extends PureComponent {
    render ({
        open,
        onClose,
        defaultWidth,
        fullScreenWidth,
        limit,
        value,
        onChange,
        task,
        view,
        options,
        viewOptions,
        emptyLabel,
        filter,
        fields,
        locale,
        search,
        sorting,
        extraListOptions,
        ...extra
    }) {
        extra.class = (extra.class || '') + ' item-picker-dialog';
        extra.style = (extra.style || {});
        extra.style['--picker-width'] = (defaultWidth || 400) + 'px';

        return (
            <Dialog
                backdrop
                fullScreen={width => width < (fullScreenWidth || 400)}
                open={open}
                actions={onClose && [{ label: dataLocale.picker.done, action: onClose }]}
                onClose={onClose}
                {...extra}>
                <DialogInner
                    value={value}
                    onChange={onChange}
                    limit={limit}
                    onClose={onClose}
                    task={task}
                    view={view}
                    options={options}
                    viewOptions={viewOptions}
                    searchDef={search}
                    emptyLabel={emptyLabel}
                    extraListOptions={extraListOptions}
                    fields={fields}
                    sorting={sorting}
                    fieldsLocale={locale}
                    filter={filter} />
            </Dialog>
        );
    }
}

function DialogInner ({
    value,
    onChange,
    limit,
    onClose,
    filter,
    task,
    view,
    options,
    viewOptions,
    emptyLabel,
    extraListOptions,
    searchDef,
    sorting,
    fields,
    fieldsLocale,
}) {
    const [offset, setOffset] = useState(0);
    const [search, setSearch] = useState('');

    const selection = {
        add: id => {
            if (value.includes(+id)) return;
            onChange(value.concat([+id]));
            if (value.length + 1 >= limit) onClose();
        },
        has: id => value.includes(+id),
        delete: id => {
            if (!value.includes(+id)) return;
            const newValue = value.slice();
            newValue.splice(value.indexOf(+id), 1);
            onChange(newValue);
        },
    };

    return (
        <div>
            {searchDef ? (
                <div class="item-picker-search">
                    <div class="search-icon-container">
                        <SearchIcon />
                    </div>
                    <input
                        class="search-inner"
                        placeholder={searchDef.placeholder}
                        value={search}
                        onChange={e => setSearch(e.target.value)} />
                </div>
            ) : null}
            <StaticOverviewList
                compact
                task={task}
                view={view}
                options={options}
                viewOptions={viewOptions}
                useDeepCmp
                emptyLabel={emptyLabel}
                {...extraListOptions}
                search={searchDef ? { field: searchDef.field, query: search } : null}
                jsonFilter={filter}
                fields={fields}
                sorting={sorting}
                offset={offset}
                onSetOffset={setOffset}
                selection={limit === 1 ? null : selection}
                onItemClick={id => {
                    if (limit === 1) {
                        onChange([+id]);
                        onClose();
                        return;
                    }
                    if (value.includes(+id)) {
                        selection.delete(id);
                    } else {
                        selection.add(id);
                    }
                }}
                limit={10}
                locale={fieldsLocale} />
        </div>
    );
}
