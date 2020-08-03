import { h } from 'preact';
import { useState } from 'preact/compat';
import Page from '../../../components/page';
import MdField from '../../../components/md-field';

export default class Components extends Page {
    render () {
        return (
            <div>
                <MdFieldTest />
            </div>
        );
    }
}

function MdFieldTest () {
    const availableRules = [
        'normalize',
        'block',
        'inline',
        'linkify',
        'replacements',
        'smartquotes',

        'text',
        'newline',
        'escape',
        'backticks',
        'strikethrough',
        'emphasis',
        'link',
        'image',
        'autolink',
        'html_inline',
        'entity',
        'balance_pairs',
        'text_collapse',

        'table',
        'code',
        'fence',
        'blockquote',
        'hr',
        'list',
        'reference',
        'heading',
        'lheading',
        'html_block',
        'paragraph',
    ];

    const [value, onChange] = useState('*hello *world**');
    const [rules, setRules] = useState([
        'heading',
        'emphasis',
        'strikethrough',
        'backticks',
        'link',
        'image',
        'table',
        'list',
    ]);
    const [k, setKey] = useState(0);

    return (
        <div>
            <div>
                {availableRules.map(rule => (
                    <span style={{ display: 'inline-block', padding: '2px' }} key={rule}>
                        <input
                            type="checkbox"
                            checked={rules.includes(rule)}
                            onChange={() => {
                                const r = rules.slice();
                                if (r.includes(rule)) {
                                    r.splice(r.indexOf(rule), 1);
                                } else r.push(rule);
                                setRules(r);
                                setKey(k + 1);
                            }} />
                        {rule}
                    </span>
                ))}
            </div>
            <MdField key={'v' + k} value={value} onChange={onChange} rules={rules} />
            <div style={{ margin: 16, marginTop: 64 }}>
                <MdField key={'e' + k} editing value={value} onChange={onChange} rules={rules} />
            </div>
            <div style={{ margin: 16, marginTop: 64 }}>
                <MdField key={'f' + k} editing singleLine value={value} onChange={onChange} rules={rules} />
            </div>
        </div>
    );
}
