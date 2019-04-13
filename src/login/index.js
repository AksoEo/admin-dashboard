import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import { UEACode } from 'akso-client';
import Form, { Validator } from '../p-components/form';
import Button from '../p-components/button';
import TextField from '../p-components/text-field';
import { CircularProgressIndicator } from '../p-components/progress';
import locale from '../locale';
import ProgressIndicator from './progress-indicator';
import AutosizingPageView from './autosizing-page-view';
import './style';

/** @jsx h */

const Stage = {
    LOST_SECURITY_CODE: -3,
    FORGOT_CODE: -2,
    FORGOT_PASSWORD: -1,
    DETAILS: 0,
    SECURITY_CODE: 1,
};

const Mode = {
    NORMAL: 0, // must be falsy for isSpecialPage
    CREATING_PASSWORD: 1,
    RESETTING_PASSWORD: 2,
};

const MIN_INDEX = -3;

const temporaryBackLinkStyle = {
    display: 'block',
    textAlign: 'center',
    fontSize: '1.2em',
    color: 'inherit',
};

/** Returns the mode and possibly additional data for the current page. */
function getPageMode () {
    const pathname = document.location.pathname;
    const match = pathname.match(/^\/krei_pasvorton\/([^/]+)\/([\da-fA-f]+)\/?$/);
    if (match) return { mode: Mode.CREATING_PASSWORD, username: match[1] };
    return { mode: Mode.NORMAL };
}

/**
 * Returns true if the current page is a special page (such as the “create password” page) and
 * should always show the login screen.
 */
export function isSpecialPage () {
    return getPageMode().mode !== Mode.NORMAL;
}

/** The login screen. */
export default class Login extends Component {
    static propTypes = {
        /** Login callback. */
        onLogin: PropTypes.func.isRequired,
    };

    state = {
        username: '',
        stage: Stage.DETAILS,
        loading: false,
        mode: Mode.NORMAL,
    };

    pageView = null;
    detailsStage = null;
    securityCodeStage = null;

    /** Called when the current dialog page changes. */
    onPageChange = page => {
        if (page === Stage.DETAILS) {
            this.detailsStage.focus();
        } else if (page === Stage.SECURITY_CODE) {
            this.securityCodeStage.focus();
        }
    };

    componentDidMount () {
        document.title = locale.documentTitleTemplate(locale.login.title);

        this.setState(getPageMode(), () => this.pageView.pageHeightChanged());

        setTimeout(() => {
            // fake page change to trigger focus
            this.onPageChange(this.state.stage);
        }, 100);
    }

