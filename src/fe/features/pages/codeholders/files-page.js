import { h } from 'preact';
import { Fragment } from 'preact/compat';
import { Button } from '@cpsdqs/yamdl';
import AddIcon from '@material-ui/icons/Add';
import config from '../../../../config.val';
import Page from '../../../components/page';
import Meta from '../../meta';
import DataList from '../../../components/data-list';
import pickFile from '../../../components/pick-file';
import { IdUEACode } from '../../../components/data/uea-code';
import { timestamp } from '../../../components/data';
import { codeholders as locale } from '../../../locale';
import { coreContext } from '../../../core/connection';
import { connectPerms } from '../../../perms';
import { FileThumbnail, Mime, FileSize } from './files';
import './files-page.less';

export default connectPerms(class FilesPage extends Page {
    static contextType = coreContext;

    getId = () => +this.props.matches[this.props.matches.length - 2][1];

    uploadFile = () => pickFile('*/*', files => {
        const file = files[0];
        this.context.createTask('codeholders/uploadFile', { id: this.getId() }, {
            file,
            name: file.name,
            description: '',
        });
    });

    renderFile = file => {
        return (
            <div class="member-file">
                <FileThumbnail id={file.id} mime={file.mime} />
                <div class="file-details">
                    <div class="file-name">
                        <span class="file-id">#{file.id}</span>
                        {file.name}
                    </div>
                    <div class="file-description">{file.description}</div>
                    <div class="file-meta">
                        <span class="file-type">
                            <Mime mime={file.mime} />
                        </span>
                        {' · '}
                        <span class="file-size">
                            <FileSize bytes={file.size} />
                        </span>
                        {' · '}
                        <span class="file-added-by">
                            {locale.fileAddedBy}
                            <IdUEACode id={file.addedBy} />
                        </span>
                        {' · '}
                        <span class="file-time">
                            <timestamp.inlineRenderer value={file.time * 1000} />
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    onItemClick = file => {
        this.props.push('' + file.id);
    };

    render ({ perms }) {
        const id = this.getId();
        const canWriteFiles = perms.hasCodeholderField('files', 'w');

        const actions = [];
        if (canWriteFiles) {
            actions.push({
                icon: <AddIcon />,
                label: locale.uploadFile,
                action: this.uploadFile,
            });
        }

        return (
            <div class="member-files-page">
                <Meta
                    title={locale.filesTitle}
                    actions={actions} />
                <DataList
                    class="files-list"
                    updateView={['codeholders/codeholderSigFiles', { id }]}
                    onLoad={(offset, limit) =>
                        this.context.createTask('codeholders/listFiles', { id }, {
                            offset,
                            limit,
                        }).runOnceAndDrop()}
                    emptyLabel={locale.noFiles}
                    itemHeight={96}
                    renderItem={this.renderFile}
                    onItemClick={this.onItemClick}
                    onRemove={item => this.context
                        .createTask('codeholders/deleteFile', { id, file: item.id, _noGUI: true })
                        .runOnceAndDrop()} />
            </div>
        );
    }
});

/*
function Files ({ id, canUpload }) {
    const canReadFiles = perms.hasCodeholderField('files', 'r');

    return (
        <div class="member-files">
            <coreContext.Consumer>
                {core => <Fragment>
                    <header class="files-header">
                        <h3 class="files-title">{locale.filesTitle}</h3>
                        {canUpload ? <Button onClick={uploadFile(core)}>{locale.uploadFile}</Button> : null}
                    </header>
                    <DataList
                        class="files-list"
                        onLoad={(offset, limit) => core
                            .createTask('codeholders/listFiles', { id }, { offset, limit })
                            .runOnceAndDrop()}
                        updateView={['codeholders/codeholderSigFiles', { id }]}
                        useShowMore
                        emptyLabel={locale.noFiles}
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
                                            <timestamp.inlineRenderer value={item.time * 1000} />
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
                </Fragment>}
            </coreContext.Consumer>
        </div>
    );
}

*/
