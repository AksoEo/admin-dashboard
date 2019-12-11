import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';

const emailRenderer = allowsInteractive => function Email ({ value }) {
    return allowsInteractive
        ? <a class="data email" href={`mailto:${value}`}>{value}</a>
        : <span class="data email not-interactive">{value}</span>;
};

function EmailEditor ({ value, onChange }) {
    return <TextField
        class="data email-editor"
        value={value}
        onChange={e => onChange(e.target.value || null)}
        type="email" />;
}

export default {
    renderer: emailRenderer(true),
    inlineRenderer: emailRenderer(),
    editor: EmailEditor,
};
