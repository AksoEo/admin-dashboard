import { h } from 'preact';
import { useState } from 'preact/compat';
import { TextField } from '@cpsdqs/yamdl';
import TaskDialog from '../../../components/task-dialog';
import Segmented from '../../../components/segmented';
import Select from '../../../components/select';
import ChangedFields from '../../../components/changed-fields';
import DynamicHeightDiv from '../../../components/dynamic-height-div';
import { currencyAmount } from '../../../components/data';
import { Validator, Field } from '../../../components/form';
import { connectPerms } from '../../../perms';
import { routerContext } from '../../../router';
import {
    paymentOrgs as orgLocale,
    paymentAddons as addonLocale,
    paymentMethods as methodLocale,
    paymentIntents as intentLocale,
    data as dataLocale,
    currencies,
} from '../../../locale';
import { CREATION_FIELDS as methodFields } from './orgs/methods/fields';
import MethodPicker from './method-picker';
import PurposesPicker from './purposes-picker';
import './tasks.less';

export default {
    createOrg: connectPerms(({ perms, open, task }) => {
        let orgSelector;

        const hasTejo = perms.hasPerm('pay.payment_orgs.create.tejo');
        const hasUea = perms.hasPerm('pay.payment_orgs.create.uea');

        if (hasTejo && hasUea) {
            orgSelector = (
                <Validator
                    component={Segmented}
                    value={task.parameters.org}
                    validate={value => {
                        if (!value) throw {};
                    }}
                    selected={task.parameters.org}
                    onSelect={org => task.update({ org })}>
                    {Object.entries(orgLocale.create.orgs).map(([k, v]) => ({ id: k, label: v }))}
                </Validator>
            );
        } else if (!task.parameters.org) {
            task.update({ org: hasTejo ? 'tejo' : 'uea' });
        }

        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={orgLocale.create.title}
                        actionLabel={orgLocale.create.button}
                        run={() => task.runOnce().then(id => {
                            routerContext.navigate(`/aksopago/organizoj/${id}`);
                        })}>
                        {orgSelector}
                        <Field>
                            <Validator
                                component={TextField}
                                validate={value => {
                                    if (!value) throw { error: orgLocale.update.nameRequired };
                                }}
                                label={orgLocale.fields.name}
                                value={task.parameters.name || ''}
                                onChange={e => task.update({ name: e.target.value })} />
                        </Field>
                        <Field>
                            <TextField
                                label={orgLocale.fields.description}
                                value={task.parameters.description || ''}
                                onChange={e => task.update({ description: e.target.value || null })} />
                        </Field>
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    }),

    createAddon ({ open, task }) {
        const org = task.options.org;

        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={addonLocale.create.title}
                        actionLabel={addonLocale.create.button}
                        run={() => task.runOnce().then(id => {
                            routerContext.navigate(`/aksopago/organizoj/${org}/aldonebloj/${id}`);
                        })}>
                        <Field>
                            <Validator
                                component={TextField}
                                validate={value => {
                                    if (!value) throw { error: addonLocale.update.nameRequired };
                                }}
                                label={addonLocale.fields.name}
                                value={task.parameters.name || ''}
                                onChange={e => task.update({ name: e.target.value })} />
                        </Field>
                        <Field>
                            <TextField
                                label={addonLocale.fields.description}
                                value={task.parameters.description || ''}
                                onChange={e => task.update({ description: e.target.value || null })} />
                        </Field>
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },

    createMethod ({ open, task }) {
        const org = task.options.org;

        const item = task.parameters;
        const fields = [];
        for (const f in methodFields) {
            const field = methodFields[f];
            if (field.shouldHide && field.shouldHide(item, true)) continue;
            const Component = field.component;

            fields.push(
                <Field key={f}>
                    {field.wantsCreationLabel ? (
                        <label class="creation-label">
                            {methodLocale.fields[f]}
                        </label>
                    ) : null}
                    <Component
                        value={item[f]}
                        editing={true}
                        onChange={value => task.update({ [f]: value })}
                        item={item}
                        isCreation={true}
                        onItemChange={value => task.update(value)} />
                </Field>
            );
        }

        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        class="payment-method-task-create"
                        open={open}
                        fullScreen={width => width < 400}
                        onClose={() => task.drop()}
                        title={methodLocale.create.title}
                        actionLabel={methodLocale.create.button}
                        run={() => task.runOnce().then(id => {
                            routerContext.navigate(`/aksopago/organizoj/${org}/metodoj/${id}`);
                        })}>
                        <DynamicHeightDiv useFirstHeight>
                            {fields}
                        </DynamicHeightDiv>
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },

    createIntent ({ open, core, task }) {
        const fields = [];

        const customer = task.parameters.customer || {};
        const method = task.parameters.method || {};
        const [availableCurrencies, setCurrencies] = useState([]);

        const [shouldImmediatelySubmit, setShouldImmediatelySubmit] = useState(false);

        fields.push(
            <div key="customer" class="create-intent-subtitle">
                {intentLocale.fields.customer}
            </div>
        );

        fields.push(
            <Field key="customer.name">
                <Validator
                    component={TextField}
                    validate={value => {
                        if (!value) throw { error: dataLocale.requiredField };
                    }}
                    outline
                    required
                    label={intentLocale.fields.customerName}
                    value={customer.name}
                    onChange={e => task.update({ customer: { ...customer, name: e.target.value } })} />
            </Field>
        );
        fields.push(
            <Field key="customer.email">
                <Validator
                    component={TextField}
                    type="email"
                    required
                    validate={value => {
                        if (!value) throw { error: dataLocale.requiredField };
                    }}
                    outline
                    label={intentLocale.fields.customerEmail}
                    value={customer.email}
                    onChange={e => task.update({ customer: { ...customer, email: e.target.value } })} />
            </Field>
        );

        fields.push(
            <div key="cnotes-title" class="create-intent-subtitle">
                {intentLocale.fields.customerNotes}
            </div>
        );
        fields.push(
            <Field>
                <textarea
                    class="notes-field"
                    value={task.parameters.customerNotes || ''}
                    onChange={e => task.update({ customerNotes: e.target.value || null })} />
            </Field>
        );
        fields.push(
            <div key="notes-title" class="create-intent-subtitle">
                {intentLocale.fields.internalNotes}
            </div>
        );
        fields.push(
            <Field>
                <textarea
                    class="notes-field"
                    value={task.parameters.internalNotes || ''}
                    onChange={e => task.update({ internalNotes: e.target.value || null })} />
            </Field>
        );

        /*
        fields.push(
            <div key="state-title" class="create-intent-subtitle">
                {intentLocale.fields.status}
            </div>
        );
        fields.push(
            <Field>
                <Select
                    class="status-select"
                    value={task.parameters.status || 'pending'}
                    onChange={status => task.update({ status })}
                    items={Object.keys(intentLocale.filters.statuses).filter(x => x)
                        .map(i => ({ value: i, label: intentLocale.filters.statuses[i] }))} />
            </Field>
        );
        */

        fields.push(
            <div key="method-title" class="create-intent-subtitle">
                {intentLocale.create.paymentMethod}
            </div>
        );

        fields.push(
            <Field key="method">
                <MethodPicker
                    onGetCurrencies={setCurrencies}
                    org={task.parameters.paymentOrg}
                    onOrgChange={paymentOrg => {
                        // clear all addons because they're org-specific
                        const purposes = (task.parameters.purposes || [])
                            .filter(purpose => purpose.type !== 'addon');
                        task.update({ paymentOrg, purposes });
                    }}
                    value={method.id}
                    onChange={id => {
                        if (id) task.update({ method: { id } });
                        else task.update({ method: null, currency: null });
                    }}
                    onItemData={data => {
                        if (data) setShouldImmediatelySubmit(data.type === 'manual');
                    }} />
            </Field>
        );

        if (method.id) {
            fields.push(
                <div key="currency-title" class="create-intent-subtitle">
                    {intentLocale.fields.currency}
                </div>
            );
            fields.push(
                <Field key="currency">
                    <Select
                        class="currency-select"
                        value={task.parameters.currency || ''}
                        onChange={currency => task.update({ currency })}
                        items={[!task.parameters.currency && {
                            value: '',
                            label: intentLocale.create.noCurrencySelected,
                            disabled: true,
                        }].filter(x => x).concat(Object.keys(currencies)
                            .filter(x => availableCurrencies.includes(x))
                            .map(c => ({ value: c, label: currencies[c] })))} />
                </Field>
            );
        }

        if (task.parameters.currency) {
            fields.push(
                <div key="purposes-title" class="create-intent-subtitle">
                    {intentLocale.create.purposes}
                </div>
            );
            fields.push(
                <Field key="purposes">
                    <PurposesPicker
                        org={task.parameters.paymentOrg}
                        currency={task.parameters.currency}
                        value={task.parameters.purposes || []}
                        onChange={purposes => task.update({ purposes })} />
                </Field>
            );
        }
        const ready = task.parameters.currency && task.parameters.purposes && task.parameters.purposes.length;

        let total = 0;
        if (task.parameters.purposes) {
            total = task.parameters.purposes.map(p => p.amount).reduce((a, b) => a + b, 0);
        }

        if (ready) {
            fields.push(
                <div key="total" class="create-intent-total">
                    <div>
                        {intentLocale.create.total}
                        {' '}
                        <currencyAmount.renderer value={total} currency={task.parameters.currency} />
                    </div>
                    <div class="total-note">
                        {intentLocale.create.totalNote}
                    </div>
                </div>
            );
        }

        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        class="payments-task-create-intent"
                        open={open}
                        fullScreen={width => width < 400}
                        onClose={() => task.drop()}
                        title={intentLocale.create.title}
                        actionLabel={!!ready && intentLocale.create.button}
                        run={() => task.runOnce().then(id => {
                            routerContext.navigate(`/aksopago/pagoj/${id}`);
                            // immediately submit
                            if (shouldImmediatelySubmit) {
                                core.createTask('payments/submitIntent', { id }).run();
                            }
                        })}>
                        <DynamicHeightDiv useFirstHeight>
                            {fields}
                        </DynamicHeightDiv>
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },

    updateOrg ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={orgLocale.update.title}
                actionLabel={orgLocale.update.button}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields}
                    locale={orgLocale.fields} />
            </TaskDialog>
        );
    },

    updateAddon ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={addonLocale.update.title}
                actionLabel={addonLocale.update.button}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields}
                    locale={addonLocale.fields} />
            </TaskDialog>
        );
    },

    updateMethod ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={methodLocale.update.title}
                actionLabel={methodLocale.update.button}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields}
                    locale={methodLocale.fields} />
            </TaskDialog>
        );
    },

    updateIntent ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={intentLocale.update.title}
                actionLabel={intentLocale.update.button}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields}
                    locale={intentLocale.fields} />
            </TaskDialog>
        );
    },

    deleteOrg ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={orgLocale.delete.title}
                actionLabel={orgLocale.delete.button}
                run={() => task.runOnce()}>
                {orgLocale.delete.description}
            </TaskDialog>
        );
    },
    deleteAddon ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={addonLocale.delete.title}
                actionLabel={addonLocale.delete.button}
                run={() => task.runOnce()}>
                {addonLocale.delete.description}
            </TaskDialog>
        );
    },
    deleteMethod ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={methodLocale.delete.title}
                actionLabel={methodLocale.delete.button}
                run={() => task.runOnce()}>
                {methodLocale.delete.description}
            </TaskDialog>
        );
    },

    cancelIntent ({ open, task }) {
        return (
            <TaskDialog
                class="payments-task-intent-action"
                open={open}
                onClose={() => task.drop()}
                title={intentLocale.actions.cancel.title}
                actionLabel={intentLocale.actions.cancel.button}
                run={() => task.runOnce()}>
                {intentLocale.actions.cancel.description}
            </TaskDialog>
        );
    },
    markIntentDisputed ({ open, task }) {
        return (
            <TaskDialog
                class="payments-task-intent-action"
                open={open}
                onClose={() => task.drop()}
                title={intentLocale.actions.markDisputed.title}
                actionLabel={intentLocale.actions.markDisputed.button}
                run={() => task.runOnce()}>
                {intentLocale.actions.markDisputed.description}
            </TaskDialog>
        );
    },
    markIntentRefunded ({ open, task }) {
        return (
            <TaskDialog
                class="payments-task-intent-action"
                open={open}
                onClose={() => task.drop()}
                title={intentLocale.actions.markRefunded.title}
                actionLabel={intentLocale.actions.markRefunded.button}
                run={() => task.runOnce()}>
                <div>
                    {intentLocale.actions.markRefunded.description}
                </div>

                <Field class="task-refund-amount-container">
                    <Validator
                        component={currencyAmount.editor}
                        outline
                        validate={value => {
                            if (value < 0) throw { error: intentLocale.actions.markRefunded.lowerBound };
                            if (value > task.options._max) {
                                throw { error: intentLocale.actions.markRefunded.upperBound };
                            }
                        }}
                        label={intentLocale.actions.markRefunded.amount}
                        value={task.parameters.amount}
                        onChange={amount => task.update({ amount })}
                        currency={task.options._currency} />
                </Field>
            </TaskDialog>
        );
    },
    _stripeDispute ({ open, task }) {
        return (
            <TaskDialog
                class="payments-task-intent-action"
                open={open}
                onClose={() => task.drop()}
                title={intentLocale.actions.markDisputed.stripeTitle}
                actionLabel={intentLocale.actions.markDisputed.stripeButton}
                run={() => {
                    task.drop();
                    const a = document.createElement('a');
                    a.href = intentLocale.stripeIntentLink(task.options.id);
                    a.rel = 'noopener noreferrer';
                    a.target = '_blank';
                    a.click();
                }}>
                {intentLocale.actions.markDisputed.stripeDescription}
            </TaskDialog>
        );
    },
    _stripeRefund ({ open, task }) {
        return (
            <TaskDialog
                class="payments-task-intent-action"
                open={open}
                onClose={() => task.drop()}
                title={intentLocale.actions.markRefunded.stripeTitle}
                actionLabel={intentLocale.actions.markRefunded.stripeButton}
                run={() => {
                    task.drop();
                    const a = document.createElement('a');
                    a.href = intentLocale.stripeIntentLink(task.options.id);
                    a.rel = 'noopener noreferrer';
                    a.target = '_blank';
                    a.click();
                }}>
                {intentLocale.actions.markRefunded.stripeDescription}
            </TaskDialog>
        );
    },
    markIntentSucceeded ({ open, task }) {
        return (
            <TaskDialog
                class="payments-task-intent-action"
                open={open}
                onClose={() => task.drop()}
                title={intentLocale.actions.markSucceeded.title}
                actionLabel={intentLocale.actions.markSucceeded.button}
                run={() => task.runOnce()}>
                {intentLocale.actions.markSucceeded.description}
            </TaskDialog>
        );
    },
    submitIntent ({ open, task }) {
        return (
            <TaskDialog
                class="payments-task-intent-action"
                open={open}
                onClose={() => task.drop()}
                title={intentLocale.actions.submit.title}
                running={task.running}
                actionLabel={intentLocale.actions.submit.button}
                run={() => task.runOnce()}>
                {intentLocale.actions.submit.description}
            </TaskDialog>
        );
    },
};
