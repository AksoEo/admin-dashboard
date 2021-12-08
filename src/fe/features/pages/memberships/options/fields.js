import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import RemoveIcon from '@material-ui/icons/Remove';
import UpIcon from '@material-ui/icons/KeyboardArrowUp';
import DownIcon from '@material-ui/icons/KeyboardArrowDown';
import { Button, Checkbox, Dialog, TextField } from 'yamdl';
import TinyProgress from '../../../../components/controls/tiny-progress';
import MdField from '../../../../components/controls/md-field';
import Select from '../../../../components/controls/select';
import Segmented from '../../../../components/controls/segmented';
import StaticOverviewList from '../../../../components/lists/overview-list-static';
import RearrangingList from '../../../../components/lists/rearranging-list';
import ScriptItem from '../../../../components/form-editor/script-item';
import OrgIcon from '../../../../components/org-icon';
import { ScriptContextProvider } from '../../../../components/form-editor';
import { RefNameView } from '../../../../components/form-editor/script-views';
import {
    membershipOptions as locale,
    membershipCategories as categoriesLocale,
    paymentOrgs as paymentOrgsLocale,
    paymentAddons as paymentAddonsLocale,
    currencies,
} from '../../../../locale';
import { FIELDS as PAYMENT_ADDON_FIELDS } from '../../payments/orgs/addons/fields';
import { FIELDS as PAYMENT_ORG_FIELDS } from '../../payments/orgs/fields';
import { FIELDS as CATEGORY_FIELDS } from '../categories/fields';
import { connect } from '../../../../core/connection';
import './fields.less';

export const FIELDS = {
    year: {
        sortable: true,
        slot: 'title',
        component ({ value }) {
            return '' + value;
        },
    },
    enabled: {
        slot: 'titleAlt',
        skipLabel: true,
        component ({ value, editing, onChange }) {
            if (editing) {
                return <Checkbox checked={value} onChange={onChange} />;
            }
            if (!value) return null;
            return <CheckIcon />;
        },
    },
    currency: {
        component ({ value, editing, onChange }) {
            if (editing) {
                const items = Object.keys(currencies).map(currency => ({
                    value: currency,
                    label: currencies[currency],
                }));
                if (!value) items.push({ value: '', label: '—' });
                return (
                    <Select
                        outline
                        value={value || ''}
                        onChange={v => onChange(v)}
                        items={items} />
                );
            }
            return value;
        },
    },
    paymentOrg: {
        virtual: ['paymentOrgId'],
        isEmpty: (_, item) => !item.paymentOrgId,
        component ({ item, editing, onItemChange }) {
            if (editing) {
                return (
                    <PaymentOrgPicker value={item.paymentOrgId} onChange={id => {
                        onItemChange({ ...item, paymentOrgId: id });
                    }} />
                );
            }

            const id = item.paymentOrgId;
            return <PaymentOrgLabel id={id} />;
        },
    },
    offers: {
        component ({ value, editing, onChange, item }) {
            return (
                <Offers
                    year={item.year}
                    value={value}
                    editing={editing}
                    onChange={onChange}
                    paymentOrg={item.paymentOrgId} />
            );
        },
    },
};

const PaymentOrgLabel = connect(({ id }) => (['payments/org', { id }]))(data => ({
    data,
}))(class PaymentOrgLabel extends PureComponent {
    render ({ data }) {
        if (!data) return <TinyProgress />;
        return (
            <span class="payment-org-label">
                <OrgIcon org={data.org} style={{ verticalAlign: 'middle' }} />
                {' '}
                {data.name}
            </span>
        );
    }
});

class Offers extends PureComponent {
    itemKeys = new WeakMap();

