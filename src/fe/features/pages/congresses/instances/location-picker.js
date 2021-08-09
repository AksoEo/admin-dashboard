import { h } from 'preact';
import { PureComponent, useState } from 'preact/compat';
import { Dialog } from 'yamdl';
import AddIcon from '@material-ui/icons/Add';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import DetailShell from '../../../../components/detail-shell';
import StaticOverviewList from '../../../../components/overview-list-static';
import { LinkButton } from '../../../../router';
import { congressLocations as locale } from '../../../../locale';
import { FIELDS } from './locations/fields';
import './location-picker.less';

const portalContainer = document.createElement('div');
portalContainer.id = 'congress-location-picker-portal-container';
document.body.appendChild(portalContainer);

function orderPortalContainerFront () {
    document.body.removeChild(portalContainer);
    document.body.appendChild(portalContainer);
}


/// Location picker.
///
/// # Props
/// - congress, instance: ids
/// - externalOnly: will only show external locations if set
/// - value/onChange: id
/// - editing: editing state
/// - disabled: will disable interaction
/// - adding: if true, will show + instead of "nowhere v" if empty, and the value cannot
///   be edited without removing it first.
export default class LocationPicker extends PureComponent {
    state = {
        pickerOpen: false,
    };

    render ({ congress, instance, value, editing, onChange, externalOnly, disabled, adding }, { pickerOpen }) {
        let preview;
        if (value) {
            preview = (
                <DetailShell
                    inline
                    view="congresses/location"
                    options={{ congress, instance }}
                    id={value}
                    locale={{}}>
                    {data => (editing || disabled) ? (
                        <div class="picker-selected-inner">
                            {data.type === 'external' ? (
                                <FIELDS.icon.component value={data.icon} />
                            ) : null}
                            <FIELDS.name.component value={data.name} />
                        </div>
                    ) : (
                        <LinkButton
                            target={`/kongresoj/${congress}/okazigoj/${instance}/lokoj/${value}`}
                            class="picker-selected-inner">
                            {data.type === 'external' ? (
                                <FIELDS.icon.component value={data.icon} />
                            ) : null}
                            <FIELDS.name.component value={data.name} />
                        </LinkButton>
                    )}
                </DetailShell>
            );
        } else if (adding) {
            preview = (
                <AddIcon style={{ verticalAlign: 'middle' }} />
            );
        } else {
            preview = locale.locatedWithinNowhere;
        }

        return (
            <div
                class={'congress-location-picker'
                    + (editing ? ' is-editing' : '')
                    + (disabled ? ' is-disabled' : '')}
                tabIndex={editing ? 0 : undefined}
                onClick={() => {
                    if (!disabled && editing && (!value || !adding)) {
                        orderPortalContainerFront();
                        this.setState({ pickerOpen: true });
                    }
                }}>
                <div class="picker-selected">
                    {preview}
                </div>
                {(editing && value) ? (
                    <div class="clear-button" onClick={e => {
                        e.stopPropagation();
                        onChange(null);
                    }}>
                        <CloseIcon />
                    </div>
                ) : (editing && !adding) ? (
                    <div class="editable-indicator">
                        <ExpandMoreIcon />
                    </div>
                ) : null}

                <Dialog
                    class="congress-location-picker-dialog"
                    container={portalContainer}
                    backdrop
                    open={pickerOpen}
                    onClose={() => this.setState({ pickerOpen: false })}
                    fullScreen={width => width < 600}
                    title={locale.locationPicker.pick}>
                    <Picker
                        onChange={onChange}
                        onClose={() => this.setState({ pickerOpen: false })}
                        externalOnly={externalOnly}
                        congress={congress}
                        instance={instance} />
                </Dialog>
            </div>
        );
    }
}

const REDUCED_FIELDS = Object.fromEntries(['name', 'icon', 'description'].map(id => [id, FIELDS[id]]));

function Picker ({ onChange, onClose, externalOnly, congress, instance }) {
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
                onItemClick={id => {
                    onChange(id);
                    onClose();
                }}
                limit={10}
                locale={locale.fields} />
        </div>
    );
}
