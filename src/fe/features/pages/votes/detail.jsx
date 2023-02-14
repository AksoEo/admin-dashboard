import { h } from 'preact';
import { CircularProgress } from 'yamdl';
import EditIcon from '@material-ui/icons/Edit';
import DetailView from '../../../components/detail/detail';
import Page from '../../../components/page';
import OrgIcon from '../../../components/org-icon';
import Meta from '../../meta';
import { coreContext } from '../../../core/connection';
import { useDataView } from '../../../core';
import { connectPerms } from '../../../perms';
import { LinkButton } from '../../../router';
import { votes as locale } from '../../../locale';
import {
    voterCodeholders,
    voterCodeholdersMemberFilter,
    viewerCodeholders,
    viewerCodeholdersMemberFilter,
    type,
    config,
} from './config';
import FIELDS from './fields';
import './detail.less';
import DisplayError from '../../../components/utils/error';

const DETAIL_FIELDS = {
    ...FIELDS,
    type: { component: type },
    config: { component: config },
    voterCodeholders: { component: voterCodeholders },
    voterCodeholdersMemberFilter: { component: voterCodeholdersMemberFilter, shouldHide: (_, editing) => editing },
    viewerCodeholders: { component: viewerCodeholders },
    viewerCodeholdersMemberFilter: {
        component: viewerCodeholdersMemberFilter,
        shouldHide: (item, editing) => editing || item.viewerCodeholders === 'null',
    },
};

export default connectPerms(class VoteDetailPage extends Page {
    static contextType = coreContext;

    state = {
        edit: null,
        org: null,
        hasEnded: null,
    };

    onEndEdit = () => {
        this.props.editing && this.props.editing.pop(true);
        this.setState({ edit: null });
    };

    #commitTask = null;
    onCommit = changedFields => {
        if (!this.props.editing || this.#commitTask) return Promise.resolve();
        if (!changedFields.length) {
            // nothing changed, so we can just pop the editing state
            this.props.editing.pop(true);
            return Promise.resolve();
        }

        return new Promise(resolve => {
            this.#commitTask = this.context.createTask('votes/update', {
                id: this.props.match[1],
                _changedFields: changedFields,
            }, this.state.edit);
            this.#commitTask.on('success', this.onEndEdit);
            this.#commitTask.on('drop', () => {
                this.#commitTask = null;
                resolve();
            });
        });
    };

    componentWillUnmount () {
        if (this.#commitTask) this.#commitTask.drop();
    }

    /** Mildly hacky function for getting the org so we can check for perms */
    setOrg (org) {
        if (this.state.org !== org) this.setState({ org });
    }
    // ditto
    setEnded (hasEnded) {
        if (this.state.hasEnded !== hasEnded) this.setState({ hasEnded });
    }

    render ({ match, perms, editing }, { edit, org, hasEnded }) {
        const id = match[1];

        const actions = [];

        if (perms.hasPerm(`votes.delete.${org}`)) {
            actions.push({
                label: locale.delete.menuItem,
                action: () => this.context.createTask('votes/delete', { id }),
                overflow: true,
            });
        }

        if (perms.hasPerm(`votes.update.${org}`) && !hasEnded) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update,
                action: () => this.props.push('redakti', true),
            });
        }

        return (
            <div class="vote-detail-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />

                <DetailView
                    view="votes/vote"
                    id={id}
                    options={{
                        fields: Object.keys(DETAIL_FIELDS),
                    }}
                    header={Header}
                    fields={DETAIL_FIELDS}
                    locale={locale}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    onDelete={() => this.props.pop()}
                    userData={{ owner: this }} />
            </div>
        );
    }
});

function Header ({ item, editing, userData }) {
    if (editing) return null;
    const { owner } = userData;
    owner.setOrg(item.org);
    if (item) owner.setEnded(item.state.hasEnded);

    return (
        <div class="vote-header">
            <h1>
                <span class="vote-org-icon">
                    <OrgIcon org={item.org} />
                </span>
                {item.name}
            </h1>
            <div class="vote-header-items">
                <VoteStats id={item.id} />
                {item && item.state.hasResults ? (
                    <LinkButton raised target={`/vochdonoj/${item.id}/rezultoj`}>
                        {locale.results.link}
                    </LinkButton>
                ) : null}
            </div>
        </div>
    );
}

function VoteStats ({ id }) {
    const [loading, error, data] = useDataView('votes/stats', { id });

    if (loading) {
        return (
            <CircularProgress small indeterminate />
        );
    }

    if (error) {
        return (
            <DisplayError error={error} />
        );
    }

    if (!data) return null;

    return (
        <div class="vote-stats">
            {data.numBallots ? (
                locale.stats.ballots(
                    data.numBallots,
                    data.numVoters,
                    (data.numBallots / data.numVoters * 100).toFixed(1),
                )
            ) : (
                locale.stats.eligible(data.numVoters)
            )}
        </div>
    );
}
