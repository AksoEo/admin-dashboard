import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { DefsPreview } from './script-views';

export default class ScriptItem extends PureComponent {
    render ({ item, onChange, editing }) {
        // TODO
        return (
            <div class="form-editor-script-item">
                <DefsPreview
                    script={item.script} />
            </div>
        );
    }
}
