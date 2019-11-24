import { h } from 'preact';
import { useState, useCallback, Fragment } from 'preact/compat';
import { Dialog, TextField, Button } from '@cpsdqs/yamdl';
import FileIcon from '@material-ui/icons/InsertDriveFile';
import config from '../../../../config.val';
import DataList from '../../../components/data-list';
import pickFile from '../../../components/pick-file';
import { IdUEACode } from '../../../components/data/uea-code';
import data from '../../../components/data';
import { codeholders as locale, mime as mimeLocale, data as dataLocale } from '../../../locale';
import { coreContext } from '../../../core/connection';

// TODO: use core API properly

const loadFiles = (core, id) => (offset, limit) => core
    .createTask('codeholders/listFiles', { id }, { offset, limit })
    .runOnceAndDrop();

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
                <h3 class="files-title">{locale.filesTitle}</h3>
                <Button onClick={uploadFile}>{locale.uploadFile}</Button>
            </header>
            <coreContext.Consumer>
                {core => <Fragment>
                    <DataList
                        class="files-list"
                        onLoad={loadFiles(core, id)}
                        updateView={['codeholders/codeholderSigFiles', { id }]}
                        itemHeight={76}
                        renderItem={item => (
                            <div class="member-file" data-id={item.id}>
                                <FileThumbnail id={item.id} mime={item.mime} />
                                <div class="file-meta">
                                    <div class="file-name">
                                        <span class="file-id">#{item.id}</span>
                                        {item.name}
                                    </div>
                                    <div class="file-desc">{item.description}</div>
                                    <div class="secondary-info">
                                        <span class="file-type">
                                            <Mime mime={item.mime} />
                                        </span>
                                        {' · '}
                                        <span class="file-size">
                                            <FileSize bytes={item.size} />
                                        </span>
                                        {' · '}
                                        <span class="file-added-by">
                                            {locale.fileAddedBy}
                                            <IdUEACode id={item.addedBy} />
                                        </span>
                                        {' · '}
                                        <span class="file-time">
                                            <data.timestamp.inlineRenderer value={item.time * 1000} />
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    class="download-button"
                                    href={new URL(`/codeholders/${id}/files/${item.id}`, config.base).toString()}
                                    target="_blank"
                                    rel="noopener">
                                    {locale.downloadFile}
                                </Button>
                            </div>
                        )}
                        onRemove={item => core
                            .createTask('codeholders/deleteFile', { id, file: item.id })
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
        if (file) setName(file.name);
    }, [file])();

    const contents = [];
    const actions = [];

    const canClose = !uploading;

    if (file) {
        contents.push(
            <FileThumbnail file={file} />,
            <TextField
                label={locale.fileName}
                maxLength={50}
                value={name}
                disabled={uploading}
                onChange={e => setName(e.target.value)} />,
            <TextField
                label={locale.fileDescription}
                maxLength={300}
                value={description}
                disabled={uploading}
                onChange={e => setDescription(e.target.value)} />
        );

        if (!uploading) {
            actions.push({
                label: locale.cancelUploadFile,
                action: onClose,
            }, {
                label: locale.uploadFile,
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
                title={locale.uploadThisFile}
                onClose={canClose && onClose}
                actions={actions}>
                {contents}
            </Dialog>
            <Dialog
                backdrop
                open={error}
                actions={[
                    {
                        label: locale.cancelUploadFile,
                        action: () => {
                            setError(null);
                            onClose();
                        },
                    },
                    {
                        label: locale.retryFileUpload,
                        action: () => setError(null),
                    },
                ]}>
                {locale.failedFileUpload}
            </Dialog>
        </Fragment>
    );
}

function FileThumbnail ({ file, id, mime }) {
    // TODO: this
    void id;
    void mime;
    // upload dialog preview
    if (file) return <div class="file-thumbnail">?<FileIcon /></div>;

    return <div class="file-thumbnail">?<FileIcon /></div>;
}

function Mime ({ mime }) {
    if (mimeLocale.exceptions[mime]) {
        return (
            <span class="mime-type is-special">
                {mimeLocale.exceptions[mime]}
            </span>
        );
    }

    const parts = mime.split('/');
    const type = parts[0];
    const subtype = parts[1];

    return (
        <span class="mime-type">
            <span class="mime-subtype">{subtype}</span>
            <span class="mime-ty">{mimeLocale.types[type]}</span>
        </span>
    );
}

function FileSize ({ bytes }) {
    let value = bytes;
    let suffix = '';
    for (const s of dataLocale.byteSizes) {
        suffix = Array.isArray(s) ? (value === 1 ? s[0] : s[1]) : s;
        if (value >= 1000) value = Math.floor(value / 10) / 100;
        else break;
    }
    // esperanto uses commas
    value = value.toString().replace('.', ',');

    return `${value} ${suffix}`;
}
