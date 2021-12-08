import { h } from 'preact';
import { lazy, Suspense, PureComponent } from 'preact/compat';
import { AppBarProxy, Button, Checkbox, CircularProgress, MenuIcon } from 'yamdl';
import { CardStackItem } from '../../../components/layout/card-stack';
import { connectPerms } from '../../../perms';
import { coreContext } from '../../../core/connection';
import { codeholders as locale } from '../../../locale';
import './notif-templates.less';

const NotifTemplatePicker = lazy(() => import('./notif-template-picker'));

export default class NotifTemplates extends PureComponent {
    render ({ options, open, onClose, lvIsCursed }) {
        return (
            <CardStackItem
                open={open}
                onClose={onClose}
                depth={0}
                appBar={
                    <AppBarProxy
                        menu={<Button icon small onClick={onClose}>
                            <MenuIcon type="close" />
                        </Button>}
                        title={locale.notifTemplates.title}
                        priority={9} />
                }>
                <Contents
                    options={options}
                    onClose={onClose}
                    lvIsCursed={lvIsCursed} />
            </CardStackItem>
        );
    }
}

const Contents = connectPerms(class Contents extends PureComponent {
    state = {
        template: null,
        templateOrg: null,
        deleteOnComplete: false,
    };

    static contextType = coreContext;

    onSubmit = () => {
        const task = this.context.createTask('codeholders/sendNotifTemplate', this.props.options, {
            template: this.state.template,
            deleteOnComplete: this.state.deleteOnComplete,
        });
        task.on('success', () => {
            this.props.onClose();
        });
    };

    render ({ perms, lvIsCursed }, { template, templateOrg }) {
        const contents = [];
        if (template && templateOrg && perms.hasPerm(`notif_templates.delete.${templateOrg}`)) {
            const checkboxId = Math.random().toString(36);
            contents.push(
                <div class="send-option" key="deleteOnComplete">
                    <Checkbox
                        class="option-switch"
                        id={checkboxId}
                        checked={this.state.deleteOnComplete}
                        onChange={deleteOnComplete => this.setState({ deleteOnComplete })} />
                    <label for={checkboxId}>
                        {locale.notifTemplates.deleteOnComplete}
                    </label>
                </div>
            );
        }

        if (template && templateOrg) {
            contents.push(
                <footer class="send-footer">
                    <div class="send-submit" key="submit">
                        <Button raised onClick={this.onSubmit}>
                            {locale.notifTemplates.send.button}
                        </Button>
                    </div>
                </footer>
            );
        }

        return (
            <div class="codeholders-send-notif-template">
                {lvIsCursed ? <div class="cursed-notice">
                    {locale.notifTemplates.cursedNotice}
                </div> : null}
                <p class="templates-description">
                    {locale.notifTemplates.description}
                </p>
                <Suspense fallback={(
                    <div class="notif-template-picker-loading">
                        <CircularProgress indeterminate />
                    </div>
                )}>
                    <NotifTemplatePicker
                        value={template}
                        onChange={template => this.setState({ template })}
                        onChangeOrg={templateOrg => this.setState({ templateOrg })} />
                </Suspense>
                {contents}
            </div>
        );
    }
});
