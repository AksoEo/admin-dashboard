import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import SearchIcon from '@material-ui/icons/Search';
import Page from '../../../../../components/page';
import DetailShell from '../../../../../components/detail/detail-shell';
import TaskButton from '../../../../../components/controls/task-button';
import Meta from '../../../../meta';
import { connectPerms } from '../../../../../perms';
import { coreContext } from '../../../../../core/connection';
import { congressParticipants as locale } from '../../../../../locale';
import { LinkButton } from '../../../../../router';
import { FIELDS } from './fields';
import './detail.less';

export default connectPerms(class ParticipantsPage extends Page {
    state = {
        edit: null,
        org: null,
        registrationForm: null,
    };

    static contextType = coreContext;

    onEndEdit = () => {
        this.props.editing && this.props.editing.pop(true);
        this.setState({ edit: null });
    };

    #commitTask = null;
    onCommit = changedFields => {
        if (!this.props.editing || this.#commitTask) return Promise.resolve();
        if (!changedFields.length) {
            // nothing changed, so we can just pop the editing state
            this.props.editing.pop(true);
            return Promise.resolve();
        }

        return new Promise(resolve => {
            this.#commitTask = this.context.createTask('congresses/updateParticipant', {
                congress: this.congress,
                instance: this.instance,
                id: this.id,
                _changedFields: changedFields,
            }, this.state.edit);
            this.#commitTask.on('success', this.onEndEdit);
            this.#commitTask.on('drop', () => {
                this.#commitTask = null;
                resolve();
            });
        });
    };

    componentWillUnmount () {
        if (this.#commitTask) this.#commitTask.drop();
    }

    get congress () {
        return +this.props.matches.congress[1];
    }
    get instance () {
        return +this.props.matches.instance[1];
    }
    get id () {
        return this.props.match[1];
    }

    render ({ perms, editing }, { org, edit, registrationForm }) {
        const { congress, instance, id } = this;

        const actions = [];

        if (perms.hasPerm(`congress_instances.participants.update.${org}`)) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
                action: () => this.props.push('redakti', true),
            });
        }

        if (perms.hasPerm(`congress_instances.participants.delete.${org}`)) {
            actions.push({
                label: locale.delete.menuItem,
                action: () => this.context.createTask('congresses/deleteParticipant', {
                    congress,
                    instance,
                    id,
                }),
                overflow: true,
            });
        }

        const currency = registrationForm && registrationForm.price
            ? registrationForm.price.currency : null;
        const userData = { org, congress, instance, currency, registrationForm };

        return (
            <div class="congress-participant-detail-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />

                <DetailShell
                    view="congresses/participant"
                    options={{
                        congress,
                        instance,
                        fields: Object.keys(FIELDS),
                    }}
                    id={id}
                    locale={locale}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    onDelete={() => this.props.pop()}>
                    {data => (
                        <Detail
                            core={this.context}
                            editing={editing}
                            onItemChange={edit => this.setState({ edit })}
                            item={this.state.edit || data}
                            userData={userData} />
                    )}
                </DetailShell>
                <DetailShell
                    /* this is kind of a hack to get the org field */
                    view="congresses/congress"
                    id={congress}
                    fields={{}}
                    locale={{}}
                    onData={data => data && this.setState({ org: data.org })} />
                <DetailShell
                    /* a hack to get the currency */
                    view="congresses/registrationForm"
                    options={{ congress, instance }}
                    id="irrelevant" // detail shell won't work without one
                    fields={{}}
                    locale={{}}
                    onData={data => this.setState({ registrationForm: data })} />
            </div>
        );
    }
});

function DetailField ({ field, item, editing, onItemChange, userData }) {
    const Cmp = FIELDS[field].component;
    return <Cmp
        slot="detail"
        value={item[field]}
        onChange={v => onItemChange({ ...item, [field]: v })}
        editing={editing}
        item={item}
        onItemChange={onItemChange}
        userData={userData} />;
}

