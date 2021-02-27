import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Button, Dialog } from '@cpsdqs/yamdl';
import AddIcon from '@material-ui/icons/Add';
import {
    paymentIntents as locale,
    membershipEntries as entriesLocale,
} from '../../../locale';
import StaticOverviewList from '../../../components/overview-list-static';
import { FIELDS as ENTRY_FIELDS } from '../memberships/entries/fields';
import './trigger-picker.less';

const dialogRootContainer = document.createElement('div');
dialogRootContainer.id = 'payments-trigger-picker-container';
document.body.appendChild(dialogRootContainer);

const REDUCED_ENTRY_FIELDS = Object.fromEntries(['status', 'year', 'codeholderData', 'id'].map(x => ([x, ENTRY_FIELDS[x]])));

class RegistrationEntryPicker extends PureComponent {
    state = { offset: 0 };
    render ({ onChange }, { offset }) {
        return (
            <StaticOverviewList
                task="memberships/listEntries"
                view="memberships/entry"
                fields={REDUCED_ENTRY_FIELDS}
                sorting={{ timeSubmitted: 'asc' }}
                offset={offset}
                onSetOffset={offset => this.setState({ offset })}
                limit={10}
                locale={entriesLocale.fields}
                onItemClick={id => onChange(id)}
                emptyLabel={locale.triggerPicker.empty.registration_entry}
                compact />
        );
    }
}

const PICKER_TYPES = {
    registration_entry: RegistrationEntryPicker,
};

export default class TriggerPicker extends PureComponent {
    state = {
        pickerOpen: false,
    };

    onOpenPicker = (e) => {
        e.preventDefault();
        this.setState({ pickerOpen: true });
    };

    render ({ type, onChange }) {
        if (!PICKER_TYPES[type]) return null;
        const ContentType = PICKER_TYPES[type] || (() => null);

        return (
            <Button icon small class="payment-trigger-picker" onClick={this.onOpenPicker}>
                <AddIcon style={{ verticalAlign: 'middle' }} />
                <Dialog
                    container={dialogRootContainer}
                    class="payment-trigger-picker-dialog"
                    backdrop
                    title={locale.triggerPicker.titles[type]}
                    open={this.state.pickerOpen}
                    onClose={() => this.setState({ pickerOpen: false })}>
                    <ContentType onChange={id => {
                        onChange(id);
                        this.setState({ pickerOpen: false });
                    }} />
                </Dialog>
            </Button>
        );
    }
}