    render ({ year, value, editing, onChange, paymentOrg }) {
        const items = [];
        for (let i = 0; i < value.length; i++) {
            const group = value[i];
            const index = i;
            const removeItem = () => {
                const newValue = value.slice();
                newValue.splice(index, 1);
                onChange(newValue);
            };

            if (!this.itemKeys.has(group)) this.itemKeys.set(group, Math.random().toString(36));
            const itemKey = this.itemKeys.get(group);

            const onItemChange = item => {
                const newValue = value.slice();
                newValue[index] = item;
                this.itemKeys.set(item, itemKey);
                onChange(newValue);
            };
            items.push(
                <OfferGroup
                    key={'og' + itemKey}
                    year={year}
                    value={group}
                    editing={editing}
                    onChange={onItemChange}
                    onRemove={removeItem}
                    paymentOrg={paymentOrg} />
            );
        }

        const moveItem = (fromIndex, toIndex) => {
            if (toIndex < 0 || toIndex > value.length - 1) return;
            const newValue = value.slice();
            const item = newValue.splice(fromIndex, 1)[0];
            newValue.splice(toIndex, 0, item);
            onChange(newValue);
        };

        const addItem = () => {
            onChange(value.concat([{
                title: '',
                description: '',
                offers: [],
            }]));
        };

        return (
            <ScriptContextProvider>
                {editing ? (
                    <RearrangingList
                        class="registration-offers is-editing"
                        isItemDraggable={() => editing}
                        canMove={() => true}
                        onMove={moveItem}>
                        {items}
                    </RearrangingList>
                ) : <div class="registration-offers">{items}</div>}
                {editing && (
                    <Button icon small onClick={addItem}>
                        <AddIcon />
                    </Button>
                )}
            </ScriptContextProvider>
        );
    }
}

class OfferGroup extends PureComponent {
    state = {
        open: false,
        adding: false,
    };

    render ({ year, value, editing, onChange, onRemove, paymentOrg }) {
        const items = [];
        for (let i = 0; i < value.offers.length; i++) {
            const offer = value.offers[i];
            const index = i;
            const removeItem = () => {
                const newOffers = value.offers.slice();
                newOffers.splice(index, 1);
                onChange({ ...value, offers: newOffers });
            };
            const onItemChange = item => {
                const newOffers = value.offers.slice();
                newOffers[index] = item;
                onChange({ ...value, offers: newOffers });
            };

            items.push(
                <Offer
                    key={'o' + offer.id}
                    value={offer}
                    editing={editing}
                    onChange={onItemChange}
                    onRemove={removeItem}
                    paymentOrg={paymentOrg} />
            );
        }

        const moveItem = (fromIndex, toIndex) => {
            const newOffers = value.offers.slice();
            const item = newOffers.splice(fromIndex, 1)[0];
            newOffers.splice(toIndex, 0, item);
            onChange({ ...value, offers: newOffers });
        };

        const addOffer = offer => {
            onChange({ ...value, offers: value.offers.concat([offer]) });
            this.setState({ adding: false });
        };

        return (
            <div class={'registration-offer-group' + (editing ? ' is-editing' : '')}>
                <div class="offer-group-title">
                    {editing && (
                        <Button class="remove-button" icon small onClick={onRemove}>
                            <RemoveIcon />
                        </Button>
                    )}
                    {editing ? (
                        <TextField
                            class="inner-input"
                            label={locale.offers.group.title}
                            outline
                            value={value.title}
                            onChange={e => onChange({ ...value, title: e.target.value })} />
                    ) : value.title}
                </div>
                {editing && (
                    <div class="offer-group-description-label">
                        {locale.offers.group.description}
                    </div>
                )}
                <MdField
                    editing={editing}
                    class="offer-group-description"
                    value={value.description}
                    onChange={description => onChange({ ...value, description: description || null })}
                    rules={['emphasis', 'strikethrough', 'link']} />
                {editing && (
                    <Button class="offer-group-expand-button" icon small onClick={() => this.setState({ open: !this.state.open })}>
                        {this.state.open ? <UpIcon /> : <DownIcon />}
                    </Button>
                )}
                {!editing ? (
                    <div class="offer-group-items">
                        {items}
                    </div>
                ) : (this.state.open && (
                    <RearrangingList
                        isItemDraggable={() => editing}
                        canMove={() => true}
                        onMove={moveItem}
                        class="offer-group-items is-editing">
                        {items}
                    </RearrangingList>
                ))}
                {this.state.open && editing && (
                    <div>
                        <Button icon small onClick={() => this.setState({ adding: true })}>
                            <AddIcon />
                        </Button>
                    </div>
                )}

                <Dialog
                    class="registration-options-add-offer-dialog"
                    title={locale.offers.add.title}
                    open={this.state.adding && editing}
                    backdrop
                    onClose={() => this.setState({ adding: false })}>
                    <AddOffer
                        paymentOrg={paymentOrg}
                        year={year}
                        offers={value.offers}
                        onSelect={addOffer} />
                </Dialog>
            </div>
        );
    }
}

