import { h } from 'preact';
import { Button, TextField } from '@cpsdqs/yamdl';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../../components/page';
import DetailView from '../../../../components/detail';
import TejoIcon from '../../../../components/tejo-icon';
import UeaIcon from '../../../../components/uea-icon';
import StripeIcon from '../../../../components/stripe-icon';
import ProfilePicture from '../../../../components/profile-picture';
import DynamicHeightDiv from '../../../../components/dynamic-height-div';
import CodeholderPicker from '../../../../components/codeholder-picker';
import { Field, Validator } from '../../../../components/form';
import { currencyAmount, email, timestamp } from '../../../../components/data';
import { IdUEACode } from '../../../../components/data/uea-code';
import { FIELDS as METHOD_FIELDS } from '../orgs/methods/fields';
import Meta from '../../../meta';
import { connectPerms } from '../../../../perms';
import { connect, coreContext } from '../../../../core/connection';
import {
    paymentIntents as locale,
    data as dataLocale,
    paymentMethods as methodsLocale,
} from '../../../../locale';
import { LinkButton } from '../../../../router';
import './detail.less';

export default connectPerms(class IntentPage extends Page {
    state = {
        edit: null,
        org: 'meow', // nonsense default value
        status: 'meow', // nonsense default value
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

        this.#commitTask = this.context.createTask('payments/updateIntent', {
            id: this.getId(),
            _changedFields: changedFields,
        }, this.state.edit);
        this.#commitTask.on('success', this.onEndEdit);
        this.#commitTask.on('drop', () => this.#commitTask = null);
    };

    componentWillUnmount () {
        if (this.#commitTask) this.#commitTask.drop();
    }

    getId () {
        return this.props.match[1];
    }

    render ({ perms, editing }, { edit, org, status }) {
        const actions = [];

        const id = this.getId();

        if (status === 'pending' && perms.hasPerm(`pay.payment_intents.update.${org}`)) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
                action: () => this.props.push('redakti', true),
            });
        }

        return (
            <div class="payment-intent-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />

                <DetailView
                    view="payments/intent"
                    id={id}
                    options={{
                        lazyFetch: true,
                        fields: [
                            'customer',
                            'method',
                            'org',
                            'paymentOrg',
                            'currency',
                            'status',
                            'events',
                            'timeCreated',
                            'internalNotes',
                            'customerNotes',
                            'foreignId',
                            'purposes',
                            'totalAmount',
                            'amountRefunded',
                            'stripePaymentIntentId',
                        ],
                    }}
                    header={DetailViewInner}
                    locale={locale}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    onData={data => this.setState({ org: data.org, status: data.status })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    onDelete={() => this.props.pop()} />
            </div>
        );
    }
});

function DetailViewInner ({ item, editing, onItemChange }) {
    const {
        status,
        totalAmount,
        amountRefunded,
        currency,
        purposes,
        org,
        paymentOrg,
    } = item;

    let orgIcon = null;
    if (org === 'tejo') orgIcon = <TejoIcon class="payment-org-icon" />;
    else if (org === 'uea') orgIcon = <UeaIcon class="payment-org-icon" />;

    const currentAmount = totalAmount - amountRefunded;

    let methodType = null;
    if (item.method) {
        if (item.method.type === 'stripe') {
            const link = locale.stripeIntentLink(item.stripePaymentIntentId);
            methodType = (
                <a class="method-stripe" target="_blank" rel="noopener noreferrer nofollow" href={link}>
                    {locale.openInStripePrefix}
                    {' '}
                    <StripeIcon />™
                </a>
            );
        } else {
            methodType = <span class="method-manual">{methodsLocale.fields.types.manual}</span>;
        }
    }

    return (
        <div class="payment-intent-inner">
            <div class="intent-status">
                <div class={`intent-state is-${status}`}>
                    {locale.fields.statuses[status]}
                </div>
                <div class="intent-method-type">
                    {methodType}
                </div>
            </div>
            <div class="intent-amount">
                <span class="intent-amount-inner">
                    {amountRefunded ? (
                        <span class="original-amount">
                            <currencyAmount.renderer value={totalAmount} currency={currency} />
                        </span>
                    ) : null}
                    <currencyAmount.renderer value={currentAmount} currency={currency} />
                </span>
                <span class="intent-amount-to">
                    <span>{locale.detailTo}</span>
                    {' '}
                    <span class="intent-payment-org">
                        {orgIcon}
                        {' '}
                        {!!paymentOrg && <PaymentOrgName id={paymentOrg} />}
                    </span>
                </span>
            </div>
            {amountRefunded ? (
                <div class="refund-status">
                    <currencyAmount.renderer value={amountRefunded} currency={currency} />
                    {' '}
                    {locale.detailRefundSuffix}
                </div>
            ) : null}
            <DynamicHeightDiv useFirstHeight>
                {!editing && (
                    <div class="intent-purposes">
                        {(purposes || [])
                            .map((purpose, i) => <Purpose key={i} purpose={purpose} item={item} />)}
                    </div>
                )}
                {!editing && <IntentActions item={item} />}
            </DynamicHeightDiv>
            <div class="intent-customer-container">
                <div class="intent-section-title">{locale.fields.customer}</div>
                <Customer item={item} editing={editing} onItemChange={onItemChange} />
            </div>
            <div class="intent-method-container">
                <div class="intent-section-title">{locale.fields.method}</div>
                <Method method={item.method} item={item} editing={editing} onItemChange={onItemChange} />
            </div>
            <DynamicHeightDiv useFirstHeight>
                {!editing && (
                    <div class="intent-events-container">
                        <div class="intent-section-title">{locale.fields.events}</div>
                        <Events item={item} />
                    </div>
                )}
            </DynamicHeightDiv>
            <NotesField item={item} editing={editing} onItemChange={onItemChange} field="internalNotes" />
            <NotesField item={item} editing={editing} onItemChange={onItemChange} field="customerNotes" />
        </div>
    );
}

