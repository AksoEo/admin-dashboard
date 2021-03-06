import { h } from 'preact';
import { lazy, Suspense, useState } from 'preact/compat';
import { Button, CircularProgress } from '@cpsdqs/yamdl';
import VisibilityIcon from '@material-ui/icons/Visibility';
import EditIcon from '@material-ui/icons/Edit';
import SendIcon from '@material-ui/icons/Send';
import CopyIcon from '../../../components/copy-icon';
import Page from '../../../components/page';
import DynamicHeightDiv from '../../../components/dynamic-height-div';
import DetailShell from '../../../components/detail-shell';
import Meta from '../../meta';
import { connectPerms } from '../../../perms';
import { LinkButton } from '../../../router';
import { coreContext } from '../../../core/connection';
import { notifTemplates as locale } from '../../../locale';
import { FIELDS } from './fields';
import { getFormVarsForIntent } from './intents';
import TemplatingPopup, { TemplatingContext } from './templating-popup';
import './detail.less';

let cachedAKSOScriptEditor = null;
const AKSOScriptEditor = () => {
    if (!cachedAKSOScriptEditor) {
        cachedAKSOScriptEditor = import('@tejo/akso-script-editor').then(r => r.default);
    }
    return cachedAKSOScriptEditor;
};
const DefsPreview = lazy(async () => ({
    default: (await import('../../../components/form-editor/script-views')).DefsPreview,
}));

export default connectPerms(class NotifTemplate extends Page {
    state = {
        edit: null,
        org: null,
        intent: null,
    };

    static contextType = coreContext;

    onEndEdit = () => {
        this.props.editing && this.props.editing.pop(true);
        this.setState({ edit: null });
    };

    #commitTask = null;
    onCommit = changedFields => {
        if (!this.props.editing || this.#commitTask) return;
        if (!changedFields.length) {
            // nothing changed, so we can just pop the editing state
            this.props.editing.pop(true);
            return;
        }

        this.#commitTask = this.context.createTask('notifTemplates/update', {
            id: this.id,
            _changedFields: changedFields,
        }, this.state.edit);
        this.#commitTask.on('success', this.onEndEdit);
        this.#commitTask.on('drop', () => this.#commitTask = null);
    };

    onData = data => {
        if (data) this.setState({ org: data.org, intent: data.intent });
    };

    componentDidMount () {
        window.addEventListener('resize', this.onResize);
    }

    componentWillUnmount () {
        if (this.#commitTask) this.#commitTask.drop();
        this.detachScriptEditor();
        window.removeEventListener('resize', this.onResize);
    }

    get id () {
        return +this.props.match[1];
    }

    openScriptEditor = (defs) => AKSOScriptEditor().then(Editor => new Promise(resolve => {
        // it's fine for this to be a potentially delayed action, because if the AKSO script editor
        // hasn't loaded yet, then the def preview hasn't either
        const editor = new Editor();
        editor.setFormVars(getFormVarsForIntent(this.state.intent));
        editor.load(defs);
        editor.onSave = () => {
            resolve(editor.save());
            this.detachScriptEditor();
        };
        this.attachScriptEditor(editor);
    }));

    // TODO: dedup code with form editor
    scriptEditor = null;
    attachScriptEditor (editor) {
        if (this.scriptEditor) this.detachScriptEditor();
        this.scriptEditor = editor;
        const editorNode = document.createElement('div');
        editorNode.className = 'notif-template-script-node-root';
        editorNode.appendChild(editor.node);
        document.body.appendChild(editorNode);
        this.onResize();
    }

    detachScriptEditor () {
        if (!this.scriptEditor) return;
        document.body.removeChild(this.scriptEditor.node.parentNode);
        this.scriptEditor.destroy();
        this.scriptEditor = null;
    }

    onResize = () => {
        if (!this.scriptEditor) return;
        this.scriptEditor.width = window.innerWidth;
        this.scriptEditor.height = window.innerHeight;
    };

    render ({ perms, editing }, { edit, org }) {
        const actions = [];

        const id = this.id;

        if (perms.hasPerm(`notif_templates.create.${org}`)) {
            actions.push({
                icon: <CopyIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.duplicate.menuItem,
                action: () => this.context.createTask('notifTemplates/duplicate', { id }),
            });
        }

        if (perms.hasPerm(`notif_templates.update.${org}`)) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
                action: () => this.props.push('redakti', true),
            });
        }

        if (perms.hasPerm(`notif_templates.delete.${org}`)) {
            actions.push({
                label: locale.delete.menuItem,
                action: () => this.context.createTask('notifTemplates/delete', { id }),
                overflow: true,
            });
        }

        return (
            <div class="notif-template-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />

                <DetailShell
                    view="notifTemplates/template"
                    id={id}
                    options={{ fields: Object.keys(FIELDS) }}
                    onData={this.onData}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    onDelete={() => this.props.pop()}>
                    {data => (
                        <DetailContents
                            id={id}
                            item={this.state.edit || data}
                            editing={editing}
                            onItemChange={edit => this.setState({ edit })}
                            openScriptEditor={this.openScriptEditor} />
                    )}
                </DetailShell>
            </div>
        );
    }
});

