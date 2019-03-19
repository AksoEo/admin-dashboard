import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import { UEACode } from 'akso-client';
import Form, { Validator } from '../components/form';
import Button from '../components/button';
import TextField from '../components/text-field';
import { CircularProgressIndicator } from '../components/progress';
import locale from '../locale';
import ProgressIndicator from './progress-indicator';
import AutosizingPageView from './autosizing-page-view';
import './style';

const Stage = {
    LOST_SECURITY_CODE: -3,
    FORGOT_CODE: -2,
    FORGOT_PASSWORD: -1,
    DETAILS: 0,
    SECURITY_CODE: 1
};

const MIN_INDEX = -3;

/** The login screen. */
export default class Login extends Component {
    static propTypes = {
        /** Login callback. */
        onLogin: PropTypes.func.isRequired
    };

    state = {
        username: '',
        password: '',
        securityCode: '',
        stage: Stage.DETAILS,
        loading: false
    };

    securityCodeField = null;

    /** Called when the current dialog page changes. */
    onPageChange = page => {
        if (page === Stage.SECURITY_CODE) {
            this.securityCodeField.focus();
        }
    };

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
                            className="login-logo"
                            src="/assets/logo-dark.svg"
                            aria-hidden="true"
                            role="presentation"
                            draggable={0} />
                        <div className="login-label">
                            <img
                                className="login-small-logo"
                                src="/assets/logo-dark.svg"
                                aria-hidden="true"
                                role="presentation"
                                draggable={0} />
                            <img
                                className="login-logo-label"
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
                                {locale.login.detailsStage}
                            </span>
                            <span>{locale.login.securityCodeStage}</span>
                        </ProgressIndicator>
                    </header>
                    <AutosizingPageView
                        selected={this.state.stage}
                        minIndex={MIN_INDEX}
                        onPageChange={this.onPageChange}>
                        <p>
                            you lost your totp key<br />
                            <a
                                href="#"
                                onClick={e => {
                                    e.preventDefault();
                                    this.setState({ stage: Stage.SECURITY_CODE });
                                }}>
                                back
                            </a>
                        </p>
                        <p>
                            you lost your uea code<br />
                            <a
                                href="#"
                                onClick={e => {
                                    e.preventDefault();
                                    this.setState({ stage: Stage.DETAILS });
                                }}>
                                back
                            </a>
                        </p>
                        <p>
                            you lost your password<br />
                            <a
                                href="#"
                                onClick={e => {
                                    e.preventDefault();
                                    this.setState({ stage: Stage.DETAILS });
                                }}>
                                back
                            </a>
                        </p>
                        <Form key={Stage.DETAILS} onSubmit={() => {
                            setTimeout(() => {
                                this.setState({
                                    stage: Stage.SECURITY_CODE,
                                    loading: false,
                                    password: ''
                                });
                            }, 1000);
                            this.setState({ loading: true });
                        }}>
                            <Validator component={TextField}
                                class="form-field"
                                outline
                                label={locale.login.username}
                                type={this.state.username.includes('@') ? 'email' : 'text'}
                                autocapitalize="none"
                                value={this.state.username}
                                onChange={e => this.setState({ username: e.target.value })}
                                validate={value => {
                                    if (!value.includes('@') && !UEACode.validate(value)) {
                                        throw { error: locale.login.invalidUEACode };
                                    }
                                }} />
                            <Validator component={TextField}
                                class="form-field"
                                outline
                                label={locale.login.password}
                                value={this.state.password}
                                type="password"
                                onChange={e => this.setState({ password: e.target.value })}
                                validate={() => true} />
                            <footer class="form-footer">
                                <div class="help-links">
                                    <a
                                        class="help-link"
                                        href="#"
                                        onClick={e => {
                                            e.preventDefault();
                                            this.setState({ stage: Stage.FORGOT_PASSWORD });
                                        }}>
                                        {locale.login.forgotPassword}
                                    </a>
                                    <br />
                                    <a
                                        class="help-link"
                                        href="#"
                                        onClick={e => {
                                            e.preventDefault();
                                            this.setState({ stage: Stage.FORGOT_CODE });
                                        }}>
                                        {locale.login.forgotCode}
                                    </a>
                                </div>
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
                        <Form key={Stage.SECURITY_CODE} onSubmit={() => {
                            setTimeout(() => {
                                this.props.onLogin();
                            }, 1000);
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
                                type="number"
                                onChange={e => this.setState({
                                    securityCode: e.target.value.replace(/\D/g, '').substr(0, 6)
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
                                            this.setState({ stage: Stage.LOST_SECURITY_CODE });
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
                    </AutosizingPageView>
                    {meta}
                </div>
                {meta}
            </div>
        );
    }
}
