import { h, Component } from 'preact';
import { TextField, Button, CircularProgress } from '@cpsdqs/yamdl';
import { UEACode } from '@tejo/akso-client';
import { LoginAuthStates } from '../../../protocol';
import Form, { Validator } from '../../components/form';
import { login as locale } from '../../locale';
import { Mode } from './is-special-page';

/// Details page in the login dialog.
///
/// # Props
/// - core: core ref
/// - authState: core auth state
/// - mode: login mode
/// - login/onLoginChange: login name
export default class DetailsPage extends Component {
    state = {
        password: '',
        confirmPassword: '',
    };

    #passwordValidator;
    #loginField;
    #passwordField;

    #nopwCheckTimeout;
    #checkHasPassword = () => this.props.core.createTask('login/hasPassword', {}, {
        login: this.props.login,
    }).runOnceAndDrop().catch(() => {});

    #onSubmit = () => {
        this.props.core.createTask('login/login', {}, {
            login: this.props.login,
            password: this.state.password,
        }).runOnceAndDrop().catch(err => {
            let error = locale.genericError;
            if (err.code === 400 || err.code === 401) {
                // conflating 400 (probably a schema error) and 401 (invalid login)
                // because invalid emails will also return schema errors and showing the
                // generic error isn’t really appropriate
                error = this.props.login.includes('@')
                    ? locale.invalidLogin.email
                    : locale.invalidLogin.ueaCode;
            }

            this.#passwordValidator.shake();
            this.#passwordValidator.setError({ error });
        });
    };

    focus () {
        this.#loginField.focus();
    }

    render ({ mode, authState }) {
        const needsPasswordValidation = mode !== Mode.NORMAL;
        const shouldShowHelpLinks = mode === Mode.NORMAL;

        const isLoading = authState === LoginAuthStates.AUTHENTICATING;

        return (
            <Form onSubmit={this.#onSubmit}>
                <Validator component={TextField}
                    class="form-field"
                    innerRef={view => this.#loginField = view}
                    outline
                    label={locale.login}
                    type={this.props.login.includes('@') ? 'email' : 'text'}
                    autocapitalize="none"
                    spellcheck="false"
                    value={this.props.login}
                    onChange={e => {
                        this.props.onLoginChange(e.target.value);
                        clearTimeout(this.#nopwCheckTimeout);
                        this.#nopwCheckTimeout = setTimeout(this.#checkHasPassword, 2000);
                    }}
                    onBlur={() => {
                        clearTimeout(this.#nopwCheckTimeout);
                        this.#checkHasPassword();
                    }}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            // instead of submitting; focus the password field
                            e.preventDefault();
                            this.#passwordField.focus();
                        }
                    }}
                    validate={value => {
                        if (!value.includes('@') && !UEACode.validate(value)) {
                            throw { error: locale.invalidUEACode };
                        }
                    }} />
                <Validator component={TextField}
                    class="form-field"
                    ref={view => this.#passwordValidator = view}
                    innerRef={view => this.#passwordField = view}
                    outline
                    label={locale.password}
                    value={this.state.password}
                    type="password"
                    placeholder={this.props.mode === Mode.CREATING_PASSWORD
                        ? locale.createPasswordPlaceholder
                        : null}
                    onChange={e => this.setState({ password: e.target.value })}
                    validate={() => true} />
                {needsPasswordValidation ? (
                    <Validator component={TextField}
                        class="form-field"
                        outline
                        label={locale.confirmPassword}
                        value={this.state.confirmPassword}
                        type="password"
                        placeholder={locale.confirmPasswordPlaceholder}
                        onChange={e => this.setState({ confirmPassword: e.target.value })}
                        validate={value => {
                            if (value !== this.state.password) {
                                throw { error: locale.passwordMismatch };
                            }
                        }} />
                ) : null}
                <footer class="form-footer">
                    {shouldShowHelpLinks ? (
                        <div class="help-links">
                            <a
                                class="help-link"
                                href="#"
                                onClick={e => {
                                    e.preventDefault();
                                    // TODO
                                }}>
                                {locale.forgotPassword}
                            </a>
                            <br />
                            <a
                                class="help-link"
                                href="#"
                                onClick={e => {
                                    e.preventDefault();
                                    // TODO
                                }}>
                                {locale.forgotCode}
                            </a>
                        </div>
                    ) : <div class="help-links" />}
                    <Button
                        type="submit"
                        raised
                        disabled={isLoading}>
                        <CircularProgress
                            class="progress-overlay"
                            indeterminate={isLoading}
                            small />
                        <span>{locale.continue}</span>
                    </Button>
                </footer>
            </Form>
        );
    }
}
