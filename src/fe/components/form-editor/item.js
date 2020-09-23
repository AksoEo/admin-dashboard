import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Button } from '@cpsdqs/yamdl';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';
import InputItem from './input-item';
import TextItem from './text-item';
import ScriptItem from './script-item';
import { RefNameView } from './script-views';
import './item.less';

/// A form editor item.
///
/// - item/onChange: the item
/// - editing/onEditingChange: bool
/// - ...something to pass previous ASC scripts?
export default class FormEditorItem extends PureComponent {
    render ({ item, onChange, editing, onEditingChange, value, onValueChange }) {
        if (!item) return null;

        const props = {
            editing,
            item,
            onChange,
        };

        let contents;
        if (item.el === 'input') {
            contents = <InputItem {...props} value={value} onValueChange={onValueChange} />;
        } else if (item.el === 'text') {
            contents = <TextItem {...props} />;
        } else if (item.el === 'script') {
            contents = <ScriptItem {...props} />;
        }

        return (
            <div class="form-editor-item">
                <ItemBar
                    name={item.name}
                    editing={editing}
                    onStartEditing={() => onEditingChange(true)}
                    onClose={() => onEditingChange(false)} />
                {contents}
            </div>
        );
    }
}

/// The bottom bar on a form editor item.
class ItemBar extends PureComponent {
    render ({ name, editing, onStartEditing, onClose }) {
        let button;
        if (editing) {
            button = (
                <Button small icon onClick={onClose}>
                    <CloseIcon style={{ verticalAlign: 'middle' }} />
                </Button>
            );
        } else {
            button = (
                <Button small icon onClick={onStartEditing}>
                    <EditIcon style={{ verticalAlign: 'middle' }} />
                </Button>
            );
        }

        return (
            <div class={'form-editor-item-bar' + (editing ? ' is-editing' : '')}>
                {name ? <RefNameView name={'@' + name} /> : <span />}
                {button}
            </div>
        );
    }
}
