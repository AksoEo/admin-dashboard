import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import SearchFilters from '../../../../components/search-filters';
import OverviewList from '../../../../components/overview-list';
import { congressInstances as locale } from '../../../../locale';
import { FIELDS } from './fields';

/// Shows an overview over instances
///
/// # Props
/// - congress: congress id
export default class InstancesView extends PureComponent {
    state = {
        parameters: {
            search: {
                field: 'name',
                query: '',
            },
            fields: [
                { id: 'humanId', sorting: 'asc', fixed: true },
                { id: 'name', sorting: 'none', fixed: true },
                { id: 'dateFrom', sorting: 'none', fixed: true },
                { id: 'dateTo', sorting: 'none', fixed: true },
            ],
            offset: 0,
            limit: 10,
        },
    };

    #searchInput;

    render ({ congress }, { parameters }) {
        return (
            <div class="congresses-instances">
                <SearchFilters
                    value={parameters}
                    searchFields={[
                        'name',
                        'locationName',
                        'locationNameLocal',
                    ]}
                    onChange={parameters => this.setState({ parameters })}
                    locale={{
                        searchPlaceholders: locale.search.placeholders,
                        searchFields: locale.fields,
                    }}
                    inputRef={view => this.#searchInput = view} />
                <OverviewList
                    options={{ congress }}
                    viewOptions={{ congress }}
                    task="congresses/listInstances"
                    view="congresses/instance"
                    updateView={['congresses/sigInstances', { congress }]}
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/kongresoj/${congress}/okazigoj/${id}`}
                    onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />
            </div>
        );
    }
}
