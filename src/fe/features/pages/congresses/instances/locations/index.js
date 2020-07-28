import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import BusinessIcon from '@material-ui/icons/Business';
import OverviewListItem from '../../../../../components/overview-list-item';
import { congressLocations as locale } from '../../../../../locale';
import { FIELDS } from './fields';
import MapList from '../../map-list';
import './index.less';

/// Shows an overview over locations, with a map
///
/// # Props
/// - congress: congress id
/// - congressLocation: optional congress location
/// - instance: instance id
/// - push: proxy for navigation API
export default class LocationsView extends PureComponent {
    render ({ congress, instance, congressLocation }) {
        const markers = [];
        if (congressLocation) {
            markers.push({
                location: congressLocation,
                icon: <BusinessIcon />,
            });
        }

        const IconField = FIELDS.icon.component;

        return (
            <div class="congresses-instance-locations">
                <MapList
                    task="congresses/listLocations"
                    options={{ congress, instance }}
                    view="congresses/location"
                    viewOptions={{ congress, instance, noFetch: true }}
                    updateView={['congresses/sigLocations', { congress, instance }]}
                    item={listItemConstructor({ congress, instance })}
                    itemToMarker={item => item.type === 'internal' ? null : ({
                        key: item.id,
                        location: item.ll,
                        icon: item.icon === 'GENERIC' ? null : <IconField value={item.icon} />,
                    })}
                    onItemClick={id => {
                        this.props.push('lokoj/' + id);
                    }}
                    itemParent={item => item.type === 'internal' ? item.externalLoc : null}
                    searchFields={['name', 'description']}
                    markers={markers} />
            </div>
        );
    }
}

const listItemConstructor = ({ congress, instance }) => function ListItem ({ id }) {
    const fields = [
        { id: 'icon' },
        { id: 'name' },
        { id: 'description' },
    ];

    return (
        <div class="location-item">
            <OverviewListItem
                compact
                view="congresses/location"
                options={{ congress, instance }}
                id={id}
                selectedFields={fields}
                fields={FIELDS}
                locale={locale.fields} />
        </div>
    );
};
