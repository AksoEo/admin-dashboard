import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../../../components/page';
import DetailView from '../../../../../components/detail';
import DetailShell from '../../../../../components/detail-shell';
import Meta from '../../../../meta';
import { connectPerms } from '../../../../../perms';
import { coreContext } from '../../../../../core/connection';
import { congressParticipants as locale } from '../../../../../locale';
import { FIELDS } from './fields';

export default connectPerms(class ParticipantsPage extends Page {
    state = {
        edit: null,
        org: null,
    };

    static contextType = coreContext;

    onEndEdit = () => {
        this.props.editing && this.props.editing.pop(true);
        this.setState({ edit: null });
    };

    #commitTask = null;
    onCommit = changedFields => {
        if (!this.props.editing || this.#commitTask) return;
        if (!changedFields.length) {
            // nothing changed, so we can just pop the editing state
            this.props.editing.pop(true);
            return;
        }

        this.#commitTask = this.context.createTask('congresses/updateParticipant', {
            id: this.getId(),
            _changedFields: changedFields,
        }, this.state.edit);
        this.#commitTask.on('success', this.onEndEdit);
        this.#commitTask.on('drop', () => this.#commitTask = null);
    };

    componentWillUnmount () {
        if (this.#commitTask) this.#commitTask.drop();
    }

    get congress () {
        return +this.props.matches[this.props.matches.length - 5][1];
    }
    get instance () {
        return +this.props.matches[this.props.matches.length - 3][1];
    }
    get id () {
        return this.props.match[1];
    }

    render ({ perms, editing }, { org, edit, currency }) {
        const { congress, instance, id } = this;

        const actions = [];

        if (perms.hasPerm(`congress_instances.participants.update.${org}`)) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
                action: () => this.props.push('redakti', true),
            });
        }

        if (perms.hasPerm(`congress_instances.participants.delete.${org}`)) {
            actions.push({
                label: locale.delete.menuItem,
                action: () => this.context.createTask('congresses/deleteParticipant', {
                    congress,
                    instance,
                    id,
                }),
                overflow: true,
            });
        }

        return (
            <div class="role-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />

                <DetailView
                    view="congresses/participant"
                    options={{
                        congress,
                        instance,
                        fields: Object.keys(FIELDS),
                    }}
                    id={id}
                    fields={FIELDS}
                    locale={locale}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    onDelete={() => this.props.pop()}
                    userData={{ congress, instance, currency }} />
                <DetailShell
                    /* this is kind of a hack to get the org field */
                    view="congresses/congress"
                    id={congress}
                    fields={{}}
                    locale={{}}
                    onData={data => data && this.setState({ org: data.org })} />
                <DetailShell
                    /* a hack to get the currency */
                    view="congresses/registrationForm"
                    options={{ congress, instance }}
                    id="irrelevant" // detail shell won't work without one
                    fields={{}}
                    locale={{}}
                    onData={data => data && this.setState({
                        currency: data.price ? data.price.currency : null,
                    })} />
            </div>
        );
    }
});
