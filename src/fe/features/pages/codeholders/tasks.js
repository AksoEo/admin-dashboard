import { h } from 'preact';
import { useRef, useState, useEffect } from 'preact/compat';
import { Dialog, TextField, CircularProgress, Button } from '@cpsdqs/yamdl';
import { UEACode } from '@tejo/akso-client';
import Segmented from '../../../components/segmented';
import Form, { Validator } from '../../../components/form';
import data from '../../../components/data';
import { routerContext } from '../../../router';
import {
    codeholders as locale,
    detail as detailLocale,
    generic as genericLocale,
} from '../../../locale';
import './style';

export default {
    create ({ open, core, task }) {
        const buttonValidator = useRef(null);
        const [error, setError] = useState(null);

        let nameFields = [];
        if (task.parameters.type === 'human') {
            nameFields = [
                'firstLegal',
                'lastLegal',
                'first',
                'last',
            ];
        } else if (task.parameters.type === 'org') nameFields = ['full', 'local', 'abbrev'];

        useEffect(() => {
            if (!task.parameters.type) {
                task.update({ type: 'human' });
            }
        });

        const onSubmit = routerContext => () => {
            setError(null);
            task.runOnce().then(() => {
                // open the new codeholder page
                core.createTask('codeholders/list', {}, {
                    jsonFilter: { filter: { newCode: task.parameters.code.new } },
                    offset: 0,
                    limit: 1,
                }).runOnceAndDrop().then(res => {
                    routerContext.navigate('/membroj/' + res.items[0]);
                }).catch(err => {
                    console.error('failed to open new codeholder', err); // eslint-disable-line no-console
                });
            }).catch(err => {
                setError(err);
                console.error(err); // eslint-disable-line no-console
                buttonValidator.current.shake();
            });
        };

        const codeSuggestions = [];
        if (task.parameters.name) {
            codeSuggestions.push(...UEACode.suggestCodes({
                type: task.parameters.type,
                firstNames: [task.parameters.name.firstLegal, task.parameters.name.first],
                lastNames: [task.parameters.name.lastLegal, task.parameters.name.last],
                fullName: task.parameters.name.full,
                nameAbbrev: task.parameters.name.abbrev,
            }));
        }

        return (
            <Dialog
                backdrop
                title={locale.create}
                class="codeholders-task-create"
                open={open}
                onClose={() => task.drop()}>
                <routerContext.Consumer>
                    {context => <Form class="task-create-form" onSubmit={onSubmit(context)}>
                        <Validator
                            component={Segmented}
                            class="form-field"
                            selected={task.parameters.type}
                            onSelect={type => task.update({ type })}
                            disabled={task.running}
                            validate={() => true}>
                            {[
                                { id: 'human', label: locale.fields.types.human },
                                { id: 'org', label: locale.fields.types.org },
                            ]}
                        </Validator>
                        {nameFields.map((field, isOptional) => (
                            // we assume only the first field is required, so !!index == isOptional
                            <Validator
                                key={field}
                                component={TextField}
                                class="form-field text-field"
                                outline
                                label={locale.nameSubfields[field] + (isOptional ? '' : '*')}
                                value={(task.parameters.name || {})[field]}
                                onChange={e => task.update({
                                    name: {
                                        ...(task.parameters.name || {}),
                                        [field]: e.target.value,
                                    },
                                })}
                                disabled={task.running}
                                validate={value => {
                                    if (isOptional) return;
                                    if (!value || !value.trim()) throw { error: locale.createNoName };
                                }} />
                        ))}
                        <Validator
                            component={data.ueaCode.editor}
                            class="form-field text-field"
                            outline
                            value={(task.parameters.code || {}).new}
                            suggestions={codeSuggestions}
                            onChange={newCode => task.update({ code: { new: newCode } })}
                            disabled={task.running}
                            id={-1} // pass nonsense id to just check if it’s taken
                            validate={value => {
                                if (!UEACode.validate(value) || (new UEACode(value)).type !== 'new') {
                                    throw { error: locale.invalidUEACode };
                                }
                            }} />
                        <footer class="form-footer">
                            <Validator
                                component={Button}
                                raised
                                type="submit"
                                disabled={task.running}
                                ref={buttonValidator}
                                validate={() => {}}>
                                <CircularProgress
                                    class="progress-overlay"
                                    indeterminate={task.running}
                                    small />
                                <span>
                                    {locale.createAction}
                                </span>
                            </Validator>
                        </footer>
                        {error ? (
                            <div class="form-error">
                                {locale.createGenericError}
                            </div>
                        ) : null}
                    </Form>}
                </routerContext.Consumer>
            </Dialog>
        );
    },
    update ({ open, task }) {
        const buttonValidator = useRef(null);
        const [error, setError] = useState(null);

        const changedFields = task.options._changedFields || [];

        return (
            <Dialog
                backdrop
                title={detailLocale.saveTitle}
                class="codeholders-task-update"
                open={open}
                onClose={() => task.drop()}>
                <Form class="task-update-form" onSubmit={() => {
                    setError(null);
                    task.runOnce().catch(err => {
                        setError(err);
                        buttonValidator.current.shake();
                    });
                }}>
                    <div class="commit-info">
                        <span class="changed-fields-title">
                            {detailLocale.diff}
                        </span>
                        <ul class="changed-fields">
                            {changedFields.map(field => (
                                <li key={field}>
                                    {locale.fields[field]}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <TextField
                        class="update-comment"
                        label={detailLocale.updateComment}
                        value={task.parameters.updateComment || ''}
                        onChange={e => task.update({ updateComment: e.target.value })} />
                    {error ? (
                        <div class="error-message">
                            {'' + error}
                        </div>
                    ) : null}
                    <footer class="form-footer">
                        <span class="footer-spacer" />
                        <Validator
                            component={Button}
                            raised
                            type="submit"
                            disabled={task.running}
                            ref={buttonValidator}
                            validate={() => {}}>
                            <CircularProgress
                                class="progress-overlay"
                                indeterminate={task.running}
                                small />
                            <span>
                                {detailLocale.commit}
                            </span>
                        </Validator>
                    </footer>
                </Form>
            </Dialog>
        );
    },
    delete ({ open, core, task }) {
        return (
            <Dialog
                backdrop
                class="codeholders-task-delete"
                open={open}
                onClose={() => task.drop()}
                actions={[
                    {
                        label: genericLocale.cancel,
                        action: () => task.drop(),
                    },
                    {
                        label: locale.delete,
                        action: () => task.runOnceAndDrop().catch(err => {
                            core.createTask('info', {
                                message: err.toString(),
                            });
                        }),
                    },
                ]}>
                {locale.deleteDescription}
            </Dialog>
        );
    },
};
