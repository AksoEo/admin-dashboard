import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import Page from '../../../../components/page';
import OverviewList from '../../../../components/overview-list';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../../components/list-url-coding';
import Meta from '../../../meta';
import { membershipEntries as locale } from '../../../../locale';
import { coreContext } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';
import { FIELDS } from './fields';

export default connectPerms(class RegistrationEntries extends Page {
    state = {
        parameters: {
            search: { query: '' },
            fields: [
                { id: 'timeSubmitted', sorting: 'desc', fixed: true },
                { id: 'codeholderData', sorting: 'none', fixed: true },
                { id: 'year', sorting: 'none', fixed: true },
                { id: 'status', sorting: 'none', fixed: true },
            ],
            offset: 0,
            limit: 10,
        },
    };

    static contextType = coreContext;

    #currentQuery = '';

    decodeURLQuery () {
        this.setState({
            parameters: applyDecoded(decodeURLQuery(this.props.query, {}), this.state.parameters),
        });
        this.#currentQuery = this.props.query;
    }

    encodeURLQuery () {
        const encoded = encodeURLQuery(this.state.parameters, {});
        if (encoded === this.#currentQuery) return;
        this.#currentQuery = encoded;
        this.props.onQueryChange(encoded);
    }

    componentDidMount () {
        this.decodeURLQuery();
    }

    componentDidUpdate (prevProps, prevState) {
        if (prevProps.query !== this.props.query && this.props.query !== this.#currentQuery) {
            this.decodeURLQuery();
        }
        if (prevState.parameters !== this.state.parameters) {
            this.encodeURLQuery();
        }
    }

    render ({ perms }, { parameters }) {
        const actions = [];
        if (perms.hasPerm('registration.entries.create')) {
            actions.push({
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.create.menuItem,
                action: () => this.context.createTask('memberships/createEntry', {}),
            });
        }

        return (
            <div class="registration-entries-page">
                <Meta
                    title={locale.title}
                    actions={actions} />
                <OverviewList
                    task="memberships/listEntries"
                    view="memberships/entry"
                    updateView={['memberships/sigEntries']}
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/membreco/alighoj/${id}`}
                    onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />
            </div>
        );
    }
});
