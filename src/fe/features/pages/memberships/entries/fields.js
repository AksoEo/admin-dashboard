import { h } from 'preact';
import { useState, PureComponent } from 'preact/compat';
import { Button, CircularProgress, Dialog } from 'yamdl';
import moment from 'moment';
import { evaluate } from '@tejo/akso-script';
import WarningIcon from '@material-ui/icons/Warning';
import CheckIcon from '@material-ui/icons/CheckCircleOutline';
import RemoveIcon from '@material-ui/icons/Remove';
import UpIcon from '@material-ui/icons/KeyboardArrowUp';
import DownIcon from '@material-ui/icons/KeyboardArrowDown';
import AddIcon from '@material-ui/icons/Add';
import LinkIcon from '@material-ui/icons/Link';
import { currencyAmount, timestamp, ueaCode } from '../../../../components/data';
import TextArea from '../../../../components/controls/text-area';
import DynamicHeightDiv from '../../../../components/layout/dynamic-height-div';
import Select from '../../../../components/controls/select';
import Segmented from '../../../../components/controls/segmented';
import DetailFields from '../../../../components/detail/detail-fields';
import TinyProgress from '../../../../components/controls/tiny-progress';
import CodeholderPicker from '../../../../components/pickers/codeholder-picker';
import ItemPickerDialog from '../../../../components/pickers/item-picker-dialog';
import { membershipEntries as locale, codeholders as codeholdersLocale, currencies } from '../../../../locale';
import { Link } from '../../../../router';
import { connect, coreContext } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';
import { fields as CODEHOLDER_FIELDS } from '../../codeholders/detail-fields';
import './fields.less';

const portalContainer = document.createElement('div');
portalContainer.id = 'registration-entry-offer-picker-container';
document.body.appendChild(portalContainer);

function orderPortalContainerFront () {
    document.body.removeChild(portalContainer);
    document.body.appendChild(portalContainer);
}

const CODEHOLDER_DATA_FIELDS = Object.fromEntries([
    'name', 'address', 'feeCountry', 'email', 'birthdate', 'cellphone',
].map(id => ([id, CODEHOLDER_FIELDS[id]])));

const YEAR_PICKER_FIELDS = {
    year: {
        slot: 'title',
        component ({ value }) {
            return '' + value;
        },
    },
};

