import React from 'react';
import PropTypes from 'prop-types';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import './json-editor.less';

export default class JSONEditor extends React.PureComponent {
    static propTypes = {
        value: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        submitted: PropTypes.bool.isRequired,
    };

    onEditorMount = editor => {
        let lastErrorLine = -1;
        let lastWidget;

        editor.on('change', () => {
            let error = null;
            try {
                JSON.parse(this.props.value);
            } catch (err) {
                const message = err.toString()
                    .replace(/^SyntaxError:\s*/, '')
                    .replace(/^JSON\.parse:\s*/, '');

                const position = { line: -1, column: -1 };
                let match = message.match(/line\s+(\d+)/, '');
                if (match) position.line = +match[1] - 1;
                match = message.match(/column\s+(\d+)/, '');
                if (match) position.column = +match[1] - 1;

                error = {
                    message,
                    position,
                };
            }

            if (lastErrorLine >= 0) {
                editor.doc.removeLineClass(lastErrorLine, 'background', 'json-error-line');
                lastErrorLine = -1;
            }
            if (lastWidget) {
                lastWidget.clear();
                lastWidget = null;
            }

            if (error) {
                lastErrorLine = error.position.line;
                if (lastErrorLine >= 0) {
                    editor.doc.addLineClass(lastErrorLine, 'background', 'json-error-line');

                    const node = document.createElement('div');
                    node.classList.add('json-error-message');
                    node.textContent = error.message;

                    lastWidget = editor.doc.addLineWidget(lastErrorLine, node);
                }
            }
        });
    };

    render () {
        return (
            <div className={'json-editor' + (this.props.submitted ? ' submitted' : '')}>
                <CodeMirror
                    value={this.props.value}
                    options={{
                        mode: 'application/json',
                        theme: 'akso',
                        lineNumbers: true,
                        indentWithTabs: true,
                        indentUnit: 4,
                        matchBrackets: true,
                        autoCloseBrackets: true,
                    }}
                    editorDidMount={this.onEditorMount}
                    onBeforeChange={(editor, data, value) => this.props.onChange(value)} />
            </div>
        );
    }
}
