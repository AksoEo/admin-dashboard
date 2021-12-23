import { h, Component } from 'preact';
import { useEffect } from 'preact/compat';
import { Button, TextField } from 'yamdl';
import DialogSheet from '../../../components/tasks/dialog-sheet';
import ProgressIndicator from '../../../components/dialog-progress-indicator';
import AutosizingPageView from '../../../components/layout/autosizing-page-view';
import Form, { Validator } from '../../../components/form';
import { TejoIcon, UeaIcon, UeaColorIcon } from '../../../components/org-icon';
import { timestamp } from '../../../components/data';
import { votes as locale } from '../../../locale';
import {
    config as Config,
    voterCodeholders as VoterCodeholders,
    viewerCodeholders as ViewerCodeholders,
} from './config';
import { routerContext } from '../../../router';
import { connectPerms } from '../../../perms';
import { deepMerge } from '../../../../util';

function WizardPage ({ children, next }) {
    return (
        <Form class="wizard-page" onSubmit={next[1]}>
            {children}
            <footer class="page-footer">
                <span />
                {next[0]}
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

function WizardSection ({ title }) {
    return (
        <div class="wizard-title">
            {title}
        </div>
    );
}

function WizardSelector ({ value, onChange, items, vertical }) {
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
            <div class="selector-items">
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

function OrgPicker ({ value, onChange }) {
    return (
        <div class="org-picker">
            <WizardSection title={locale.fields.org} />
            <WizardSelector
                value={value}
                onChange={onChange}
                items={[
                    {
                        value: 'tejo',
                        icon: true,
                        contents: <TejoIcon />,
                    },
                    {
                        value: 'uea',
                        icon: true,
                        contents: value === 'uea' ? <UeaColorIcon /> : <UeaIcon />,
                    },
                ]} />
        </div>
    );
}

function TypePicker ({ value, onChange }) {
    return (
        <div class="type-picker">
            <WizardSection title={locale.fields.type} />
            <WizardSelector
                title={locale.fields.type}
                value={value}
                onChange={onChange}
                vertical
                items={Object.keys(locale.types).map(type => ({
                    value: type,
                    contents: locale.types[type],
                }))} />
        </div>
    );
}

function TimespanEditor ({ value, onChange }) {
    return (
        <div class="timespan-editor">
            <WizardSection title={locale.fields.timeStart} />
            <Validator
                component={timestamp.editor}
                outline
                value={value.start}
                onChange={start => onChange({ ...value, start })}
                validate={v => {
                    if (!v) throw { error: true };
                    if (v >= value.end) throw { error: locale.create.emptyTimespan };
                }} />
            <br />
            <br />
            <WizardSection title={locale.fields.timeEnd} />
            <Validator
                component={timestamp.editor}
                outline
                value={value.end}
                onChange={end => onChange({ ...value, end })}
                validate={v => {
                    if (!v) throw { error: true };
                    if (v <= value.start) throw { error: locale.create.emptyTimespan };
                }} />
        </div>
    );
}

const templatePage = () => ({
    id: 'template',
    page: connectPerms(function TemplatePage ({ template: value, onTemplateChange: onChange, next, perms }) {
        const hasTejo = perms.hasPerm('votes.create.tejo');
        const hasUea = perms.hasPerm('votes.create.uea');

        if ((!hasTejo || !hasUea) && !value.org) {
            // set org field to the one the user has permission to create
            useEffect(() => {
                onChange({ ...value, org: hasUea ? 'uea' : 'tejo' });
            });
        }

        return (
            <WizardPage next={next}>
                <WizardSection title={locale.fields.name} />
                <Validator
                    class="name-editor"
                    validatorProps={{ class: 'block-validator' }}
                    component={TextField}
                    outline
                    value={value.name}
                    onChange={e => onChange({ ...value, name: e.target.value })}
                    validate={value => {
                        if (!value) {
                            throw { error: locale.create.nameRequired };
                        }
                    }} />
                <WizardSection title={locale.fields.description} />
                <Validator
                    class="name-editor"
                    validatorProps={{ class: 'block-validator' }}
                    component={TextField}
                    outline
                    value={value.description}
                    onChange={e => onChange({ ...value, description: e.target.value || null })}
                    validate={() => {}} />
                {hasTejo && hasUea ? (
                    <OrgPicker
                        value={value.org}
                        onChange={org => onChange({ ...value, org })} />
                ) : null}
            </WizardPage>
        );
    }),
});

const generalPage = (isTemplate) => ({
    id: 'general',
    page: connectPerms(function GeneralPage ({ value, onChange, next, perms }) {
        const hasTejo = perms.hasPerm('votes.create.tejo');
        const hasUea = perms.hasPerm('votes.create.uea');

        if ((!hasTejo || !hasUea) && !value.org) {
            // set org field to the one the user has permission to create
            useEffect(() => {
                onChange({ ...value, org: hasUea ? 'uea' : 'tejo' });
            });
        }

        return (
            <WizardPage next={next}>
                <WizardSection title={locale.fields.name} />
                <Validator
                    class="name-editor"
                    validatorProps={{ class: 'block-validator' }}
                    component={TextField}
                    outline
                    value={value.name}
                    onChange={e => onChange({ ...value, name: e.target.value })}
                    validate={value => {
                        if (!value) {
                            throw { error: locale.create.nameRequired };
                        }
                    }} />
                {hasTejo && hasUea && !isTemplate ? (
                    <OrgPicker
                        value={value.org}
                        onChange={org => onChange({ ...value, org })} />
                ) : null}
            </WizardPage>
        );
    }),
});

const votePage = (isTemplate) => ({
    id: 'vote',
    page: function VotePage ({ value, onChange, next }) {
        return (
            <WizardPage next={next}>
                <TypePicker
                    value={value.type}
                    onChange={type => onChange({ ...value, type })} />
                {isTemplate ? null : (
                    <TimespanEditor
                        value={value.timespan}
                        onChange={timespan => onChange({ ...value, timespan })} />
                )}
            </WizardPage>
        );
    },
});

const votersPage = () => ({
    id: 'voters',
    page: function VotersPage ({ value, onChange, next }) {
        return (
            <WizardPage next={next}>
                <p>
                    {locale.voterCodeholdersDescription}
                </p>
                <VoterCodeholders
                    value={value.voterCodeholders}
                    onChange={voterCodeholders => onChange({ ...value, voterCodeholders })}
                    item={value}
                    editing={true} />
                <WizardSection title={locale.fields.viewerCodeholders} />
                <p>
                    {locale.viewerCodeholdersDescription}
                </p>
                <ViewerCodeholders
                    value={value.viewerCodeholders}
                    onChange={viewerCodeholders => onChange({ ...value, viewerCodeholders })}
                    item={value}
                    editing={true} />
            </WizardPage>
        );
    },
});

const configPage = () => ({
    id: 'config',
    page: function ConfigPage ({ value, onChange, next }) {
        return (
            <WizardPage next={next}>
                <Config
                    value={value.config}
                    onChange={config => onChange({ ...value, config })}
                    editing={true}
                    item={value} />
            </WizardPage>
        );
    },
});

export default function makeCreateTask (isTemplate) {
    const pages = [
        generalPage(isTemplate),
        votersPage(isTemplate),
        votePage(isTemplate),
        configPage(isTemplate),
    ];

    if (isTemplate) {
        pages.unshift(templatePage());
    }

    return class CreateVote extends Component {
        state = {
            page: 0,
            template: {
                name: '',
                description: '',
                org: null,
            },
            vote: {
                name: '',
                org: null,
                type: null,
                state: {
                    isActive: false,
                },
                timespan: {
                    start: null,
                    end: null,
                },
                voterCodeholders: '{\n\t\n}',
                viewerCodeholders: 'null',
                config: {
                    quorum: 0,
                    quorumInclusive: true,
                    blankBallotsLimit: 0,
                    blankBallotsLimitInclusive: true,
                    majorityBallots: 0,
                    majorityBallotsInclusive: true,
                    majorityVoters: 0,
                    majorityVotersInclusive: true,
                    majorityMustReachBoth: true,
                    numChosenOptions: 1,
                    mentionThreshold: 0,
                    mentionThresholdInclusive: true,
                    maxOptionsPerBallot: null,
                    tieBreakerCodeholder: null,
                    publishVoters: false,
                    publishVotersPercentage: true,
                    options: [],
                    ballotsSecret: false,
                },
            },
            error: null,
        };

        static contextType = routerContext;

        componentDidMount () {
            if (!isTemplate && this.props.task.parameters.name) {
                // seems like we’re using a template! copy over data
                this.setState({
                    vote: deepMerge({ ...this.state.vote }, this.props.task.parameters),
                });
            }
        }

        render ({ open, task }, { page }) {
            const pageTitles = [];
            const pageContents = [];
            let pageIndex = 0;
            for (const p of pages) {
                const i = pageIndex;
                pageTitles.push(
                    <span key={p.id} onClick={() => {
                        if (page > i) this.setState({ page: i });
                    }}>
                        {locale.create.pages[p.id]}
                    </span>
                );

                const isLast = i + 1 === pages.length;
                const nextAction = () => {
                    if (isLast) {
                        task.update(isTemplate ? {
                            ...this.state.template,
                            vote: this.state.vote,
                        } : this.state.vote);
                        task.runOnce().then(id => {
                            if (isTemplate) {
                                this.context.navigate(`/vochdonado/shablonoj/${id}`);
                            } else {
                                this.context.navigate(`/vochdonado/${id}`);
                            }
                        }).catch(error => {
                            this.setState({ error });
                            console.error(error); // eslint-disable-line no-console
                        });
                        return;
                    }
                    this.setState({ page: i + 1 });
                };
                const nextButton = isLast ? (
                    <Button raised disabled={task.running} type="submit">
                        {locale.create.button}
                    </Button>
                ) : (
                    <Button raised type="submit">
                        {locale.create.continue}
                    </Button>
                );

                const Page = p.page;
                pageContents.push(
                    <Page
                        value={this.state.vote}
                        onChange={vote => this.setState({ vote })}
                        template={this.state.template}
                        onTemplateChange={template => this.setState({ template })}
                        next={[nextButton, nextAction]} />
                );
                pageIndex++;
            }

            return (
                <DialogSheet
                    backdrop
                    open={open}
                    onClose={() => task.drop()}
                    title={isTemplate ? locale.create.templateTitle : locale.create.title}
                    class="vote-creator-wizard"
                    fullScreen={width => width <= 420}>
                    <ProgressIndicator selected={page} onBack={() => {
                        if (page > 0) this.setState({ page: page - 1 });
                    }}>
                        {pageTitles}
                    </ProgressIndicator>
                    <AutosizingPageView eager alwaysOverflow selected={page}>
                        {pageContents}
                    </AutosizingPageView>
                    {this.state.error ? (
                        <div class="error-message-container">
                            {'' + this.state.error}
                        </div>
                    ) : null}
                </DialogSheet>
            );
        }
    };
}
