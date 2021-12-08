import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import Page from '../../../../components/page';
import OverviewList from '../../../../components/lists/overview-list';
import CSVExport from '../../../../components/tasks/csv-export';
import { decodeURLQuery, applyDecoded, encodeURLQuery } from '../../../../components/overview/list-url-coding';
import Meta from '../../../meta';
import { membershipCategories as locale, search as searchLocale } from '../../../../locale';
import { coreContext } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';
import { FIELDS } from './fields';

export default connectPerms(class MembershipCategories extends Page {
    state = {
        parameters: {
            search: { query: '' },
            fields: [
                { id: 'nameAbbrev', sorting: 'none', fixed: true },
                { id: 'name', sorting: 'asc', fixed: true },
                { id: 'description', sorting: 'none', fixed: true },
            ],
            offset: 0,
            limit: 10,
        },
        csvExportOpen: false,
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
        if (perms.hasPerm('membership_categories.create')) {
            actions.push({
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.create.menuItem,
                action: () => this.context.createTask('memberships/createCategory', {}),
            });
        }

        actions.push({
            label: searchLocale.csvExport,
            action: () => this.setState({ csvExportOpen: true }),
            overflow: true,
        });

        return (
            <div class="membership-categories-page">
                <Meta
                    title={locale.title}
                    actions={actions} />
                <OverviewList
                    task="memberships/listCategories"
                    view="memberships/category"
                    updateView={['memberships/sigCategories']}
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/membreco/kategorioj/${id}`}
                    onSetFields={fields => this.setState({ parameters: { ...parameters, fields }})}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />

                <CSVExport
                    open={this.state.csvExportOpen}
                    onClose={() => this.setState({ csvExportOpen: false })}
                    task="memberships/listCategories"
                    detailView="memberships/category"
                    parameters={parameters}
                    fields={FIELDS}
                    detailViewOptions={id => ({ id, noFetch: true })}
                    locale={{ fields: locale.fields }}
                    filenamePrefix={locale.csvFilename} />
            </div>
        );
    }
});
