import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../../components/page';
import DetailView from '../../../../components/detail';
import TejoIcon from '../../../../components/tejo-icon';
import UeaIcon from '../../../../components/uea-icon';
import ProfilePicture from '../../../../components/profile-picture';
import { currencyAmount, email, timestamp } from '../../../../components/data';
import { IdUEACode } from '../../../../components/data/uea-code';
import Meta from '../../../meta';
import { connectPerms } from '../../../../perms';
import { coreContext } from '../../../../core/connection';
import { paymentIntents as locale } from '../../../../locale';
import { LinkButton } from '../../../../router';
import { FIELDS } from './fields';
import './detail.less';

export default connectPerms(class IntentPage extends Page {
    state = {
        edit: null,
        org: 'meow', // nonsense default value
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

    render ({ perms, editing }, { edit, org }) {
        const actions = [];

        const id = this.getId();

        if (perms.hasPerm(`pay.payment_intents.update.${org}`)) {
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
                            'currency',
                            'status',
                            'events',
                            'timeCreated',
                            'statusTime',
                            'internalNotes',
                            'customerNotes',
                            'foreignId',
                            'purposes',
                            'totalAmount',
                            'amountRefunded',
                        ],
                    }}
                    header={DetailViewInner}
                    fields={FIELDS}
                    locale={locale}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    onData={data => this.setState({ org: data.org })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    onDelete={() => this.props.pop()} />
            </div>
        );
    }
});

function DetailViewInner ({ item }) {
    const {
        status,
        totalAmount,
        amountRefunded,
        currency,
        purposes,
        org,
    } = item;

    let orgIcon = null;
    if (org === 'tejo') orgIcon = <TejoIcon class="payment-org-icon" />;
    else if (org === 'uea') orgIcon = <UeaIcon class="payment-org-icon" />;

    const currentAmount = totalAmount - amountRefunded;

    return (
        <div class="payment-intent-inner">
            <div class="intent-status">
                <div class={`intent-state is-${status}`}>
                    {locale.fields.statuses[status]}
                </div>
                <div class="intent-method-type">
                    todo:stripe/manual
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
                        <PaymentOrgName />
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
            <div class="intent-purposes">
                {(purposes || []).map((purpose, i) => <Purpose key={i} purpose={purpose} item={item} />)}
            </div>
            <div class="intent-customer-container">
                <div class="intent-section-title">{locale.fields.customer}</div>
                <Customer item={item} />
            </div>
            <div class="intent-method-container">
                <div class="intent-section-title">{locale.fields.method}</div>
                <div class="intent-card">
                    todo
                    <br />
                    also link to https://dashboard.stripe.com/test/payments/pi_intent_id_goes_here
                </div>
            </div>
            <div class="intent-events-container">
                <div class="intent-section-title">{locale.fields.events}</div>
                <Events item={item} />
            </div>
        </div>
    );
}

function PaymentOrgName () {
    // TODO
    return '(no orgId in data)';
}

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

function Customer ({ item }) {
    let profilePictureHash;
    let profilePictureId;
    let isCodeholder = false;
    let codeholderLink;
    let customerName;
    let customerEmail;
    let ueaCode;

    if (item.customer) {
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
            <div class="card-id">
                <div class="customer-picture">
                    <ProfilePicture
                        id={profilePictureId}
                        profilePictureHash={profilePictureHash} />
                </div>
            </div>
            <div class="card-details">
                <div class="card-title">
                    {customerName}
                </div>
                <div class="card-description">
                    {ueaCode}
                    {ueaCode ? ' ' : ''}
                    <email.renderer value={customerEmail} />
                </div>
            </div>
            <div class="card-after">
                {isCodeholder ? (
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

function Events ({ item }) {
    if (!window.meow) {
        return (
            <div class="intent-card">
                events are broken
            </div>
        );
    }

    const rawEvents = [];
    if (item.timeCreated) {
        rawEvents.push({ status: 'created', time: item.timeCreated });
    }
    if (item.events) {
        rawEvents.push(...item.events);
    }
    rawEvents.reverse();

    return (
        <div class="intent-card">
            {rawEvents.map((e, i) => {
                const isFirst = i === 0;
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
