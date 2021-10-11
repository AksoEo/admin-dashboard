import { h } from 'preact';
import { useState } from 'preact/compat';
import { Dialog } from 'yamdl';
import SearchIcon from '@material-ui/icons/Search';
import StaticOverviewList from '../../../../components/overview-list-static';
import { delegations as locale } from '../../../../locale';
import './city-picker.less';

export default function PickerDialog ({ value, onChange, limit, container, open, onClose, filter, ...extra }) {
    return (
        <Dialog
            class="city-picker-dialog"
            backdrop
            fullScreen={width => width < 600}
            title={limit === 1 ? locale.cityPicker.pickOne : locale.cityPicker.pick}
            container={container}
            open={open}
            onClose={onClose}
            actions={onClose && [{ label: locale.cityPicker.done, action: onClose }]}
            {...extra}>
            <DialogInner
                value={value}
                onChange={onChange}
                onClose={onClose}
                filter={filter}
                limit={this.props.limit} />
        </Dialog>
    );
}

const FIELDS = {
    eoLabel: {
        slot: 'title',
        component ({ value }) {
            return value;
        },
    },
    nativeLabel: {
        component ({ value }) {
            return value;
        },
    },
    subdivision_eoLabel: {
        component ({ value }) {
            return value;
        },
    },
};

function DialogInner ({ value, onChange, limit, onClose, filter }) {
    const [offset, setOffset] = useState(0);
    const [search, setSearch] = useState('');

    const selection = {
        add: id => {
            if (value.includes('' + id)) return;
            onChange(value.concat(['' + id]));
            if (value.length + 1 >= limit) onClose();
        },
        has: id => value.includes('' + id),
        delete: id => {
            if (!value.includes('' + id)) return;
            const newValue = value.slice();
            newValue.splice(value.indexOf('' + id), 1);
            onChange(newValue);
        },
    };

    return (
        <div>
            <div class="city-picker-search">
                <div class="search-icon-container">
                    <SearchIcon />
                </div>
                <input
                    class="search-inner"
                    placeholder={locale.cityPicker.search}
                    value={search}
                    onChange={e => setSearch(e.target.value)} />
            </div>
            <StaticOverviewList
                compact
                task="geoDb/listCities"
                view="geoDb/city"
                search={{ field: 'searchLabel', query: search }}
                jsonFilter={filter}
                fields={FIELDS}
                sorting={{ code: 'asc' }}
                offset={offset}
                onSetOffset={setOffset}
                selection={limit === 1 ? null : selection}
                onItemClick={id => {
                    if (value.includes('' + id)) {
                        selection.delete(id);
                    } else {
                        selection.add(id);
                    }
                }}
                limit={10}
                locale={locale.cityPicker.fields} />
        </div>
    );
}
