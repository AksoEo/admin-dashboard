import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Meta from '../../../../meta';
import Page from '../../../../../components/page';
import DetailShell from '../../../../../components/detail-shell';
import Detail from '../../../../../components/detail';
import { coreContext } from '../../../../../core/connection';
import { connectPerms } from '../../../../../perms';
import { congressPrograms as locale } from '../../../../../locale';
import { FIELDS } from './fields';
import TagManager from '../tag-manager';

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
                <TagManager
                    list="congresses/listProgramTags"
                    selected="congresses/listTagsOfProgram"
                    options={{ congress, instance, program: id }}
                    view="congresses/programTag"
                    viewOptions={{ congress, instance }}
                    taskOptions={{ congress, instance, program: id }}
                    addTask="congresses/createProgramTag"
                    updateTask="congresses/updateProgramTag"
                    deleteTask="congresses/removeProgramTag"
                    attachTask="congresses/addTagToProgram"
                    removeTask="congresses/removeTagFromProgram" />
                <Detail
                    view="congresses/program"
                    id={id}
                    options={{ congress, instance }}
                    editing={editing}
                    edit={this.state.edit}
                    onEditChange={edit => this.setState({ edit })}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    locale={locale}
                    onDelete={() => this.props.pop()}
                    userData={{ congress, instance }}
                    fields={FIELDS} />
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
