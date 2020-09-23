import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import Segmented from '../segmented';
import MdField from '../md-field';
import { ScriptableString } from './script-expr';
import { formEditor as locale } from '../../locale';

export default class TextItem extends PureComponent {
    changeType = type => {
        const currentType = (typeof this.props.item.text === 'string') ? 'text' : 'script';
        if (type === currentType) return;
        if (type === 'text') {
            let string = '';
            if (this.props.item.text.t === 's') {
                // string expr
                string = this.props.item.text.v;
            }
            this.props.onChange({ ...this.props.item, text: string });
        } else if (type === 'script') {
            this.props.onChange({
                ...this.props.item,
                text: { t: 's', v: this.props.item.text },
            });
        }
    };

    render ({ item, onChange, editing }) {
        let typeSwitch = null;
        let contents = null;

        if (editing) {
            typeSwitch = (
                <Segmented
                    class="small"
                    selected={typeof item.text === 'string' ? 'text' : 'script'}
                    onSelect={this.changeType}>
                    {[
                        { id: 'text', label: locale.textItemTypes.text },
                        { id: 'script', label: locale.textItemTypes.script },
                    ]}
                </Segmented>
            );
        }

        if (typeof item.text === 'string') {
            // markdown!
            contents = <MdField
                editing={editing}
                rules={['blockquote', 'code', 'heading', 'hr', 'table', 'emphasis', 'image', 'link', 'list', 'strikethrough']}
                value={item.text}
                onChange={text => onChange({ ...item, text })} />;
        } else {
            contents = <ScriptableString
                value={item.text}
                onChange={text => onChange({ ...item, text })} />;
        }

        return (
            <div class="form-editor-text-item">
                {typeSwitch}
                {contents}
            </div>
        );
    }
}
