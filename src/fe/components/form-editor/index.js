import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Button, Menu } from 'yamdl';
import AKSOScriptEditor from '@tejo/akso-script-editor';
import InputIcon from '@material-ui/icons/Input';
import TextIcon from '@material-ui/icons/Subject';
import ScriptIcon from '@material-ui/icons/Code';
import FormEditorSettings from './settings';
import RearrangingList from '../lists/rearranging-list';
import FormEditorItem from './item';
import ScriptContext from './script-context';
import { createInput, getGlobalDefs, getAscDefs } from './model';
import { formEditor as locale } from '../../locale';
import './index.less';

export class ScriptContextProvider extends PureComponent {
    /// Opens the AKSO Script Editor in full screen.
    ///
    /// - defs: akso script definitions object
    /// - options:
    ///     - previousNodes: array of { defs, formVars } to be able to use variables from other
    ///       scripts and such
    openScriptEditor = (defs, options = {}) => new Promise(resolve => {
        const editor = new AKSOScriptEditor();

        const previousNodes = options.previousNodes;
        if (previousNodes) {
            const previousDefs = previousNodes
                .filter(x => x)
                .map(node => node.defs)
                .filter(x => Object.keys(x).length);
            const formVars = previousNodes
                .filter(x => x)
                .flatMap(node => node.formVars);
            editor.loadExternalDefs(previousDefs);
            editor.setFormVars(formVars);
        }

        editor.load(defs);
        editor.onSave = () => {
            resolve(editor.save());
            this.detachScriptEditor();
        };
        this.attachScriptEditor(editor);
    });

    /// Opens the AKSO Script Editor for editing only a single expression.
    openScriptExprEditor = (expr, options) => new Promise(resolve => {
        const editor = new AKSOScriptEditor();

        const previousNodes = options.previousNodes;
        if (previousNodes) {
            const previousDefs = previousNodes
                .filter(x => x)
                .map(node => node.defs)
                .filter(x => Object.keys(x).length);
            const formVars = previousNodes
                .filter(x => x)
                .flatMap(node => node.formVars);
            editor.loadExternalDefs(previousDefs);
            editor.setFormVars(formVars);
        }

        editor.loadInRawExprMode(expr, {
            location: options.location,
            onClose: () => {
                resolve(editor.saveRawExpr());
                this.detachScriptEditor();
            },
        });
        this.attachScriptEditor(editor);
    });

    scriptContext = {
        openDefs: this.openScriptEditor,
        openExpr: this.openScriptExprEditor,
    };

    // attaching and detaching from the DOM

    scriptEditor = null;
    attachScriptEditor (editor) {
        if (this.scriptEditor) this.detachScriptEditor();
        this.scriptEditor = editor;
        const editorNode = document.createElement('div');
        editorNode.className = 'form-editor-script-node-root';
        editorNode.appendChild(editor.node);
        if (this.props.reallyOnTop) editorNode.classList.add('really-on-top');
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

    render ({ children }) {
        return <ScriptContext.Provider value={this.scriptContext}>{children}</ScriptContext.Provider>;
    }
}

// TODO: add Reset button to reset to default values etc
// TODO: add Validate Form button

/// The Form Editor is the component used to edit e.g. registration forms.
/// It allows editing both the form data (i.e. like a user would) and editing the form itself.
///
/// The implementation will generally assume that form data and the form itself will not be edited
/// simultaneously, so there may be weird states caused by entering form data and then editing the
/// form.
///
/// If editingFormData is set to true, this will also interact with FormContext to validate the form
/// before submission.
///
/// # Props
/// - isEditingContext: bool - whether to show internal details
/// - editing: bool
/// - value: { allowUse, allowGuests, ..., form } object (see API docs)
/// - onChange: (value) => void callback
/// - formData/onFormDataChange: optional form data
/// - editingFormData: set to false to disable
/// - skipSettings: TEMPORARY for not rendering settings
/// - skipNonInputs: will not render modules that aren't inputs
/// - disableValidation: bool
export default class FormEditor extends PureComponent {
    state = {
        /// Form input name -> form input value
        formData: {},
    };

