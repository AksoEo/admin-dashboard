import { h } from 'preact';
import { lazy, Suspense, PureComponent } from 'preact/compat';
import { AppBarProxy, Button, Checkbox, CircularProgress, MenuIcon } from 'yamdl';
import { CardStackItem } from '../../../components/layout/card-stack';
import { connectPerms } from '../../../perms';
import { coreContext } from '../../../core/connection';
import { notifTemplates as locale } from '../../../locale';
import './send.less';

const MagazineEditionPicker = lazy(() => import('../magazines/edition-picker'));
const NotifTemplatePicker = lazy(() => import('./picker'));

export default class SendNotifTemplate extends PureComponent {
    render ({ options, open, onClose, lvIsCursed, isNewsletter, jsonFilter, task }) {
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
                        title={locale.send.title}
                        priority={9} />
                }>
                <Contents
                    task={task}
                    options={options}
                    jsonFilter={jsonFilter}
                    onClose={onClose}
                    lvIsCursed={lvIsCursed}
                    isNewsletter={isNewsletter} />
            </CardStackItem>
        );
    }
}

const Contents = connectPerms(class Contents extends PureComponent {
    state = {
        template: null,
        templateData: null,
        deleteOnComplete: false,
        additionalParams: {},
    };

    static contextType = coreContext;

    onSubmit = () => {
        const task = this.context.createTask(this.props.task, this.props.options, {
            template: this.state.template,
            deleteOnComplete: this.state.deleteOnComplete,
            additionalParams: this.state.additionalParams,
        });
        task.on('success', () => {
            this.context.createTask('info', {
                message: locale.send.send.sent,
            });

            this.props.onClose();
        });
    };

    render ({ perms, lvIsCursed, isNewsletter, jsonFilter }, { template, templateData }) {
        const contents = [];
        const intent = templateData?.intent;

        let canDeleteOnComplete = !!templateData;
        let canSend = !!templateData;
        if (intent === 'newsletter_magazine') {
            canDeleteOnComplete = false;
            canSend = this.state.additionalParams.magazineId && this.state.additionalParams.editionId;

            contents.push(
                <div class="magazine-params" key="params">
                    <p>
                        {locale.send.intentDescriptions.newsletterMagazine}
                    </p>
                    <Suspense fallback={(
                        <div class="notif-template-picker-loading">
                            <CircularProgress indeterminate />
                        </div>
                    )}>
                        <MagazineEditionPicker
                            magazineJsonFilter={{
                                org: templateData.org,
                            }}
                            magazine={this.state.additionalParams.magazineId}
                            edition={this.state.additionalParams.editionId}
                            onMagazineChange={magazineId => this.setState({
                                additionalParams: {
                                    ...this.state.additionalParams,
                                    magazineId,
                                },
                            })}
                            onEditionChange={editionId => this.setState({
                                additionalParams: {
                                    ...this.state.additionalParams,
                                    editionId,
                                },
                            })} />
                    </Suspense>
                </div>
            );
        }

        if (canDeleteOnComplete && perms.hasPerm(`notif_templates.delete.${templateData.org}`)) {
            const checkboxId = Math.random().toString(36);
            contents.push(
                <div class="send-option" key="deleteOnComplete">
                    <Checkbox
                        class="option-switch"
                        id={checkboxId}
                        checked={this.state.deleteOnComplete}
                        onChange={deleteOnComplete => this.setState({ deleteOnComplete })} />
                    <label for={checkboxId}>
                        {locale.send.deleteOnComplete}
                    </label>
                </div>
            );
        }

        if (canSend) {
            contents.push(
                <footer class="send-footer" key="send">
                    <div class="send-submit" key="submit">
                        <Button raised onClick={this.onSubmit}>
                            {locale.send.send.button}
                        </Button>
                    </div>
                </footer>
            );
        }

        return (
            <div class="codeholders-send-notif-template">
                {this.props.options.search?.query ? <div class="search-query-notice">
                    {locale.send.searchQueryNotice}
                </div> : null}
                {lvIsCursed ? <div class="cursed-notice">
                    {locale.send.cursedNotice}
                </div> : null}
                <p class="templates-description">
                    {isNewsletter ? (
                        locale.send.descriptionNewsletter
                    ) : (
                        locale.send.descriptionCodeholder
                    )}
                </p>
                <Suspense fallback={(
                    <div class="notif-template-picker-loading">
                        <CircularProgress indeterminate />
                    </div>
                )}>
                    <NotifTemplatePicker
                        jsonFilter={jsonFilter}
                        value={template}
                        onChange={template => this.setState({ template })}
                        onLoadData={templateData => {
                            const deleteOnComplete = isNewsletter && templateData?.intent === 'newsletter';

                            this.setState({
                                templateData,
                                deleteOnComplete,
                            });
                        }} />
                </Suspense>
                {contents}
            </div>
        );
    }
});
