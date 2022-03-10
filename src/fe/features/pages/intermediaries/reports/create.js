import { h } from 'preact';
import { useState, useEffect } from 'preact/compat';
import { Button, CircularProgress, TextField } from 'yamdl';
import EditIcon from '@material-ui/icons/Edit';
import RemoveIcon from '@material-ui/icons/Remove';
import Page from '../../../../components/page';
import Select from '../../../../components/controls/select';
import { country, currencyAmount } from '../../../../components/data';
import DialogSheet from '../../../../components/tasks/dialog-sheet';
import DetailFields from '../../../../components/detail/detail-fields';
import TinyProgress from '../../../../components/controls/tiny-progress';
import ItemPicker from '../../../../components/pickers/item-picker-dialog';
import MdField from '../../../../components/controls/md-field';
import PaymentMethodPicker from '../../payments/method-picker';
import Meta from '../../../meta';
import {
    intermediaryReports as locale,
    membershipEntries as entriesLocale,
    paymentAddons as addonsLocale,
    currencies,
} from '../../../../locale';
import { FIELDS as ENTRY_FIELDS } from '../../memberships/entries/fields';
import { FIELDS as ADDON_FIELDS } from '../../payments/orgs/addons/fields';
import { connect, coreContext } from '../../../../core/connection';
import './create.less';

const REDUCED_ENTRY_FIELDS = Object.fromEntries(['codeholderData', 'offers'].map(id => [id, ENTRY_FIELDS[id]]));
const NEW_ENTRY = {
    codeholderData: null,
    offers: null,
};

const EMPTY_STATE = {
    org: null,
    method: null,
    methodData: null,
    country: null,
    year: null,
    number: null,
    currency: null,
    entries: [],
    addons: [],
    expenses: [],
};

export default class CreateReport extends Page {
    state = {
        loading: false,
        ...EMPTY_STATE,
    };

    reset () {
        this.setState(EMPTY_STATE);
    }

    componentDidMount () {
        try {
            const reportState = JSON.parse(sessionStorage.spReportState);
            this.setState(reportState, () => {
                if (this.state.method) this.loadMethod();
            });
        } catch {
            /* doesnt matter */
        }
    }

    componentDidUpdate () {
        try {
            sessionStorage.spReportState = JSON.stringify({
                org: this.state.org,
                method: this.state.method,
                country: this.state.country,
                year: this.state.year,
                number: this.state.number,
                currency: this.state.currency,
                entries: this.state.entries,
                addons: this.state.addons,
                expenses: this.state.expenses,
            });
        } catch {
            /* doesnt matter */
        }
    }

    static contextType = coreContext;

    loadMethod () {
        const { org, method: id } = this.state;
        this.setState({ loading: true });
        this.context.createTask('payments/getMethod', { org, id }).runOnceAndDrop().then(result => {
            this.setState({ methodData: result, loading: false });
        }).catch(err => {
            console.error(err); // eslint-disable-line no-console
            this.context.createTask('info', {
                message: locale.failedToLoadMethod,
            });
            this.setState({ loading: false });
        });
    }

    loadYear () {
        this.setState({ loading: true });
        this.context.createTask('payments/listIntermediaryIntents', {}, {
            jsonFilter: {
                filter: {
                    intermediaryCountryCode: this.state.country,
                    'intermediaryIdentifier.year': this.state.year,
                },
            },
            fields: [{ id: 'intermediary', sorting: 'none' }, { id: 'timeCreated', sorting: 'desc' }],
            limit: 1,
        }).runOnceAndDrop().then(result => {
            const first = result.items[0];
            if (!first) {
                this.setState({ number: 1, loading: false });
                return;
            }

            return new Promise((resolve, reject) => {
                const view = this.context.createDataView('payments/intent', {
                    id: first,
                    fields: ['intermediary'],
                    noFetch: true,
                });
                view.on('update', data => {
                    this.setState({ number: (data.intermediary?.number | 0) + 1, loading: false });
                    resolve();
                    view.drop();
                });
                view.on('error', err => {
                    reject(err);
                    view.drop();
                });
            });
        }).catch(err => {
            console.error(err); // eslint-disable-line no-console
            this.context.createTask('info', {
                message: locale.failedToLoadYear,
            });
            this.setState({ loading: false });
        });
    }

