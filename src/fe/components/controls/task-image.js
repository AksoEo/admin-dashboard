import { h } from 'preact';
import { PureComponent, useState, useEffect } from 'preact/compat';
import { Button, CircularProgress, Menu } from 'yamdl';
import ResizeObserver from 'resize-observer-polyfill';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import EditIcon from '@material-ui/icons/Edit';
import { coreContext } from '../../core/connection';
import { data as locale } from '../../locale';
import pickFile from '../pick-file';
import Lightbox from '../lightbox';
import DialogSheet from '../tasks/dialog-sheet';
import TaskButton from './task-button';
import DisplayError from '../utils/error';
import { FileThumbnail, Mime, FileSize } from '../files';
import './task-image.less';

// TODO: add a crop dialog or something

/**
 * Renders an image.
 *
 * # Props
 * - `sizes`: available image sizes (sorted ascending!)
 * - `task`: the task that fetches the image. Should return a blob and take a `size` parameter.
 * - `options`: task options
 * - `editing`: bool - editing state
 * - `hash`: if not none, will re-fetch when this changes
 * - `onUpdate`: (Blob, core) => Promise<void, any>
 * - `contain`: bool - if true, image will use object-fit: contain instead of cover
 * - `lightbox`: bool - if true, will allow tapping to open a lightbox
 * - `placeholder`: VNode - placeholder to show if there is no image
 */
export default class TaskImage extends PureComponent {
    state = {
        loading: false,
        error: null,
        image: null,
        lightboxOpen: false,
        editMenuOpen: false,
        editMenuPosition: [0, 0],
        uploading: false,
        uploadingFile: null,
    };

    #size = null;
    #loadedSize = NaN;

    resizeObserver = new ResizeObserver(entries => this.#sizeDidUpdate(entries));

    #currentRef;
    #onNodeRef = node => {
        if (this.#currentRef) {
            this.resizeObserver.unobserve(this.#currentRef);
        }
        if (node) {
            this.resizeObserver.observe(node);
        }
        this.#currentRef = node;
    };

    static contextType = coreContext;

    load () {
        if (!this.#size) return;
        this.setState({ loading: true, image: null, error: null });

        const size = this.#size + 'px';
        const loadedSize = this.#size;

        this.context.createTask(this.props.task, this.props.options, {
            size,
        }).runOnceAndDrop().then(blob => {
            if (blob === null) {
                return null;
            } else {
                const url = URL.createObjectURL(blob);
                // before just passing it to the DOM, load it as an actual image.
                // I assume this causes some sort of caching to happen because if you do it this
                // way it doesn't take another second to appear after the <img> is mounted
                const img = new Image();
                img.src = url;
                return new Promise(resolve => {
                    img.onload = () => resolve(url);
                    // not sure how this would happen but it probably can
                    img.onerror = () => resolve(null);
                });
            }
        }).then(url => {
            if (loadedSize !== this.#size) {
                URL.revokeObjectURL(url);
                return;
            }
            this.#loadedSize = loadedSize;

            if (this.state.image) URL.revokeObjectURL(this.state.image);
            this.setState({
                loading: false,
            });

            this.setState({ image: url });
        }).catch(error => {
            console.error(error); // eslint-disable-line no-console
            this.setState({
                loading: false,
                imageSeqId: this.state.imageSeqId + 1,
                image: null,
                error,
            });
        });
    }

    componentDidMount () {
        this.load();

        this.createUpdateView();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.hash !== this.props.hash) {
            this.load();
        }
    }

    componentWillUnmount () {
        this.deleteUpdateView();
    }

    #updateView;
    createUpdateView () {
        if (this.#updateView) this.deleteUpdateView();
        if (this.props.updateView) {
            this.#updateView = this.context.createDataView(...this.props.updateView);
            this.#updateView.on('update', () => this.load());
        }
    }

    deleteUpdateView () {
        if (!this.#updateView) return;
        this.#updateView.drop();
    }

    #sizeDidUpdate = (entries) => {
        if (!entries.length) return;
        const entry = entries[0];
        const rect = entry.contentRect;

        const pixelWidth = window.devicePixelRatio * rect.width;

        let size = 0;
        for (const s of this.props.sizes) {
            size = s;
            if (s >= pixelWidth) {
                break;
            }
        }

        this.#size = size;
        if (this.#size !== this.#loadedSize) this.load();
    };

    #edit = (e) => {
        if (this.state.image && this.props.onDelete) {
            // image exists; show choice to upload or delete
            this.setState({
                editMenuOpen: true,
                editMenuPosition: [e.clientX, e.clientY],
            });
        } else {
            this.#doUpload();
        }
    };

    #doUpload = () => {
        pickFile('image/png, image/jpeg', files => {
            const file = files[0];
            if (!file) return;

            this.setState({
                uploading: true,
                uploadingFile: file,
            });
        });
    };

    #doDelete = () => {
        this.props.onDelete(this.context);
    };

