import { h, Component } from 'preact'; 
import './text-area.less';

export default class TextArea extends Component {
    render ({ value, onChange }) {
        return (
            <textarea
                class="a-text-area"
                value={value}
                onChange={e => onChange(e.target.value)} />
        );
    }
}
