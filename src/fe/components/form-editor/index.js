import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Button, Menu } from '@cpsdqs/yamdl';
import InputIcon from '@material-ui/icons/Input';
import TextIcon from '@material-ui/icons/Subject';
import ScriptIcon from '@material-ui/icons/Code';
import RearrangingList from '../rearranging-list';
import FormEditorItem from './item';
import { formEditor as locale } from '../../locale';

/// The Form Editor is the component used to edit e.g. registration forms.
///
/// # Props
/// - value: { allowUse, allowGuests, ..., form } object (see API docs)
/// - onChange: (value) => void callback
export default class FormEditor extends PureComponent {
    // TODO: hold form var state for asc testing

    render ({ value, onChange }) {
        if (!value) return null;

        return (
            <div class="form-editor">
                <FormEditorSettings
                    value={value}
                    onChange={onChange} />
                <FormEditorItems
                    items={value.form}
                    onItemsChange={form => onChange({ ...value, form })} />
            </div>
        );
    }
}

class FormEditorSettings extends PureComponent {
    render () {
        // TODO
        return 'meow';
    }
}

class FormEditorItems extends PureComponent {
    state = {
        /// Item key that is currently being edited
        editingItem: null,
    };

    addInput = () => {}; // TODO
    addText = () => {}; // TODO
    addScript = () => {}; // TODO

    #itemKeys = [];
    /// >> which item is at which index?
    /// we keep track of items using random ids so when rearranging we can assign the correct
    /// key again
    getItemKey (index) {
        if (!this.#itemKeys[index]) this.#itemKeys[index] = Math.random().toString(36);
        return this.#itemKeys[index];
    }

    onMoveItem = (fromPos, toPos) => {
        const items = this.props.items.slice();
        items.splice(toPos, 0, items.splice(fromPos, 1)[0]);
        this.#itemKeys.splice(toPos, 0, this.#itemKeys.splice(fromPos, 1)[0]);
        this.props.onItemsChange(items);
    };

    render ({ items, onItemsChange }, { editingItem }) {
        const listItems = [];
        for (let i = 0; i < items.length; i++) {
            const index = i;
            const key = this.getItemKey(index);
            listItems.push(
                <FormEditorItem
                    key={key}
                    editing={editingItem === key}
                    onEditingChange={editing => {
                        if (editing) this.setState({ editingItem: key });
                        else if (editingItem === key) this.setState({ editingItem: null });
                    }}
                    item={items[index]}
                    onChange={item => {
                        const newItems = items.slice();
                        newItems[index] = item;
                        onItemsChange(newItems);
                    }} />
            );
        }

        listItems.push(
            <FormEditorAddItem
                key="~add"
                canAdd={items.length < 255}
                addInput={this.addInput}
                addText={this.addText}
                addScript={this.addScript} />
        );

        return (
            <RearrangingList
                isItemDraggable={index => index < items.length}
                canMove={toPos => toPos < items.length}
                onMove={this.onMoveItem}>
                {listItems}
            </RearrangingList>
        );
    }
}
class FormEditorAddItem extends PureComponent {
    state = {
        addInputMenuPos: null,
        addInputMenuOpen: null,
    };

    render ({ canAdd, addInput, addText, addScript }, { addInputMenuPos, addInputMenuOpen }) {
        if (!canAdd) return null;

        return (
            <div class="form-editor-add-item">
                <Menu
                    open={!!addInputMenuOpen}
                    position={addInputMenuPos}
                    onClose={() => this.setState({ addInputMenuOpen: false })}
                    items={Object.keys(locale.inputTypes).map(id => ({
                        label: locale.inputTypes[id],
                        action: () => addInput(id),
                    }))} />
                <Button onClick={e => {
                    this.setState({
                        addInputMenuPos: [e.clientX, e.clientY],
                        addInputMenuOpen: true,
                    });
                }}>
                    <InputIcon style={{ verticalAlign: 'middle' }} />
                </Button>
                <Button onClick={addText}>
                    <TextIcon style={{ verticalAlign: 'middle' }} />
                </Button>
                <Button onClick={addScript}>
                    <ScriptIcon style={{ verticalAlign: 'middle' }} />
                </Button>
            </div>
        );
    }
}
