import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import SearchFilters from '../../../../../components/search-filters';
import OverviewList from '../../../../../components/overview-list';
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
export default class LocationsView extends PureComponent {
    state = {
        parameters: {
            search: {
                field: 'name',
                query: '',
            },
            fields: [
                { id: 'type', sorting: 'none', fixed: true },
                { id: 'icon', sorting: 'none', fixed: true },
                { id: 'name', sorting: 'asc', fixed: true },
                { id: 'description', sorting: 'none', fixed: true },
            ],
            offset: 0,
            limit: 10,
        },
    };

    #searchInput;

    render ({ congress, instance }, { parameters }) {
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
                    })}/>
                <div class="locations-list">
                    delete this
                    <SearchFilters
                        compact
                        value={parameters}
                        searchFields={[
                            'name',
                            'description',
                        ]}
                        onChange={parameters => this.setState({ parameters })}
                        locale={{
                            searchPlaceholders: locale.search.placeholders,
                            searchFields: locale.fields,
                        }}
                        inputRef={view => this.#searchInput = view} />
                    <OverviewList
                        compact
                        options={{ congress, instance }}
                        viewOptions={{ congress, instance }}
                        task="congresses/listLocations"
                        view="congresses/location"
                        updateView={['congresses/sigLocations', { congress, instance }]}
                        parameters={parameters}
                        fields={FIELDS}
                        onGetItemLink={id => `/kongresoj/${congress}/okazigoj/${instance}/lokoj/${id}`}
                        onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                        onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                        onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                        locale={locale.fields} />
                </div>
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
