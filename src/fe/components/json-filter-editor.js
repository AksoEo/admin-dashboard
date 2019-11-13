import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import CodeMirror from 'codemirror';
import { Controlled as RCodeMirror } from 'react-codemirror2';
import JSON5 from 'json5';
import { Dialog, Button } from '@cpsdqs/yamdl';
import HelpIcon from '@material-ui/icons/Help';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import { search as locale } from '../locale';
import './json-filter-editor.less';

const DEFAULT_VALUE = '{\n\ttest: \x91year\x91\n}'; // must be equal to {}
// after the tab on the second line
const DEFAULT_CURSOR_POS = [1, 1]; // FIXME: broken for some reason

const AKSO_REPR = 'org.akso.admin.v1';

const EXPR_DELIM = '\x91';

// TODO: use custom JSON highlighter instead so templates don’t break the rest of the highlighting
CodeMirror.defineMode('akso-json-template', () => ({
    token: stream => {
        if (stream.peek() === EXPR_DELIM) {
            // eat template
            stream.next();
            while (true) { // eslint-disable-line no-constant-condition
                const next = stream.next();
                if (next === EXPR_DELIM) break;
                if (!next) break;
            }
            return 'akso-template';
        } else {
            // eat garbage
            while (true) { // eslint-disable-line no-constant-condition
                if (stream.peek() === EXPR_DELIM) break;
                if (!stream.next()) break;
            }
            return null;
        }
    },
}));

/// JSON editor for advanced search filters.
///
/// # Props
/// - value/onChange: object value
/// - expanded: bool
/// - onCollapse: callback
export default class JSONFilterEditor extends PureComponent {
    state = {
        helpOpen: false,
    };

    /// Serializes the object value into a string value.
    loadStringValue () {
        const value = { ...this.props.value };
        delete value._disabled;
        let stringified = JSON5.stringify(value, undefined, 4);
        if (stringified === '{}') stringified = DEFAULT_VALUE;
        this.setState({ value: stringified });
    }

    toCMSource (value) {
        let source;
        if (!value.source || value.source.repr !== AKSO_REPR) {
            let stringified = JSON5.stringify(value.filter, undefined, 4);
            if (stringified === '{}') stringified = DEFAULT_VALUE;
            source = {
                repr: AKSO_REPR,
                fragments: [{
                    type: 'text',
                    value: stringified,
                }],
            };
        } else {
            source = value.source;
        }

        return source.fragments.map(token => {
            if (token.type === 'text') return token.value;
            else if (token.type === 'expr') return EXPR_DELIM + token.value + EXPR_DELIM;
        }).join('');
    }

    onChange (cmSource) {
        const source = cmSource.split(EXPR_DELIM).map((value, i) => ({
            type: i % 2 === 0 ? 'text' : 'expr',
            value,
        }));
        const jsonString = source.map(({ type, value }) => {
            if (type === 'text') return value;
            else if (type === 'expr') {
                // TODO: parse expr
                return '0';
            }
        }).join('');
        const filter = this.validateJSON(jsonString) || {};
        this.props.onChange({
            ...this.props.value,
            source: {
                repr: AKSO_REPR,
                fragments: source,
            },
            filter,
        });
    }

    lastErrorLine = -1;
    lastWidget = null;
    editor = null;

    validateJSON (value) {
        let error = null;
        let parsed;
        try {
            parsed = JSON5.parse(value);
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

        return parsed;
    }

    onKeyDown = (instance, e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            // submit on ⌃⏎ or ⌘⏎
            e.preventDefault();
            this.props.onCollapse();
        }
    };

    onEditorMount = editor => {
        this.editor = editor;
        editor.doc.setCursor(...DEFAULT_CURSOR_POS);
        editor.on('keydown', this.onKeyDown);
        editor.addOverlay('akso-json-template');

        // update template variables and detect errors by doing a round-trip
        this.onChange(this.toCMSource(this.props.value));
    };

    render () {
        const { value } = this.props;
        const cmSource = this.toCMSource(value);

        return (
            <div
                class={'json-filter-editor' + (this.props.expanded ? '' : ' collapsed')}
                onClick={e => e.stopPropagation()}>
                <Button
                    icon
                    class="json-editor-help-button"
                    onClick={() => this.setState({ helpOpen: true })}>
                    <HelpIcon />
                </Button>
                <RCodeMirror
                    value={cmSource}
                    options={{
                        mode: 'application/json',
                        theme: 'akso',
                        lineNumbers: true,
                        indentWithTabs: true,
                        indentUnit: 4,
                        matchBrackets: true,
                        // autoCloseBrackets: true, // glitchy for some reason
                    }}
                    editorDidMount={this.onEditorMount}
                    onBeforeChange={(editor, data, value) => this.onChange(value)} />
                <Dialog
                    open={this.state.helpOpen}
                    backdrop
                    onClose={() => this.setState({ helpOpen: false })}
                    fullScreen={width => width < 500}
                    title={locale.json.help.title}>
                    {locale.json.help.content}
                </Dialog>
            </div>
        );
    }
}
