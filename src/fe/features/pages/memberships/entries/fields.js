import { h } from 'preact';
import { useState, PureComponent } from 'preact/compat';
import { Button, CircularProgress, Dialog, TextField } from '@cpsdqs/yamdl';
import WarningIcon from '@material-ui/icons/Warning';
import CheckIcon from '@material-ui/icons/CheckCircleOutline';
import RemoveIcon from '@material-ui/icons/Remove';
import UpIcon from '@material-ui/icons/KeyboardArrowUp';
import DownIcon from '@material-ui/icons/KeyboardArrowDown';
import AddIcon from '@material-ui/icons/Add';
import LinkIcon from '@material-ui/icons/Link';
import { currencyAmount, timestamp, ueaCode } from '../../../../components/data';
import TextArea from '../../../../components/text-area';
import DynamicHeightDiv from '../../../../components/dynamic-height-div';
import Select from '../../../../components/select';
import Segmented from '../../../../components/segmented';
import DetailFields from '../../../../components/detail-fields';
import TinyProgress from '../../../../components/tiny-progress';
import CodeholderPicker from '../../../../components/codeholder-picker';
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
        component ({ value, editing, onChange, item, slot }) {
            if (editing && (!item.status || item.status.status === 'submitted')) {
                return (
                    <TextField
                        class="registration-entry-year-field"
                        outline
                        label={slot === 'create' ? locale.fields.year : null}
                        type="number"
                        value={'' + value}
                        onChange={e => onChange(+e.target.value | 0)} />
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
        component ({ value, editing, item, onChange }) {
            if (!item.year) return null;
            if (item.status && item.status.status !== 'submitted') editing = false;
            const [addOfferOpen, setAddOfferOpen] = useState(false);

            if (!value) value = { currency: null, selected: [] };

            const year = item.year;

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
                            <Select
                                outline
                                value={value.currency}
                                onChange={currency => onChange({ ...value, currency })}
                                items={(!value.currency ? [{ value: null, label: '—' }] : [])
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
                                currency={value.currency}
                                onRemove={() => removeSelected(i)} />
                        ))}
                        {editing && value.currency && (
                            <div class="add-offer-container">
                                <Button
                                    icon
                                    small
                                    class="add-offer-button"
                                    onClick={e => {
                                        e.preventDefault();
                                        orderPortalContainerFront();
                                        setAddOfferOpen(true);
                                    }}>
                                    <AddIcon />
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
                                <AddOfferDialog
                                    year={year}
                                    onAdd={onAddItem}
                                    currency={item.offers?.currency} />
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

const AddOfferDialog = connect(({ year }) => ['memberships/options', { id: year }])(data => ({
    data,
}))(function AddOfferDialog ({ data, year, currency, onAdd }) {
    if (!data) return <div class="progress-container"><CircularProgress indeterminate /></div>;

    return (
        <div class="add-offer">
            {data.offers.map((group, i) => (
                <AddOfferGroup
                    key={i}
                    group={group}
                    year={year}
                    onAdd={onAdd}
                    currency={currency} />
            ))}
        </div>
    );
});

function AddOfferGroup ({ group, year, currency, onAdd }) {
    const [open, setOpen] = useState(false);

    return (
        <div class="offer-group">
            <div class="group-title">
                <Button class="disclosure-button" icon small onClick={() => setOpen(!open)}>
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
                            <OfferItem
                                key={i}
                                onSelect={() => onAdd({
                                    type: item.type,
                                    id: item.id,
                                    amount: 0,
                                })}
                                value={{ ...item, amount: 0 }}
                                year={year}
                                currency={currency} />
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

function OfferItem ({ value, year, currency, editing, onChange, onRemove, onSelect }) {
    let contents;
    if (value.type === 'membership') {
        contents = <OfferMembership id={value.id} noLink={onSelect} />;
    } else if (value.type === 'addon') {
        contents = <OfferAddon id={value.id} year={year} noLink={onSelect} />;
    }

    return (
        <div
            onClick={onSelect}
            class={'registration-entry-offer-item' + (onSelect ? ' is-selectable' : '')}>
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
            {!onSelect && (
                <div class="item-amount">
                    {editing ? (
                        <currencyAmount.editor
                            outline
                            value={value.amount}
                            onChange={amount => onChange({ ...value, amount })}
                            currency={currency} />
                    ) : (
                        <currencyAmount.renderer value={value.amount} currency={currency} />
                    )}
                </div>
            )}
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

const OfferAddon = connect(({ year }) => ['memberships/options', { id: year }])(data => ({
    data,
}))(function OfferAddon ({ data, id, noLink }) {
    if (!data) return <TinyProgress />;
    return <OfferAddonInner org={data.paymentOrgId} id={id} noLink={noLink} />;
});

const OfferAddonInner = connect(({ org, id }) => ['payments/addon', { org, id }])(data => ({
    data,
}))(function OfferAddonInner ({ data, org, id, noLink }) {
    if (!data) return <TinyProgress />;
    if (noLink) return data.name;
    const target = `/aksopago/organizoj/${org}/aldonebloj/${id}`;
    return <Link target={target}>{data.name}</Link>;
});
