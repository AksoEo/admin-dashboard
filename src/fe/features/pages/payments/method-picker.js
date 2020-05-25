import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Button, MenuIcon, Dialog, Ripple } from '@cpsdqs/yamdl';
import AddIcon from '@material-ui/icons/Add';
import { coreContext } from '../../../core/connection';
import { paymentOrgs as orgLocale, paymentMethods as methodLocale } from '../../../locale';
import { FIELDS as ORG_FIELDS } from './orgs/fields';
import { FIELDS as METHOD_FIELDS } from './orgs/methods/fields';
import StaticOverviewList from '../../../components/overview-list-static';
import OverviewListItem from '../../../components/overview-list-item';
import DynamicHeightDiv from '../../../components/dynamic-height-div';
import './method-picker.less';

const portalContainer = document.createElement('div');
portalContainer.id = 'payment-method-picker-portal-container';
document.body.appendChild(portalContainer);

function orderPortalContainerFront () {
    document.body.removeChild(portalContainer);
    document.body.appendChild(portalContainer);
}

const METHOD_FIELD_IDS = [{ id: 'type' }, { id: 'name' }, { id: 'internalDescription' }];
const REDUCED_METHOD_FIELDS = Object.fromEntries(METHOD_FIELD_IDS
    .map(({ id }) => [id, METHOD_FIELDS[id]]));

/// Picker for manual payment methods.
///
/// # Props
/// - value/onChange
/// - org/onOrgChange
export default class PaymentMethodPicker extends PureComponent {
    state = {
        pickerOpen: false,
    };

    static contextType = coreContext;

    #open = () => {
        orderPortalContainerFront();
        this.setState({ pickerOpen: true });
    };

    #ripple = null;

    #onPointerDown = e => {
        if (!this.#ripple) return;
        this.#ripple.onPointerDown(e);
    };

    render ({ value, onChange, org, onOrgChange }, { pickerOpen }) {
        let contents, orgItem;

        if (org && value) {
            contents = (
                <div class="picker-content-wrapper">
                    <OverviewListItem
                        doFetch compact view="payments/method"
                        skipAnimation
                        id={value}
                        key={`${org}-${value}`}
                        options={{ org }}
                        selectedFields={METHOD_FIELD_IDS}
                        fields={REDUCED_METHOD_FIELDS}
                        index={0}
                        locale={methodLocale.fields} />
                    <Button
                        class="remove-button"
                        onPointerDown={e => e.stopPropagation()}
                        onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            onOrgChange(null);
                            onChange(null);
                        }}>
                        <MenuIcon type="close" />
                    </Button>
                </div>
            );
        } else {
            contents = (
                <div class="picker-placeholder-content">
                    <AddIcon />
                </div>
            );
        }

        if (org) {
            const orgFields = Object.keys(ORG_FIELDS).map(f => ({ id: f }));

            orgItem = (
                <div class="picker-chosen-org">
                    <div class="picker-back-container">
                        <Button icon onClick={() => onOrgChange(null)}>
                            <MenuIcon type="back" />
                        </Button>
                    </div>
                    <OverviewListItem
                        doFetch compact view="payments/org"
                        id={org}
                        selectedFields={orgFields}
                        fields={ORG_FIELDS}
                        index={0}
                        locale={orgLocale.fields} />
                </div>
            );
        }

        return (
            <span
                class="payment-method-picker"
                onPointerDown={this.#onPointerDown}
                onClick={this.#open}>
                <Ripple ref={ripple => this.#ripple = ripple} />
                <DynamicHeightDiv useFirstHeight>
                    {contents}
                </DynamicHeightDiv>
                <Dialog
                    class="payment-method-picker-dialog"
                    container={portalContainer}
                    backdrop
                    fullScreen={width => width < 400}
                    open={pickerOpen}
                    onClose={() => this.setState({ pickerOpen: false })}>
                    <DynamicHeightDiv>
                        {orgItem}
                    </DynamicHeightDiv>
                    <StaticOverviewList
                        task={org ? 'payments/listMethods' : 'payments/listOrgs'}
                        options={org ? { org } : null}
                        view={org ? 'payments/method' : 'payments/org'}
                        viewOptions={org ? { org } : null}
                        fields={org ? REDUCED_METHOD_FIELDS : ORG_FIELDS}
                        jsonFilter={org ? {
                            type: 'manual',
                        } : null}
                        offset={0}
                        limit={10}
                        locale={org ? orgLocale.fields : methodLocale.fields}
                        onItemClick={id => {
                            if (!org) onOrgChange(id);
                            else {
                                onChange(id);
                                this.setState({ pickerOpen: false });
                            }
                        }}
                        emptyLabel={org ? methodLocale.pickerEmpty : methodLocale.pickerOrgsEmpty}
                        compact />
                </Dialog>
            </span>
        );
    }
}
