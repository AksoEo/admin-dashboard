import { h } from 'preact';
import { useRef, useState, useEffect } from 'preact/compat';
import { Dialog, TextField, CircularProgress, Button } from '@cpsdqs/yamdl';
import TaskDialog from '../../../components/task-dialog';
import { UEACode } from '@tejo/akso-client';
import Segmented from '../../../components/segmented';
import Select from '../../../components/select';
import ChangedFields from '../../../components/changed-fields';
import Form, { Validator } from '../../../components/form';
import { ueaCode, date } from '../../../components/data';
import { connect } from '../../../core/connection';
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
                            component={ueaCode.editor}
                            class="form-field text-field"
                            outline
                            value={(task.parameters.code || {}).new}
                            suggestionParameters={task.parameters}
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
                    <ChangedFields changedFields={changedFields} locale={locale.fields} />
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
    addMembership: connect('memberships/categories')(categories => ({
        categories,
    }))(function ({ open, task, categories }) {
        let yearMin = 0;
        let yearMax = 0;

        if (task.parameters.category) {
            yearMin = categories[task.parameters.category].availableFrom;
            yearMax = categories[task.parameters.category].availableTo;
        }

        useEffect(() => {
            if (!task.parameters.year) {
                task.update({ year: new Date().getFullYear() });
            }
            if (categories && !('category' in task.parameters)) {
                task.update({ category: Object.values(categories)[0].id });
            }
        });

        return (
            <TaskDialog
                class="codeholders-task-add-membership"
                open={open}
                title={locale.addMembership}
                onClose={() => task.drop()}
                actionLabel={locale.membership.add}
                run={() => task.runOnce()}>
                <Validator
                    component={Select}
                    validate={() => {}}
                    class="category-select form-field"
                    value={task.parameters.category}
                    onChange={category => task.update({ category })}
                    items={categories ? Object.values(categories).map(({
                        id,
                        nameAbbrev,
                        name,
                        availableFrom,
                        availableTo,
                    }) => ({
                        value: id,
                        label: `${name} (${nameAbbrev})` + (
                            availableFrom && availableTo ? (
                                ` (${availableFrom}–${availableTo})`
                            ) : availableFrom ? (
                                ` (${locale.membership.availableFrom} ${availableFrom})`
                            ) : availableTo ? (
                                ` (${locale.membership.availableTo} ${availableTo})`
                            ) : ''
                        ),
                    })) : []} />
                <Validator
                    component={TextField}
                    class="form-field text-field"
                    type="number"
                    label={locale.membership.year}
                    min={yearMin}
                    max={yearMax}
                    value={task.parameters.year}
                    onChange={e => task.update({ year: e.target.value })}
                    validate={value => {
                        if (+value != value) throw { error: locale.membership.notAYear };
                    }} />
            </TaskDialog>
        );
    }),
    addRole: makeRoleEditor('add'),
    updateRole: makeRoleEditor('update'),

    setPermissions ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.perms.setTitle}
                actionLabel={locale.perms.setButton}
                run={() => task.runOnce()}>
                todo: summary of changes
            </TaskDialog>
        );
    },
    setMemberRestrictions ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.perms.setRestrictions}
                actionLabel={locale.perms.setRestrictionsButton}
                running={task.running}
                run={() => task.runOnce()}>
                todo: some view
            </TaskDialog>
        );
    },

    createPassword ({ open, core, task }) {
        return (
            <TaskDialog
                class="codeholders-task-reset-password"
                open={open}
                onClose={() => task.drop()}
                title={locale.resetPassword.create}
                actionLabel={locale.resetPassword.send}
                running={task.running}
                run={() => task.runOnce().then(() => {
                    core.createTask('info', {
                        message: locale.resetPassword.success,
                    });
                })}>
                <p>
                    {locale.resetPassword.descriptionCreate}
                </p>
                <div class="reset-password-select-org">
                    <label>
                        {locale.resetPassword.orgsSelect}
                    </label>
                    <Segmented
                        selected={task.parameters.org}
                        onSelect={org => task.update({ org })}>
                        {Object.entries(locale.resetPassword.orgs).map(([k, v]) => ({ id: k, label: v }))}
                    </Segmented>
                </div>
            </TaskDialog>
        );
    },
    resetPassword ({ open, core, task }) {
        return (
            <TaskDialog
                class="codeholders-task-reset-password"
                open={open}
                onClose={() => task.drop()}
                title={locale.resetPassword.reset}
                actionLabel={locale.resetPassword.send}
                running={task.running}
                run={() => task.runOnce().then(() => {
                    core.createTask('info', {
                        message: locale.resetPassword.success,
                    });
                })}>
                <p>
                    {locale.resetPassword.descriptionReset}
                </p>
                <div class="reset-password-select-org">
                    <label>
                        {locale.resetPassword.orgsSelect}
                    </label>
                    <Segmented
                        selected={task.parameters.org}
                        onSelect={org => task.update({ org })}>
                        {Object.entries(locale.resetPassword.orgs).map(([k, v]) => ({ id: k, label: v }))}
                    </Segmented>
                </div>
            </TaskDialog>
        );
    },
};

function makeRoleEditor (type) {
    return connect('roles/roles')(roles => ({ roles }))(function ({ open, task, roles }) {
        useEffect(() => {
            if (roles && !('role' in task.parameters)) {
                task.update({ role: Object.values(roles)[0].id });
            }
        });

        return (
            <TaskDialog
                class="codeholders-task-add-role"
                open={open}
                title={locale[type + 'Role']}
                onClose={() => task.drop()}
                actionLabel={locale.role[type]}
                run={() => task.runOnce()}>
                <Validator
                    component={Select}
                    validate={() => {}}
                    class="category-select form-field"
                    value={task.parameters.role}
                    onChange={role => task.update({ role })}
                    items={roles && Object.values(roles).map(({
                        id,
                        name,
                    }) => ({
                        value: id,
                        label: name,
                    }))} />
                <p class="add-role-description">
                    {locale.role.description}
                </p>
                <Validator
                    component={date.editor}
                    class="form-field text-field"
                    label={locale.role.durationFrom}
                    value={task.parameters.durationFrom}
                    onChange={date => task.update({ durationFrom: date })}
                    validate={value => {
                        if (!value) return;
                        if (!Number.isFinite(new Date(value).getDate())) {
                            throw { error: locale.role.notADate };
                        }
                    }} />
                <Validator
                    component={date.editor}
                    class="form-field text-field"
                    label={locale.role.durationTo}
                    value={task.parameters.durationTo}
                    onChange={date => task.update({ durationTo: date })}
                    validate={value => {
                        if (!value) return;
                        if (!Number.isFinite(new Date(value).getDate())) {
                            throw { error: locale.role.notADate };
                        }
                    }} />
            </TaskDialog>
        );
    });
}