    render ({
        skipSettings, skipNonInputs, value, editing, onChange, additionalVars, editingFormData,
        isEditingContext, disableValidation,
    }) {
        if (!value) return null;

        // TODO: properly disable inputs if not editingFormData

        const formData = this.props.formData || this.state.formData;

        return (
            <div class="form-editor">
                <ScriptContextProvider>
                    <FormEditorItems
                        skipSettings={skipSettings}
                        skipNonInputs={skipNonInputs}
                        editing={editing}
                        settings={value}
                        onSettingsChange={onChange}
                        items={value.form}
                        onItemsChange={form => onChange({ ...value, form })}
                        editingData={editingFormData}
                        isEditingContext={isEditingContext}
                        values={formData}
                        onValuesChange={values => {
                            if (this.props.onFormDataChange) {
                                if (!editingFormData) return;
                                this.props.onFormDataChange(values);
                            } else this.setState({ formData });
                        }}
                        additionalVars={additionalVars}
                        disableValidation={disableValidation} />
                </ScriptContextProvider>
            </div>
        );
    }
}

class FormEditorItems extends PureComponent {
    state = {
        /// Item key that is currently being edited
        editingItem: null,
    };

    addItem (item, skipEditing) {
        const itemIndex = this.props.items.length;
        if (!skipEditing) this.setState({ editingItem: this.getItemKey(itemIndex) });
        this.props.onItemsChange(this.props.items.concat([item]));
    }

    addInput = (type) => this.addItem(createInput(type));
    addText = () => {
        this.addItem({
            el: 'text',
            text: '',
        });
    };
    addScript = () => {
        this.addItem({
            el: 'script',
            script: {},
        }, true);
    };

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
    removeItem (i) {
        const items = this.props.items.slice();
        items.splice(i, 1);
        this.#itemKeys.splice(i, 1);
        this.props.onItemsChange(items);
    }

    initFormEditing () {
        // initialize form editing by creating all fields and setting them to null if necessary
        if (!this.props.editingData) return;
        const inputKeys = new Set();
        const newValues = { ...this.props.values };
        for (const item of this.props.items) {
            if (item.el === 'input') {
                if (!item.name) continue;
                inputKeys.add(item.name);
                if (!(item.name in newValues)) newValues[item.name] = null;
            }
        }
        for (const k in newValues) {
            if (!inputKeys.has(k)) delete newValues[k];
        }
        this.props.onValuesChange(newValues);
    }

    componentDidMount () {
        this.initFormEditing();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.editingData !== this.props.editingData) {
            this.initFormEditing();
        }
    }

    currentBatch = {};
    currentBatchTimeout = null;
    batchValueChange (name, value) {
        this.currentBatch[name] = value;
        clearTimeout(this.currentBatchTimeout);

        this.currentBatchTimeout = setTimeout(() => {
            this.props.onValuesChange({ ...this.props.values, ...this.currentBatch });
            this.currentBatch = {};
        }, 1);
    }

    render ({
        editing, settings, onSettingsChange, items, onItemsChange, values, additionalVars,
        skipSettings, skipNonInputs, editingData, isEditingContext, disableValidation,
    }, { editingItem }) {
        const listItems = [];
        const previousNodes = [getGlobalDefs(additionalVars)];
        for (let i = 0; i < items.length; i++) {
            const index = i;
            const key = this.getItemKey(index);
            const name = items[i].name || '???';
            if (!skipNonInputs || items[i].el === 'input') {
                listItems.push(
                    <FormEditorItem
                        key={key}
                        editable={editing}
                        isEditingContext={isEditingContext}
                        disableValidation={disableValidation}
                        previousNodes={previousNodes.slice()}
                        editing={editing && (editingItem === key)}
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
                        editingData={editingData}
                        value={values[name]}
                        onValueChange={value => this.batchValueChange(name, value)}
                        onRemove={() => this.removeItem(i)} />
                );
            }
            previousNodes.push(getAscDefs(items[i], values[name]));
        }

        if (editing) {
            listItems.push(
                <FormEditorAddItem
                    key="~add"
                    canAdd={items.length < 255}
                    addInput={this.addInput}
                    addText={this.addText}
                    addScript={this.addScript} />
            );
        }

        return (
            <div class="form-editor-items">
                {!skipSettings && (
                    <FormEditorSettings
                        editing={editing}
                        value={settings}
                        onChange={onSettingsChange}
                        previousNodes={previousNodes} />
                )}
                <RearrangingList
                    spacing={16}
                    isItemDraggable={index => editing && index < items.length}
                    canMove={toPos => toPos < items.length}
                    onMove={this.onMoveItem}>
                    {listItems}
                </RearrangingList>
            </div>
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