const PaymentOrgName = connect(({ id }) => ['payments/org', {
    id,
}], ['id'])()(function PaymentOrgName ({ name }) {
    return name;
});

function Purpose ({ purpose, item }) {
    let title = '';
    let description = '';

    if (purpose.type === 'trigger' || purpose.type === 'manual') {
        title = purpose.title;
        description = purpose.description;
    } else if (purpose.type === 'addon') {
        title = purpose.paymentAddon.name;
        description = purpose.paymentAddon.description;
    }

    return (
        <div class="intent-split-card">
            <div class="card-id">
                <span class="purpose-type">
                    {locale.fields.purposeTypes[purpose.type]}
                </span>
            </div>
            <div class="card-details">
                <div class="card-title">
                    {title}
                </div>
                <div class="card-description">
                    {description}
                </div>
            </div>
            <div class="card-after">
                <div class="purpose-amount">
                    <currencyAmount.renderer value={purpose.amount} currency={item.currency} />
                </div>
            </div>
        </div>
    );
}

const ACTIONS = {
    cancel: {
        state: 'canceled',
        enabled: (t, s) => s === 'pending' || s === 'submitted' || (t === 'manual' && s === 'disputed'),
        task: id => ['payments/cancelIntent', { id }],
    },
    markDisputed: {
        state: 'disputed',
        enabled: (t, s) => t === 'manual' && (s === 'submitted' || s === 'succeeded'),
        manualOnly: true,
        task: id => ['payments/markIntentDisputed', { id }],
    },
    submit: {
        state: 'submitted',
        enabled: (t, s) => t === 'manual' && s === 'pending',
        manualOnly: true,
        task: id => ['payments/submitIntent', { id }],
    },
    markSucceeded: {
        state: 'succeeded',
        enabled: (t, s) => t === 'manual' && s === 'submitted',
        manualOnly: true,
        task: id => ['payments/markIntentSucceeded', { id }],
    },
    markRefunded: {
        state: 'refunded',
        manualOnly: true,
        enabled: (t, s) => t === 'manual'
            && ['pending', 'submitted', 'canceled', 'succeeded', 'refunded', 'disputed'].includes(s),
        task: (id, item) => ['payments/markIntentRefunded', {
            id,
            _currency: item.currency,
            _max: item.totalAmount,
        }, {
            amount: item.amountRefunded ? item.amountRefunded : item.totalAmount,
        }],
    },
};

