import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Button } from '@cpsdqs/yamdl';
import ListIcon from '@material-ui/icons/List';
import TimelineIcon from '@material-ui/icons/Timeline';
import SearchFilters from '../../../../../components/search-filters';
import OverviewList from '../../../../../components/overview-list';
import DetailShell from '../../../../../components/detail-shell';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../../../components/list-url-coding';
import { congressPrograms as locale } from '../../../../../locale';
import ProgramTimeline from './timeline';
import { FIELDS } from './fields';
import { FILTERS } from './filters';
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
            filters: {},
            jsonFilter: {
                _disabled: true,
                filter: {},
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
        expanded: false,
        dateFrom: null,
        dateTo: null,
        tz: null,
        listView: false,
    };

    #searchInput;
    #currentQuery = '';

    decodeURLQuery () {
        if (!this.props.query) {
            this.setState({ listView: false });
        } else {
            this.setState({
                listView: true,
                parameters: applyDecoded(decodeURLQuery(this.props.query, FILTERS), this.state.parameters),
            });
        }
        this.#currentQuery = this.props.query;
    }

    encodeURLQuery () {
        const encoded = this.state.listView
            ? encodeURLQuery(this.state.parameters, FILTERS)
            : '';
        if (encoded === this.#currentQuery) return;
        this.#currentQuery = encoded;
        this.props.onQueryChange(encoded);
    }

    componentDidMount () {
        this.decodeURLQuery();
        if (this.#searchInput) this.#searchInput.focus(500);
    }

    componentDidUpdate (prevProps, prevState) {
        if (prevProps.query !== this.props.query && this.props.query !== this.#currentQuery) {
            this.decodeURLQuery();
        }
        if (prevState.parameters !== this.state.parameters
            || prevState.listView !== this.state.listView) {
            this.encodeURLQuery();
        }
    }


    render ({ congress, instance }, { parameters, dateFrom, dateTo, tz, listView, expanded }) {
        const contents = [];
        if (listView) {
            contents.push(
                <SearchFilters
                    value={parameters}
                    searchFields={[
                        'title',
                        'description',
                    ]}
                    filters={FILTERS}
                    onChange={parameters => this.setState({ parameters })}
                    locale={{
                        searchPlaceholders: locale.search.placeholders,
                        searchFields: locale.fields,
                        filters: locale.search.filters,
                    }}
                    expanded={expanded}
                    onExpandedChange={expanded => this.setState({ expanded })}
                    inputRef={view => this.#searchInput = view}
                    userData={{ tz }} />,
                <OverviewList
                    expanded={expanded}
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
