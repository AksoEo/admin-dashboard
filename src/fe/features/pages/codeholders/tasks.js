import { h } from 'preact';
import { useEffect, PureComponent } from 'preact/compat';
import { Checkbox, CircularProgress, TextField } from 'yamdl';
import TaskDialog from '../../../components/task-dialog';
import SavePerms from '../administration/perms-editor/save';
import { UEACode } from '@tejo/akso-client';
import Segmented from '../../../components/segmented';
import Select from '../../../components/select';
import ChangedFields from '../../../components/changed-fields';
import CodeholderPicker from '../../../components/codeholder-picker';
import DynamicHeightDiv from '../../../components/dynamic-height-div';
import LimitedTextField from '../../../components/limited-text-field';
import { Field, Validator } from '../../../components/form';
import { country, ueaCode, date } from '../../../components/data';
import { createDialog, updateDialog, deleteDialog } from '../../../components/task-templates';
import { connect } from '../../../core/connection';
import { routerContext } from '../../../router';
import {
    codeholders as locale,
    data as dataLocale,
    detail as detailLocale,
    codeholderChgReqs as chgReqLocale,
    delegations as delegationsLocale,
} from '../../../locale';
import { FIELDS as DELEGATION_FIELDS } from '../delegations/delegates/fields';
import { FileThumbnail, FileSize, Mime } from '../../../components/files';
import './style';

