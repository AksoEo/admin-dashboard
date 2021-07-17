import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { CircularProgress } from '@cpsdqs/yamdl';
import { ChangeRequestIcon, ChangeRequestNewIcon } from '../../../components/icons';
import { codeholderChgReqs as locale } from '../../../locale';
import { coreContext } from '../../../core/connection';
import { LinkButton } from '../../../router';
import './button.less';

/// Shows codeholder change requests.
export default class ChangeRequestsButton extends PureComponent {
    state = {
        loading: false,
        preview: false,
        error: null,
        items: [],
        count: 0,
    };

    static contextType = coreContext;

    load () {
        this.setState({ loading: true, error: null });
        this.context.createTask('codeholders/changeRequests', {
            id: this.props.id,
        }, {
            offset: 0,
            limit: 10,
            jsonFilter: { filter: { status: 'pending' } },
        }).runOnceAndDrop().then(({ items, total }) => {
            this.setState({ items, count: total });
        }).catch(error => {
            this.setState({ error });
        }).then(() => {
            this.setState({ loading: false });
        });
    }

    componentDidMount () {
        this.load();
    }

    render ({ id }) {
        return (
            <div class="codeholder-change-requests-button-container">
                <LinkButton class="change-reqs-button" raised target={`/membroj/${id}/shanghopetoj`}>
                    <span class={'reqs-icon-container' + (this.state.loading ? ' is-loading' : '')}>
                        {this.state.count ? <ChangeRequestNewIcon class="req-icon" /> : <ChangeRequestIcon class="req-icon" />}
                        <CircularProgress class="reqs-loading" small indeterminate={this.state.loading} />
                    </span>
                    {locale.buttonLabel(this.state.count)}
                </LinkButton>
            </div>
        );
    }
}
