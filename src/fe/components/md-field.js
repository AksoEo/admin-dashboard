import Markdown from 'markdown-it';
import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import 'codemirror';
import { Controlled as RCodeMirror } from 'react-codemirror2';
import { layoutContext } from './dynamic-height-div';
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
export default class MarkdownTextField extends PureComponent {
    static contextType = layoutContext;

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

        if (!this.props.editing && this.#cachedHtml === null) this.updateCache();
    }

    render ({ value, editing, onChange, inline, disabled, rules, ...extra }) {
        void rules;

        let contents;
        if (editing) {
            contents = <RCodeMirror
                value={value}
                options={{
                    mode: 'text/markdown',
                    theme: 'akso',
                    lineNumbers: true,
                    indentWithTabs: true,
                    indentUnit: 4,
                    matchBrackets: true,
                    readOnly: disabled,
                }}
                onBeforeChange={(editor, data, value) => onChange(value)} />;
        } else {
            contents = <div
                class={'markdown-contents' + (inline ? ' is-inline' : '')}
                dangerouslySetInnerHTML={{ __html: this.#cachedHtml }} />;
        }

        extra.class = (extra.class || '') + ' markdown-text-field' + (editing ? ' editing' : '');

        return (
            <div {...extra}>
                {contents}
            </div>
        );
    }
}
