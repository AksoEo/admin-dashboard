import { h } from 'preact';
import { lazy, Suspense, PureComponent } from 'preact/compat';
import CodeMirror from 'codemirror';
import { Controlled as RCodeMirror } from 'react-codemirror2';
import JSON5 from 'json5';
import { Dialog, Button } from 'yamdl';
import HelpIcon from '@material-ui/icons/Help';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import { search as locale } from '../../locale';
import './json-filter-editor.less';

const MdField = lazy(() => import('../controls/md-field'));

const DEFAULT_VALUE = '{\n\t\n}'; // must be equal to {}

// ID string used to identify our filter source format
// -- SOURCE FORMAT --
// source: { repr: AKSO_REPR, fragments: <fragments> }
// where <fragments> is an array of objects like { type: string, value: string }
// - type 'text': contains regular source text
// - type 'expr': contains a template expression
const AKSO_REPR = 'org.akso.admin.v1';
// delimiter we use in our CodeMirror source string to delimit templates
const EXPR_DELIM = '\x91';

// template expressions { [expression]: value }
const EXPRS = {
    currentYear: () => new Date().getFullYear().toString(),
    lastYear: () => (new Date().getFullYear() - 1).toString(),
    nextYear: () => (new Date().getFullYear() + 1).toString(),
    currentDate: () => "'" + new Date().toISOString().split('T')[0] + "'",
};

function evalExpr (expr) {
    if (expr in EXPRS) return EXPRS[expr]();
    return '0';
}

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
/// - disabled: disabled state
/// - suppressInitialRoundTrip: set to true to prevent onChange when initializing
/// - enableTemplates: bool - true to enable templating variables
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
        let source = cmSource.split(EXPR_DELIM).map((value, i) => ({
            type: i % 2 === 0 ? 'text' : 'expr',
            value,
        }));

        if (!this.props.enableTemplates) {
            // convert all templates to regular text if they're not enabled
            source = [{
                type: 'text',
                value: source.map(({ type, value }) => {
                    if (type === 'text') return value;
                    else if (type === 'expr') return evalExpr(value);
                }).join(''),
            }];
        }

        const jsonString = source.map(({ type, value }) => {
            if (type === 'text') return value;
            else if (type === 'expr') return evalExpr(value);
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

    onInsertExpr = (expr) => {
        this.editor.replaceSelection(EXPR_DELIM + expr + EXPR_DELIM);
    };

    lastErrorLine = -1;
    lastWidget = null;
    editor = null;
    templateMarkings = [];

    updateTemplateMarkings () {
        for (const marking of this.templateMarkings) marking.clear();
        this.templateMarkings = [];

        this.editor.doc.eachLine(line => {
            const lineNo = line.lineNo();

            let exprState = null;
            for (let i = 0; i < line.text.length; i++) {
                const ch = line.text[i];

                if (exprState) {
                    if (ch === EXPR_DELIM) {
                        exprState.end = { line: lineNo, ch: i + 1 };

                        const node = document.createElement('span');
                        if (EXPRS[exprState.text]) {
                            node.className = 'akso-json-marked-atom';
                            node.textContent = locale.json.exprs[exprState.text];
                        } else {
                            node.className = 'akso-json-marked-atom is-invalid';
                            node.textContent = `?${exprState.text}?`;
                        }

                        const marking = this.editor.doc.markText(
                            exprState.start,
                            exprState.end,
                            {
                                className: 'akso-json-marked-template',
                                replacedWith: node,
                            },
                        );
                        this.templateMarkings.push(marking);

                        exprState = null;
                    } else {
                        exprState.text += ch;
                    }
                    continue;
                }

                if (ch === EXPR_DELIM) {
                    exprState = { start: { line: lineNo, ch: i }, text: '' };
                }
            }
        });
    }

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
        editor.on('keydown', this.onKeyDown);
        editor.addOverlay('akso-json-template');
        this.updateTemplateMarkings();

        if (!this.props.suppressInitialRoundTrip) {
            // update template variables and detect errors by doing a round-trip
            this.onChange(this.toCMSource(this.props.value));
        }
    };

    render () {
        const { value, disabled, enableTemplates } = this.props;
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
                        readOnly: disabled,
                        // autoCloseBrackets: true, // glitchy for some reason
                    }}
                    editorDidMount={this.onEditorMount}
                    onBeforeChange={(editor, data, value) => this.onChange(value)}
                    onChange={() => {
                        this.updateTemplateMarkings();
                    }} />
                {enableTemplates && (
                    <div class="json-templates-container">
                        <JsonTemplates onInsert={this.onInsertExpr} />
                    </div>
                )}
                <Dialog
                    open={this.state.helpOpen}
                    onClose={() => this.setState({ helpOpen: false })}
                    fullScreen={width => width < 500}
                    title={locale.json.help.title}>
                    <Suspense fallback="…">
                        <MdField
                            rules={['link', 'list', 'image']}
                            value={locale.json.help.content} />
                    </Suspense>
                </Dialog>
            </div>
        );
    }
}

function JsonTemplates ({ onInsert }) {
    return (
        <div class="json-templates">
            <div class="inner-title">
                {locale.json.exprs.title}
            </div>
            <div class="inner-buttons">
                {Object.keys(EXPRS).map(id => (
                    <Button
                        key={id}
                        onClick={() => {
                            onInsert(id);
                        }}
                        class="expr-button">
                        {locale.json.exprs[id]}
                    </Button>
                ))}
            </div>
        </div>
    );
}
