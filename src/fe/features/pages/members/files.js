import { h } from 'preact';
import { useState, useCallback, Fragment } from 'preact/compat';
import { Dialog, TextField, Button } from '@cpsdqs/yamdl';
import config from '../../../../config.val';
import DataList from '../../../components/data-list';
import pickFile from '../../../components/pick-file';
import locale from '../../../locale';
import { coreContext } from '../../../core/connection';

// TODO: use core API properly

const loadFiles = (core, id) => async (offset, limit) => {
    const { items, total } = await core
        .createTask('codeholders/listFiles', { id }, { offset, limit })
        .runOnceAndDrop();
    return { items, totalItems: total };
};

export default function Files ({ id }) {
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);

    const uploadFile = () => pickFile('*/*', files => {
        const file = files[0];
        setFile(file);
        setUploading(true);
    });

    return (
        <div class="member-files">
            <header class="files-header">
                <h3 class="files-title">{locale.members.detail.filesTitle}</h3>
                <Button onClick={uploadFile}>{locale.members.detail.uploadFile}</Button>
            </header>
            <coreContext.Consumer>
                {core => <Fragment>
                    <DataList
                        class="member-files"
                        onLoad={loadFiles(core, id)}
                        renderItem={item => (
                            <div class="member-file" data-id={item.id}>
                                <div class="file-meta">
                                    <FileThumbnail id={item.id} mime={item.mime} />
                                    <div class="file-name">{item.name}</div>
                                    <div class="file-desc">{item.description}</div>
                                    <div class="file-type">{item.mime}</div>
                                    <div class="file-added-by">{item.addedBy}</div>
                                    <div class="file-time">{item.time}</div>
                                    <Button
                                        href={new URL(`/codeholders/${id}/files/${item.id}`, config.base).toString()}
                                        target="_blank"
                                        rel="noopener">
                                        {locale.members.detail.downloadFile}
                                    </Button>
                                </div>
                            </div>
                        )}
                        onRemove={item => core
                            .createTask('codeholders/deleteFile', { id }, { id: item.id })
                            .runOnceAndDrop()} />

                    <UploadDialog
                        id={id}
                        file={file}
                        open={uploading}
                        onClose={() => setUploading(false)}
                        core={core} />
                    </Fragment>}
            </coreContext.Consumer>
        </div>
    );
}

function UploadDialog ({ id, open, onClose, file, core }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    useCallback(() => {
        setName(file.name);
    }, [file]);

    const contents = [];
    const actions = [];

    const canClose = !uploading;

    if (file) {
        contents.push(
            <FileThumbnail file={file} />,
            <TextField
                label={locale.members.detail.fileName}
                maxLength={50}
                value={name}
                disabled={uploading}
                onChange={e => setName(e.target.value)} />,
            <TextField
                label={locale.members.detail.fileDescription}
                maxLength={300}
                value={description}
                disabled={uploading}
                onChange={e => setDescription(e.target.value)} />
        );

        if (!uploading) {
            actions.push({
                label: locale.members.detail.cancelUploadFile,
                action: onClose,
            }, {
                label: locale.members.detail.uploadFile,
                action: () => {
                    setUploading(true);

                    core.createTask('codeholders/uploadFile', { id }, {
                        name,
                        description,
                        file,
                    }).runOnceAndDrop().then(() => {
                        onClose();
                    }).catch(err => {
                        console.error(err); // eslint-disable-line no-console
                        setError(err);
                    }).then(() => setUploading(false));
                },
            });
        }
    }

    return (
        <Fragment>
            <Dialog
                backdrop
                open={open && !error}
                title={locale.members.detail.uploadThisFile}
                onClose={canClose && onClose}
                actions={actions}>
                {contents}
            </Dialog>
            <Dialog
                backdrop
                open={error}
                actions={[
                    {
                        label: locale.members.detail.cancelUploadFile,
                        action: () => {
                            setError(null);
                            onClose();
                        },
                    },
                    {
                        label: locale.members.detail.retryFileUpload,
                        action: () => setError(null),
                    },
                ]}>
                {locale.members.detail.failedFileUpload}
            </Dialog>
        </Fragment>
    );
}

function FileThumbnail ({ file, id, mime }) {
    // upload dialog preview
    if (file) return 'file preview goes here';

    return 'file thumbnail goes here';
}
