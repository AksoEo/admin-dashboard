import { h, Component } from 'preact';
import { Fragment, createPortal } from 'preact/compat';
import moment from 'moment';
import { globalAnimator, TextField, DatePicker } from '@cpsdqs/yamdl';
import { data as locale } from '../../locale';
import './style';

/// Renders a formatted date (not editable). Use prop `value`.
function DateFormatter ({ value }) {
    return value ? moment(value).format('D[-a de] MMMM Y') : '';
}

const MIN_DATE = new Date(1970, 0, 1);
const MAX_DATE = new Date(2147482647 * 1000);

const APPROX_DATE_EDITOR_HEIGHT = 300; // for deciding whether to show above or below

const dateEditorPortalContainer = document.createElement('div');
dateEditorPortalContainer.id = 'data-date-editor-portal-container';
document.body.appendChild(dateEditorPortalContainer);

function stringifyDate (date) {
    return date ? moment(date).format('D[-a de] MMMM Y') : '';
}

const parseFormatsToTry = [
    undefined,
    'D[-a de] MMMM YYYY',
    'D[-a de] MMM YYYY',
    'D MMMM YYYY',
    'D MMM YYYY',
    'D[-a de] MMMM',
    'D[-a de] MMM',
    'D MMMM',
    'D MMM',
];

function tryParseDate (input) {
    if (!input) return null;
    for (const f of parseFormatsToTry) {
        const m = moment.utc(input, f);
        if (m.isValid()) return m.toDate();
    }
    return undefined;
}

/// Edits a date. Value must be formatted as YYYY-MM-DD.
class DateEditor extends Component {
    state = {
        // popout screen pos
        popoutX: 0,
        popoutY: 0,
        anchorBottom: false,
        // true if input is focused
        focused: false,
        // if true, the pointer is in the popout and popout should remain open
        pointerInPopout: false,
        // input string that might be invalid
        inputText: null,
    };

    textField = null;

    #onFocus = () => {
        this.setState({ focused: true });
        globalAnimator.register(this);
    };
    #onBlur = () => {
        this.setState({
            focused: false,
            inputText: stringifyDate(this.props.value),
        });
        globalAnimator.deregister(this);
    };
    #onMouseLeave = () => {
        if (this.textField && this.textField.inputNode) {
            this.textField.inputNode.focus();
        }
        this.setState({ pointerInPopout: false });
    };

    onInputTextChange = e => {
        this.setState({ inputText: e.target.value });
        const date = tryParseDate(e.target.value);

        if (date !== undefined) {
            this.props.onChange(date ? moment(date).format('YYYY-MM-DD') : date);
        }
    };

    getDateValue () {
        const { value } = this.props;
        return value ? moment.utc(value, 'YYYY-MM-DD').toDate() : null;
    }

    update () {
        if (this.textField && this.textField.node) {
            const rect = this.textField.node.getBoundingClientRect();
            if (rect.left !== this.state.popoutX) this.setState({ popoutX: rect.left });

            const anchorBottom = window.innerHeight - rect.bottom < APPROX_DATE_EDITOR_HEIGHT;
            const popoutY = anchorBottom ? rect.top : rect.bottom;

            if (popoutY !== this.state.popoutY) this.setState({ popoutY });
            if (anchorBottom !== this.state.anchorBottom) this.setState({ anchorBottom });
        }
    }

    componentDidMount () {
        this.setState({ inputText: stringifyDate(this.getDateValue()) });
    }

    componentDidUpdate (prevProps) {
        if (prevProps.value !== this.props.value && !this.state.focused) {
            this.setState({ inputText: stringifyDate(this.getDateValue()) });
        }
    }

    componentWillUnmount () {
        globalAnimator.deregister(this);
    }

    render ({ onChange, disabled, ...props }, {
        popoutX,
        popoutY,
        anchorBottom,
        focused,
        pointerInPopout,
        inputText,
    }) {
        const dateValue = this.getDateValue();

        const fakeUTCValue = dateValue
            ? new Date(dateValue.getTime() + dateValue.getTimezoneOffset() * 60000)
            : null;

        const today = new Date();
        const fakeUTCToday = new Date(today.getTime() + today.getTimezoneOffset() * 60000);

        let popout;
        if (focused || pointerInPopout) {
            popout = createPortal(
                <div
                    class="data-date-picker-portal"
                    style={{
                        transform: anchorBottom
                            ? `translateY(-100%) translate(${popoutX}px, ${popoutY}px)`
                            : `translate(${popoutX}px, ${popoutY}px)`,
                    }}
                    onMouseEnter={() => this.setState({ pointerInPopout: true })}
                    onMouseLeave={this.#onMouseLeave}>
                    <DatePicker
                        months={locale.months}
                        weekdays={locale.weekdays}
                        weekStart={locale.weekStart}
                        min={MIN_DATE}
                        max={MAX_DATE}
                        today={fakeUTCToday}
                        value={fakeUTCValue}
                        onChange={date => {
                            const newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                            onChange(moment(newDate).format('YYYY-MM-DD'));
                            this.setState({ inputText: stringifyDate(newDate) });
                        }} />
                </div>,
                dateEditorPortalContainer,
            );
        }

        props.class = 'data date-editor ' + (props.class || '');

        return (
            <Fragment>
                <TextField
                    {...props}
                    ref={view => this.textField = view}
                    disabled={disabled}
                    onFocus={this.#onFocus}
                    onBlur={this.#onBlur}
                    value={inputText}
                    onChange={this.onInputTextChange} />
                {popout}
            </Fragment>
        );
    }
}

export default {
    renderer: DateFormatter,
    inlineRenderer: DateFormatter,
    editor: DateEditor,
};

