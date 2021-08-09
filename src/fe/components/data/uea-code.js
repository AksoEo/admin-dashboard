import { h, Component } from 'preact';
import { CircularProgress } from 'yamdl';
import { UEACode as AKSOUEACode } from '@tejo/akso-client';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import ErrorIcon from '@material-ui/icons/Error';
import { connect, coreContext } from '../../core/connection';
import { data as locale } from '../../locale';
import { Validator } from '../form';
import SuggestionField from '../suggestion-field';
import TinyProgress from '../tiny-progress';
import './style';

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

/// Renders a UEA code by ID.
///
/// # Props
/// - id: codeholder id
export const IdUEACode = connect(
    ({ id }) => ['codeholders/codeholder', { id, fields: ['code'], lazyFetch: true }],
    ['id'],
)((data, _, err) => ({ data, err }))(({ data, err, errorLabel }) => (
    err
        ? (errorLabel || (
            <span class="data uea-code-load-error" title={locale.ueaCode.idFailed}>
                <ErrorIcon style={{ verticalAlign: 'middle' }} />
            </span>
        ))
        : (data && data.code) ? <UEACode value={data.code.new} /> : <TinyProgress />
));

/// Also pass `id` to enable checking if it’s taken.
/// Also pass an array to `suggestions` to show a list of suggestions.
/// Alternatively, pass `suggestionParameters` to automatically suggest some codes.
/// Also pass `keepSuggestions` to keep suggestions from being filtered above in suggestion params.
class UEACodeEditor extends Component {
    state = {
        takenState: null,
        suggestions: [],
    };

    static contextType = coreContext;

    checkTaken () {
        let isNewCode = false;
        try {
            isNewCode = new AKSOUEACode(this.props.value).type === 'new';
        } catch (_) {
            //
        }
        if (!this.props.id || !isNewCode) {
            this.setState({ takenState: null });
            return;
        }
        this.setState({ takenState: 'loading' });
        return this.context.createTask('codeholders/list', {}, {
            jsonFilter: { filter: { newCode: this.props.value, id: { $neq: this.props.id } } },
            offset: 0,
            limit: 1,
        }).runOnceAndDrop().then(({ items }) => {
            if (this.doNotUpdate) return;
            if (items.length) this.setState({ takenState: 'taken' });
            else this.setState({ takenState: 'available' });
        }).catch(err => {
            if (this.doNotUpdate) return;
            console.error(err); // eslint-disable-line no-console
            this.setState({ takenState: null });
        });
    }

    updateSuggestions () {
        if (!this.props.suggestionParameters) return;
        const task = this.context.createTask('codeholders/codeSuggestions', {
            keep: this.props.keepSuggestions || [],
        }, this.props.suggestionParameters);
        task.runOnceAndDrop().then(items => {
            this.setState({ suggestions: items });
        }).catch(console.error); // eslint-disable-line no-console
    }

    componentDidMount () {
        this.updateSuggestions();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.value !== this.props.value) this.checkTaken();
    }

    componentWillUnmount () {
        this.doNotUpdate = true;
    }

    render ({ value, onChange, ...extraProps }) {
        let trailing;
        if (this.state.takenState === 'loading') {
            trailing = <CircularProgress class="taken-state is-loading" small indeterminate />;
        } else if (this.state.takenState === 'available') {
            trailing = <CheckIcon className="taken-state is-available" />;
        } else if (this.state.takenState === 'taken') {
            trailing = <CloseIcon className="taken-state is-taken" />;
        }

        const suggestions = extraProps.suggestionParameters
            ? this.state.suggestions
            : extraProps.suggestions;
        delete extraProps.suggestionParameters;
        delete extraProps.suggestions;
        const className = 'data uea-code-editor' + (extraProps.class ? ' ' + extraProps.class : '');
        delete extraProps.class;

        if (!extraProps.error && this.state.takenState === 'taken') {
            extraProps.error = locale.ueaCode.codeTaken;
        }

        return <Validator
            class={className}
            component={SuggestionField}
            value={value}
            suggestions={suggestions || []}
            onChange={onChange}
            maxLength={6}
            placeholder="xxxxxx"
            label={locale.ueaCode.newCode + (this.props.required ? '*' : '')}
            onFocus={() => this.updateSuggestions()}
            validate={() => {
                try {
                    const code = new AKSOUEACode(value);
                    if (code.type !== 'new') throw 0;
                } catch (_) {
                    throw { error: locale.ueaCode.invalidUEACode };
                }
                if (this.state.takenState === 'taken') {
                    throw { error: locale.ueaCode.codeTaken };
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
