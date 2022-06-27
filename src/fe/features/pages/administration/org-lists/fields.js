import { h } from 'preact';
import { useState } from 'preact/compat';
import { Button, Dialog, TextField } from 'yamdl';
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import RemoveIcon from '@material-ui/icons/Remove';
import fuzzaldrin from 'fuzzaldrin';
import CodeholderPicker from '../../../../components/pickers/codeholder-picker';
import DynamicHeightDiv from '../../../../components/layout/dynamic-height-div';
import { Form, Field, ValidatedTextField } from '../../../../components/form';
import { IdUEACode } from '../../../../components/data/uea-code';
import { orgLists as locale } from '../../../../locale';
import { Link } from '../../../../router';
import './fields.less';

export function Header ({ item, editing }) {
    return (
        <div class="org-list-header">
            <h1 class="list-title">{item.name}</h1>
            <DynamicHeightDiv lazy>
                {editing && (
                    <div class="name-not-editable-note">{locale.fields.nameNotEditable}</div>
                )}
            </DynamicHeightDiv>
        </div>
    );
}

export const FIELDS = {
    name: {
        sortable: true,
        slot: 'title',
        weight: 0.5,
        component ({ value, onChange, slot }) {
            if (slot === 'create') {
                return (
                    <TextField
                        outline
                        label={locale.fields.name}
                        value={value}
                        onChange={e => onChange(e.target.value)} />
                );
            }
            return <span class="org-list-name">{value}</span>;
        },
        shouldHide: () => true,
    },
    list: {
        slot: 'body',
        weight: 1,
        component ({ value, editing, onChange }) {
            return (
                <ListField value={value} editing={editing} onChange={onChange} />
            );
        },
    },
};

function ListField ({ value, editing, onChange }) {
    const [search, setSearch] = useState('');
    const [showAddTag, setShowAddTag] = useState(false);
    const [pickers] = useState({});

    const searchResults = search
        ? fuzzaldrin.filter(Object.keys(value), search)
        : Object.keys(value);

    const entries = [];
    for (const tag of searchResults) {
        entries.push(
            <div class={'tag-entry' + (editing ? ' is-editing' : '')} key={tag}>
                {editing ? (
                    <div class="entry-delete">
                        <Button class="entry-delete-button" icon small onClick={() => {
                            const newValue = { ...value };
                            delete newValue[tag];
                            onChange(newValue);
                        }}>
                            <RemoveIcon />
                        </Button>
                    </div>
                ) : null}
                <div class="entry-title">
                    {tag}
                </div>
                <div class="entry-codeholders">
                    {editing ? (
                        <CodeholderPicker value={value[tag].map(x => '' + x)} onChange={ch => {
                            onChange({ ...value, [tag]: ch.map(x => +x) }); // integer ids!
                        }} jsonFilter={{ codeholderType: 'org' }} ref={p => pickers[tag] = p} />
                    ) : (
                        value[tag].map(id => (
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

    const onAddTag = code => {
        onChange({ ...value, [code]: [] });
        setShowAddTag(false);
        setTimeout(() => {
            // show picker after adding
            pickers[code]?.open();
        }, 50);
    };

    return (
        <div class="org-list-inner-list">
            <div class="tag-search">
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
                        <Button icon small onClick={() => setShowAddTag(true)}>
                            <AddIcon />
                        </Button>
                        <Dialog
                            class="org-list-add-tag-dialog"
                            title={locale.fields.listAddTag.title}
                            open={showAddTag}
                            onClose={() => setShowAddTag(false)}
                            backdrop>
                            <AddTagDialogContents onAdd={onAddTag} taken={Object.keys(value)} />
                        </Dialog>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function AddTagDialogContents ({ onAdd, taken }) {
    const [tag, setTag] = useState('');
    return (
        <Form onSubmit={() => onAdd(tag)}>
            <Field class="label-name-input-container">
                <ValidatedTextField
                    component={TextField}
                    outline
                    class="label-name-input"
                    label={locale.fields.listAddTag.label}
                    maxLength={48}
                    value={tag}
                    validate={value => {
                        if (!value) return locale.fields.listAddTag.labelEmpty;
                        if (taken.includes(value)) {
                            return locale.fields.listAddTag.labelTaken;
                        }
                    }}
                    onChange={e => setTag(e.target.value)} />
            </Field>
            <div class="org-list-add-tag-footer">
                <Button raised type="submit">
                    {locale.fields.listAddTag.confirm}
                </Button>
            </div>
        </Form>
    );
}
