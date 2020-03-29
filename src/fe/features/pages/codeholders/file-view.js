import { h, Component } from 'preact';
import { Button, LinearProgress } from '@cpsdqs/yamdl';
import DisplayError from '../../../components/error';
import { data as dataLocale, codeholders as locale } from '../../../locale';
import { base as apiHostBase } from 'akso:config';

/// Previews a file.
export default class FileView extends Component {
    state = {
        invalid: false,
        progress: 0,
        data: null,
        error: null,
    };

    getFileURL () {
        const { id, file } = this.props;
        return new URL(`/codeholders/${id}/files/${file}`, apiHostBase).toString();
    }

    load () {
        const { mime } = this.props;
        if (!MIME_TYPES[mime]) {
            this.setState({ invalid: true });
        }
        const fileURL = this.getFileURL();
        const typeSpec = MIME_TYPES[mime];

        this.setState({
            progress: NaN,
            data: null,
            error: null,
        });

        fetch(fileURL, {
            credentials: 'include',
        }).then(async res => {
            const reader = res.body.getReader();
            const len = +res.headers.get('content-length');

            this.setState({ progress: 0 });

            const chunks = [];
            let chunksLen = 0;
            while (true) { // eslint-disable-line no-constant-condition
                const { value, done } = await reader.read();
                if (done) break;
                chunks.push(value);
                chunksLen += value.length;

                this.setState({ progress: chunksLen / len });
            }

            this.setState({ progress: 1 });

            const blob = new Blob(chunks, { type: mime });
            const data = await typeSpec.prep(blob);
            this.setState({ data });
        }).catch(error => {
            this.setState({ error });
        });
    }

    componentDidMount () {
        this.load();
    }

    componentWillUnmount () {
        const type = this.props.mime;
        const typeSpec = MIME_TYPES[type];
        if (typeSpec && typeSpec.release && this.state.data) typeSpec.release(this.state.data);
    }

    render ({ name, mime }, { progress, data, error, invalid }) {
        if (invalid) return (
            <div class="file-view is-invalid">
                <Button href={this.getFileURL()} target="_blank" download={name}>
                    {locale.files.downloadToView}
                </Button>
            </div>
        );

        let contents = null;

        if (error) {
            contents = (
                <div class="file-view-error">
                    <DisplayError error={error} />
                    <Button onClick={() => this.load()}>
                        {dataLocale.retry}
                    </Button>
                </div>
            );
        } else if (data) {
            const Renderer = MIME_TYPES[mime].component;
            contents = <Renderer data={data} />;
        }

        return (
            <div class="file-view">
                <div class="file-view-loading">
                    <LinearProgress
                        indeterminate={!Number.isFinite(progress)}
                        progress={progress}
                        class={(data || error) ? 'hide-none' : ''} />
                </div>
                {contents ? (
                    <div class="file-contents" data-mime={mime}>
                        {contents}
                    </div>
                ) : null}
            </div>
        );
    }
}

const imageType = {
    prep: blob => URL.createObjectURL(blob),
    release: url => URL.revokeObjectURL(url),
    component ({ data }) {
        return <img src={data} />;
    },
};

const videoType = {
    prep: blob => URL.createObjectURL(blob),
    release: url => URL.revokeObjectURL(url),
    component ({ data }) {
        return <video src={data} controls />;
    },
};

const audioType = {
    prep: blob => URL.createObjectURL(blob),
    release: url => URL.revokeObjectURL(url),
    component ({ data }) {
        return <audio src={data} controls />;
    },
};

const MIME_TYPES = {
    'text/plain': {
        prep: blob => blob.text(),
        component ({ data }) {
            return <pre>{data}</pre>;
        },
    },
    'image/png': imageType,
    'image/jpeg': imageType,
    'image/svg+xml': imageType,
    'audio/mp3': audioType,
    'audio/mpeg': audioType,
    'video/mp4': videoType,
};
