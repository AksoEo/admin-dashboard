import Markdown from 'markdown-it';
import { h } from 'preact';
import { createPortal, createRef, PureComponent, useState } from 'preact/compat';
import { globalAnimator, Button, Dialog, TextField } from '@cpsdqs/yamdl';
import FormatBoldIcon from '@material-ui/icons/FormatBold';
import FormatItalicIcon from '@material-ui/icons/FormatItalic';
import FormatStrikethroughIcon from '@material-ui/icons/FormatStrikethrough';
import TitleIcon from '@material-ui/icons/Title';
import InsertLinkIcon from '@material-ui/icons/InsertLink';
import InsertPhotoIcon from '@material-ui/icons/InsertPhoto';
import CodeIcon from '@material-ui/icons/Code';
import TableChartIcon from '@material-ui/icons/TableChart';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
// import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import HelpIcon from '@material-ui/icons/Help';
import VisibilityIcon from '@material-ui/icons/Visibility';
import CloseIcon from '@material-ui/icons/Close';
import 'codemirror';
import { Controlled as RCodeMirror } from 'react-codemirror2';
import { layoutContext } from './dynamic-height-div';
import { data as locale } from '../locale';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/markdown/markdown';
import './md-field.less';

const portalContainer = document.createElement('div');
portalContainer.id = 'md-field-portal-container';
document.body.appendChild(portalContainer);