    #lightbox = null;
    #onImageClick = (e) => {
        if (this.#lightbox) {
            this.#lightbox.setOpenFromImage(e.currentTarget);
            this.setState({ lightboxOpen: true });
        }
    };

    render ({
        sizes,
        task,
        options,
        hash,
        onUpdate,
        onDelete,
        editing,
        lightbox,
        contain,
        placeholder,
        updateView,
        ...extra
    }, { loading, image, imageSeqId }) {
        void sizes, task, options, hash, onUpdate, onDelete, updateView;

        extra.class = (extra.class || '') + ' task-image';
        if (contain) extra.class += ' p-contain';
        if (lightbox) extra.class += ' p-lightbox';

        return (
            <div {...extra} ref={this.#onNodeRef}>
                <CircularProgress class="image-loading-indicator" indeterminate={loading} />
                {image ? (
                    <img
                        class="inner-image"
                        key={'i' + imageSeqId}
                        onClick={this.#onImageClick}
                        src={image} />
                ) : !loading ? (
                    <div class="inner-image is-placeholder">
                        {placeholder}
                    </div>
                ) : null}

                {editing ? (
                    <Button
                        class="inner-edit-button"
                        fab
                        icon
                        onClick={this.#edit}>
                        {(image && this.props.onDelete) ? (
                            <EditIcon />
                        ) : (
                            <AddAPhotoIcon />
                        )}
                    </Button>
                ) : null}
                {editing ? (
                    <Menu
                        open={this.state.editMenuOpen}
                        onClose={() => this.setState({ editMenuOpen: false })}
                        position={this.state.editMenuPosition}
                        items={[
                            {
                                label: locale.taskImageUpload.menuItem,
                                action: this.#doUpload,
                            },
                            {
                                label: locale.taskImageUpload.delete,
                                action: this.#doDelete,
                            },
                        ]} />
                ) : null}
                {editing ? (
                    <UploadDialog
                        open={this.state.uploading}
                        file={this.state.uploadingFile}
                        onUpdate={this.props.onUpdate}
                        onDidUpdate={() => {
                            this.load();
                        }}
                        core={this.context}
                        onClose={() => this.setState({ uploading: false })} />
                ) : null}

                {lightbox ? (
                    <Lightbox
                        ref={view => this.#lightbox = view}
                        src={image}
                        open={this.state.lightboxOpen}
                        onClose={() => this.setState({ lightboxOpen: false })} />
                ) : null}
            </div>
        );
    }
}

function UploadDialog ({ open, onClose, file, onUpdate, onDidUpdate, core }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    // reset error when new file is selected
    useEffect(() => setError(null), [file]);

    const doUpload = async () => {
        setError(null);
        setUploading(true);

        try {
            await onUpdate(file, core);

            onDidUpdate();
            onClose();
        } catch (err) {
            console.error(err); // eslint-disable-line no-console
            setError(err);
        }

        setUploading(false);
    };

    return (
        <DialogSheet
            class="task-image-upload-dialog"
            backdrop
            title={locale.taskImageUpload.title}
            open={open}
            onClose={uploading ? null : onClose}>
            <UploaderContents file={file} upload={doUpload} error={error} />
        </DialogSheet>
    );
}

function UploaderContents ({ file, upload, error }) {
    if (!file) return null;

    return (
        <div class="upload-preview">
            <FilePreview class="image-preview" file={file} />
            <div class="image-details">
                <FileThumbnail file={file} />
                <div class="inner-details">
                    <div class="inner-file-type">
                        <Mime mime={file.type} />
                    </div>
                    <div class="inner-file-size">
                        <FileSize bytes={file.size || 0} />
                    </div>
                </div>
                <TaskButton
                    raised
                    run={upload}
                    class="upload-button">
                    {locale.taskImageUpload.button}
                </TaskButton>
            </div>
            {error && (
                <div class="error-container">
                    <DisplayError error={error} />
                </div>
            )}
        </div>
    );
}

function FilePreview ({ file, ...extra }) {
    const [blobUrl, setBlobUrl] = useState(null);

    useEffect(() => {
        const objUrl = URL.createObjectURL(file);
        setBlobUrl(objUrl);
        return (() => {
            URL.revokeObjectURL(objUrl);
        });
    }, [file]);

    if (!blobUrl) return null;
    return <img {...extra} src={blobUrl} />;
}
