import { h } from 'preact';
import { useState } from 'preact/compat';
import { Dialog } from 'yamdl';
import SearchIcon from '@material-ui/icons/Search';
import StaticOverviewList from '../../../../components/overview-list-static';
import { delegationSubjects as locale } from '../../../../locale';
import { FIELDS } from './fields';

export default function PickerDialog ({ value, onChange, container, limit, open, onClose, filter, ...extra }) {
    return (
        <Dialog
            class="subject-picker-dialog"
            backdrop
            fullScreen={width => width < 600}
            title={locale.picker.pick}
            container={container}
            open={open}
            onClose={onClose}
            actions={onClose && [{ label: locale.picker.done, action: onClose }]}
            {...extra}>
            <DialogInner
                value={value}
                onChange={onChange}
                onClose={onClose}
                filter={filter}
                limit={limit} />
        </Dialog>
    );
}

function DialogInner ({ value, onChange, limit, onClose, filter }) {
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
            <div class="subject-picker-search">
                <div class="search-icon-container">
                    <SearchIcon />
                </div>
                <input
                    class="search-inner"
                    placeholder={locale.picker.search}
                    value={search}
                    onChange={e => setSearch(e.target.value)} />
            </div>
            <StaticOverviewList
                compact
                task="delegations/listSubjects"
                view="delegations/subject"
                search={{ field: 'name', query: search }}
                jsonFilter={filter}
                fields={FIELDS}
                sorting={{ id: 'asc' }}
                offset={offset}
                onSetOffset={setOffset}
                selection={limit === 1 ? null : selection}
                onItemClick={id => {
                    if (value.includes(+id)) {
                        selection.delete(id);
                    } else {
                        selection.add(id);
                    }
                }}
                limit={10}
                locale={locale.fields} />
        </div>
    );
}
