import Markdown from 'markdown-it';
import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Button } from '@cpsdqs/yamdl';
import 'codemirror';
import { Controlled as RCodeMirror } from 'react-codemirror2';
import { layoutContext } from './dynamic-height-div';
import { data as locale } from '../locale';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/markdown/markdown';
import './md-field.less';

/// Renders a markdown text field.
///
/// # Props
/// - value/onChange: string
/// - editing: bool
/// - rules: list of enabled rules
/// - inline: if true, will try to style it without line breaks
/// - singleLine: if true, will not allow line breaks
export default class MarkdownTextField extends PureComponent {
    static contextType = layoutContext;

    state = {
        preview: false,
    };

    #cachedHtml = null;

    updateCache () {
        const md = new Markdown('zero');
        md.enable('newline');
        if (this.props.rules) md.enable(this.props.rules);
        this.#cachedHtml = md.render(this.props.value || '');
        this.forceUpdate();
        this.context && this.context();
    }

    componentDidMount () {
        if (!this.props.editing) this.updateCache();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.value !== this.props.value) {
            this.#cachedHtml = null;
        }

        if ((!this.props.editing || this.state.preview) && this.#cachedHtml === null) {
            this.updateCache();
        }
        if (!this.props.editing && this.state.preview) this.setState({ preview: false });
    }

    onEditorMount = editor => {
        this.editor = editor;
    };

    render ({ value, editing, onChange, inline, disabled, rules, singleLine, ...extra }, { preview }) {
        void rules;

        let editorBar;

        if (editing) {
            editorBar = (
                <div class={'md-editor-bar' + (preview ? ' is-previewing' : '')}>
                    <Button
                        class="editor-preview-open-button"
                        disabled={preview}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            this.setState({ preview: true });
                        }}>
                        {locale.mdEditor.previewOn}
                    </Button>
                    <div class="editor-bar-preview-state">
                        <label class="editor-preview-title">
                            {locale.mdEditor.previewTitle}
                        </label>
                        <Button
                            disabled={!preview}
                            class="editor-preview-close-button"
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                this.setState({ preview: false }, () => {
                                    this.editor && this.editor.focus();
                                });
                            }}>
                            {locale.mdEditor.previewOff}
                        </Button>
                    </div>
                </div>
            );
        }

        let contents;
        if (editing && !preview) {
            contents = <RCodeMirror
                value={value}
                options={{
                    mode: 'text/markdown',
                    theme: 'akso',
                    lineNumbers: false,
                    indentWithTabs: true,
                    indentUnit: 4,
                    matchBrackets: true,
                    readOnly: disabled,
                    lineWrapping: true,
                }}
                editorDidMount={this.onEditorMount}
                onBeforeChange={(editor, data, value) => singleLine
                    ? onChange(value.replace(/\n/g, ''))
                    : onChange(value)} />;
        } else {
            contents = <div
                class={'markdown-contents' + (inline ? ' is-inline' : '') + (preview ? ' is-preview' : '')}
                dangerouslySetInnerHTML={{ __html: this.#cachedHtml }} />;
        }

        extra.class = (extra.class || '') + ' markdown-text-field' + (editing ? ' editing' : '');

        return (
            <div {...extra}>
                {editorBar}
                {contents}
            </div>
        );
    }
}