export function Detail ({ core, item, creating, editing, onItemChange, userData }) {
    const statusType = item.cancelledTime ? 'canceled' : item.isValid ? 'valid' : 'pending';

    return (
        <div class="congress-participant-detail">
            <div class="participant-header">
                {!creating && (
                    <div class="header-status">
                        <span class="participation-status" data-status={statusType}>
                            {locale.fields.statuses[statusType]}
                        </span>
                    </div>
                )}
                {!creating && (
                    <div class="header-title">
                        <div class="header-name">{item.identity?.name}</div>
                        <div class="header-email">{item.identity?.email}</div>
                    </div>
                )}
                <div class="header-id">
                    {!creating && (
                        <div class="header-data-id">
                            <span class="field-label">
                                {locale.fields.dataId}
                                {':'}
                            </span>
                            {' '}
                            <DetailField
                                field="dataId"
                                item={item}
                                editing={editing}
                                onItemChange={onItemChange}
                                userData={userData} />
                        </div>
                    )}
                    <div class="field-codeholder">
                        <span class="field-label">
                            {locale.fields.identity}
                            {':'}
                        </span>
                        {' '}
                        <DetailField
                            field="identity"
                            item={item}
                            editing={editing}
                            onItemChange={onItemChange}
                            userData={userData} />
                    </div>
                </div>
            </div>
            {!creating && (
                <div class="participant-payment">
                    <div class="participant-payment-inner">
                        <div class="payment-price">
                            <DetailField
                                field="price"
                                item={item}
                                editing={editing}
                                onItemChange={onItemChange}
                                userData={userData} />
                        </div>
                        <div class="payment-details">
                            <span class="field-label">
                                {locale.fields.paid}
                                {': '}
                            </span>
                            {' '}
                            <DetailField
                                field="paid"
                                item={item}
                                editing={editing}
                                onItemChange={onItemChange}
                                userData={userData} />
                        </div>
                    </div>
                    <ViewPaymentsButton item={item} />
                </div>
            )}
            {!creating && !editing && <ParticipantActions core={core} item={item} userData={userData} />}
            <div class="participant-details">
                <div class="detail-field">
                    <span class="field-label">{locale.fields.approved}</span>
                    <DetailField
                        field="approved"
                        item={item}
                        editing={editing}
                        onItemChange={onItemChange}
                        userData={userData} />
                </div>
                {!creating && (
                    <div class="detail-field">
                        <span class="field-label">{locale.fields.createdTime}</span>
                        <DetailField
                            field="createdTime"
                            item={item}
                            editing={editing}
                            onItemChange={onItemChange}
                            userData={userData} />
                    </div>
                )}
                {!creating && (
                    <div class="detail-field">
                        <span class="field-label">{locale.fields.editedTime}</span>
                        <DetailField
                            field="editedTime"
                            item={item}
                            editing={editing}
                            onItemChange={onItemChange}
                            userData={userData} />
                    </div>
                )}
                <div class="detail-field">
                    <span class="field-label">{locale.fields.cancelledTime}</span>
                    <DetailField
                        field="cancelledTime"
                        item={item}
                        editing={editing}
                        onItemChange={onItemChange}
                        userData={userData} />
                </div>
                <div class="detail-field">
                    <span class="field-label">{locale.fields.notes}</span>
                    <DetailField
                        field="notes"
                        item={item}
                        editing={editing}
                        onItemChange={onItemChange}
                        userData={userData} />
                </div>
            </div>
            <div class="participant-data">
                <div class="data-title">
                    {locale.fields.data}
                </div>
                <DetailField
                    field="data"
                    item={item}
                    editing={editing}
                    onItemChange={onItemChange}
                    userData={userData} />
            </div>
        </div>
    );
}

const ViewPaymentsButton = connectPerms(function ViewPaymentsButton ({ perms, item }) {
    // don't know which org the payments may be in because there's nothing stopping you from using
    // a payment method from one org to pay for a participant in a congress from a different org
    if (!perms.hasPerm('pay.payment_intents.read.tejo') && !perms.hasPerm('pay.payment_intents.read.uea')) return null;

    const target = `/aksopago/pagoj?filter(purposeDataId:${item.dataId})`;

    return (
        <LinkButton target={target}>
            <SearchIcon style={{ verticalAlign: 'middle' }} />
            {' '}
            {locale.fields.viewPayments}
        </LinkButton>
    );
});

const ParticipantActions = connectPerms(function ParticipantActions ({ perms, core, item, userData }) {
    const actions = [
        {
            id: 'createPaymentIntent',
            hasPerm: () => {
                return !item.cancelledTime && (perms.hasPerm('pay.payment_intents.create.tejo')
                    || perms.hasPerm('pay.payment_intents.create.uea'));
            },
            action: async () => {
                const congress = await core.viewData('congresses/instance', {
                    congress: userData.congress,
                    id: userData.instance,
                });
                core.createTask('payments/createIntent', {}, {
                    customer: {
                        name: item.identity?.name || null,
                        email: item.identity?.email || null,
                    },
                    purposes: [
                        {
                            type: 'trigger',
                            title: locale.fields.actions.createPaymentIntentData.title,
                            description: congress.name,
                            triggers: 'congress_registration',
                            dataId: item.dataId,
                        },
                    ],
                });
            },
        },
        {
            id: 'approveManually',
            hasPerm: () => {
                return !item.approved && !item.cancelledTime
                    && perms.hasPerm(`congress_instances.participants.update.${userData.org}`);
            },
            action: async () => {
                core.createTask('congresses/updateParticipant', {
                    congress: userData.congress,
                    instance: userData.instance,
                    id: item.dataId,
                    _changedFields: ['approved'],
                }, {
                    approved: true,
                });
            },
        },
        {
            id: 'cancel',
            hasPerm: () => {
                return !item.cancelledTime
                    && perms.hasPerm(`congress_instances.participants.update.${userData.org}`);
            },
            action: async () => {
                core.createTask('congresses/updateParticipant', {
                    congress: userData.congress,
                    instance: userData.instance,
                    id: item.dataId,
                    _changedFields: ['cancelledTime'],
                }, {
                    cancelledTime: Math.floor(Date.now() / 1000),
                });
            },
        },
    ].filter(x => x.hasPerm()).map(x => (
        <TaskButton key={x.id} run={x.action}>
            {locale.fields.actions[x.id]}
        </TaskButton>
    ));

    if (!actions.length) return null;

    return (
        <div class="participant-actions">
            {actions}
        </div>
    );
});
