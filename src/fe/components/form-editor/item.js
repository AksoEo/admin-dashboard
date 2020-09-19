import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Button } from '@cpsdqs/yamdl';
import EditIcon from '@material-ui/icons/Edit';
import InputItem from './input-item';
import TextItem from './text-item';
import ScriptItem from './script-item';

/// A form editor item.
///
/// - item/onChange: the item
/// - editing/onEditingChange: bool
/// - ...something to pass previous ASC scripts?
export default class FormEditorItem extends PureComponent {
    render ({ item, onChange, editing, onEditingChange }) {
        if (!item) return null;

        const props = {
            editing,
            item,
            onChange,
        };

        let contents;
        if (item.el === 'input') {
            contents = <InputItem {...props} />;
        } else if (item.el === 'text') {
            contents = <TextItem {...props} />;
        } else if (item.el === 'script') {
            contents = <ScriptItem {...props} />;
        }

        return (
            <div class="form-editor-item">
                {contents}
                <ItemBar
                    editing={editing}
                    onStartEditing={() => onEditingChange(true)} />
            </div>
        );
    }
}

/// The bottom bar on a form editor item.
class ItemBar extends PureComponent {
    render ({ editing, onStartEditing }) {
        return (
            <div class="form-editor-item-bar">
                <Button onClick={onStartEditing}>
                    <EditIcon style={{ verticalAlign: 'middle' }} />
                </Button>
            </div>
        );
    }
}
