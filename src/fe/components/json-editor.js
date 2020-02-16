import { h, Component } from 'preact';
import 'codemirror';
import { Controlled as RCodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import './json-filter-editor.less';

/// This editor edits a raw JSON serialized string.
///
/// # Props
/// - value/onChange: string value
/// - disabled: if true, will be read-only
export default class JSONEditor extends Component {
    lastErrorLine = -1;
    lastWidget = null;
    editor = null;

    validateJSON (value) {
        let error = null;
        try {
            JSON.parse(value);
        } catch (err) {
            const message = err.toString();
            const lineColGuess = message.match(/at\s+(\d+):(\d+)/)
                || message.match(/at\s+line\s+(\d+)\s+column\s+(\d+)/);

            error = {
                message,
                position: { line: 0, column: 0 },
            };

            if (lineColGuess) {
                error.position.line = +lineColGuess[1] - 1;
                error.position.column = +lineColGuess[2] - 1;
            }
        }

        if (this.lastErrorLine >= 0) {
            this.editor.doc.removeLineClass(this.lastErrorLine, 'background', 'json-error-line');
            this.lastErrorLine = -1;
        }
        if (this.lastWidget) {
            this.lastWidget.clear();
            this.lastWidget = null;
        }

        if (error) {
            this.lastErrorLine = error.position.line;
            if (this.lastErrorLine >= 0) {
                this.editor.doc.addLineClass(this.lastErrorLine, 'background', 'json-error-line');
            }

            const node = document.createElement('div');
            node.classList.add('json-error-message');
            node.textContent = error.message;

            const widgetLine = this.lastErrorLine === -1
                ? this.editor.doc.lastLine()
                : this.lastErrorLine;
            this.lastWidget = this.editor.doc.addLineWidget(widgetLine, node);
        }
    }

    onEditorMount = editor => {
        this.editor = editor;
    };

    onChange (jsonString) {
        this.validateJSON(jsonString);
        this.props.onChange(jsonString);
    }

    render ({ value, disabled }) {
        return (
            <div
                class="json-editor"
                onClick={e => e.stopPropagation()}>
                <RCodeMirror
                    value={value}
                    options={{
                        mode: 'application/json',
                        theme: 'akso',
                        lineNumbers: true,
                        indentWithTabs: true,
                        indentUnit: 4,
                        matchBrackets: true,
                        readOnly: disabled,
                        // autoCloseBrackets: true, // glitchy for some reason
                    }}
                    editorDidMount={this.onEditorMount}
                    onBeforeChange={(editor, data, value) => this.onChange(value)} />
            </div>
        );
    }
}
