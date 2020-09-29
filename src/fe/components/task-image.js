import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Button, CircularProgress } from '@cpsdqs/yamdl';
import ResizeObserver from 'resize-observer-polyfill';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import { coreContext } from '../core/connection';
import pickFile from './pick-file';
import Lightbox from './lightbox';
import './task-image.less';

// TODO: add a crop dialog or something

/// Renders an image.
///
/// # Props
/// - `sizes`: available image sizes (sorted ascending!)
/// - `task`: the task that fetches the image. Should return a blob and take a `size` parameter.
/// - `options`: task options
/// - `editing`: bool - editing state
/// - `hash`: if not none, will re-fetch when this changes
/// - `onUpdate`: (Blob, core) => Promise<void, any>
/// - `contain`: bool - if true, image will use object-fit: contain instead of cover
/// - `lightbox`: bool - if true, will allow tapping to open a lightbox
export default class TaskImage extends PureComponent {
    state = {
        loading: false,
        error: null,
        image: null,
        prevImage: null,
        imageSeqId: 0,
        lightboxOpen: false,
    }

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
        this.setState({ loading: true, error: null });

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
                imageSeqId: this.state.imageSeqId + 1,
                prevImage: this.state.image,
            });
            this.scheduleDeletePrevImage(this.state.imageSeqId);

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
    }

    componentDidUpdate (prevProps) {
        if (prevProps.hash !== this.props.hash) {
            this.load();
        }
    }

    #scheduledDeletePrevImage;
    scheduleDeletePrevImage (seqId) {
        clearTimeout(this.#scheduledDeletePrevImage);
        this.#scheduledDeletePrevImage = setTimeout(() => {
            if (this.state.imageSeqId === seqId) this.setState({ prevImage: null });
        }, 1000);
    }

    componentWillUnmount () {
        clearTimeout(this.#scheduledDeletePrevImage);
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

    #edit = () => {
        pickFile('image/png, image/jpeg', files => {
            const file = files[0];
            if (!file) return;
            this.props.onUpdate(file, this.context).then(() => {
                this.load();
            }).catch((err) => {
                console.error(err); // eslint-disable-line no-console
                // TODO: proper error handling
            });
        });
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
        editing,
        lightbox,
        contain,
        ...extra
    }, { loading, image, prevImage, imageSeqId }) {
        void sizes, task, options, hash, onUpdate;
        void prevImage;

        extra.class = (extra.class || '') + ' task-image';
        if (contain) extra.class += ' p-contain';
        if (lightbox) extra.class += ' p-lightbox';

        return (
            <div {...extra} ref={this.#onNodeRef}>
                <CircularProgress class="image-loading-indicator" indeterminate={loading} />
                {/* prevImage ? ( // this does not work properly so w/e
                    <img
                        class="inner-image is-prev-image"
                        key={'i' + (imageSeqId - 1)}
                        src={image} />
                ) : null */}
                {image ? (
                    <img
                        class="inner-image"
                        key={'i' + imageSeqId}
                        onClick={this.#onImageClick}
                        src={image} />
                ) : null}

                {editing ? (
                    <Button
                        class="inner-edit-button"
                        fab
                        icon
                        onClick={this.#edit}>
                        <AddAPhotoIcon />
                    </Button>
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