function IntentActions ({ item }) {
    return (
        <coreContext.Consumer>{core => {
            const actions = [];

            const id = item.id;
            const t = item.method && item.method.type;
            const s = item.status;

            for (const k in ACTIONS) {
                const isRefund = k === 'markRefunded';
                let enabled = ACTIONS[k].enabled(t, s);
                let whyNot = null;
                let whyNotBecauseStripe = false;
                if (!enabled) {
                    const tur = locale.transitionUnavailabilityReasons;
                    {
                        const turState = tur[s];
                        if (typeof turState === 'string') whyNot = turState;
                        else {
                            const subState = turState[ACTIONS[k].state];
                            if (typeof subState === 'string') whyNot = subState;
                            else whyNot = subState[t];
                        }
                    }

                    if (!whyNot && t === 'stripe' && ACTIONS[k].manualOnly) {
                        whyNot = tur.stripe;
                        whyNotBecauseStripe = true;
                    }
                }
                let task = ACTIONS[k].task(id, item);
                if (isRefund && !enabled && whyNotBecauseStripe) {
                    // stripe
                    enabled = true;
                    whyNot = null;
                    task = ['payments/_stripeRefund', { id: item.stripePaymentIntentId }];
                }
                actions.push(
                    <Button
                        disabled={!enabled}
                        title={whyNot}
                        key={k}
                        onClick={() => core.createTask(...task)}>
                        {locale.actions[k].title}
                    </Button>
                );
            }

            return (
                <div class="intent-actions-container">
                    {actions}
                </div>
            );
        }}</coreContext.Consumer>
    );
}

function Customer ({ item, editing, onItemChange }) {
    let profilePictureHash;
    let profilePictureId;
    let isCodeholder = false;
    let codeholderLink;
    let customerName;
    let customerEmail;
    let ueaCode;

    if (editing && item.customer) {
        const onCustomerChange = customer => onItemChange({ ...item, customer });

        customerName = (
            <Field>
                <Validator
                    label={locale.fields.customerName}
                    component={TextField}
                    validate={value => {
                        if (!value) throw { error: dataLocale.requiredField };
                    }}
                    value={item.customer.name}
                    onChange={e => onCustomerChange({ ...item.customer, name: e.target.value })} />
            </Field>
        );
        customerEmail = (
            <Validator
                label={locale.fields.customerEmail}
                component={TextField}
                type="email"
                validate={value => {
                    if (!value) throw { error: dataLocale.requiredField };
                }}
                value={item.customer.email}
                onChange={e => onCustomerChange({ ...item.customer, email: e.target.value })} />
        );
        codeholderLink = (
            <CodeholderPicker
                value={item.customer.id ? [item.customer.id] : []}
                onChange={([id]) => onCustomerChange({
                    ...item.customer,
                    id: id || null,
                })}
                limit={1} />
        );
    } else if (item.customer) {
        if (item.customer.id !== null) {
            isCodeholder = true;
            profilePictureId = item.customer.id;
            codeholderLink = `/membroj/${item.customer.id}`;
            // TODO: use actual hash
            profilePictureHash = `fake_hash_for_${item.customer.id}`;
            ueaCode = <IdUEACode id={item.customer.id} />;
        } else {
            profilePictureId = item.customer.email;
        }

        customerName = item.customer.name;
        customerEmail = item.customer.email;
    }

    return (
        <div class="intent-split-card">
            {!editing && (
                <div class="card-id">
                    <div class="customer-picture">
                        <ProfilePicture
                            id={profilePictureId}
                            profilePictureHash={profilePictureHash} />
                    </div>
                </div>
            )}
            <div class="card-details">
                <div class="card-title">
                    {customerName}
                </div>
                {editing ? (
                    <div class="card-description">
                        {customerEmail}
                    </div>
                ) : (
                    <div class="card-description">
                        {ueaCode}
                        {ueaCode ? ' ' : ''}
                        <email.renderer value={customerEmail} />
                    </div>
                )}
            </div>
            <div class="card-after">
                {editing ? (
                    codeholderLink
                ) : isCodeholder ? (
                    <LinkButton
                        class="customer-codeholder-link"
                        target={codeholderLink}>
                        {locale.detailViewCodeholder}
                    </LinkButton>
                ) : (
                    <div class="customer-no-codeholder">
                        {locale.detailNoCodeholder}
                    </div>
                )}
            </div>
        </div>
    );
}