function orderPortalContainerFront () {
    document.body.removeChild(portalContainer);
    document.body.appendChild(portalContainer);
}

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
        focused: false,
        editorBarPopout: null,
        helpOpen: false,
    };

    #node = createRef();
    #cachedHtml = null;
    #document = { current: null };

    updateCache () {
        const md = new Markdown('zero');
        if (!this.props.singleLine) md.enable('newline');
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

    #onEditorMount = editor => {
        this.editor = editor;
        this.#document.current = this.editor.doc;
    };

    #onFocus = () => {
        this.setState({ focused: true });
        orderPortalContainerFront();
    };

    #onBlur = () => {
        this.setState({ focused: false });
    };

    #onEditorBarPopout = popout => {
        this.setState({ editorBarPopoutClosing: false, editorBarPopout: popout });
    };

    #closeEditorBarPopout = () => {
        if (this.state.editorBarPopoutClosing) return;
        this.setState({ editorBarPopoutClosing: true }, () => {
            setTimeout(() => {
                this.setState({ editorBarPopout: null });
                this.editor.focus();
            }, 300);
        });
    };

    #onContentsClick = e => {
        if (e.target instanceof HTMLAnchorElement) {
            e.preventDefault();
            // TODO: show dialog: 'do you really want to open this link?'
        }
    };

    render ({
        value, editing, onChange, inline, disabled, rules, singleLine, ...extra
    }, { focused, preview, editorBarPopout, helpOpen }) {
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

            let popoutBackdrop;
            let popout = null;
            const popoutClosing = this.state.editorBarPopoutClosing;
            if (editorBarPopout) {
                popoutBackdrop = (
                    <div
                        class={'editor-bar-request-backdrop' + (popoutClosing ? ' is-closing' : '')}
                        onClick={this.#closeEditorBarPopout} />
                );
                const Popout = editorBarPopout;
                popout = <Popout closing={popoutClosing} onClose={this.#closeEditorBarPopout} />;
            }

            editorBar = (
                <EditorBarPortal
                    owner={this.#node}
                    requestBackdrop={popoutBackdrop}
                    request={popout}>
                    <EditorBar
                        visible={focused || editorBarPopout}
                        rules={rules}
                        doc={this.#document}
                        onChange={onChange}
                        onPopout={this.#onEditorBarPopout}
                        onOpenHelp={() => {
                            this.setState({ helpOpen: true });
                            document.activeElement.blur();
                        }} />
                </EditorBarPortal>
            );
        }

        const rendered = (
            <div
                onClick={this.#onContentsClick}
                class={'markdown-contents' + (inline ? ' is-inline' : '')}
                dangerouslySetInnerHTML={{ __html: this.#cachedHtml }} />
        );

        let contents;
        if (editing) {
            contents = (
                <div class="md-editor-inner">
                    <InnerEditor
                        value={value}
                        onChange={onChange}
                        singleLine={singleLine}
                        disabled={disabled}
                        onMount={this.#onEditorMount}
                        onFocus={this.#onFocus}
                        onBlur={this.#onBlur} />

                    <div class={'preview-flourish' + (!preview ? ' is-hidden' : '')} />
                    <div class={'preview-container' + (!preview ? ' is-hidden' : '')}>
                        <div class="preview-mark">{locale.mdEditor.previewTitle}</div>
                        {rendered}
                    </div>

                    <Button
                        icon small class="preview-button"
                        title={preview
                            ? locale.mdEditor.previewOff
                            : locale.mdEditor.previewOn}
                        onClick={() => this.setState({ preview: !preview }, () => {
                            if (!this.state.preview) this.editor.focus();
                        })}>
                        {preview ? <CloseIcon /> : <VisibilityIcon />}
                    </Button>

                    <Dialog
                        class="markdown-text-field-help-dialog"
                        backdrop
                        container={portalContainer}
                        fullScreen={width => width < 900}
                        open={helpOpen}
                        onClose={() => this.setState({ helpOpen: false })}
                        title={locale.mdEditor.help.title}>
                        <AllHelp rules={singleLine ? rules : ['newline'].concat(rules)} />
                    </Dialog>
                </div>
            );
        } else {
            contents = rendered;
        }

        extra.class = (extra.class || '') + ' markdown-text-field'
            + (editing ? ' editing' : '')
            + (singleLine ? ' single-line' : '');

        return (
            <div {...extra} ref={this.#node}>
                {editorBar}
                {contents}
            </div>
        );
    }
}

class EditorBarPortal extends PureComponent {
    state = {
        posX: 0,
        posY: 0,
        width: 0,
    };

    #updates = 0;
    update () {
        if (!this.props.owner.current) return;
        const rect = this.props.owner.current.getBoundingClientRect();

        const posX = rect.left;
        const posY = rect.top;
        const width = rect.width;

        this.setState({ posX, posY, width });

        if (this.#updates > 12) {
            globalAnimator.deregister(this);
            this.#updates = 0;
        }
    }

    #onMutate = () => {
        globalAnimator.register(this);
        this.#updates = 0;
    }

    componentDidMount () {
        this.#onMutate();
        window.addEventListener('resize', this.#onMutate);
        window.addEventListener('pointermove', this.#onMutate);
        window.addEventListener('wheel', this.#onMutate);
        window.addEventListener('keydown', this.#onMutate);
        window.addEventListener('keyup', this.#onMutate);
    }
    componentWillUnmount () {
        globalAnimator.deregister(this);
        window.removeEventListener('resize', this.#onMutate);
        window.removeEventListener('pointermove', this.#onMutate);
        window.removeEventListener('wheel', this.#onMutate);
        window.removeEventListener('keydown', this.#onMutate);
        window.removeEventListener('keyup', this.#onMutate);
    }

    render ({ children, requestBackdrop, request }, { posX, posY, width }) {
        const transform = `translate(${posX}px, ${posY}px)`;

        return createPortal(
            <div class="markdown-text-field-editor-bar-container">
                <div class="editor-bar-container-inner" style={{ transform, width }}>
                    {children}
                </div>
                {requestBackdrop}
                {request ? (
                    <div class="editor-bar-request-container" style={{ transform, width }}>
                        {request}
                    </div>
                ) : null}
            </div>,
            portalContainer,
        );
    }
}

function InnerEditor ({ value, onChange, disabled, singleLine, onMount, onFocus, onBlur }) {
    return (
        <RCodeMirror
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
            editorDidMount={onMount}
            onFocus={onFocus}
            onBlur={onBlur}
            onBeforeChange={(editor, data, value) => singleLine
                ? onChange(value.replace(/\n/g, ''))
                : onChange(value)} />
    );
}

/// Applies a wrapping formatting tag, such as bold or italic.
/// - start: start tag
/// - end: end tag
/// - doc: document
function applyWrappingFormat (startTag, endTag, doc) {
    const selections = [];
    for (const { anchor, head } of doc.listSelections()) {
        let start = anchor;
        let end = head;
        if (head.line < anchor.line || head.ch < anchor.ch) {
            start = head;
            end = anchor;
        }

        const startMinus2 = { line: start.line, ch: start.ch - startTag.length };
        const endPlus2 = { line: end.line, ch: end.ch + endTag.length };

        const before = doc.getRange(startMinus2, start);
        const after = doc.getRange(end, endPlus2);
        if (before === startTag && after === endTag) {
            // remove emphasis
            doc.replaceRange('', end, endPlus2);
            doc.replaceRange('', startMinus2, start);
            selections.push({
                anchor: { line: start.line, ch: start.ch - startTag.length },
                head: { line: end.line, ch: end.ch - startTag.length },
            });
        } else {
            // add emphasis
            doc.replaceRange(endTag, end, end);
            doc.replaceRange(startTag, start, start);
            selections.push({
                anchor: { line: start.line, ch: start.ch + startTag.length },
                head: { line: end.line, ch: end.ch + startTag.length },
            });
        }
    }
    doc.setSelections(selections);
}

function applyHeadings (doc) {
    const { line: ln } = doc.getCursor();
    let line = doc.getLine(ln);
    const prefix = line.match(/^(#{1,6})(\s|$)/);

    const prevLen = prefix ? prefix[0].length : 0;
    let nextCount = 1;

    if (prefix) {
        const count = prefix[1].length;
        line = line.substr(count);
        nextCount = count + 1;
        if (nextCount > 6) nextCount = 0;
    }

    const newPrefix = nextCount
        ? '#'.repeat(nextCount) + (prefix ? prefix[2] : ' ')
        : '';

    doc.replaceRange(newPrefix, { line: ln, ch: 0 }, { line: ln, ch: prevLen });
}

const makeURLInputRequest = apply => function URLInputRequest ({ selection, onComplete }) {
    const [label, setLabel] = useState(selection);
    const [url, setUrl] = useState('');
    const complete = () => onComplete(apply(label, url));

    return (
        <div class="url-input-request">
            <TextField
                class="label-field"
                outline label={locale.mdEditor.urlLabel}
                value={label}
                onChange={e => setLabel(e.target.value)} />
            <TextField
                class="url-field"
                outline label={locale.mdEditor.url}
                placeholder={locale.mdEditor.urlPlaceholder}
                value={url}
                onChange={e => setUrl(e.target.value)} />
            <div class="req-footer">
                <Button outline class="insert-button" onClick={complete} disabled={!url}>
                    {locale.mdEditor.insertUrl}
                </Button>
            </div>
        </div>
    );
};

const FORMAT_BUTTONS = {
    title: {
        icon: <TitleIcon />,
        rule: 'heading',
        apply: doc => applyHeadings(doc),
    },
    bold: {
        icon: <FormatBoldIcon />,
        rule: 'emphasis',
        apply: doc => applyWrappingFormat('**', '**', doc),
    },
    italic: {
        icon: <FormatItalicIcon />,
        rule: 'emphasis',
        apply: doc => applyWrappingFormat('*', '*', doc),
    },
    strike: {
        icon: <FormatStrikethroughIcon />,
        rule: 'strikethrough',
        apply: doc => applyWrappingFormat('~~', '~~', doc),
    },
    link: {
        icon: <InsertLinkIcon />,
        rule: 'link',
        request: makeURLInputRequest((label, url) => doc => {
            doc.replaceSelection(`[${label}](${url})`);
        }),
    },
    image: {
        icon: <InsertPhotoIcon />,
        rule: 'image',
        request: makeURLInputRequest((label, url) => doc => {
            doc.replaceSelection(`![${label}](${url})`);
        }),
    },
    code: {
        icon: <CodeIcon />,
        rule: 'backticks',
        apply: doc => applyWrappingFormat('`', '`', doc),
    },
    table: {
        icon: <TableChartIcon />,
        rule: 'table',
        request: () => <HelpSection rule="table" />,
    },
    ul: {
        icon: <FormatListBulletedIcon />,
        rule: 'list',
        request: () => <HelpSection rule="list" />,
    },
    // since we don't actually use these buttons, we can omit this for now
    /* ol: {
        icon: <FormatListNumberedIcon />,
        rule: 'list',
        request: () => <HelpSection rule="list" />,
    }, */
};

function EditorBar ({ visible, rules, doc, onChange, onPopout, onOpenHelp }) {
    const buttons = [];

    const applyAction = apply => {
        // FIXME: this is very hacky, but mutating the document directly
        // causes react-codemirror2 to do very strange things
        const d = doc.current.copy();
        apply(d);
        onChange(d.getValue());
        requestAnimationFrame(() => {
            doc.current.setSelections(d.listSelections());
        });
    };

    for (const id in FORMAT_BUTTONS) {
        const btn = FORMAT_BUTTONS[id];
        if (!rules.includes(btn.rule)) continue;

        buttons.push(
            <Button
                class="format-button"
                title={locale.mdEditor.formatButtons[id]}
                // prevent focus stealing
                onTouchStart={e => e.preventDefault()}
                onMouseDown={e => e.preventDefault()}
                onClick={() => {
                    if (btn.request) {
                        const Request = btn.request;
                        onPopout(({ closing, onClose }) => (
                            <div class={'format-button-request-container'
                                + (closing ? ' is-closing' : '')}>
                                <div class="format-button-request">
                                    <Request
                                        selection={doc.current.getSelection()}
                                        onComplete={apply => {
                                            onClose();
                                            applyAction(apply);
                                        }} />
                                </div>
                            </div>
                        ));
                    } else applyAction(btn.apply);
                }}>
                {btn.icon}
            </Button>
        );
    }

    return (
        <div class={'markdown-text-field-editor-bar' + (visible ? ' is-visible' : '')}>
            <div class="editor-bar-contents">
                {buttons}
                <div class="editor-bar-spacer" />
                <Button
                    title={locale.mdEditor.help.title}
                    class="help-button"
                    // prevent focus stealing
                    onTouchStart={e => e.preventDefault()}
                    onMouseDown={e => e.preventDefault()}
                    onClick={onOpenHelp}>
                    <HelpIcon />
                </Button>
            </div>
        </div>
    );
}

/// Renders all help.
function AllHelp ({ rules }) {
    const sections = [];
    for (const rule in locale.mdEditor.help.rules) {
        if (rules.includes(rule)) sections.push(<HelpSection key={rule} rule={rule} />);
    }

    return (
        <div class="markdown-text-field-help">
            {sections}
        </div>
    );
}

const cachedHelpSections = {};
function HelpSection ({ rule }) {
    if (!cachedHelpSections[rule]) {
        const md = new Markdown();
        cachedHelpSections[rule] = md.render(locale.mdEditor.help.rules[rule]);
    }

    return (
        <div
            class="markdown-text-field-help-section"
            data-rule={rule}
            dangerouslySetInnerHTML={{ __html: cachedHelpSections[rule] }} />
    );
}
