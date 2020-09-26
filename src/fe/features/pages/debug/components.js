import { h } from 'preact';
import { useState } from 'preact/compat';
import Page from '../../../components/page';
import MdField from '../../../components/md-field';
import FormEditor from '../../../components/form-editor';

export default class Components extends Page {
    render () {
        return (
            <div>
                <FormEditorTest />
                <MdFieldTest />
            </div>
        );
    }
}

function FormEditorTest () {
    const [value, setValue] = useState({
        allowUse: true,
        allowGuests: false,
        editable: true,
        cancellable: true,
        manualApproval: false,
        price: {
            currency: 'AUD',
            var: 'aaaaa',
            minUpfront: null,
        },
        form: [
            {
                el: 'script',
                script: {
                    aaaaa: { t: 's', v: 'cats' },
                },
            },
            {
                el: 'input',
                name: 'disable_hewwo',
                label: 'Disable hewwo',
                description: '',
                type: 'boolean',
                default: false,
                editable: true,
                disabled: false,
                required: false,
            },
            {
                el: 'input',
                name: 'hewwo',
                label: 'Hewwo®',
                description: 'horse',
                type: 'text',
                default: { t: 'c', f: 'id', a: ['aaaaa'] },
                editable: true,
                disabled: { t: 'c', f: 'id', a: ['@disable_hewwo'] },
                required: false,
            },
            {
                el: 'text',
                // text: 'text text *text* **text**',
                text: { t: 'c', f: '++', a: ['aaaaa', '@hewwo'] },
            },
            {
                el: 'script',
                script: {
                    meow: { t: 'n', v: 2 },
                    meow2: { t: 'n', v: 3 },
                    horse: { t: 'c', f: '+', a: ['meow', 'meow2'] },
                    ext_ref: { t: 'c', f: 'aaaaa' },
                },
            },
        ],
    });

    return (
        <div>
            <h2>Form Editor</h2>
            <FormEditor
                value={value}
                onChange={setValue} />
        </div>
    );
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
            <h2>MD Field Editor</h2>
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
