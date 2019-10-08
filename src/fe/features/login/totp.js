import { h, Component } from 'preact';
import { lazy, Suspense, Fragment } from 'preact/compat';
import { Checkbox, CircularProgress, Button, TextField, Spring } from '@cpsdqs/yamdl';
import { LoginAuthStates } from '../../../protocol';
import Form, { Validator } from '../../components/form';
import { login as locale } from '../../locale';

const TotpSetup = lazy(() => import(/* webpackChunkName: "totp-setup" */ './totp-setup'));

/// The TOTP code input page.
///
/// # Props
/// - core: core ref
/// - authState: core auth state
/// - onHeightChange: callback called when the height changes
/// - totpSetupRequired: bool
export default class TotpPage extends Component {
    state = {
        secret: null,
        code: '',
        remember: false,
    };

    #codeValidator;
    #codeField;

    focus () {
        if (this.props.totpSetupRequired) return;
        this.#codeField.focus();
    }

    #onSubmit = () => {
        this.props.core.createTask('login/totp', {
            secret: this.props.totpSetupRequired ? this.state.secret : null,
        }, {
            code: this.state.code,
            remember: this.state.remember,
        }).runOnceAndDrop().catch(err => {
            let error = locale.genericTotpError;
            if (err.code === 400 || err.code === 401) {
                // conflating 400 (probably a schema error) and 401 (invalid login)
                // because invalid emails will also return schema errors and showing the
                // generic error isn’t really appropriate
                error = locale.invalidTotp;
            }

            this.#codeValidator.shake();
            this.#codeValidator.setError({ error });
        });
    };

    render ({ authState, onHeightChange, totpSetupRequired, ueaCode }) {
        const isLoading = authState === LoginAuthStates.VERIFYING_TOTP;

        const contents = (
            <Fragment>
                <p>
                    {locale.totpDescription}
                </p>
                <Validator component={TextField}
                    class="form-field totp-input"
                    ref={view => this.#codeValidator = view}
                    innerRef={view => this.#codeField = view}
                    outline
                    center
                    label={locale.totp}
                    value={this.state.code}
                    placeholder="000000"
                    // \d* seems to be the only way to get a numpad input on iOS
                    pattern="\d*"
                    type="number"
                    onKeyDown={e => {
                        if (!e.key.match(/\d/) && !e.key.match(/^[A-Z]/)) {
                            e.preventDefault();
                        }
                    }}
                    onChange={e => this.setState({
                        code: e.target.value.replace(/\D/g, '').substr(0, 6),
                    })}
                    validate={value => {
                        if (!value || !value.match(/^\d{6}$/)) {
                            throw { error: locale.invalidTotpFormat };
                        }
                    }} />
                <TotpRememberSwitch
                    value={this.state.remember}
                    onChange={remember => this.setState({ remember })}
                    onHeightChange={onHeightChange} />
            </Fragment>
        );

        return (
            <Form ref={node => this.form = node} onSubmit={this.#onSubmit}>
                {totpSetupRequired ? (
                    <Suspense
                        fallback={<CircularProgress class="totp-setup-loading" indeterminate />}>
                        <TotpSetup
                            onHeightChange={onHeightChange}
                            onGenerateSecret={secret => this.setState({ secret })}
                            ueaCode={ueaCode}
                            contents={contents} />
                    </Suspense>
                ) : contents}
                <footer class="form-footer">
                    <div class="help-links">
                        {!totpSetupRequired && (
                            <a
                                class="help-link"
                                href="#"
                                onClick={e => {
                                    e.preventDefault();
                                    this.props.core.createTask('info', {
                                        message: locale.lostTotpDescription,
                                    });
                                }}>
                                {locale.lostTotp}
                            </a>
                        )}
                    </div>
                    <Button
                        type="submit"
                        raised
                        disabled={isLoading}>
                        <CircularProgress
                            class="progress-overlay"
                            indeterminate={isLoading}
                            small />
                        <span>{locale.continueTotp}</span>
                    </Button>
                </footer>
            </Form>
        );
    }
}

class TotpRememberSwitch extends Component {
    heightSpring = new Spring(1, 0.3);

    state = {
        height: 0,
    };

    constructor (props) {
        super(props);
        this.heightSpring.on('update', height => {
            this.setState({ height });
            this.props.onHeightChange();
        });
    }

    componentDidMount () {
        this.updateHeight();
        setImmediate(() => this.heightSpring.finish());
    }

    updateHeight () {
        const height = this.node.style.height;
        this.node.style.height = '';
        this.heightSpring.target = this.node.offsetHeight;
        this.node.style.height = height;
        this.heightSpring.start();
    }

    componentWillUnmount () {
        this.heightSpring.stop();
    }

    render ({ value, onChange }, { height }) {
        return (
            <p
                class="totp-bypass-container"
                ref={node => this.node = node}
                style={{ height }}>
                <Checkbox
                    class="totp-bypass-switch"
                    id="totp-bypass-switch"
                    checked={value}
                    onChange={value => {
                        onChange(value);
                        requestAnimationFrame(() => this.updateHeight());
                    }} />
                <label
                    class="totp-bypass-label"
                    for="totp-bypass-switch">
                    {locale.rememberTotp}
                </label>
                <p class={'totp-bypass-description' + (value ? '' : ' hidden')}>
                    {locale.rememberTotpDescription}
                </p>
            </p>
        );
    }
}