    render () {
        const meta = (
            <div class="login-meta">
                {locale.meta.copyright} <a
                    href={locale.meta.copyrightHref}
                    target="_blank"
                    rel="noopener noreferrer">
                    {locale.meta.copyrightHolder}
                </a>, {locale.meta.license} · <a
                    href={locale.meta.githubHref}
                    target="_blank"
                    rel="noopener noreferrer">
                    {locale.meta.github}
                </a>
            </div>
        );

        return (
            <div class="login">
                <div class="login-dialog">
                    <header class="login-header">
                        <img
                            class="login-logo"
                            src="/assets/logo-dark.svg"
                            aria-hidden="true"
                            role="presentation"
                            draggable={0} />
                        <div class="login-label">
                            <img
                                class="login-small-logo"
                                src="/assets/logo-dark.svg"
                                aria-hidden="true"
                                role="presentation"
                                draggable={0} />
                            <img
                                class="login-logo-label"
                                src="/assets/logo-label-dark.svg"
                                alt="AKSO"
                                draggable={0} />
                        </div>
                        <ProgressIndicator
                            selected={this.state.stage < 0 ? -2 : this.state.stage}
                            helpLabel={
                                this.state.stage === Stage.FORGOT_PASSWORD
                                    ? locale.login.forgotPassword
                                    : this.state.stage === Stage.FORGOT_CODE
                                        ? locale.login.forgotCode
                                        : this.state.stage === Stage.LOST_SECURITY_CODE
                                            ? locale.login.lostSecurityCode
                                            : ''
                            }>
                            <span onClick={() =>
                                this.setState({ stage: Stage.DETAILS })}>
                                {this.state.mode === Mode.NORMAL
                                    ? locale.login.detailsStage
                                    : this.state.mode === Mode.CREATING_PASSWORD
                                        ? locale.login.createPasswordStage
                                        : locale.login.resetPasswordStage}
                            </span>
                            <span>{locale.login.securityCodeStage}</span>
                        </ProgressIndicator>
                    </header>
                    <AutosizingPageView
                        ref={view => this.pageView = view}
                        selected={this.state.stage}
                        minIndex={MIN_INDEX}
                        onPageChange={this.onPageChange}>
                        <p>
                            (...)<br />
                            <a
                                style={temporaryBackLinkStyle}
                                href="#"
                                onClick={e => {
                                    e.preventDefault();
                                    this.setState({ stage: Stage.SECURITY_CODE });
                                }}>
                                Reiri
                            </a>
                        </p>
                        <p>
                           (...)<br />
                            <a
                                style={temporaryBackLinkStyle}
                                href="#"
                                onClick={e => {
                                    e.preventDefault();
                                    this.setState({ stage: Stage.DETAILS });
                                }}>
                                Reiri
                            </a>
                        </p>
                        <p>
                            (...)<br />
                            <a
                                style={temporaryBackLinkStyle}
                                href="#"
                                onClick={e => {
                                    e.preventDefault();
                                    this.setState({ stage: Stage.DETAILS });
                                }}>
                                Reiri
                            </a>
                        </p>
                        <DetailsStage
                            ref={stage => this.detailsStage = stage}
                            username={this.state.username}
                            mode={this.state.mode}
                            onUsernameChange={username => this.setState({ username })}
                            onSuccess={() => this.setState({ stage: Stage.SECURITY_CODE })}
                            onForgotPassword={() => this.setState({ stage: Stage.FORGOT_PASSWORD })}
                            onForgotCode={() => this.setState({ stage: Stage.FORGOT_CODE })} />
                        <SecurityCodeStage
                            ref={stage => this.securityCodeStage = stage}
                            onSuccess={this.props.onLogin}
                            onLostCode={() => this.setState({ stage: Stage.LOST_SECURITY_CODE })} />
                    </AutosizingPageView>
                    {meta}
                </div>
                {meta}
            </div>
        );
    }
}

class DetailsStage extends Component {
    propTypes = {
        onSuccess: PropTypes.func.isRequired,
        onForgotPassword: PropTypes.func.isRequired,
        onForgotCode: PropTypes.func.isRequired,
        username: PropTypes.string.isRequired,
        onUsernameChange: PropTypes.func.isRequired,
        mode: PropTypes.number.isRequired,
    };

    state = {
        password: '',
        confirmPassword: '',
        loading: false,
    };

    usernameField = null;
    passwordField = null;

    focus () {
        if (this.props.mode === Mode.NORMAL) {
            this.usernameField.focus();
        } else {
            this.passwordField.focus();
        }
    }

