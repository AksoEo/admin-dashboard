import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../components/page';
import DetailView from '../../../components/detail/detail';
import Meta from '../../meta';
import { connectPerms } from '../../../perms';
import { coreContext } from '../../../core/connection';
import { magazines as locale, magazineEditions as editionsLocale } from '../../../locale';
import { FIELDS } from './fields';
import EditionsView from './editions';

export default connectPerms(class Magazine extends Page {
    state = {
        edit: null,
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

        this.#commitTask = this.context.createTask('magazines/updateMagazine', {
            id: this.id,
            _changedFields: changedFields,
        }, this.state.edit);
        this.#commitTask.on('success', this.onEndEdit);
        this.#commitTask.on('drop', () => this.#commitTask = null);
    };

    componentWillUnmount () {
        if (this.#commitTask) this.#commitTask.drop();
    }

    get id () {
        return +this.props.match[1];
    }

    render ({ perms, editing }, { edit }) {
        const actions = [];

        if (perms.hasPerm('')) {
            actions.push({
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                label: editionsLocale.create.menuItem,
                action: () => this.context.createTask('magazines/createEdition', {
                    magazine: this.id,
                }),
            });
        }

        if (perms.hasPerm('')) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
                action: () => this.props.push('redakti', true),
            });
        }

        if (perms.hasPerm('')) {
            actions.push({
                label: locale.delete.menuItem,
                action: () => this.context.createTask('magazines/deleteMagazine', { id: this.id }),
                overflow: true,
            });
        }

        return (
            <div class="magazine-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />

                <DetailView
                    view="magazines/magazine"
                    id={this.id}
                    fields={FIELDS}
                    locale={locale}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    onDelete={() => this.props.pop()} />

                <EditionsView
                    magazine={this.id}
                    query={this.props.query}
                    onQueryChange={this.props.onQueryChange} />
            </div>
        );
    }
});