    render () {
        let contents;
        if (this.state.loading) {
            contents = (
                <div class="loading-container">
                    <CircularProgress indeterminate />
                </div>
            );
        } else if (!this.state.country || !this.state.year) {
            contents = (
                <div>
                    <PaymentMethodPicker
                        item={{}}
                        org={this.state.org}
                        onOrgChange={org => this.setState({ org })}
                        value={this.state.method}
                        onChange={method => this.setState({ method }, () => this.loadMethod())}
                        jsonFilter={{ type: 'intermediary' }} />
                    todo proper country editor
                    {this.state.method && (
                        <country.editor
                            value={this.state.country}
                            onChange={country => this.setState({ country })} />
                    )}
                    {this.state.country && (
                        <Select
                            value={this.state.year}
                            onChange={year => this.setState({ year }, () => this.loadYear())}
                            items={[{
                                value: null,
                                label: '—',
                            }].concat(Object.keys(this.state.methodData.prices).map(year => ({
                                value: +year,
                                label: year,
                            })))} />
                    )}
                </div>
            );
        } else {
            const header = (
                <div class="report-header">
                    <Button onClick={() => this.reset()}>
                        {locale.reset}
                    </Button>
                    <div class="report-title">
                        {locale.idFmt(this.state.year, this.state.number)}
                        {' '}
                        {locale.idCountryInfix}
                        {' '}
                        <country.renderer value={this.state.country} />
                    </div>
                    <div class="report-subtitle">
                        todo method name
                    </div>
                    <Select
                        outline
                        value={this.state.currency}
                        onChange={currency => this.setState({ currency })}
                        items={(!this.state.currency ? [{ value: null, label: '—' }] : [])
                            .concat((this.state.methodData?.currencies || []).map(currency => ({
                                value: currency,
                                label: currencies[currency],
                            })))} />
                </div>
            );

            let entries = null;
            if (this.state.currency) {
                entries = (
                    <div>
                        <EntriesEditor
                            year={this.state.year}
                            org={this.state.org}
                            method={this.state.method}
                            currency={this.state.currency}
                            value={this.state.entries}
                            onChange={entries => this.setState({ entries })} />
                        <AddonsEditor
                            org={this.state.org}
                            currency={this.state.currency}
                            value={this.state.addons}
                            onChange={addons => this.setState({ addons })} />
                        <ExpensesEditor
                            currency={this.state.currency}
                            value={this.state.expenses}
                            onChange={expenses => this.setState({ expenses })} />
                    </div>
                );
            }

            contents = (
                <div>
                    {header}
                    {entries}
                </div>
            );
        }

        return (
            <div class="intermediary-report-create">
                <Meta title={locale.create.title} />
                {contents}
            </div>
        );
    }
}

function EntriesEditor ({ value, onChange, year, org, method, currency }) {
    const [editing, setEditing] = useState(null);

    return (
        <div>
            {value.map((entry, i) => (
                <EntryItem
                    key={i}
                    entry={entry}
                    editing={editing === i}
                    onEdit={() => setEditing(i)}
                    onRemove={() => {
                        const newEntries = value.slice();
                        newEntries.splice(i, 1);
                        setEditing(null);
                        onChange(newEntries);
                    }} />
            ))}
            <div>
                <Button onClick={() => {
                    setEditing(value.length);
                    onChange(value.concat([NEW_ENTRY]));
                }}>
                    {locale.entries.add.button}
                </Button>
            </div>
            <EntryEditor
                year={year}
                org={org}
                method={method}
                currency={currency}
                entry={editing !== null ? value[editing] : null}
                onCancel={() => {
                    if (value[editing].codeholderData === null) {
                        // user canceled creation
                        const newEntries = value.slice();
                        newEntries.splice(editing, 1);
                        onChange(newEntries);
                    }
                    setEditing(null);
                }}
                onConfirm={entry => {
                    const newEntries = value.slice();
                    newEntries[editing] = entry;
                    onChange(newEntries);
                    setEditing(null);
                }} />
        </div>
    );
}

function EntryItem ({ entry, onEdit, onRemove }) {
    if (!entry) {
        useEffect(() => onRemove());
        return '???';
    }

    return (
        <div class="report-entry">
            <div class="entry-header">
                <Button icon small class="remove-button" onClick={onRemove}>
                    <RemoveIcon />
                </Button>
                <RegistrationEntryName entry={entry} />
                <Button icon small class="edit-button" onClick={onEdit}>
                    <EditIcon />
                </Button>
            </div>
        </div>
    );
}

function RegistrationEntryName ({ entry }) {
    if (typeof entry.codeholderData === 'number') {
        return (
            <div class="entry-name">
                <CodeholderName id={entry.codeholderData} />
            </div>
        );
    } else {
        return (
            <div class="entry-name">
                <CodeholderNameLabel name={entry.codeholderData?.name} />
            </div>
        );
    }
}

const CodeholderName = connect(({ id }) => [
    'codeholders/codeholder', { id, fields: ['name'] },
])()(function CodeholderName ({ name }) {
    if (!name) return <TinyProgress />;
    return <CodeholderNameLabel name={name} />;
});

function CodeholderNameLabel ({ name }) {
    if (!name) return;
    if (name.full) return name.full;
    return [
        name.honorific,
        name.first || name.firstLegal,
        name.last || name.lastLegal,
    ].filter(x => x).join(' ');
}

