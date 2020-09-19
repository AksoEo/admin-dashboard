import { h } from 'preact';
import { PureComponent } from 'preact/compat';

export default class InputItem extends PureComponent {
    render ({ editing, item }) {
        let contents = null;
        if (editing) {
            contents = [
                <InputSettings key="settings" />
            ];
        } else {
            contents = 'preview goes here';
        }

        return (
            <div class="form-editor-input-item">
                {contents}
            </div>
        );
    }
}

class InputSettings extends PureComponent {
    render () {
        return 'input settings go here';
    }
}
