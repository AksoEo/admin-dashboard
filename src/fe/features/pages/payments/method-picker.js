import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Dialog } from '@cpsdqs/yamdl';
import { coreContext } from '../../../core/connection';
import { paymentOrgs as orgLocale } from '../../../locale';
import { FIELDS as ORG_FIELDS } from './orgs/fields';
import './method-picker.less';

/// # Props
/// - value/onChange
export default class PaymentMethodPicker extends PureComponent {
    state = {
        pickerOpen: false,
    };

    static contextType = coreContext;

    render ({ value, onChange }, { pickerOpen }) {
        return (
            <span class="payment-method-picker">
                <span onClick={() => this.setState({ pickerOpen: true })}>
                    cats
                </span>
                <Dialog
                    backdrop
                    fullScreen={width => width < 400}
                    open={pickerOpen}
                    onClose={() => this.setState({ pickerOpen: false })}>
                </Dialog>
            </span>
        );
    }
}
