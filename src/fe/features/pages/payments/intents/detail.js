import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../../components/page';
import DetailView from '../../../../components/detail';
import Meta from '../../../meta';
import { connectPerms } from '../../../../perms';
import { coreContext } from '../../../../core/connection';
import { paymentIntents as locale } from '../../../../locale';
import { FIELDS } from './fields';

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
            <div class="payment-addon-page">
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
                            'stripePaymentIntentId',
                            'stripeClientSecret',
                            'purposes',
                            'totalAmount',
                            'amountRefunded',
                        ],
                    }}
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
