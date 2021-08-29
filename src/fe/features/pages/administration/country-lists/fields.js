import { h } from 'preact';
import { useState } from 'preact/compat';
import { Button, Dialog } from 'yamdl';
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import RemoveIcon from '@material-ui/icons/Remove';
import fuzzaldrin from 'fuzzaldrin';
import CodeholderPicker from '../../../../components/codeholder-picker';
import { WithCountries, CountryFlag } from '../../../../components/data/country';
import { IdUEACode } from '../../../../components/data/uea-code';
import { countryLists as locale } from '../../../../locale';
import { Link } from '../../../../router';
import './fields.less';

export function Header ({ item }) {
    return (
        <div class="country-org-list-header">
            <h1 class="list-title">{item.name}</h1>
        </div>
    );
}

export const FIELDS = {
    name: {
        sortable: true,
        slot: 'title',
        weight: 0.5,
        component ({ value }) {
            return <span class="country-org-list-name">{value}</span>;
        },
        shouldHide: () => true,
    },
    list: {
        slot: 'body',
        weight: 1,
        component ({ value, editing, onChange }) {
            return (
                <WithCountries>
                    {(countries) => (
                        <ListField value={value} editing={editing} onChange={onChange} countries={countries} />
                    )}
                </WithCountries>
            );
        },
    },
};

function ListField ({ value, editing, onChange, countries }) {
    const [search, setSearch] = useState('');
    const [showAddCountry, setShowAddCountry] = useState(false);
    const [pickers] = useState({});

    const searchResults = search
        ? fuzzaldrin
            .filter(Object.keys(value).map(code => ({ code, name: countries[code].name_eo })), search, { key: 'name' })
            .map(x => x.code)
        : Object.keys(value);

    const entries = [];
    for (const country of searchResults) {
        entries.push(
            <div class={'country-entry' + (editing ? ' is-editing' : '')} key={country}>
                {editing ? (
                    <div class="entry-delete">
                        <Button class="entry-delete-button" icon small onClick={() => {
                            const newValue = { ...value };
                            delete newValue[country];
                            onChange(newValue);
                        }}>
                            <RemoveIcon />
                        </Button>
                    </div>
                ) : null}
                <div class="entry-title">
                    {countries[country] ? countries[country].name_eo : country}
                </div>
                <div class="entry-codeholders">
                    {editing ? (
                        <CodeholderPicker value={value[country].map(x => '' + x)} onChange={ch => {
                            onChange({ ...value, [country]: ch.map(x => +x) }); // integer ids!
                        }} jsonFilter={{ codeholderType: 'org' }} ref={p => pickers[country] = p} />
                    ) : (
                        value[country].map(id => (
                            <Link class="codeholder-item" key={id} outOfTree target={`/membroj/${id}`}>
                                <IdUEACode id={id} />
                            </Link>
                        ))
                    )}
                </div>
            </div>
        );
    }

    if (!entries.length) {
        entries.push(
            <div class="empty-notice">
                {locale.fields.listEmpty}
            </div>
        );
    }

    const onAddCountry = code => {
        onChange({ ...value, [code]: [] });
        setShowAddCountry(false);
        setTimeout(() => {
            // show picker after adding
            pickers[code]?.open();
        }, 50);
    };

    return (
        <div class="country-org-list-inner-list">
            <div class="country-search">
                <SearchIcon className="search-icon" />
                <input
                    class="search-input"
                    placeholder={locale.fields.listSearch}
                    value={search}
                    onChange={e => setSearch(e.target.value)} />
            </div>
            <div class="inner-countries">
                {entries}
                {editing ? (
                    <div class="add-entry-container">
                        <Button icon small onClick={() => setShowAddCountry(true)}>
                            <AddIcon />
                        </Button>
                        <Dialog
                            class="country-org-list-add-country-dialog"
                            open={showAddCountry}
                            onClose={() => setShowAddCountry(false)}
                            backdrop>
                            <AddCountryDialogContents onAdd={onAddCountry} countries={countries} taken={Object.keys(value)} />
                        </Dialog>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function AddCountryDialogContents ({ onAdd, countries, taken }) {
    const [search, setSearch] = useState('');

    const searchResults = search
        ? fuzzaldrin
            .filter(Object.keys(countries).map(code => ({ code, name: countries[code].name_eo })), search, { key: 'name' })
            .map(x => x.code)
        : Object.keys(countries);
    const items = [];
    for (const k of searchResults) {
        if (taken.includes(k)) continue;
        items.push(
            <Button key={k} class="country-item" onClick={() => onAdd(k)}>
                <span class="country-flag-container">
                    <CountryFlag country={k} />
                </span>
                <span class="country-label">
                    {countries[k].name_eo}
                </span>
            </Button>
        );
    }

    if (!items.length) {
        items.push(
            <div class="empty-notice">
                {locale.fields.listAddCountry.empty}
            </div>
        );
    }

    return (
        <div>
            <div class="search-box">
                <SearchIcon className="search-icon" />
                <input
                    class="search-input"
                    placeholder={locale.fields.listAddCountry.searchPlaceholder}
                    value={search}
                    onChange={e => setSearch(e.target.value)} />
            </div>
            {items}
        </div>
    );
}
