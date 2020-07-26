import { h } from 'preact';
import { PureComponent, useState } from 'preact/compat';
import { Dialog } from '@cpsdqs/yamdl';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SearchIcon from '@material-ui/icons/Search';
import DetailShell from '../../../../components/detail-shell';
import StaticOverviewList from '../../../../components/overview-list-static';
import { LinkButton } from '../../../../router';
import { congressLocations as locale } from '../../../../locale';
import { FIELDS } from './locations/fields';

/// Location picker.
///
/// # Props
/// - congress, instance: ids
/// - externalOnly: will only show external locations if set
/// - value/onChange: id
/// - editing: editing state
export default class LocationPicker extends PureComponent {
    state = {
        pickerOpen: false,
    };

    render ({ congress, instance, value, editing, onChange, externalOnly }, { pickerOpen }) {
        let preview;
        if (value) {
            preview = (
                <DetailShell
                    inline
                    view="congresses/location"
                    options={{ congress, instance }}
                    id={value}
                    locale={{}}>
                    {data => editing ? (
                        <div class="picker-selected">
                            <FIELDS.icon.component value={data.icon} />
                            <FIELDS.name.component value={data.name} />
                        </div>
                    ) : (
                        <LinkButton
                            target={`/kongresoj/${congress}/okazigoj/${instance}/lokoj/${value}`}
                            class="picker-selected">
                            <FIELDS.icon.component value={data.icon} />
                            <FIELDS.name.component value={data.name} />
                        </LinkButton>
                    )}
                </DetailShell>
            );
        } else {
            preview = locale.locatedWithinNowhere;
        }

        return (
            <div
                class={'congress-location-picker' + (editing ? ' is-editing' : '')}
                tabIndex={editing ? 0 : undefined}
                onClick={() => this.setState({ pickerOpen: true })}>
                {preview}
                {editing ? (
                    <span class="editable-indicator">
                        <ExpandMoreIcon />
                    </span>
                ) : null}

                <Dialog
                    class="congress-location-picker-dialog"
                    backdrop
                    open={pickerOpen}
                    onClose={() => this.setState({ pickerOpen: false })}
                    fullScreen={width => width < 600}
                    title={locale.locationPicker.pick}>
                    <Picker
                        onChange={onChange}
                        externalOnly={externalOnly}
                        congress={congress}
                        instance={instance} />
                </Dialog>
            </div>
        );
    }
}

const REDUCED_FIELDS = Object.fromEntries(['name', 'icon', 'description'].map(id => [id, FIELDS[id]]));

function Picker ({ onChange, externalOnly, congress, instance }) {
    const [search, setSearch] = useState('');
    const [offset, setOffset] = useState(0);

    return (
        <div>
            <div class="picker-search">
                <div class="search-icon-container">
                    <SearchIcon />
                </div>
                <input
                    class="search-inner"
                    placeholder={locale.locationPicker.search}
                    value={search}
                    onChange={e => setSearch(e.target.value)} />
            </div>
            <StaticOverviewList
                compact
                task="congresses/listLocations"
                options={{ congress, instance, externalOnly }}
                view="congresses/location"
                viewOptions={{ congress, instance }}
                search={{ field: 'name', query: search }}
                fields={REDUCED_FIELDS}
                sorting={{ name: 'asc' }}
                offset={offset}
                onSetOffset={setOffset}
                onItemClick={onChange}
                limit={10}
                locale={locale.fields} />
        </div>
    );
}
