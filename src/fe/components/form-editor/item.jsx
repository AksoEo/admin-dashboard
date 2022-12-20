import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Button } from 'yamdl';
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import RemoveIcon from '@material-ui/icons/Remove';
import InputItem from './input-item';
import TextItem from './text-item';
import ScriptItem from './script-item';
import { RefNameView } from './script-views';
import { FormContext } from '../form';
import { formEditor as locale } from '../../locale';
import './item.less';

/**
 * A form editor item.
 *
 * - item/onChange: the item
 * - editing/onEditingChange: bool
 * - editable: bool
 * - isEditingContext: bool
 * - disableValidation: bool
 * - onRemove: fn
 * - previousNodes: previous nodes' asc definitions (see getAscDefs in model)
 */
export default class FormEditorItem extends PureComponent {
    state = {
        edit: null,
    };

    static contextType = FormContext;

    componentDidMount () {
        if (this.props.editing) {
            this.setState({
                edit: this.props.item,
            });
        }
    }

    componentDidUpdate (prevProps) {
        if (prevProps.editing !== this.props.editing) {
            if (this.props.editing) {
                this.setState({
                    edit: this.props.item,
                });
            } else {
                const edit = this.state.edit;
                this.setState({
                    edit: null,
                });
                this.props.onChange(edit);
            }
        }
    }

    onEditChange = (edit) => {
        this.setState({ edit });
    };

    onFinishEditing = () => {
        if (this.context.reportValidity()) {
            this.props.onEditingChange(false);
        }
    };

    render ({
        item, editable, onChange, editing, onEditingChange, editingData, value, onValueChange,
        onRemove, isEditingContext, disableValidation, hasValues,
    }) {
        if (!item) return null;

        const props = {
            editable,
            editing,
            item: this.state.edit || item,
            onChange: this.state.edit ? this.onEditChange : onChange,
            previousNodes: this.props.previousNodes,
            isEditingContext,
            disableValidation,
            hasValues,
        };

        let contents;
        if (item.el === 'input') {
            contents = <InputItem
                {...props}
                editingData={editingData}
                value={value}
                onValueChange={onValueChange}
                registerTestInput={this.props.registerTestInput}
                deregisterTestInput={this.props.registerTestInput} />;
        } else if (item.el === 'text') {
            contents = <TextItem {...props} />;
        } else if (item.el === 'script') {
            contents = <ScriptItem {...props} onEditingChange={onEditingChange} />;
        }

        return (
            <div class="form-editor-item">
                <ItemBar
                    el={item.el}
                    editable={editable}
                    name={item.name}
                    editing={editing}
                    onStartEditing={() => onEditingChange(true)}
                    onClose={this.onFinishEditing}
                    onRemove={onRemove} />
                {contents}
            </div>
        );
    }
}

/** The top bar on a form editor item. */
class ItemBar extends PureComponent {
    render ({ editable, el, name, editing, onStartEditing, onClose, onRemove }) {
        let button;
        if (!editable) {
            button = <span />;
        } else if (editing) {
            button = (
                <Button small icon onClick={onClose}>
                    <DoneIcon style={{ verticalAlign: 'middle' }} />
                </Button>
            );
        } else {
            button = (
                <Button small icon onClick={onStartEditing}>
                    <EditIcon style={{ verticalAlign: 'middle' }} />
                </Button>
            );
        }

        let nameNode;
        if (el === 'input') {
            nameNode = <RefNameView def name={'@' + name} />;
        } else {
            nameNode = <span class="item-bar-name">{locale.itemTypes[el]}</span>;
        }

        return (
            <div class={'form-editor-item-bar' + (editing ? ' is-editing' : '')}>
                {editable ? (
                    <Button class="remove-button" small icon onClick={onRemove}>
                        <RemoveIcon style={{ verticalAlign: 'middle' }} />
                    </Button>
                ) : <span />}
                {nameNode}
                {button}
            </div>
        );
    }
}
