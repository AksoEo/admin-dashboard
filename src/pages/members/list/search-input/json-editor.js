import React from 'react';
import PropTypes from 'prop-types';
import { Controlled as CodeMirror } from 'react-codemirror2';
import JSON5 from 'json5';
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
                JSON5.parse(this.props.value);
            } catch (err) {
                const message = err.toString()
                    .replace();

                error = {
                    message,
                    position: {
                        line: err.lineNumber - 1,
                        column: err.columnNumber - 1,
                    },
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
                }

                const node = document.createElement('div');
                node.classList.add('json-error-message');
                node.textContent = error.message;

                const widgetLine = lastErrorLine === -1 ? editor.doc.lastLine() : lastErrorLine;
                lastWidget = editor.doc.addLineWidget(widgetLine, node);
            }
        });
    };

    render () {
        return (
            <div
                className={'json-editor' + (this.props.submitted ? ' submitted' : '')}
                onClick={e => e.stopPropagation()}>
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