    render () {
        return (
            <Form onSubmit={() => {
                // TODO: fetch
                setTimeout(() => {
                    this.setState({
                        loading: false,
                        password: '',
                        confirmPassword: '',
                    });
                    this.props.onSuccess();
                }, 1000);
                this.setState({ loading: true });
            }}>
                <Validator component={TextField}
                    class="form-field"
                    innerRef={node => this.usernameField = node}
                    outline
                    label={locale.login.username}
                    type={this.props.username.includes('@') ? 'email' : 'text'}
                    autocapitalize="none"
                    value={this.props.username}
                    onChange={e => this.props.onUsernameChange(e.target.value)}
                    validate={value => {
                        if (!value.includes('@') && !UEACode.validate(value)) {
                            throw { error: locale.login.invalidUEACode };
                        }
                    }} />
                <Validator component={TextField}
                    class="form-field"
                    innerRef={node => this.passwordField = node}
                    outline
                    label={locale.login.password}
                    value={this.state.password}
                    type="password"
                    placeholder={this.props.mode === Mode.CREATING_PASSWORD
                        ? locale.login.createPasswordPlaceholder
                        : null}
                    onChange={e => this.setState({ password: e.target.value })}
                    validate={() => true} />
                {this.props.mode !== Mode.NORMAL ? (
                    <Validator component={TextField}
                        class="form-field"
                        outline
                        label={locale.login.confirmPassword}
                        value={this.state.confirmPassword}
                        type="password"
                        placeholder={locale.login.confirmPasswordPlaceholder}
                        onChange={e => this.setState({ confirmPassword: e.target.value })}
                        validate={value => {
                            if (value !== this.state.password) {
                                throw { error: locale.login.passwordMismatch };
                            }
                        }} />
                ) : null}
                <footer class="form-footer">
                    {this.props.mode === Mode.NORMAL ? (
                        <div class="help-links">
                            <a
                                class="help-link"
                                href="#"
                                onClick={e => {
                                    e.preventDefault();
                                    this.props.onForgotPassword();
                                }}>
                                {locale.login.forgotPassword}
                            </a>
                            <br />
                            <a
                                class="help-link"
                                href="#"
                                onClick={e => {
                                    e.preventDefault();
                                    this.props.onForgotCode();
                                }}>
                                {locale.login.forgotCode}
                            </a>
                        </div>
                    ) : <div class="help-links" />}
                    <Button type="submit" class="raised" disabled={this.state.loading}>
                        {this.state.loading ? (
                            <CircularProgressIndicator
                                class="progress-overlay"
                                indeterminate
                                small />
                        ) : null}
                        <span>{locale.login.continue}</span>
                    </Button>
                </footer>
            </Form>
        );
    }
}

// TODO: mode for creating a TOTP code or something
class SecurityCodeStage extends Component {
    propTypes = {
        onSuccess: PropTypes.func.isRequired,
        onLostCode: PropTypes.func.isRequired,
    };

    state = {
        securityCode: '',
        loading: false,
    }

    securityCodeField = null;

    focus () {
        this.securityCodeField.focus();
    }

    render () {
        return (
            <Form onSubmit={() => {
                setTimeout(this.props.onSuccess, 1000);
                this.setState({ loading: true });
            }}>
                <p>
                    {locale.login.securityCodeDescription}
                </p>
                <Validator component={TextField}
                    class="form-field totp-input"
                    innerRef={node => this.securityCodeField = node}
                    outline
                    center
                    label={locale.login.securityCode}
                    value={this.state.securityCode}
                    placeholder="000000"
                    // \d* seems to be the only way to get a numpad input on iOS
                    pattern="\d*"
                    type="number"
                    onChange={e => this.setState({
                        securityCode: e.target.value.replace(/\D/g, '').substr(0, 6),
                    })}
                    validate={value => {
                        if (!value || !value.match(/^\d{6}$/)) {
                            throw { error: locale.login.invalidSecurityCode };
                        }
                    }} />
                <footer class="form-footer">
                    <div class="help-links">
                        <a
                            class="help-link"
                            href="#"
                            onClick={e => {
                                e.preventDefault();
                                this.props.onLostCode();
                            }}>
                            {locale.login.lostSecurityCode}
                        </a>
                    </div>
                    <Button type="submit" class="raised" disabled={this.state.loading}>
                        {this.state.loading ? (
                            <CircularProgressIndicator
                                class="progress-overlay"
                                indeterminate
                                small />
                        ) : null}
                        <span>{locale.login.login}</span>
                    </Button>
                </footer>
            </Form>
        );
    }
}
