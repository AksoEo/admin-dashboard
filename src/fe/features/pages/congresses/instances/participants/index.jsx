import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Button } from 'yamdl';
import TableIcon from '@material-ui/icons/TableChart';
import SearchFilters from '../../../../../components/overview/search-filters';
import OverviewList from '../../../../../components/lists/overview-list';
import DetailShell from '../../../../../components/detail/detail-shell';
import { congressParticipants as locale } from '../../../../../locale';
import { FIELDS } from './fields';
import { FILTERS } from './filters';
import './index.less';
import SendNotifTemplate from '../../../notif-templates/send';
import SpreadsheetDialog from './spreadsheet-view';

function formSearchableFields (regFormItems) {
    return regFormItems.filter(item => item.el === 'input' && item.type === 'text').map(item => ({
        id: `data.${item.name}`,
        label: item.label,
    }));
}

export default class ParticipantsView extends PureComponent {
    state = {
        parameters: {
            search: {
                field: 'notes',
                query: '',
            },
            filters: {
                canceled: { enabled: true, value: 'false' },
            },
            jsonFilter: {
                _disabled: true,
                filter: {},
            },
            fields: [
                { id: 'sequenceId', sorting: 'desc', fixed: true },
                { id: 'createdTime', sorting: 'desc', fixed: true },
                { id: 'identity', sorting: 'none', fixed: true },
                { id: 'isValid', sorting: 'none', fixed: true },
                { id: 'approved', sorting: 'none', fixed: true },
                { id: 'price', sorting: 'none', fixed: true },
                { id: 'paid', sorting: 'none', fixed: true },
            ],
            offset: 0,
            limit: 10,
        },
        expanded: false,

        currency: null,
        registrationForm: null,
        hasRegistrationForm: true,
    };

    #searchInput;

    componentDidMount () {
        if (this.#searchInput) this.#searchInput.focus(500);
    }

    render ({
        org, congress, instance, push, sendingNotif, onStopSendingNotif,
        spreadsheetOpen,
    }, {
        parameters, expanded, currency, registrationForm, hasRegistrationForm,
    }) {
        // TODO: hide this page if the user does not have permission?
        return (
            <div class="participants-view">
                {hasRegistrationForm && registrationForm ? (
                    <div class="participants-view-contents">
                        <div class="participants-table-view-link">
                            <Button icon small onClick={() => push('alighintoj/tabelo')}>
                                <TableIcon />
                            </Button>
                        </div>
                        <SearchFilters
                            value={parameters}
                            searchFields={[
                                'notes',
                                ...formSearchableFields(registrationForm),
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
                            userData={{ congress, instance, currency, registrationForm }}
                            category="congresses/x/instances/x/participants"
                            filtersToAPI="congresses/participantFiltersToAPI" />
                        <OverviewList
                            expanded={expanded}
                            useDeepCmp options={{ congress, instance }}
                            viewOptions={{ congress, instance }}
                            task="congresses/listParticipants"
                            view="congresses/participant"
                            updateView={['congresses/sigParticipants', { congress, instance }]}
                            parameters={parameters}
                            fields={FIELDS}
                            onGetItemLink={id => `/kongresoj/${congress}/okazigoj/${instance}/alighintoj/${id}`}
                            onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                            onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                            onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                            locale={locale.fields}
                            userData={{ congress, instance, currency }} />
                    </div>
                ) : !hasRegistrationForm ? (
                    <div class="no-registration-form">
                        {locale.noParticipation}
                    </div>
                ) : (
                    <DetailShell
                        /* a hack to get the currency */
                        view="congresses/registrationForm"
                        options={{ congress, instance }}
                        id="irrelevant" // detail shell won't work without one
                        fields={{}}
                        locale={{}}
                        onData={data => data ? this.setState({
                            registrationForm: data.form,
                            currency: data.price ? data.price.currency : null,
                        }) : this.setState({
                            hasRegistrationForm: false,
                        })} />
                )}
                <SendNotifTemplate
                    task="congresses/sendParticipantsNotifTemplate"
                    jsonFilter={{
                        org,
                        intent: { $in: ['congress'] },
                    }}
                    options={{
                        congress,
                        instance,
                        ...parameters,
                    }}
                    open={sendingNotif}
                    onClose={onStopSendingNotif} />

                <SpreadsheetDialog
                    open={!!spreadsheetOpen}
                    onClose={() => spreadsheetOpen?.pop()}
                    congress={congress}
                    instance={instance}
                    listParameters={parameters} />
            </div>
        );
    }
}