function DetailField ({ field, item, editing, onItemChange }) {
    const Cmp = FIELDS[field].component;
    return <Cmp
        value={item[field]}
        onChange={v => onItemChange({ ...item, [field]: v })}
        editing={editing}
        item={item}
        onItemChange={onItemChange} />;
}

function DetailContents ({ id, item, editing, onItemChange, openScriptEditor }) {
    const [templatingContext] = useState(TemplatingContext.create());

    const org = <DetailField field="org" item={item} />;

    const editScript = () => {
        openScriptEditor(item.script || {}).then(script => {
            onItemChange({ ...item, script });
        });
    };

    let intentLink;
    let onSendIntent;

    if (item.intent === 'codeholder') {
        intentLink = `/membroj`;
        onSendIntent = (core) => {
            core.createTask('notifTemplates/_sendCodeholderInfo');
        };
    }

    return (
        <div class="notif-template-detail">
            <DynamicHeightDiv useFirstHeight>
                <div class="detail-header">
                    <div class="header-title">
                        {!editing ? <span class="header-org">{org}</span> : null}
                        <DetailField field="name" editing={editing} item={item} onItemChange={onItemChange} />
                    </div>
                    <div class="header-info">
                        <DetailField field="base" item={item} />
                        {locale.fields.intent}
                        {': '}
                        <DetailField field="intent" item={item} />
                    </div>
                    <div class="detail-description">
                        {editing ? <div class="description-label">{locale.fields.description}</div> : null}
                        <DetailField field="description" editing={editing} item={item} onItemChange={onItemChange} />
                    </div>
                    {!editing ? (
                        <div class="detail-preview-link">
                            <LinkButton target={`/amasmesaghoj/${id}/antauhvido`}>
                                <VisibilityIcon style={{ verticalAlign: 'middle' }} />
                                {' '}
                                {locale.preview.button}
                            </LinkButton>
                            {intentLink && (
                                <coreContext.Consumer>
                                    {core => (
                                        <LinkButton target={intentLink} onClick={() => {
                                            if (onSendIntent) onSendIntent(core);
                                        }}>
                                            <SendIcon style={{ verticalAlign: 'middle' }} />
                                            {' '}
                                            {locale.sendIntent}
                                        </LinkButton>
                                    )}
                                </coreContext.Consumer>
                            )}
                        </div>
                    ) : null}
                </div>
            </DynamicHeightDiv>
            <div class="template-script">
                {editing ? (
                    <Button icon fab class="template-script-edit-button" onClick={editScript}>
                        <EditIcon style={{ verticalAlign: 'middle' }} />
                    </Button>
                ) : null}
                <Suspense fallback={<CircularProgress indeterminate />}>
                    <DefsPreview
                        previousNodes={[{
                            defs: {},
                            formVars: getFormVarsForIntent(item.intent),
                        }]}
                        script={item.script || {}} />
                </Suspense>
            </div>
            <TemplatingContext.Provider value={templatingContext}>
                <div class="mail-contents">
                    <DynamicHeightDiv useFirstHeight>
                        <div class="mail-header">
                            <div class="mail-sender">
                                <div class="sender-name">
                                    <DetailField field="fromName" editing={editing} item={item} onItemChange={onItemChange} />
                                </div>
                                <div class="sender-address">
                                    <DetailField field="from" editing={editing} item={item} onItemChange={onItemChange} />
                                </div>
                            </div>
                            <div class="mail-subject">
                                <DetailField field="subject" editing={editing} item={item} onItemChange={onItemChange} />
                            </div>
                            <div class="mail-reply-to">
                                {editing ? <div class="reply-to-label">{locale.fields.replyTo}</div> : null}
                                <DetailField field="replyTo" editing={editing} item={item} onItemChange={onItemChange} />
                            </div>
                        </div>
                    </DynamicHeightDiv>
                    <div class="mail-body">
                        {item.base === 'raw' ? (
                            <div class="mail-body-raw">
                                <div class="body-type-banner">{locale.fields.html}</div>
                                <DetailField field="html" editing={editing} item={item} onItemChange={onItemChange} />
                                <div class="body-type-banner">{locale.fields.text}</div>
                                <DetailField field="text" editing={editing} item={item} onItemChange={onItemChange} />
                            </div>
                        ) : (
                            <div class="mail-body-modules">
                                <DetailField field="modules" editing={editing} item={item} onItemChange={onItemChange} />
                            </div>
                        )}
                    </div>
                </div>
                <TemplatingPopup
                    item={item}
                    editing={editing} />
            </TemplatingContext.Provider>
        </div>
    );
}

