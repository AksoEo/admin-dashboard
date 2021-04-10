import { h } from 'preact';
import { Button, LinearProgress } from '@cpsdqs/yamdl';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import FileUploadIcon from '@material-ui/icons/Publish';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import Page from '../../../../components/page';
import TaskImage from '../../../../components/task-image';
import DetailView from '../../../../components/detail';
import { DocumentIcon } from '../../../../components/icons';
import pickFile from '../../../../components/pick-file';
import Meta from '../../../meta';
import { connectPerms } from '../../../../perms';
import { connect, coreContext } from '../../../../core/connection';
import { magazineEditions as locale, magazineToc as tocLocale } from '../../../../locale';
import config from '../../../../../config.val';
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
        const actions = [];

        if (perms.hasPerm('')) {
            actions.push({
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.create.menuItem,
                action: () => this.context.createTask('magazines/createTocEntry', {
                    magazine: this.magazine,
                    edition: this.id,
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
                action: () => this.context.createTask('magazines/deleteEdition', {
                    magazine: this.magazine,
                    id: this.id,
                }),
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
                    options={{ magazine: this.magazine }}
                    id={this.id}
                    fields={FIELDS}
                    locale={locale}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    onDelete={() => this.props.pop()} />

                {!editing && (
                    <EditionFiles
                        magazine={this.magazine}
                        id={this.id} />
                )}

                {!editing && (
                    <div class="edition-toc-title">
                        {tocLocale.title}
                    </div>
                )}
                {!editing && (
                    <TocView
                        magazine={this.magazine}
                        edition={this.id}
                        query={this.props.query}
                        onQueryChange={this.props.onQueryChange} />
                )}
            </div>
        );
    }
});

const FILE_FORMATS = ['pdf', 'epub'];
const FORMAT_MIME = {
    pdf: 'application/pdf',
    epub: 'application/epub+zip',
};

const EditionFiles = connect(({ magazine, id }) => ['magazines/editionFiles', { magazine, id }])((data, core) => ({
    data,
    core,
}))(function EditionFiles ({ magazine, id, data, core }) {
    if (!data) return (
        <div class="magazine-edition-files is-loading">
            <LinearProgress class="inner-progress" indeterminate />
        </div>
    );
    const fileSlots = {};
    for (const item of data) {
        fileSlots[item.format] = item;
    }

    const uploadFile = format => () => {
        pickFile(FORMAT_MIME[format], files => {
            const file = files[0];
            if (!file) return;
            core.createTask('magazines/updateEditionFile', { magazine, id }, { format, file });
        });
    };

    const downloadURL = f => new URL(`/magazines/${magazine}/editions/${id}/files/${f}`, config.base).toString();

    const deleteFile = format => () => {
        core.createTask('magazines/deleteEditionFile', { magazine, id }, { format });
    };

    return (
        <div class="magazine-edition-files">
            {FILE_FORMATS.map(f => (
                <EditionFileSlot
                    key={f}
                    format={f}
                    downloads={fileSlots[f]?.downloads}
                    size={fileSlots[f]?.size}
                    downloadURL={downloadURL(f)}
                    onUpload={uploadFile(f)}
                    onDelete={deleteFile(f)} />
            ))}
        </div>
    );
});

function EditionFileSlot ({ format, downloads, size, onUpload, downloadURL, onDelete }) {
    const exists = !!size;

    return (
        <div class={'edition-file-slot' + (exists ? ' file-exists' : '')}>
            <div class="file-info">
                <div class="file-icon">
                    <DocumentIcon />
                </div>
                {exists ? (
                    <a
                        class="file-format is-download"
                        href={downloadURL}
                        rel="noopener noreferrer"
                        download={format}
                        target="_blank">
                        {format.toUpperCase()}
                        {' '}
                        <OpenInNewIcon className="external-icon" style={{ verticalAlign: 'middle' }} />
                    </a>
                ) : (
                    <span class="file-format">
                        {format.toUpperCase()}
                    </span>
                )}
                <div class="fi-spacer" />
                {exists ? (
                    <div class="file-actions">
                        <Button class="file-replace" icon small onClick={onUpload}>
                            <FileUploadIcon style={{ verticalAlign: 'middle' }} />
                        </Button>
                        {' '}
                        <Button class="file-delete" icon small onClick={onDelete}>
                            <DeleteForeverIcon style={{ verticalAlign: 'middle' }} />
                        </Button>
                    </div>
                ) : (
                    <div class="file-actions">
                        <Button class="upload-fab" fab onClick={onUpload}>
                            <FileUploadIcon style={{ verticalAlign: 'middle' }} />
                            {' '}
                            {locale.files.upload}
                        </Button>
                    </div>
                )}
            </div>
            {exists && (
                <div class="file-details">
                    <span class="file-downloads">
                        {locale.files.downloads(downloads)}
                    </span>
                </div>
            )}
        </div>
    );
}