function Method ({ method, item, editing, onItemChange }) {
    if (!method) return null;

    const fields = (
        <div class="method-fields">
            <div class="method-field">
                <div class="field-name">{methodsLocale.fields.currencies}</div>
                <METHOD_FIELDS.currencies.component item={method} value={method.currencies} />
            </div>
            {method.type === 'stripe' ? (
                <div class="method-field">
                    <div class="field-name">{methodsLocale.fields.stripeMethods}</div>
                    <METHOD_FIELDS.stripeMethods.component item={method} value={method.stripeMethods} />
                </div>
            ) : null}
            <div class="method-field">
                <div class="field-name">{methodsLocale.fields.paymentValidity}</div>
                <METHOD_FIELDS.paymentValidity.component item={method} value={method.paymentValidity} />
            </div>
            {method.internalDescription && (
                <div class="method-field">
                    <div class="field-name">{methodsLocale.fields.internalDescription}</div>
                    <METHOD_FIELDS.internalDescription.component item={method} value={method.internalDescription} />
                </div>
            )}
            {method.description && (
                <div class="method-field">
                    <div class="field-name">{methodsLocale.fields.description}</div>
                    <METHOD_FIELDS.description.component item={method} value={method.description} />
                </div>
            )}
        </div>
    );

    const foreignId = (editing || item.foreignId) && (
        <div class="foreign-id">
            <div class="intent-section-title">{locale.fields.foreignId}</div>
            {editing ? (
                <TextField
                    class="fid-inner"
                    value={item.foreignId}
                    onChange={e => onItemChange({ ...item, foreignId: e.target.value })} />
            ) : (
                <div class="fid-inner">
                    {item.foreignId}
                </div>
            )}
        </div>
    );

    return (
        <div class="intent-card intent-method">
            <div class="method-title">
                <span class="method-type">
                    {method.type === 'stripe' ? (
                        <span><StripeIcon class="stripe-icon" />™</span>
                    ) : <span class="type-badge">{methodsLocale.fields.types.manual}</span>}
                </span>

                <span class="method-name">{method.name}</span>
            </div>
            <DynamicHeightDiv useFirstHeight>
                {!editing && fields}
            </DynamicHeightDiv>

            {foreignId}
        </div>
    );
}

function Events ({ item }) {
    const rawEvents = [];
    if (item.timeCreated) {
        rawEvents.push({ status: 'created', time: item.timeCreated });
    }
    if (item.events) {
        rawEvents.push(...item.events);
    }
    rawEvents.reverse();

    let abandonment = null;
    if (item.status === 'pending' && item.method && item.method.paymentValidity !== null) {
        // calculate abandonment time
        const statusTime = rawEvents[0].time;
        const abandonmentTime = statusTime + item.method.paymentValidity;

        abandonment = (
            <div key="abandonment" class="intent-event is-abandonment">
                <div class="event-line-container">
                    <span class="event-line-a"></span>
                    <span class="event-line-b"></span>
                    <span class="event-line-c">
                        <span class="elc-a"></span>
                        <span class="elc-b"></span>
                        <span class="elc-c"></span>
                        <span class="elc-d"></span>
                        <span class="elc-e"></span>
                    </span>
                </div>
                <div class="event-details">
                    <div class="event-timestamp">
                        <timestamp.renderer value={abandonmentTime * 1000} />
                    </div>
                    <div class="event-title">
                        {locale.fields.statuses.willBeAbandoned}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div class="intent-card">
            {abandonment}
            {rawEvents.map((e, i) => {
                const isFirst = !abandonment && i === 0;
                const isLast = i === rawEvents.length - 1;
                const className = 'intent-event' + (isFirst ? ' is-first' : '') + (isLast ? ' is-last' : '');
                return (
                    <div key={i} class={className}>
                        <div class="event-line-container">
                            <span class="event-line-a"></span>
                            <span class="event-line-b"></span>
                            <span class="event-line-c"></span>
                        </div>
                        <div class="event-details">
                            <div class="event-timestamp">
                                <timestamp.renderer value={e.time * 1000} />
                            </div>
                            <div class="event-title">
                                {locale.fields.statuses[e.status]}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function NotesField ({ item, editing, onItemChange, field }) {
    const value = item[field];

    if (editing) {
        return (
            <div>
                <div class="intent-section-title">{locale.fields[field]}</div>
                <div class="intent-card notes-field">
                    <textarea
                        value={value}
                        onKeyDown={e => e.stopPropagation()}
                        onChange={e => onItemChange({ ...item, [field]: e.target.value })} />
                </div>
            </div>
        );
    }

    if (!value) return null;

    return (
        <div>
            <div class="intent-section-title">{locale.fields[field]}</div>
            <div class="intent-card">
                {value.split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}
            </div>
        </div>
    );
}