const REDUCED_CATEGORY_FIELDS = Object.fromEntries([
    // givesMembership comes before name for sorting order
    'nameAbbrev', 'givesMembership', 'name', 'availability',
].map(x => [x, CATEGORY_FIELDS[x]]));
class AddOffer extends PureComponent {
    state = {
        type: null,
    };

    render ({ year, offers, onSelect, paymentOrg }) {
        let picker, note;
        if (this.state.type === 'membership') {
            note = (
                <div class="add-offer-note">
                    {locale.offers.add.membershipsNote}
                </div>
            );

            picker = (
                <StaticOverviewList
                    key="categories"
                    compact
                    task="memberships/listCategories"
                    view="memberships/category"
                    fields={REDUCED_CATEGORY_FIELDS}
                    sorting={{ name: 'asc', givesMembership: 'desc' }}
                    jsonFilter={{
                        id: {
                            $nin: offers
                                .filter(x => x.type === 'membership')
                                .map(x => x.id),
                        },
                    }}
                    locale={categoriesLocale.fields}
                    emptyLabel={locale.offers.add.categoriesEmpty}
                    onItemClick={id => {
                        onSelect({ type: 'membership', id, price: null });
                    }}
                    userData={{
                        itemStyle: data => {
                            const unavailable = (data.availableFrom && data.availableFrom > year)
                                || (data.availableTo && data.availableTo < year);
                            if (unavailable) return { opacity: 0.5 };
                            return {};
                        },
                    }} />
            );
        } else if (this.state.type === 'addon') {
            picker = (
                <StaticOverviewList
                    key="addons"
                    compact
                    task="payments/listAddons"
                    view="payments/addon"
                    options={{ org: paymentOrg }}
                    viewOptions={{ org: paymentOrg }}
                    jsonFilter={{
                        id: { $nin: offers.filter(x => x.type === 'addon').map(x => x.id) },
                    }}
                    fields={PAYMENT_ADDON_FIELDS}
                    sorting={{ name: 'asc' }}
                    locale={paymentAddonsLocale.fields}
                    emptyLabel={locale.offers.add.addonsEmpty}
                    onItemClick={id => {
                        onSelect({ type: 'addon', id });
                    }} />
            );
        }

        return (
            <div>
                <div class="offer-type-picker">
                    <Segmented
                        selected={this.state.type}
                        onSelect={type => this.setState({ type })}>
                        {[
                            {
                                id: 'membership',
                                label: locale.offers.types.membership,
                            },
                            {
                                id: 'addon',
                                label: locale.offers.types.addon,
                            },
                        ]}
                    </Segmented>
                </div>
                {note}
                {picker}
            </div>
        );
    }
}

class Offer extends PureComponent {
    state = {
        priceOpen: false,
    };

    render ({ value, editing, onChange, onRemove, paymentOrg }) {
        let item, price, priceButton;
        if (value.type === 'addon') {
            item = <OfferPaymentAddon id={value.id} paymentOrg={paymentOrg} />;
        } else if (value.type === 'membership') {
            item = <OfferMembership id={value.id} />;
            const hasPrice = !!value.price;
            priceButton = (
                <Button
                    class="price-expand-button"
                    icon
                    small
                    disabled={!editing && !hasPrice}
                    onClick={() => this.setState({ priceOpen: !this.state.priceOpen })}>
                    {(!editing && !hasPrice) ? <UpIcon /> : (this.state.priceOpen
                        ? <UpIcon /> : <DownIcon />)}
                </Button>
            );
            if (!editing && !hasPrice) {
                price = (
                    <div class="price-not-available">
                        {locale.offers.price.na}
                    </div>
                );
            } else {
                price = (
                    <div class="price-container">
                        {this.state.priceOpen && (
                            <OfferPrice
                                value={value.price}
                                editing={editing}
                                onChange={price => onChange({ ...value, price })} />
                        )}
                    </div>
                );
            }
        }

        return (
            <div class="registration-offer">
                <div class="offer-details">
                    {editing && (
                        <Button class="remove-button" small icon onClick={onRemove}>
                            <RemoveIcon />
                        </Button>
                    )}
                    <div class="offer-details-inner">
                        <div class="offer-type">{locale.offers.types[value.type]}</div>
                        <div class="offer-item">
                            {item}
                        </div>
                    </div>
                    {priceButton}
                </div>
                {price}
            </div>
        );
    }
}

