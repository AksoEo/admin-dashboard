import { h } from 'preact';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../../components/page';
import TaskImage from '../../../../components/task-image';
import DetailView from '../../../../components/detail';
import { DocumentIcon } from '../../../../components/icons';
import Meta from '../../../meta';
import { connectPerms } from '../../../../perms';
import { coreContext } from '../../../../core/connection';
import { magazineEditions as locale, magazineToc as tocLocale } from '../../../../locale';
import { Files } from './files';
import { FIELDS } from './fields';
import TocView from './toc';
import './detail.less';

export default connectPerms(class MagazineEdition extends Page {
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

        this.#commitTask = this.context.createTask('magazines/updateEdition', {
            magazine: this.magazine,
            id: this.id,
            _changedFields: changedFields,
        }, this.state.edit);
        this.#commitTask.on('success', this.onEndEdit);
        this.#commitTask.on('drop', () => this.#commitTask = null);
    };

    componentWillUnmount () {
        if (this.#commitTask) this.#commitTask.drop();
    }

    get magazine () {
        return +this.props.matches.magazine[1];
    }

    get id () {
        return +this.props.match[1];
    }

    render ({ perms, editing }, { edit }) {
        const { magazine, id } = this;

        const actions = [];

        if (perms.hasPerm('')) {
            actions.push({
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.create.menuItem,
                action: () => this.context.createTask('magazines/createTocEntry', {
                    magazine,
                    edition: id,
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
                action: () => this.context.createTask('magazines/deleteEdition', { magazine, id }),
                overflow: true,
            });
        }

        return (
            <div class="magazine-edition-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />

                <TaskImage
                    editing={editing}
                    class="edition-thumbnail"
                    contain lightbox
                    sizes={[32, 64, 128, 256, 512, 1024]}
                    task="magazines/editionThumbnail"
                    options={{ magazine: this.magazine, id: this.id }}
                    onUpdate={(thumbnail, core) => {
                        const task = core.createTask('magazines/updateEditionThumbnail', {
                            magazine: this.magazine,
                            id: this.id,
                        }, {
                            thumbnail,
                        });
                        return task.runOnceAndDrop();
                    }} />

                <DetailView
                    view="magazines/edition"
                    options={{ magazine }}
                    id={id}
                    fields={FIELDS}
                    locale={locale}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    onDelete={() => this.props.pop()} />

                {!editing && (
                    <Files
                        formats={{
                            pdf: 'application/pdf',
                            epub: 'application/epub+zip',
                        }}
                        icon={<DocumentIcon />}
                        view={['magazines/editionFiles', { magazine, id }]}
                        onUpload={(core, format, file) => {
                            core.createTask('magazines/updateEditionFile', { magazine, id }, { format, file });
                        }}
                        onDelete={(core, format) => {
                            core.createTask('magazines/deleteEditionFile', { magazine, id }, { format });
                        }}
                        downloadURL={f => `/magazines/${magazine}/editions/${id}/files/${f}`} />
                )}

                {!editing && (
                    <div class="edition-toc-title">
                        {tocLocale.title}
                    </div>
                )}
                {!editing && (
                    <TocView
                        magazine={magazine}
                        edition={id}
                        query={this.props.query}
                        onQueryChange={this.props.onQueryChange} />
                )}
            </div>
        );
    }
});