export default {
    create ({ open, task }) {
        let nameFields = [];
        let nameFieldsAfter = [];
        if (task.parameters.type === 'human') {
            nameFields = [
                'firstLegal',
                'lastLegal',
                'first',
                'last',
            ];
            nameFieldsAfter = ['honorific'];
        } else if (task.parameters.type === 'org') nameFields = ['full', 'local', 'abbrev'];

        useEffect(() => {
            if (!task.parameters.type) {
                task.update({ type: 'human' });
            }
        });

        const renderNameField = (field, isOptional) => (
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
        );

        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        sheet
                        title={locale.create}
                        fullScreen={width => width <= 420}
                        class="codeholders-task-create"
                        open={open}
                        onClose={() => task.drop()}
                        actionLabel={locale.createAction}
                        run={() => task.runOnce().then(id => {
                            routerContext.navigate(`/membroj/${id}`);
                        })}>
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
                        <DynamicHeightDiv useFirstHeight>
                            {nameFields.map((field, isOptional) => (
                                // we assume only the first field is required, so !!index == isOptional
                                renderNameField(field, isOptional)
                            ))}
                        </DynamicHeightDiv>
                        <Validator
                            component={ueaCode.editor}
                            class="form-field text-field"
                            outline
                            value={(task.parameters.code || {}).new}
                            required
                            suggestionParameters={task.parameters}
                            onChange={newCode => task.update({ code: { new: newCode } })}
                            disabled={task.running}
                            id={-1} // pass nonsense id to just check if it’s taken
                            validate={value => {
                                if (!UEACode.validate(value) || (new UEACode(value)).type !== 'new') {
                                    throw { error: locale.invalidUEACode };
                                }
                            }} />
                        <DynamicHeightDiv useFirstHeight>
                            {nameFieldsAfter.map(field => renderNameField(field, true))}
                        </DynamicHeightDiv>
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },
    update ({ open, task }) {
        const changedFields = task.options._changedFields || [];

        return (
            <TaskDialog
                title={detailLocale.saveTitle}
                run={() => task.runOnce()}
                actionLabel={detailLocale.commit}
                class="codeholders-task-update"
                open={open}
                onClose={() => task.drop()}>
                <ChangedFields changedFields={changedFields} locale={locale.fields} />
                <Field>
                    <TextField
                        outline
                        class="update-comment"
                        label={detailLocale.updateComment}
                        value={task.parameters.updateComment || ''}
                        onChange={e => task.update({ updateComment: e.target.value })} />
                </Field>
            </TaskDialog>
        );
    },
    delete ({ open, task }) {
        return (
            <TaskDialog
                class="codeholders-task-delete"
                run={() => task.runOnce()}
                actionLabel={locale.delete}
                open={open}
                onClose={() => task.drop()}>
                {locale.deleteDescription}
            </TaskDialog>
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

        const canutoId = `canuto-${Math.random().toString(36)}`;

        return (
            <TaskDialog
                sheet
                class="codeholders-task-add-membership"
                open={open}
                title={locale.addMembership}
                onClose={() => task.drop()}
                actionLabel={locale.membership.add}
                run={() => task.runOnce()}>
                <Validator
                    component={Select}
                    outline
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
                    outline
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
                <div class="canuto-field">
                    <Checkbox
                        id={canutoId}
                        checked={task.parameters.canuto}
                        onChange={canuto => task.update({ canuto })} />
                    <label for={canutoId}>
                        {locale.membership.useCanuto}
                    </label>
                </div>
            </TaskDialog>
        );
    }),
    addRole: makeRoleEditor('add'),
    updateRole: makeRoleEditor('update'),

    setPermissions ({ open, core, task }) {
        return (
            <SavePerms
                open={open}
                core={core}
                task={task}
                pxTask="codeholders/setPermissionsPX"
                mrTask="codeholders/setPermissionsMR" />
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

    uploadFile ({ open, task }) {
        return (
            <TaskDialog
                sheet
                class="codeholders-task-upload-file"
                open={open}
                onClose={() => task.drop()}
                title={locale.uploadFile}
                actionLabel={locale.uploadThisFile}
                run={() => task.runOnce()}>
                <div class="file-preview">
                    <FileThumbnail file={task.parameters.file} />
                    <div class="file-preview-details">
                        <div>
                            <Mime mime={task.parameters.file.type} />
                        </div>
                        <div>
                            <FileSize bytes={task.parameters.file.size} />
                        </div>
                    </div>
                </div>
                <Validator
                    component={TextField}
                    validate={value => {
                        if (!value) {
                            throw { error: dataLocale.requiredField };
                        }
                    }}
                    label={locale.fileName}
                    maxLength={50}
                    value={task.parameters.name}
                    disabled={task.running}
                    onChange={e => task.update({ name: e.target.value })} />
                <Validator
                    component={TextField}
                    validate={() => {}}
                    label={locale.fileDescription}
                    maxLength={300}
                    value={task.parameters.description}
                    disabled={task.running}
                    onChange={e => task.update({ description: e.target.value })} />
            </TaskDialog>
        );
    },
    deleteFile ({ open, task }) {
        if (task.options._noGUI) return null;

        return (
            <TaskDialog
                class="codeholders-task-delete-file"
                open={open}
                onClose={() => task.drop()}
                title={locale.deleteFile}
                actionLabel={locale.delete}
                run={() => task.runOnce()}>
                {dataLocale.deleteDescription}
            </TaskDialog>
        );
    },

    createAddrLabelPreset ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.addrLabelGen.presets.create.title}
                actionLabel={locale.addrLabelGen.presets.create.button}
                run={() => task.runOnce()}>
                <Field>
                    <Validator
                        component={TextField}
                        value={task.parameters.name}
                        onChange={e => task.update({ name: e.target.value })}
                        validate={value => {
                            if (!value) throw { error: dataLocale.requiredField };
                        }}
                        outline
                        label={locale.addrLabelGen.presets.name} />
                </Field>
            </TaskDialog>
        );
    },
    updateAddrLabelPreset ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.addrLabelGen.presets.update.title}
                actionLabel={locale.addrLabelGen.presets.update.button}
                run={() => task.runOnce()}>
                <Field>
                    <Validator
                        component={TextField}
                        value={task.parameters.name}
                        onChange={e => task.update({ name: e.target.value })}
                        validate={value => {
                            if (!value) throw { error: dataLocale.requiredField };
                        }}
                        outline
                        label={locale.addrLabelGen.presets.name} />
                </Field>
            </TaskDialog>
        );
    },

    sendNotifTemplate ({ open, core, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.notifTemplates.send.title}
                actionLabel={locale.notifTemplates.send.confirm}
                run={() => task.runOnce()}>
                <NotifTemplateMessage
                    core={core}
                    options={task.options} />
            </TaskDialog>
        );
    },

    updateChangeRequest: updateDialog({ locale: chgReqLocale.update, fields: chgReqLocale.fields }),
    setDelegations: updateDialog({ locale: delegationsLocale.update, fields: delegationsLocale.fields }),
    createDelegations: createDialog({
        locale: delegationsLocale,
        fieldNames: ['org', 'codeholderId', 'cities', 'countries', 'subjects', 'hosting', 'tos'],
        fields: DELEGATION_FIELDS,
        onCompletion: (task, routerContext) => routerContext.navigate(`/delegitoj/${task.parameters.codeholderId}/${task.parameters.org}`),
    }),
    deleteDelegations: deleteDialog({ locale: delegationsLocale.delete }),
};

