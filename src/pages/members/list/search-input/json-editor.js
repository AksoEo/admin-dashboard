import React from 'react';
import PropTypes from 'prop-types';
import { Controlled as CodeMirror } from 'react-codemirror2';
import JSON5 from 'json5';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import './json-editor.less';

// see ../index.js for the default value
// after the tab on the second line
const DEFAULT_CURSOR_POS = [1, 1];

export default class JSONEditor extends React.PureComponent {
    static propTypes = {
        value: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        submitted: PropTypes.bool.isRequired,
        onSubmit: PropTypes.func.isRequired,
    };

    lastErrorLine = -1;
    lastWidget = null;
    editor = null;

    validateJSON = () => {
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
    };

    onKeyDown = (instance, e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            // submit on ⌃⏎ or ⌘⏎
            e.preventDefault();
            this.props.onSubmit();
        }
    };

    onEditorMount = editor => {
        this.editor = editor;
        this.validateJSON();
        editor.on('change', this.validateJSON);
        editor.doc.setCursor(...DEFAULT_CURSOR_POS);
        editor.on('keydown', this.onKeyDown);
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
