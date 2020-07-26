import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Meta from '../../../../meta';
import Page from '../../../../../components/page';
import DetailShell from '../../../../../components/detail-shell';
import { coreContext } from '../../../../../core/connection';
import { connectPerms } from '../../../../../perms';
import { congressPrograms as locale } from '../../../../../locale';
import { FIELDS } from './fields';

export default connectPerms(class ProgramPage extends Page {
    state = {
        edit: null,
        org: 'meow', // nonsense default value
    };

    static contextType = coreContext;

    #commitTask = null;
    onCommit = changedFields => {
        if (!this.props.editing || this.#commitTask) return;
        if (!changedFields.length) {
            // nothing changed, so we can just pop the editing state
            this.props.editing.pop(true);
            return;
        }

        this.#commitTask = this.context.createTask('congresses/updateProgram', {
            congress: this.congress,
            instance: this.instance,
            id: this.id,
            _changedFields: changedFields,
        }, this.state.edit);
        this.#commitTask.on('success', this.onEndEdit);
        this.#commitTask.on('drop', () => this.#commitTask = null);
    };
    onEndEdit = () => {
        this.props.editing && this.props.editing.pop(true);
        this.setState({ edit: null });
    };

    get congress () {
        return +this.props.matches[this.props.matches.length - 5][1];
    }
    get instance () {
        return +this.props.matches[this.props.matches.length - 3][1];
    }
    get id () {
        return +this.props.match[1];
    }

    render ({ perms, push, editing }, { org }) {
        const { congress, instance, id } = this;

        const actions = [];

        if (perms.hasPerm(`congress_instances.update.${org}`)) {
            actions.push({
                label: locale.update.menuItem,
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                action: () => push('redakti', true),
            }, {
                label: locale.delete.menuItem,
                overflow: true,
                action: () => this.context.createTask('congresses/deleteProgram', {
                    congress, instance, id,
                }),
            });
        }

        return (
            <div class="congress-program-detail">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />
                <DetailShell
                    view="congresses/program"
                    id={id}
                    options={{ congress, instance }}
                    editing={editing}
                    edit={this.state.edit}
                    onEditChange={edit => this.setState({ edit })}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    locale={locale}
                    onDelete={() => this.props.pop()}>
                    {data => (
                        <DetailInner
                            congress={congress}
                            instance={instance}
                            id={id}
                            editing={editing}
                            onItemChange={edit => this.setState({ edit })}
                            item={this.state.edit || data}
                            org={org} />
                    )}
                </DetailShell>
                <DetailShell
                    /* this is kind of a hack to get the org field */
                    view="congresses/congress"
                    id={congress}
                    fields={{}}
                    locale={{}}
                    onData={data => data && this.setState({ org: data.org })} />
            </div>
        );
    }
});

function InnerField ({ field, item, editing, onItemChange }) {
    const Component = FIELDS[field].component;
    return <Component
        slot="detail"
        value={item[field]}
        editing={editing}
        onChange={v => onItemChange({ ...item, [field]: v })}
        item={item}
        onItemChange={onItemChange} />;
}

function DetailInner ({ congress, instance, id, item, editing, onItemChange }) {
    return 'meow';
}
