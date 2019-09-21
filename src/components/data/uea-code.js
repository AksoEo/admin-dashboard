import { h, Component } from 'preact';
import { TextField, CircularProgress } from 'yamdl';
import { UEACode as AKSOUEACode } from 'akso-client';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import locale from '../../locale';
import { Validator } from '../form';
import SuggestionField from '../suggestion-field';
import client from '../../client';

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

/// Also pass `id` to enable checking if it’s taken.
/// Also pass an array to `suggestions` to show a list of suggestions.
class UEACodeEditor extends Component {
    state = {
        takenState: null,
    };

    checkTaken () {
        if (!this.props.id) return;
        if (!AKSOUEACode.validate(this.props.value)) return;
        this.setState({ takenState: 'loading' });
        return client.get('/codeholders', {
            limit: 1,
            filter: { newCode: this.props.value, id: { $neq: this.props.id } },
        }).then(res => {
            if (this.doNotUpdate) return;
            if (res.body.length) this.setState({ takenState: 'taken' });
            else this.setState({ takenState: 'available' });
        }).catch(err => {
            if (this.doNotUpdate) return;
            console.error(err);
            this.setState({ takenState: null });
        });
    }

    componentDidUpdate (prevProps) {
        if (prevProps.value !== this.props.value) this.checkTaken();
    }

    componentWillUnmount () {
        this.doNotUpdate = true;
    }

    render ({ value, onChange, suggestions, ...extraProps }) {
        let trailing;
        if (this.state.takenState === 'loading') {
            trailing = <CircularProgress class="taken-state is-loading" small indeterminate />;
        } else if (this.state.takenState === 'available') {
            trailing = <CheckIcon class="taken-state is-available" />;
        } else if (this.state.takenState === 'taken') {
            trailing = <CloseIcon class="taken-state is-taken" />;
        }

        let className = 'data uea-code-editor' + (extraProps.class ? ' ' + extraProps.class : '');
        delete extraProps.class;

        return <Validator
            class={className}
            component={SuggestionField}
            value={value}
            suggestions={suggestions || []}
            onChange={onChange}
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
                if (this.state.takenState === 'taken') {
                    throw { error: locale.data.ueaCode.codeTaken };
                }
            }}
            trailing={trailing}
            {...extraProps} />;
    }
}

export default {
    renderer: BothUEACodes,
    inlineRenderer: BothUEACodes,
    editor: UEACodeEditor,
};
