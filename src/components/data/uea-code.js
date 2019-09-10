import { h } from 'preact';
import { TextField } from 'yamdl';
import { UEACode as AKSOUEACode } from 'akso-client';
import locale from '../../locale';
import { Validator } from '../form';

/// Renders a single UEA code. Props: `value`, `old`.
export function UEACode ({ value, old, ...extra }) {
    if (!value) return null;
    if (old) {
        const oldCodeCheckLetter = new AKSOUEACode(value).getCheckLetter();
        return <span class="data uea-code is-old" {...extra}>{value}-{oldCodeCheckLetter}</span>;
    } else {
        return <span class="data uea-code" {...extra}>{value}</span>;
    }
}

function BothUEACodes ({ value, value2 }) {
    if (!value2) return <UEACode value={value} />;
    return (
        <span class="data both-uea-codes">
            <UEACode value={value} />
            {!!value2 && ' '}
            <UEACode value={value2} old />
        </span>
    );
}

function UEACodeEditor ({ value, onChange }) {
    return <Validator
        class="data uea-code-editor"
        component={TextField}
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={6}
        placeholder="xxxxxx"
        label={locale.data.ueaCode.newCode}
        validate={() => {
            try {
                const code = new AKSOUEACode(value);
                if (code.type !== 'new') throw 0;
            } catch (_) {
                throw { error: locale.data.ueaCode.invalidUEACode };
            }
        }} />;
}

export default {
    renderer: BothUEACodes,
    inlineRenderer: BothUEACodes,
    editor: UEACodeEditor,
};
