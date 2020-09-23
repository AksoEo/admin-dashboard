import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Button, Menu } from '@cpsdqs/yamdl';
import AKSOScriptEditor from '@tejo/akso-script-editor';
import InputIcon from '@material-ui/icons/Input';
import TextIcon from '@material-ui/icons/Subject';
import ScriptIcon from '@material-ui/icons/Code';
import RearrangingList from '../rearranging-list';
import FormEditorItem from './item';
import ScriptContext from './script-context';
import { formEditor as locale } from '../../locale';
import './index.less';

// TODO: add Reset button to reset to default values etc

/// The Form Editor is the component used to edit e.g. registration forms.
///
/// # Props
/// - value: { allowUse, allowGuests, ..., form } object (see API docs)
/// - onChange: (value) => void callback
export default class FormEditor extends PureComponent {
    state = {
        /// Form input name -> form input value
        values: {},
    };

    openScriptEditor = (defs) => {
        // TODO
    };

    openScriptExprEditor = (expr) => new Promise(resolve => {
        const editor = new AKSOScriptEditor();
        // TODO: set up form vars and references
        editor.loadInRawExprMode(expr, () => {
            resolve(editor.saveRawExpr());
            this.detachScriptEditor();
        });
        this.attachScriptEditor(editor);
    });


    scriptContext = {
        openDefs: this.openScriptEditor,
        openExpr: this.openScriptExprEditor,
    };

    scriptEditor = null;
    attachScriptEditor (editor) {
        if (this.scriptEditor) this.detachScriptEditor();
        this.scriptEditor = editor;
        const editorNode = document.createElement('div');
        editorNode.className = 'form-editor-script-node-root';
        editorNode.appendChild(editor.node);
        document.body.appendChild(editorNode);
        this.onResize();
    }

    detachScriptEditor () {
        if (!this.scriptEditor) return;
        document.body.removeChild(this.scriptEditor.node.parentNode);
        this.scriptEditor.destroy();
        this.scriptEditor = null;
    }

    onResize = () => {
        if (!this.scriptEditor) return;
        this.scriptEditor.width = window.innerWidth;
        this.scriptEditor.height = window.innerHeight;
    };

    componentDidMount () {
        window.addEventListener('resize', this.onResize);
    }
    componentWillUnmount () {
        window.removeEventListener('resize', this.onResize);
    }

    render ({ value, onChange }, { values }) {
        if (!value) return null;

        return (
            <div class="form-editor">
                <ScriptContext.Provider value={this.scriptContext}>
                    <FormEditorSettings
                        value={value}
                        onChange={onChange} />
                    <FormEditorItems
                        items={value.form}
                        onItemsChange={form => onChange({ ...value, form })}
                        values={values}
                        onValuesChange={values => this.setState({ values })} />
                </ScriptContext.Provider>
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

    render ({ items, onItemsChange, values, onValuesChange }, { editingItem }) {
        const listItems = [];
        for (let i = 0; i < items.length; i++) {
            const index = i;
            const key = this.getItemKey(index);
            const name = items[i].name || '???';
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
                    }}
                    value={values[name]}
                    onValueChange={value => {
                        onValuesChange({
                            ...values,
                            [name]: value,
                        });
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
                spacing={16}
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
