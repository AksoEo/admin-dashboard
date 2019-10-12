import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Controlled as CodeMirror } from 'react-codemirror2';
import JSON5 from 'json5';
import { Dialog, Button } from '@cpsdqs/yamdl';
import HelpIcon from '@material-ui/icons/Help';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import locale from '../../locale';
import './json-editor.less';

// after the tab on the second line
// (see ./index.js for the default value)
const DEFAULT_CURSOR_POS = [1, 1];

/// JSON editor for advanced search filters.
///
/// # Props
/// - value/onChange: string value
/// - submitted: bool
/// - onSubmit: callback
export default class JSONEditor extends PureComponent {
    state = {
        helpOpen: false,
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
                className={'json-filter-editor' + (this.props.submitted ? ' submitted' : '')}
                onClick={e => e.stopPropagation()}>
                <Button
                    icon
                    class="json-editor-help-button"
                    onClick={() => this.setState({ helpOpen: true })}>
                    <HelpIcon />
                </Button>
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
                <Dialog
                    open={this.state.helpOpen}
                    backdrop
                    onClose={() => this.setState({ helpOpen: false })}
                    fullScreen={width => width < 500}
                    title={locale.listView.json.help.title}>
                    {locale.listView.json.help.content}
                </Dialog>
            </div>
        );
    }
}
