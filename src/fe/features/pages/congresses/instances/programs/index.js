import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Button } from '@cpsdqs/yamdl';
import ListIcon from '@material-ui/icons/List';
import TimelineIcon from '@material-ui/icons/Timeline';
import SearchFilters from '../../../../../components/search-filters';
import OverviewList from '../../../../../components/overview-list';
import DetailShell from '../../../../../components/detail-shell';
import { congressPrograms as locale } from '../../../../../locale';
import ProgramTimeline from './timeline';
import { FIELDS } from './fields';
import './index.less';

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
        dateFrom: null,
        dateTo: null,
        tz: null,
        listView: false,
    };

    #searchInput;

    render ({ congress, instance }, { parameters, dateFrom, dateTo, tz, listView }) {
        const contents = [];
        if (listView) {
            contents.push(
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
                    inputRef={view => this.#searchInput = view} />,
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
                    locale={locale.fields}
                    userData={{ congress, instance, tz }} />,
            );
        } else {
            contents.push(
                <ProgramTimeline
                    key="timeline"
                    congress={congress}
                    instance={instance}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    tz={tz} />
            );
        }

        return (
            <div class="congresses-instance-programs">
                <div class="switch-button-container">
                    <Button icon small onClick={() => this.setState({ listView: !listView })}>
                        {listView ? <TimelineIcon /> : <ListIcon />}
                    </Button>
                </div>
                {contents}
                <DetailShell
                    /* hack for getting some fields about the instance */
                    view="congresses/instance"
                    options={{ congress }}
                    id={instance}
                    fields={{}}
                    locale={{}}
                    onData={data => data && this.setState({
                        dateFrom: data.dateFrom,
                        dateTo: data.dateTo,
                        tz: data.tz,
                    })} />
            </div>
        );
    }
}