export const FIELDS = {
    id: {
        skipLabel: true,
        component ({ value }) {
            return <span class="registration-entry-id">{value}</span>;
        },
        shouldHide: () => true,
    },
    year: {
        sortable: true,
        slot: 'title',
        wantsCreationLabel: true,
        component ({ value, editing, onChange, item }) {
            const [dialogOpen, setDialogOpen] = useState(false);

            if (editing && (!item.status || item.status.status === 'submitted')) {
                return (
                    <Button
                        class="registration-entry-year-field"
                        onClick={() => setDialogOpen(true)}
                        outline>
                        {value || locale.fields.yearSelectYear}
                        <ItemPickerDialog
                            open={dialogOpen}
                            onClose={() => setDialogOpen(false)}
                            limit={1}
                            value={value ? [value] : []}
                            onChange={v => onChange(v[0] ? +v[0] : null)}
                            task="memberships/listOptions"
                            view="memberships/options"
                            sorting={{ year: 'asc' }}
                            filter={{ year: { $gte: new Date().getFullYear() } }}
                            emptyLabel={locale.fields.yearSelectEmpty}
                            locale={{ year: locale.fields.year }}
                            fields={YEAR_PICKER_FIELDS} />
                    </Button>
                );
            }
            return value;
        },
        shouldHide: (_, editing) => !editing,
    },
    status: {
        sortable: true,
        slot: 'titleAlt',
        component ({ value }) {
            if (!value) return null;
            return (
                <span class="registration-entry-status" data-status={value.status}>
                    {locale.fields.statusTypes[value.status]}
                </span>
            );
        },
        shouldHide: () => true,
    },
    timeSubmitted: {
        sortable: true,
        weight: 2,
        component ({ value }) {
            return <timestamp.renderer value={value} />;
        },
    },
    internalNotes: {
        component ({ value, editing, onChange }) {
            if (editing) return <TextArea value={value} onChange={v => onChange(v || null)} />;
            if (!value) return null;
            return <div>{value.split('\n').map((l, i) => <div key={i}>{l}</div>)}</div>;
        },
    },
    issue: {
        component: connectPerms(({ value, item, editing, perms }) => {
            if (!value.what) return null;

            let where;
            if (value.where.startsWith('offer[')) {
                const index = +value.where.match(/offer\[(\d+)/)[1];
                where = (
                    <span class="issue-offer">
                        <div class="registration-issue-offer-container">
                            <OfferItem
                                value={item.offers.selected[index]}
                                year={item.year}
                                currency={item.offers.currency} />
                        </div>
                    </span>
                );
            } else {
                where = locale.issue.where[value.where];
            }

            let fishy;
            if (value.what === 'fishy_data' && !editing && perms.hasPerm('registration.entries.update')) {
                fishy = (
                    <coreContext.Consumer>
                        {core => {
                            const toggleFishyOkay = () => {
                                core.createTask('memberships/updateEntry', {
                                    id: item.id,
                                    _changedFields: ['fishyIsOkay'],
                                }, { issue: { ...value, fishyIsOkay: !value.fishyIsOkay } });
                            };

                            return (
                                <div class={'issue-fishy-check' + (value.fishyIsOkay ? ' is-okay' : '')}>
                                    {value.fishyIsOkay && (
                                        <span class="marked-as-okay">
                                            <CheckIcon style={{ verticalAlign: 'middle' }} />
                                            {' '}
                                            {locale.issue.fishyMarkedOkay}
                                        </span>
                                    )}
                                    <Button onClick={toggleFishyOkay}>
                                        {value.fishyIsOkay ? locale.issue.markFishyNotOkay : locale.issue.markFishyOkay}
                                    </Button>
                                </div>
                            );
                        }}
                    </coreContext.Consumer>
                );
            }

            return (
                <div class={'registration-entry-issue' + (value.fishyIsOkay ? ' is-resolved' : '')}>
                    <div class="issue-title">
                        {value.fishyIsOkay ? (
                            <CheckIcon style={{ verticalAlign: 'middle' }} />
                        ) : (
                            <WarningIcon style={{ verticalAlign: 'middle' }} />
                        )}
                        <span class="inner-title">{locale.issue.title}</span>
                    </div>
                    <div class="issue-description">
                        {locale.issue.what[value.what]}
                        {where}
                    </div>
                    {fishy}
                </div>
            );
        }),
        isEmpty: value => !value || !value.what,
        shouldHide: (_, editing) => editing,
    },
    offers: {
        wantsCreationLabel: true,
        component ({ value, editing, item, onChange, userData }) {
            const year = userData?.fixedYear || item.year;

            if (!year || !item.codeholderData) {
                if (userData?.fixedYear) return locale.offers.selectMemberFirst;
                return locale.offers.selectYearFirst;
            }
            if (item.status && item.status.status !== 'submitted') editing = false;
            const [addOfferOpen, setAddOfferOpen] = useState(false);

            let currency = value?.currency;
            if (userData.currency) currency = userData.currency;

            if (!value) value = { currency, selected: [] };

            const onAddItem = item => {
                onChange({ ...value, selected: value.selected.concat([item]) });
                setAddOfferOpen(false);
            };
            const onItemChange = (index, data) => {
                const selected = value.selected.slice();
                selected[index] = data;
                onChange({ ...value, selected });
            };
            const removeSelected = i => {
                const selected = value.selected.slice();
                selected.splice(i, 1);
                onChange({ ...value, selected });
            };

            return (
                <div class="registration-entry-offers">
                    {editing && (
                        <div class="offers-currency">
                            <label class="offers-currency-label">{locale.offers.currency}</label>
                            <Select
                                outline
                                value={currency}
                                onChange={currency => onChange({ ...value, currency })}
                                items={(!currency ? [{ value: null, label: '—' }] : [])
                                    .concat(Object.keys(currencies).map(currency => ({
                                        value: currency,
                                        label: currencies[currency],
                                    })))} />
                        </div>
                    )}
                    <div class="selected-offers">
                        {value.selected.map((item, i) => (
                            <OfferItem
                                key={i}
                                value={item}
                                onChange={item => onItemChange(i, item)}
                                editing={editing}
                                year={year}
                                currency={currency}
                                onRemove={() => removeSelected(i)} />
                        ))}
                        {editing && currency && (
                            <div class="add-offer-container">
                                <Button
                                    class="add-offer-button"
                                    onClick={e => {
                                        e.preventDefault();
                                        orderPortalContainerFront();
                                        setAddOfferOpen(true);
                                    }}>
                                    <AddIcon style={{ verticalAlign: 'middle' }} />
                                    {' '}
                                    {locale.offers.add.button}
                                </Button>
                            </div>
                        )}
                        {editing && (
                            <Dialog
                                class="registration-entry-offers-add-offer-dialog"
                                container={portalContainer}
                                title={locale.offers.add.title}
                                open={addOfferOpen}
                                backdrop
                                onClose={() => setAddOfferOpen(false)}>
                                {userData?.intermediary ? (
                                    <AddOfferDialogIntermediary
                                        codeholder={item.codeholderData}
                                        year={year}
                                        org={userData.intermediary.org}
                                        method={userData.intermediary.method}
                                        intermediaryCurrency={currency}
                                        onAdd={onAddItem}
                                        currency={currency} />
                                ) : (
                                    <AddOfferDialog
                                        codeholder={item.codeholderData}
                                        year={year}
                                        onAdd={onAddItem}
                                        currency={currency} />
                                )}
                            </Dialog>
                        )}
                    </div>
                </div>
            );
        },
    },
    codeholderData: {
        weight: 1.5,
        slot: 'title',
        wantsCreationLabel: true,
        component ({ slot, value, editing, onChange, item }) {
            if (item.status && item.status.status !== 'submitted') editing = false;

            if (slot !== 'detail' && slot !== 'create') {
                let contents;
                if (value === null || typeof value !== 'object') {
                    contents = <CodeholderCard id={value} key={value} />;
                } else {
                    const formattedName = [
                        value.name.honorific,
                        value.name.first || value.name.firstLegal,
                        value.name.last || value.name.lastLegal,
                    ].filter(x => x).join(' ');
                    contents = [
                        <span key={0} class="new-codeholder">{locale.fields.codeholderDataTypes.object}</span>,
                        <span key={1} class="formatted-name">{formattedName}</span>,
                    ];
                }

                return (
                    <div class="registration-entry-codeholder-data-preview">
                        {contents}
                    </div>
                );
            }

            let contents;
            if (value === null || typeof value !== 'object') {
                contents = (
                    <div class="registration-entry-codeholder-data is-linked">
                        {editing ? (
                            <CodeholderPicker
                                limit={1}
                                value={value ? [value] : []}
                                onChange={v => onChange(+v[0] || null)} />
                        ) : <CodeholderCard id={value} key={value} />}
                    </div>
                );
            } else {
                let newCodeholderId = null;
                if (item.newCodeholderId) {
                    newCodeholderId = (
                        <div class="new-codeholder-id">
                            <label>
                                <CheckIcon style={{ verticalAlign: 'middle' }} />
                                {' '}
                                {locale.fields.newCodeholderId}
                            </label>
                            <CodeholderCard id={item.newCodeholderId} />
                        </div>
                    );
                }

                contents = (
                    <div class="registration-entry-codeholder-data">
                        {newCodeholderId}
                        <DetailFields
                            compact
                            data={value}
                            editing={editing}
                            edit={editing ? value : null}
                            onEditChange={onChange}
                            fields={CODEHOLDER_DATA_FIELDS}
                            locale={codeholdersLocale}
                            userData={{
                                forceShowName: true,
                                useLocalAddress: true,
                            }} />
                    </div>
                );
            }

            if (editing) {
                const valueDataType = (value !== null && typeof value === 'object') ? 'object' : 'id';
                const setDataType = type => {
                    if (type === valueDataType) return;
                    if (type === 'object') {
                        onChange({
                            type: 'human',
                            name: {
                                honorific: '',
                                first: '',
                                firstLegal: '',
                                last: '',
                                lastLegal: '',
                            },
                            address: {
                                streetAddress: null,
                                city: null,
                                cityArea: null,
                                countryArea: null,
                                postalCode: null,
                                sortingCode: null,
                                country: null,
                            },
                            feeCountry: null,
                            email: null,
                            birthdate: null,
                            cellphone: { value: null },
                        });
                    } else {
                        onChange(null);
                    }
                };

                return (
                    <div class="registration-entry-codeholder-data is-editing">
                        <div class="data-type-switch-container">
                            <Segmented
                                selected={valueDataType}
                                onSelect={setDataType}>
                                {[
                                    { id: 'id', label: locale.fields.codeholderDataTypes.id },
                                    { id: 'object', label: locale.fields.codeholderDataTypes.object },
                                ]}
                            </Segmented>
                        </div>
                        {contents}
                    </div>
                );
            }
            return contents;
        },
    },
};

export class Header extends PureComponent {
    static contextType = coreContext;

    render ({ item }) {
        let cancelButton;
        if (item.status.status === 'pending' || item.status.status === 'submitted') {
            cancelButton = (
                <Button onClick={() => this.context.createTask('memberships/cancelEntry', {
                    id: item.id,
                })}>
                    {locale.actions.cancel}
                </Button>
            );
        }

        let statusTime = null;
        if (item.status.time) {
            statusTime = (
                <span>
                    {locale.fields.timeSubmittedTime}
                    {': '}
                    <timestamp.renderer value={item.status.time} />
                </span>
            );
        }

        return (
            <div class="registration-entry-header">
                <div class="entry-top">
                    <span class="inner-status" data-status={item.status.status}>
                        {locale.fields.statusTypes[item.status.status]}
                    </span>
                    <span class="inner-id registration-entry-id">{item.id}</span>
                </div>
                <div class="entry-title">
                    {locale.titlePrefix}
                    {' '}
                    <span class="title-year">{item.year}</span>
                </div>
                <div class="entry-status-time">
                    {statusTime}
                </div>
                <div class="entry-actions">
                    {cancelButton}
                </div>
            </div>
        );
    }
}

const CodeholderDataForOffers = connect(({ codeholder }) => ['codeholders/codeholder', {
    id: codeholder,
    fields: ['birthdate', 'age', 'agePrimo', 'feeCountry', 'feeCountryGroups', 'isActiveMember'],
}])(data => ({ data }))(function CodeholderDataForOffers ({ data, children }) {
    if (!data) return <div class="progress-container"><CircularProgress indeterminate /></div>;
    return children(data);
});

// TODO: if existing codeholder, filter memberships
const AddOfferDialog = connect(({ year }) => ['memberships/options', { id: year }])(data => ({
    data,
}))(AddOfferDialogInner);
const AddOfferDialogIntermediary = connect(({
    org, method,
}) => ['payments/method', { org, id: method }])(data => ({
    data, intermediary: true,
}))(AddOfferDialogInner);

function AddOfferDialogInner ({ data, intermediary, intermediaryCurrency, year, currency, onAdd, codeholder }) {
    if (!data) return <div class="progress-container"><CircularProgress indeterminate /></div>;

    let offerGroups = data.offers;
    let yearCurrency = data.currency;
    if (intermediary) {
        // intermediary data loaded from a PaymentMethodIntermediary

        let categories = [];
        let magazines = [];

        if (data.prices[year]) {
            categories = data.prices[year].registrationEntries.membershipCategories.map(item => ({
                type: 'membership',
                id: item.id,
                price: item.price,
            }));
            magazines = data.prices[year].registrationEntries.magazines.flatMap(item => {
                const baseItem = {
                    type: 'magazine',
                    id: item.id,
                };
                const items = [];
                if (item.prices && item.prices.paper) {
                    items.push({ ...baseItem, price: item.prices.paper });
                }
                if (item.prices && item.prices.access) {
                    items.push({ ...baseItem, price: item.prices.access });
                }
                return items;
            });
        }

        offerGroups = [
            categories.length && {
                title: locale.offers.types.memberships,
                offers: categories,
            },
            magazines.length && {
                title: locale.offers.types.magazines,
                offers: magazines,
            },
        ].filter(x => x);
        yearCurrency = intermediaryCurrency;
    }

    const contents = codeholder => (
        <div class="add-offer">
            {offerGroups.map((group, i) => (
                <AddOfferGroup
                    key={i}
                    group={group}
                    year={year}
                    yearCurrency={yearCurrency}
                    onAdd={onAdd}
                    codeholder={codeholder}
                    currency={currency} />
            ))}
        </div>
    );

    if (typeof codeholder === 'number') {
        return (
            <CodeholderDataForOffers codeholder={codeholder}>
                {codeholder => contents(codeholder)}
            </CodeholderDataForOffers>
        );
    }
    return contents(codeholder);
}

function AddOfferGroup ({ group, year, yearCurrency, currency, onAdd, codeholder }) {
    const [open, setOpen] = useState(false);

    return (
        <div class="offer-group">
            <div class="group-title" onClick={() => setOpen(!open)}>
                <Button class="disclosure-button" icon small>
                    {open ? <UpIcon /> : <DownIcon />}
                </Button>
                <div class="inner-title">
                    {group.title}
                </div>
            </div>
            <DynamicHeightDiv>
                {open && (
                    <div class="group-contents">
                        {group.offers.map((item, i) => (
                            <OfferItemAmount
                                codeholder={codeholder}
                                offer={item}
                                offerCurrency={yearCurrency}
                                currency={currency}
                                key={i}>
                                {amount => (
                                    <OfferItem
                                        onSelect={() => onAdd({
                                            type: item.type,
                                            id: item.id,
                                            amount,
                                        })}
                                        value={{ ...item, amount }}
                                        year={year}
                                        currency={currency} />
                                )}
                            </OfferItemAmount>
                        ))}
                        {!group.offers.length && (
                            <div class="contents-empty">{locale.offers.add.emptyGroup}</div>
                        )}
                    </div>
                )}
            </DynamicHeightDiv>
        </div>
    );
}

const OfferItemAmount = connect(({ offerCurrency }) => [
    'payments/exchangeRates', { base: offerCurrency },
])(rates => ({ rates }))(class OfferItemAmount extends PureComponent {
    state = { amount: null };
    update () {
        const { codeholder, offer, currency, rates } = this.props;
        if (!codeholder || !offer?.price || !rates) return;
        const resultKey = Symbol('result');
        const val = evaluate([offer.price.script, { [resultKey]: { t: 'c', f: 'id', a: [offer.price.var] } }], resultKey, id => {
            if (id === 'birthdate') return codeholder.birthdate ? new Date(codeholder.birthdate + 'T00:00:00Z') : null;
            if (id.startsWith('age') && !('age' in codeholder)) {
                const birthdate = new Date(codeholder.birthdate + 'T00:00:00Z');
                if (id === 'age') return moment().diff(birthdate, 'years');
                else if (id === 'agePrimo') {
                    const beginningOfYear = moment([new Date().getFullYear(), 0, 1]);
                    return beginningOfYear.diff(birthdate, 'years');
                }
            }
            return codeholder[id] || null;
        });
        this.setState({ amount: Math.round(val * rates[currency]) });
    }
    componentDidMount () {
        this.update();
    }
    componentDidUpdate (prevProps) {
        if (prevProps.codeholder !== this.props.codeholder
            || prevProps.offer !== this.props.offer
            || prevProps.rates !== this.props.rates) {
            this.update();
        }
    }
    render ({ children }, { amount }) {
        return children(amount);
    }
});

function OfferItem ({ value, year, currency, editing, onChange, onRemove, onSelect }) {
    let disabled = false;
    let contents;
    if (value.type === 'membership') {
        contents = <OfferMembership id={value.id} noLink={onSelect} />;
    } else if (value.type === 'magazine') {
        contents = <OfferMagazine id={value.id} noLink={onSelect} />;
    } else if (value.type === 'addon') {
        contents = <OfferAddon id={value.id} year={year} noLink={onSelect} />;
        onSelect = null;
        disabled = true;
    }

    return (
        <div
            onClick={onSelect}
            class={'registration-entry-offer-item' + (onSelect ? ' is-selectable' : '') + (disabled ? ' is-disabled' : '')}>
            {editing && (
                <div class="item-remove">
                    <Button class="item-remove-button" icon small onClick={e => {
                        e.preventDefault();
                        onRemove();
                    }}>
                        <RemoveIcon />
                    </Button>
                </div>
            )}
            <div class="item-label">
                <div class="offer-type">{locale.offers.types[value.type]}</div>
                {contents}
            </div>
            <div class="item-amount">
                {editing ? (
                    <currencyAmount.editor
                        outline
                        value={value.amount}
                        onChange={amount => onChange({ ...value, amount })}
                        currency={currency} />
                ) : (!onSelect || value.amount) ? (
                    <currencyAmount.renderer value={value.amount} currency={currency} />
                ) : null}
            </div>
        </div>
    );
}

const CodeholderCard = connect(({ id }) => ['codeholders/codeholder', {
    id,
    fields: ['code'],
}])(data => ({ data }))(function CodeholderCard ({ data, id }) {
    let contents = <TinyProgress />;
    if (data) {
        contents = (
            <div class="codeholder-card-inner">
                <LinkIcon style={{ verticalAlign: 'middle' }} />
                {' '}
                <ueaCode.renderer value={data.code?.new} />
            </div>
        );
    }
    return (
        <Link class="codeholder-card" target={`/membroj/${id}`} outOfTree>
            {contents}
        </Link>
    );
});

const OfferMembership = connect(({ id }) => ['memberships/category', { id }])(data => ({
    data,
}))(function OfferMembership ({ data, id, noLink }) {
    if (!data) return <TinyProgress />;
    if (noLink) return data.name;
    const target = `/membreco/kategorioj/${id}`;
    return <Link target={target}>{data.name}</Link>;
});

const OfferMagazine = connect(({ id }) => ['magazines/magazine', { id }])(data => ({
    data,
}))(function OfferMagazine ({ data, id, noLink }) {
    if (!data) return <TinyProgress />;
    if (noLink) return data.name;
    const target = `/revuoj/${id}`;
    return <Link target={target}>{data.name}</Link>;
});

const OfferAddon = connect(({ year }) => ['memberships/options', { id: year }])(data => ({
    data,
}))(function OfferAddon ({ data, id, noLink }) {
    if (!data) return <TinyProgress />;
    return (
        <div class="inner-addon-offer">
            <OfferAddonInner org={data.paymentOrgId} id={id} noLink={noLink} />
            <div class="inner-note">
                {locale.offers.cannotAddAddonNote}
            </div>
        </div>
    );
});

const OfferAddonInner = connect(({ org, id }) => ['payments/addon', { org, id }])(data => ({
    data,
}))(function OfferAddonInner ({ data, org, id, noLink }) {
    if (!data) return <TinyProgress />;
    if (noLink) return data.name;
    const target = `/aksopago/organizoj/${org}/aldonebloj/${id}`;
    return <Link target={target}>{data.name}</Link>;
});
