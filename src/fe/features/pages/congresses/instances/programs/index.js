import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import SearchFilters from '../../../../../components/search-filters';
import OverviewList from '../../../../../components/overview-list';
import { congressPrograms as locale } from '../../../../../locale';
import { FIELDS } from './fields';

/// Shows an overview over programs, with a map
///
/// # Props
/// - congress: congress id
/// - instance: instance id
/// - push: proxy for navigation API
export default class ProgramsView extends PureComponent {
    state = {
        parameters: {
            search: {
                field: 'title',
                query: '',
            },
            fields: [
                { id: 'title', sorting: 'none', fixed: true },
                { id: 'description', sorting: 'none', fixed: true },
                { id: 'timeFrom', sorting: 'asc', fixed: true },
                { id: 'location', sorting: 'none', fixed: true },
            ],
            offset: 0,
            limit: 10,
        },
    };

    #searchInput;

    render ({ congress, instance }, { parameters }) {
        return (
            <div class="congresses-instance-programs">
                <SearchFilters
                    value={parameters}
                    searchFields={[
                        'title',
                        'description',
                    ]}
                    onChange={parameters => this.setState({ parameters })}
                    locale={{
                        searchPlaceholders: locale.search.placeholders,
                        searchFields: locale.fields,
                    }}
                    inputRef={view => this.#searchInput = view} />
                <OverviewList
                    useDeepCmp options={{ congress, instance }}
                    viewOptions={{ congress, instance }}
                    task="congresses/listPrograms"
                    view="congresses/program"
                    updateView={['congresses/sigPrograms', { congress, instance }]}
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/kongresoj/${congress}/okazigoj/${instance}/programeroj/${id}`}
                    onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />
            </div>
        );
    }
}