const OfferPaymentAddon = connect(({ id, paymentOrg }) => ['payments/addon', {
    org: paymentOrg,
    id,
}])(data => ({ data }))(function OfferPaymentAddon ({ data }) {
    if (!data) return <TinyProgress />;
    return data.name;
});

const OfferMembership = connect(({ id }) => ['memberships/category', { id }])(data => ({
    data,
}))(function OfferMembership ({ data }) {
    if (!data) return <TinyProgress />;
    return data.name;
});

class OfferPrice extends PureComponent {
    state = {
        editingScript: false,
    };

    render ({ value, editing, onChange }) {
        if (!value) {
            return (
                <div class="offer-price is-none">
                    <div class="none-label">
                        {locale.offers.price.na}
                    </div>
                    {editing && (
                        <Button icon small onClick={() => onChange({
                            description: null,
                            script: {},
                            var: null,
                        })}>
                            <AddIcon />
                        </Button>
                    )}
                </div>
            );
        }

        const variables = [];
        if (value.var === null) variables.push({ value: null, label: '—' });
        for (const v in value.script) {
            if (v.startsWith('_')) continue;
            variables.push({
                value: v,
                label: v, // TODO: use fancy icons
            });
        }

        const prevNodes = [
            {
                defs: {},
                formVars: [
                    // TODO: what to do with these values?
                    { name: 'age', type: 'n', value: 25 },
                    { name: 'agePrimo', type: 'n', value: 24 },
                    { name: 'birthdate', type: 's', value: '1999-04-21' },
                    { name: 'feeCountry', type: 's', value: 'nl' },
                    { name: 'feeCountryGroups', type: 'm', value: ['x01'] },
                    { name: 'isActiveMember', type: 'b', value: true },
                ],
            },
        ];

        return (
            <div class="offer-price">
                <div class="offer-price-title">
                    <span class="title-contents">
                        {locale.offers.price.title}
                    </span>
                    {editing && (
                        <Button class="remove-button" onClick={() => onChange(null)}>
                            {locale.offers.price.remove}
                        </Button>
                    )}
                </div>
                <ScriptItem
                    previousNodes={prevNodes}
                    editable={editing}
                    editing={this.state.editingScript}
                    onEditingChange={editingScript => this.setState({ editingScript })}
                    item={value}
                    onChange={onChange} />
                <div class="price-variable">
                    <span class="price-var-label">{locale.offers.price.varLabel}:</span>
                    <div class="price-var-contents">
                        {!editing ? (
                            <RefNameView name={value.var} />
                        ) : (
                            <Select
                                value={value.var}
                                onChange={v => onChange({ ...value, var: v })}
                                items={variables} />
                        )}
                    </div>
                </div>
                <div class="price-description-label">
                    {locale.offers.price.description}
                </div>
                <MdField
                    class="offer-price-description"
                    value={value.description}
                    editing={editing}
                    onChange={description => onChange({ ...value, description: description || null })}
                    rules={['emphasis', 'strikethrough']} />
            </div>
        );
    }
}

class PaymentOrgPicker extends PureComponent {
    state = {
        open: false,
    };

    render ({ value, onChange }) {
        return (
            <div class="registration-options-payment-org-picker">
                <Button class="picker-inner-button" onClick={() => this.setState({ open: true })}>
                    {value ? (
                        // HACK: key by value to force update
                        <PaymentOrgLabel key={value} id={value} />
                    ) : locale.paymentOrg.pick}
                </Button>

                <Dialog
                    class="registration-options-payment-org-picker-dialog"
                    title={locale.paymentOrg.pick}
                    open={this.state.open}
                    onClose={() => this.setState({ open: false })}
                    backdrop>
                    <div class="picker-note">
                        {locale.paymentOrg.pickNote}
                    </div>
                    <StaticOverviewList
                        compact
                        task="payments/listOrgs"
                        view="payments/org"
                        fields={PAYMENT_ORG_FIELDS}
                        sorting={{ name: 'asc' }}
                        locale={paymentOrgsLocale.fields}
                        emptyLabel={locale.paymentOrg.pickEmpty}
                        onItemClick={id => {
                            onChange(id);
                            this.setState({ open: false });
                        }} />
                </Dialog>
            </div>
        );
    }
}
