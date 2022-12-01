import { h } from 'preact';
import { Button, LinearProgress } from 'yamdl';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import FileUploadIcon from '@material-ui/icons/Publish';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import pickFile from '../../../../components/pick-file';
import { connect } from '../../../../core/connection';
import { base } from 'akso:config';
import { magazineEditions as locale } from '../../../../locale';
import './files.less';

export const Files = connect(({ view }) => view)((data, core) => ({
    data,
    core,
}))(function Files ({
    data,
    core,
    icon,
    onUpload,
    onDelete,
    downloadURL,
    formats,
}) {
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
        pickFile(formats[format], files => {
            const file = files[0];
            if (!file) return;
            onUpload(core, format, file);
        });
    };

    const fullDownloadURL = f => new URL(downloadURL(f), base).toString();

    const deleteFile = format => () => onDelete(core, format);

    return (
        <div class="magazine-edition-files">
            {Object.keys(formats).map(f => (
                <EditionFileSlot
                    key={f}
                    icon={icon}
                    format={f}
                    downloads={fileSlots[f]?.downloads}
                    size={fileSlots[f]?.size}
                    downloadURL={fullDownloadURL(f)}
                    onUpload={uploadFile(f)}
                    onDelete={deleteFile(f)} />
            ))}
        </div>
    );
});

function EditionFileSlot ({
    icon,
    format,
    downloads,
    size,
    onUpload,
    downloadURL,
    onDelete,
}) {
    const exists = !!size;

    return (
        <div class={'edition-file-slot' + (exists ? ' file-exists' : '')}>
            <div class="file-info">
                <div class="file-icon">
                    {icon}
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