function EntryEditor ({ entry, onCancel, onConfirm, year, org, method, currency }) {
    const [edit, onEditChange] = useState(null);

    return (
        <DialogSheet
            class="intermediary-report-entry-dialog"
            title={locale.entries.edit.title}
            open={entry !== null}
            onClose={onCancel}
            actions={[
                {
                    label: locale.entries.edit.confirm,
                    action: () => onConfirm(edit),
                },
            ]}>
            <InnerEntryEditor
                entry={entry}
                onEditChange={onEditChange}
                year={year}
                org={org}
                method={method}
                currency={currency} />
        </DialogSheet>
    );
}

function InnerEntryEditor ({ entry, onEditChange, year, org, method, currency }) {
    const [edit, onLocalEditChange] = useState(entry);

    return (
        <DetailFields
            compact
            editing
            data={entry}
            edit={edit}
            onEditChange={edit => {
                onLocalEditChange(edit);
                onEditChange(edit);
            }}
            fields={REDUCED_ENTRY_FIELDS}
            locale={entriesLocale}
            userData={{
                fixedYear: year,
                intermediary: { org, method },
                currency,
            }} />
    );
}

function AddonsEditor ({ org, value, onChange, currency }) {
    const [adding, setAdding] = useState(false);

    return (
        <div>
            {value.map((addon, i) => (
                <AddonItem
                    key={addon.id}
                    org={org}
                    addon={addon}
                    currency={currency}
                    onChange={addon => {
                        const newAddons = value.slice();
                        newAddons[i] = addon;
                        onChange(newAddons);
                    }}
                    onRemove={() => {
                        const newAddons = value.slice();
                        newAddons.splice(i, 1);
                        onChange(newAddons);
                    }} />
            ))}
            <div>
                <Button onClick={() => setAdding(true)}>
                    {locale.addons.add.button}
                </Button>
                <AddAddon
                    open={adding}
                    onClose={() => setAdding(false)}
                    onAdd={item => onChange(value.concat(item))}
                    org={org}
                    selectedIds={value.map(item => item.id)} />
            </div>
        </div>
    );
}

function AddonItem ({ org, addon, onChange, onRemove, currency }) {
    if (!addon) return '???';

    return (
        <div class="report-addon">
            <div class="addon-header">
                <Button icon small class="remove-button" onClick={onRemove}>
                    <RemoveIcon />
                </Button>
                <AddonName org={org} id={addon.id} />
            </div>
            <currencyAmount.editor
                outline
                value={addon.amount}
                onChange={amount => onChange({ ...addon, amount })}
                currency={currency} />
        </div>
    );
}

const AddonName = connect(({ org, id }) => ['payments/addon', { org, id }])()(function AddonName ({ name }) {
    if (!name) return <TinyProgress />;
    return name;
});

function AddAddon ({ open, onClose, onAdd, org, selectedIds }) {
    return (
        <ItemPicker
            open={open}
            onClose={onClose}
            limit={1}
            value={[]}
            onChange={items => {
                if (items.length) {
                    onAdd({ id: items[0], amount: 0 });
                    onClose();
                }
            }}
            task="payments/listAddons"
            view="payments/addon"
            options={{ org }}
            viewOptions={{ org }}
            filter={{
                id: { $nin: selectedIds },
            }}
            fields={ADDON_FIELDS}
            locale={addonsLocale.fields}
            emptyLabel={locale.addons.add.empty} />
    );
}

function ExpensesEditor ({ value, onChange, currency }) {
    return (
        <div class="report-expenses">
            {value.map((item, i) => (
                <ExpenseItem
                    key={i}
                    expense={item}
                    onChange={item => {
                        const newItems = value.slice();
                        newItems[i] = item;
                        onChange(newItems);
                    }}
                    onRemove={() => {
                        const newItems = value.slice();
                        newItems.splice(i, 1);
                        onChange(newItems);
                    }}
                    currency={currency} />
            ))}
            <div>
                <Button onClick={() => onChange(value.concat({
                    title: '',
                    description: null,
                    amount: 0,
                }))}>
                    {locale.expenses.add.button}
                </Button>
            </div>
        </div>
    );
}

function ExpenseItem ({ expense, onChange, onRemove, currency }) {
    return (
        <div class="expense-item">
            <Button icon small class="remove-button" onClick={onRemove}>
                <RemoveIcon />
            </Button>
            <TextField
                outline
                label={locale.expenses.item.title}
                value={expense.title}
                onChange={e => onChange({ ...expense, title: e.target.value })} />
            <MdField
                editing
                rules={['emphasis', 'strikethrough', 'link', 'list', 'table']}
                value={expense.description || ''}
                maxLength={5000}
                onChange={value => onChange({ ...expense, description: value || null })} />
            <currencyAmount.editor
                outline
                value={expense.amount}
                onChange={amount => onChange({ ...expense, amount })}
                currency={currency} />
        </div>
    );
}
