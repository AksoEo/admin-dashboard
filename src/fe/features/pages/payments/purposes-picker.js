import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { Button, Dialog, TextField } from '@cpsdqs/yamdl';
import Segmented from '../../../components/segmented';
import Form, { Validator, Field } from '../../../components/form';
import DynamicHeightDiv from '../../../components/dynamic-height-div';
import StaticOverviewList from '../../../components/overview-list-static';
import OverviewListItem from '../../../components/overview-list-item';
import { currencyAmount } from '../../../components/data';
import {
    paymentIntents as locale,
    paymentAddons as addonLocale,
    data as dataLocale,
} from '../../../locale';
import { FIELDS as ADDON_FIELDS } from './orgs/addons/fields';
import './purposes-picker.less';

const portalContainer = document.createElement('div');
portalContainer.id = 'payment-purposes-picker-portal-container';
document.body.appendChild(portalContainer);

function orderPortalContainerFront () {
    document.body.removeChild(portalContainer);
    document.body.appendChild(portalContainer);
}

const ADDON_FIELD_IDS = Object.keys(ADDON_FIELDS).map(id => ({ id }));
const REDUCED_ADDON_FIELDS = ADDON_FIELDS;

export default class PurposesPicker extends PureComponent {
    state = {
        pickerOpen: false,
    };

    #open = () => {
        this.setState({ pickerOpen: true });
        orderPortalContainerFront();
    };

    render ({ org, value, onChange, currency }, { pickerOpen }) {
        const purposes = value.map((item, i) => {
            return (
                <Purpose
                    key={i}
                    org={org}
                    currency={currency}
                    value={item}
                    onChange={item => {
                        const list = [...value];
                        list[i] = item;
                        onChange(list);
                    }}
                    onRemove={() => {
                        const list = [...value];
                        list.splice(i, 1);
                        onChange(list);
                    }} />
            );
        });

        return (
            <span class="payment-purposes-picker">
                <DynamicHeightDiv>
                    <div class="purposes-picker-inner">
                        {purposes}
                    </div>
                </DynamicHeightDiv>
                <Button
                    class="purposes-picker-add"
                    onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.#open();
                    }}>
                    <AddIcon />
                </Button>

                <AddPurposeDialog
                    org={org}
                    open={pickerOpen}
                    onAdd={item => onChange(value.concat([item]))}
                    onClose={() => this.setState({ pickerOpen: false })} />
            </span>
        );
    }
}

function Purpose ({ org, value, onChange, onRemove, currency }) {
    const { type } = value;

    const amountEditor = currency ? (
        <currencyAmount.editor
            currency={currency}
            value={value.amount}
            onChange={amount => onChange({ ...value, amount })} />
    ) : (
        <span class="purpose-no-currency">
            {locale.purposesPicker.selectCurrencyFirst}
        </span>
    );

    const removeButton = (
        <Button icon small onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
        }}>
            <RemoveIcon />
        </Button>
    );

    if (type === 'manual') {
        // TODO: format description properly
        return (
            <div class="payment-purpose is-manual">
                {removeButton}
                <div class="purpose-title">{value.title}</div>
                <div class="purpose-description">
                    {value.description}
                </div>
                {amountEditor}
            </div>
        );
    } else if (type === 'addon') {
        return (
            <div class="payment-purpose is-addon">
                {removeButton}
                <OverviewListItem
                    doFetch compact view="payments/addon"
                    skipAnimation
                    id={value.paymentAddonId}
                    options={{ org }}
                    selectedFields={ADDON_FIELD_IDS}
                    fields={REDUCED_ADDON_FIELDS}
                    index={0}
                    locale={addonLocale.fields} />
                {amountEditor}
            </div>
        );
    }
}

class AddPurposeDialog extends PureComponent {
    state = {
        type: 'manual',
        addonOffset: 0,
        manualTitle: '',
        manualDescription: null,
    };

    #add = (id) => {
        if (this.state.type === 'manual') {
            this.props.onAdd({
                type: 'manual',
                title: this.state.manualTitle,
                description: this.state.manualDescription,
                amount: 0,
            });
        } else if (this.state.type === 'addon') {
            this.props.onAdd({
                type: 'addon',
                paymentAddonId: id,
                amount: 0,
            });
        }
        this.props.onClose();
    };

    render ({ org, open, onClose }, { type, addonOffset, manualTitle, manualDescription }) {
        let contents = '';
        if (type === 'manual') {
            contents = (
                <Form onSubmit={this.#add}>
                    <Field>
                        <Validator
                            component={TextField}
                            value={manualTitle}
                            validate={value => {
                                if (!value) {
                                    throw { error: dataLocale.requiredField };
                                }
                            }}
                            onChange={e => this.setState({ manualTitle: e.target.value })}/>
                    </Field>
                    <Field>
                        <TextField
                            value={manualDescription || ''}
                            onChange={e => this.setState({ manualDescription: e.target.value || null })}/>
                    </Field>
                    <div class="form-footer">
                        <Button>
                            {locale.purposesPicker.addPurposeButton}
                        </Button>
                    </div>
                </Form>
            );
        } else if (type === 'addon') {
            if (!org) {
                contents = (
                    <div class="no-org">
                        {locale.purposesPicker.selectMethodFirst}
                    </div>
                );
            } else {
                contents = (
                    <StaticOverviewList
                        compact
                        task="payments/listAddons"
                        view="payments/addon"
                        options={{ org }}
                        viewOptions={{ org }}
                        fields={REDUCED_ADDON_FIELDS}
                        sorting={{ name: 'asc' }}
                        offset={addonOffset}
                        onSetOffset={addonOffset => this.setState({ addonOffset })}
                        onItemClick={id => this.#add(id)}
                        limit={10}
                        locale={addonLocale.fields}/>
                );
            }
        }

        return (
            <Dialog
                class="payment-purposes-picker-dialog"
                container={portalContainer}
                backdrop
                title={locale.purposesPicker.addTitle}
                open={open}
                onClose={onClose}
                fullScreen={width => width < 400}>
                <div class="type-selection">
                    <Segmented selected={type} onSelect={type => this.setState({ type })}>
                        {Object.keys(locale.purposesPicker.types).map(id => ({
                            id,
                            label: locale.purposesPicker.types[id],
                        }))}
                    </Segmented>
                </div>
                <DynamicHeightDiv>
                    {contents}
                </DynamicHeightDiv>
            </Dialog>
        );
    }
}
