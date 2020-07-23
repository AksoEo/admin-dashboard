import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import OverviewListItem from '../../../../../components/overview-list-item';
import { congressLocations as locale } from '../../../../../locale';
import { FIELDS } from './fields';
import MapList from '../../map-list';
import './index.less';

/// Shows an overview over locations, with a map
///
/// # Props
/// - congress: congress id
/// - instance: instance id
/// - push: proxy for navigation API
/// - detail: locationDetail state
/// - editing: locationEditing state
export default class LocationsView extends PureComponent {
    render ({ congress, instance }) {
        return (
            <div class="congresses-instance-locations">
                <MapList
                    task="congresses/listLocations"
                    options={{ congress, instance }}
                    view="congresses/location"
                    viewOptions={{ congress, instance, noFetch: true }}
                    item={listItemConstructor({ congress, instance })}
                    itemToMarker={item => item.type === 'internal' ? null : ({
                        key: item.id,
                        location: item.ll,
                        icon: 'meow',
                    })}
                    onItemClick={id => {
                        this.props.push('lokoj/' + id);
                    }}
                    itemParent={item => item.type === 'internal' ? item.externalLoc : null}
                    searchFields={['name', 'description']} />
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
