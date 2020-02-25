import { h, Component } from 'preact';
import { Button, Dialog, TextField } from '@cpsdqs/yamdl';
import ProgressIndicator from '../../../components/dialog-progress-indicator';
import AutosizingPageView from '../../../components/autosizing-page-view';
import Form, { Validator } from '../../../components/form';
import TejoIcon from '../../../components/tejo-icon';
import UeaIcon from '../../../components/uea-icon';
import { timestamp } from '../../../components/data';
import { votes as locale } from '../../../locale';
import { config as Config, voterCodeholders as VoterCodeholders } from './config';
import { routerContext } from '../../../router';

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
                        contents: <UeaIcon />,
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
                value={value.start}
                onChange={start => onChange({ ...value, start })}
                validate={value => {
                    if (!value) throw { error: true };
                }} />
            <WizardSection title={locale.fields.timeEnd} />
            <Validator
                component={timestamp.editor}
                value={value.end}
                onChange={end => onChange({ ...value, end })}
                validate={value => {
                    if (!value) throw { error: true };
                }} />
        </div>
    );
}

const generalPage = (isTemplate) => ({
    id: 'general',
    page: function GeneralPage ({ value, onChange, next }) {
        return (
            <WizardPage next={next}>
                <WizardSection title={locale.fields.name} />
                <Validator
                    class="name-editor"
                    validatorProps={{ class: 'block-validator' }}
                    component={TextField}
                    value={value.name}
                    onChange={e => onChange({ ...value, name: e.target.value })}
                    validate={value => {
                        if (!value) {
                            throw { error: locale.create.nameRequired };
                        }
                    }} />
                {isTemplate ? null : (
                    <OrgPicker
                        value={value.org}
                        onChange={org => onChange({ ...value, org })} />
                )}
            </WizardPage>
        );
    },
});

const votePage = () => ({
    id: 'vote',
    page: function VotePage ({ value, onChange, next }) {
        return (
            <WizardPage next={next}>
                <TypePicker
                    value={value.type}
                    onChange={type => onChange({ ...value, type })} />
                <TimespanEditor
                    value={value.timespan}
                    onChange={timespan => onChange({ ...value, timespan })} />
            </WizardPage>
        );
    },
});

const votersPage = () => ({
    id: 'voters',
    page: function VotersPage ({ value, onChange, next }) {
        return (
            <WizardPage next={next}>
                <VoterCodeholders
                    value={value.voterCodeholders}
                    onChange={voterCodeholders => onChange({ ...value, voterCodeholders })}
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

const templatePage = () => ({
    id: 'template',
    page: function TemplatePage ({ value, onChange }) {

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
                },
            },
            error: null,
        };

        static contextType = routerContext;

        render ({ open, core, task }, { page }) {
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
                        task.update(this.state.vote);
                        task.runOnce().then(id => {
                            this.context.navigate(`/vochdonado/${id}`);
                        }).catch(error => {
                            this.setState({ error });
                            console.error(error); // eslint-disable-line no-console
                        });
                        return;
                    }
                    this.setState({ page: i + 1 });
                };
                const nextButton = isLast ? (
                    <Button raised disabled={task.running}>
                        {locale.create.button}
                    </Button>
                ) : (
                    <Button raised>
                        {locale.create.continue}
                    </Button>
                );

                const Page = p.page;
                pageContents.push(
                    <Page
                        value={this.state.vote}
                        onChange={vote => this.setState({ vote })}
                        next={[nextButton, nextAction]} />
                );
                pageIndex++;
            }

            return (
                <Dialog
                    backdrop
                    open={open}
                    onClose={() => task.drop()}
                    title={locale.create.title}
                    class="vote-creator-wizard"
                    fullScreen={width => width <= 420}>
                    <ProgressIndicator selected={page}>
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
                </Dialog>
            );
        }
    };
}
