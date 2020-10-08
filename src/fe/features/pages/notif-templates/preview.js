import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { CircularProgress } from '@cpsdqs/yamdl';
import { coreContext } from '../../../core/connection';
import Meta from '../../meta';
import Page from '../../../components/page';
import DisplayError from '../../../components/error';
import Tabs from '../../../components/tabs';
import { notifTemplates as locale } from '../../../locale';
import './preview.less';

export default class NotifTemplatePreviewPage extends Page {
    state = {
        loading: false,
        data: null,
        error: null,
        tab: 'html',
    };

    get id () {
        return +this.props.matches[this.props.matches.length - 2][1];
    }

    static contextType = coreContext;

    load () {
        this.setState({ loading: true });
        this.context.createTask('notifTemplates/preview', {
            id: this.id,
        }).runOnceAndDrop().then(data => {
            this.setState({ loading: false, data });
        }).catch(error => {
            this.setState({ loading: false, error });
        });
    }

    componentDidMount () {
        this.load();
    }

    render (_, { tab, loading, data, error }) {
        return (
            <div class="notif-template-preview-page">
                <Meta
                    title={locale.preview.title} />
                {loading ? (
                    <div class="preview-loading">
                        <CircularProgress indeterminate />
                    </div>
                ) : error ? (
                    <div class="preview-error">
                        <DisplayError error={error} />
                    </div>
                ) : data ? (
                    <div class="preview-contents">
                        <Tabs
                            class="preview-tabs"
                            value={tab}
                            onChange={tab => this.setState({ tab })}
                            tabs={locale.preview.tabs} />
                        {tab === 'html' ? (
                            <HTMLPreviewRender html={data.html} />
                        ) : (
                            <TextPreviewRender text={data.text} />
                        )}
                    </div>
                ) : null}
            </div>
        );
    }
}

class HTMLPreviewRender extends PureComponent {
    render ({ html }) {
        return (
            <iframe
                class="html-preview"
                allow=""
                referrerpolicy="no-referrer"
                sandbox=""
                srcDoc={html} />
        );
    }
}

class TextPreviewRender extends PureComponent {
    render ({ text }) {
        return (
            <div class="text-preview">
                <pre class="text-contents">
                    {text}
                </pre>
            </div>
        );
    }
}
