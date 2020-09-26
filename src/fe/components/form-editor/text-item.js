import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import Segmented from '../segmented';
import MdField from '../md-field';
import { ScriptableString } from './script-expr';
import { evalExpr } from './model';
import { formEditor as locale } from '../../locale';
import './text-item.less';

const RULES = [
    'blockquote', 'code', 'heading', 'hr', 'table', 'emphasis', 'image', 'link', 'list', 'strikethrough',
];

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
                    class="text-item-type-switch smaller"
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
                rules={RULES}
                value={item.text}
                onChange={text => onChange({ ...item, text })} />;
        } else {
            contents = [];
            contents.push(
                <ScriptableString
                    key="expr"
                    ctx={{ previousNodes: this.props.previousNodes }}
                    value={item.text}
                    onChange={text => onChange({ ...item, text })} />
            );

            if (!editing) {
                const value = evalExpr(item.text, this.props.previousNodes);
                if (typeof value === 'string') {
                    contents.push(
                        <MdField
                            key="preview"
                            class="expr-preview"
                            rules={RULES}
                            value={value} />
                    );
                }
            }
        }

        return (
            <div class="form-editor-text-item">
                {typeSwitch}
                {contents}
            </div>
        );
    }
}
