import { h, Component } from 'preact';
import { Button, Dialog, TextField } from '@cpsdqs/yamdl';
import TaskDialog from '../../../components/task-dialog';
import TejoIcon from '../../../components/tejo-icon';
import UeaIcon from '../../../components/uea-icon';
import ProgressIndicator from '../../../components/dialog-progress-indicator';
import AutosizingPageView from '../../../components/autosizing-page-view';
import ChangedFields from '../../../components/changed-fields';
import Form, { Validator } from '../../../components/form';
import { timestamp } from '../../../components/data';
import { VoteConfig } from './config';
import { votes as locale } from '../../../locale';
import { routerContext } from '../../../router';
import './tasks.less';

function WizardPage ({ children, onContinue }) {
    return (
        <Form class="wizard-page" onSubmit={onContinue}>
            {children}
            <footer class="page-footer">
                <span />
                <Button raised type="submit">
                    {locale.create.continue}
                </Button>
            </footer>
        </Form>
    );
}

function ErrorableDiv ({ error, children, ...props }) {
    return (
        <div {...props}>
            {children}
            <div class="error-message-container">
                {error}
            </div>
        </div>
    );
}

function WizardSelector ({ title, value, onChange, onContinue, items, vertical }) {
    return (
        <Validator
            component={ErrorableDiv}
            validatorProps={{ class: 'wizard-selector-validator' }}
            value={null}
            validate={() => {
                if (value === null) {
                    throw { error: locale.create.requiresSelection };
                }
            }}
            class={'votes-wizard-selector' + (vertical ? ' is-vertical' : '')}>
            <div class="wizard-title">
                {title}
            </div>
            <div class="wizard-items">
                {items.map((item, i) => (
                    <Button
                        key={i}
                        onClick={e => {
                            e.preventDefault();
                            onChange(item.value);
                        }}
                        class={'wizard-selector-item'
                            + (item.value === value ? ' selected' : '')
                            + (item.icon ? ' icon-container' : '')}>
                        {item.contents}
                    </Button>
                ))}
            </div>
        </Validator>
    );
}

export default {
    create: class VoteCreatorWizard extends Component {
        state = {
            page: 0,
            org: null,
            type: null,
            timespan: {
                start: null,
                end: null,
            },
        };

        static contextType = routerContext;

        render ({ open, core, task }, { page }) {
            return (
                <Dialog
                    backdrop
                    open={open}
                    onClose={() => task.drop()}
                    title={locale.create.title}
                    class="vote-creator-wizard"
                    fullScreen={width => width <= 420}>
                    <ProgressIndicator selected={page}>
                        <span onClick={() => this.setState({ page: 0 })}>
                            {locale.create.pages.generic}
                        </span>
                        <span onClick={() => page > 1 && this.setState({ page: 1 })}>
                            {locale.create.pages.timespan}
                        </span>
                        <span onClick={() => page > 2 && this.setState({ page: 2 })}>
                            {locale.create.pages.config}
                        </span>
                    </ProgressIndicator>
                    <AutosizingPageView
                        selected={page}>
                        <WizardPage onContinue={() => this.setState({ page: 1 })}>
                            <WizardSelector
                                title={locale.fields.org}
                                value={this.state.org}
                                onChange={org => this.setState({ org })}
                                items={[
                                    {
                                        value: 'tejo',
                                        icon: true,
                                        contents: <TejoIcon />,
                                    },
                                    {
                                        value: 'uea',
                                        icon: true,
                                        contents: <UeaIcon />,
                                    },
                                ]} />
                            <WizardSelector
                                title={locale.fields.type}
                                value={this.state.type}
                                onChange={type => this.setState({ type })}
                                vertical
                                items={Object.keys(locale.types).map(type => ({
                                    value: type,
                                    contents: locale.types[type],
                                }))} />
                        </WizardPage>
                        <WizardPage onContinue={() => this.setState({ page: 2 })}>
                            <Validator
                                component={timestamp.editor}
                                value={this.state.timespan.start}
                                onChange={start => this.setState({ timespan: { ...this.state.timespan, start }})}
                                validate={value => {
                                    if (!value) throw { error: true };
                                }} />
                            <Validator
                                component={timestamp.editor}
                                value={this.state.timespan.end}
                                onChange={end => this.setState({ timespan: { ...this.state.timespan, end }})}
                                validate={value => {
                                    if (!value) throw { error: true };
                                }} />
                        </WizardPage>
                        <WizardPage>
                            <VoteConfig
                                value={this.state.config}
                                onChange={config => this.setState({ config })} />
                        </WizardPage>
                    </AutosizingPageView>
                </Dialog>
            );
        }
    },
    update ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.update.title}
                actionLabel={locale.update.button}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields}
                    locale={locale.fields} />
            </TaskDialog>
        );
    },
    delete ({ open, task }) {
        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={locale.delete.title}
                        actionLabel={locale.delete.button}>
                        {locale.delete.description}
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },
};