class NotifTemplateMessage extends PureComponent {
    state = {
        total: null,
        loading: false,
    };

    load () {
        this.setState({ loading: true });

        const notifFilter = { email: { $neq: null } };

        const options = { ...this.props.options };
        const jsonFilter = { ...(options.jsonFilter && options.jsonFilter.filter || {}) };
        options.jsonFilter = {
            filter: options.jsonFilter && !options.jsonFilter._disabled
                ? { $and: [jsonFilter, notifFilter] }
                : notifFilter,
        };

        this.props.core.createTask('codeholders/list', {}, {
            ...options,
            fields: [],
            offset: 0,
            limit: 1,
            skipCursed: true,
        }).runOnceAndDrop().then(res => {
            this.setState({ loading: false, total: res.total });
        }).catch(err => {
            console.error('Could not fetch count for sendNotifTemplate', err); // eslint-disable-line no-console
            this.setState({ loading: false });
        });
    }

    componentDidMount () {
        this.load();
    }

    render (_, { total, loading }) {
        let contents = null;
        if (loading) {
            contents = [
                <CircularProgress key={0} small indeterminate />,
                <span key={1}> {locale.notifTemplates.send.messagePostIndeterminate}</span>,
            ];
        } else if (total !== null) {
            contents = locale.notifTemplates.send.messagePost(total);
        } else {
            contents = locale.notifTemplates.send.messagePostUnknown;
        }

        return (
            <div>
                {locale.notifTemplates.send.messagePre}
                {' '}
                {contents}
            </div>
        );
    }
}

function makeRoleEditor (type) {
    return connect('roles/roles')(roles => ({ roles }))(function ({ open, task, roles }) {
        useEffect(() => {
            if (roles && !('role' in task.parameters)) {
                task.update({ role: Object.values(roles)[0].id });
            }
        });

        return (
            <TaskDialog
                sheet
                class="codeholders-task-add-role"
                open={open}
                title={locale[type + 'Role']}
                onClose={() => task.drop()}
                actionLabel={locale.role[type]}
                run={() => task.runOnce()}>
                <Validator
                    component={Select}
                    outline
                    validate={() => {}}
                    class="category-select form-field"
                    value={task.parameters.role}
                    onChange={role => task.update({ role })}
                    items={roles && Object.values(roles).sort((a, b) => a.name.localeCompare(b.name)).map(({
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
                    outline
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
                    outline
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
                <div class="additional-options">
                    <div class="opt-item">
                        <label>{locale.role.dataCountry}</label>
                        <country.editor
                            outline
                            value={task.parameters.dataCountry}
                            onChange={dataCountry => task.update({ dataCountry })}/>
                    </div>
                    <div class="opt-item">
                        <label>{locale.role.dataOrg}</label>
                        <CodeholderPicker
                            limit={1}
                            jsonFilter={{ codeholderType: 'org' }}
                            value={task.parameters.dataOrg ? ['' + task.parameters.dataOrg] : []}
                            onChange={v => task.update({ dataOrg: +v[0] || null })} />
                    </div>
                    <div class="opt-item">
                        <label>{locale.role.dataString}</label>
                        <LimitedTextField
                            outline
                            value={task.parameters.dataString}
                            onChange={e => task.update({ dataString: e.target.value || null })}
                            maxLength={50} />
                    </div>
                </div>
            </TaskDialog>
        );
    });
}
