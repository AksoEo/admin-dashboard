import { h } from 'preact';
import { Button } from '@cpsdqs/yamdl';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../components/page';
import DynamicHeightDiv from '../../../components/dynamic-height-div';
import DetailShell from '../../../components/detail-shell';
import { DefsPreview } from '../../../components/form-editor/script-views';
import Meta from '../../meta';
import { connectPerms } from '../../../perms';
import { coreContext } from '../../../core/connection';
import { notifTemplates as locale } from '../../../locale';
import { FIELDS } from './fields';
import './detail.less';

export default connectPerms(class NotifTemplate extends Page {
    state = {
        edit: null,
        org: null,
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
        if (data) this.setState({ org: data.org });
    };

    componentWillUnmount () {
        if (this.#commitTask) this.#commitTask.drop();
    }

    get id () {
        return +this.props.match[1];
    }

    render ({ perms, editing }, { edit, org }) {
        const actions = [];

        const id = this.id;

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
                            item={this.state.edit || data}
                            editing={editing}
                            onItemChange={edit => this.setState({ edit })} />
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

function DetailContents ({ item, editing, onItemChange }) {
    const org = <DetailField field="org" item={item} />;

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
                </div>
            </DynamicHeightDiv>
            <div class="template-script">
                {editing ? (
                    <Button icon fab class="template-script-edit-button">
                        <EditIcon style={{ verticalAlign: 'middle' }} />
                    </Button>
                ) : null}
                <DefsPreview
                    script={item.script || {}} />
            </div>
            <div class="mail-contents">
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
        </div>
    );
}
