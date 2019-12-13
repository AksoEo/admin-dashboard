import { h, Component } from 'preact';
import { LoginAuthStates } from '../../../protocol';
import { connect } from '../../core/connection';
import { login as locale, meta as localeMeta } from '../../locale';
import ProgressIndicator from './progress-indicator';
import AutosizingPageView from './autosizing-page-view';
import DetailsPage from './details';
import TotpPage from './totp';
import { Mode, getPageMode } from './is-special-page';
import './style';

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

/// Login view.
export default connect('login')((data, core) => ({ ...data, core }))(class Login extends Component {
    state = {
        /// Whether or not non-admins are allowed to log into the admin dashboard.
        /// This is off by default, but can be enabled for ... purposes ... if the user enters
        /// the konami code.
        /// Bugs related to this property being true shouldn’t be considered issues.
        allowsNonAdmin: false,

        /// The current login name; this is here because it’s shared across many login pages.
        login: '',

        /// Login mode; used to identify “create password” pages and such.
        mode: Mode.NORMAL,

        /// Password creation token taken from the URL (if it exists)
        token: null,
    };

    // record the last n keypresses and store them here
    #konamiDSeq = [];
    #detectKonami = key => {
        this.#konamiDSeq.push(key);
        while (this.#konamiDSeq.length > KONAMI_CODE.length) this.#konamiDSeq.shift();
        // match konamiDSeq (which is guaranteed to be shorter or the same length as KONAMI_CODE)
        // against KONAMI_CODE piece by piece
        if (this.#konamiDSeq.length === KONAMI_CODE.length
            && this.#konamiDSeq.map((x, i) => x === KONAMI_CODE[i]).reduce((a, b) => a && b)) {
            // match
            const allowsNonAdmin = !this.state.allowsNonAdmin;
            this.setState({ allowsNonAdmin });
            if (this.props.authState === LoginAuthStates.LOGGED_IN) {
                this.props.core.createTask('login/overrideIsAdmin', {
                    override: allowsNonAdmin,
                }).runOnceAndDrop();
            }
        }
    };

    #onKeyDown = e => {
        this.#detectKonami(e.key);
    };

    #getSelectedPageIndex = () => {
        const { authState, isAdmin } = this.props;
        if ((authState === LoginAuthStates.AUTHENTICATED
            || authState === LoginAuthStates.VERIFYING_TOTP) && isAdmin) return 1;
        if (authState === LoginAuthStates.LOGGED_IN && isAdmin) return 2;
        return 0;
    }

    #detailsPage;
    #totpPage;
    #autosizingPageView;

    #focusCurrentPage = () => {
        const selectedPageIndex = this.#getSelectedPageIndex();
        if (selectedPageIndex === 0) this.#detailsPage.focus();
        else if (selectedPageIndex === 1) this.#totpPage.focus();
    };

    #onPageChange = () => this.#focusCurrentPage();
    #onHeightChange = () => this.#autosizingPageView.pageHeightChanged();

    componentDidMount () {
        this.setState(getPageMode());

        setTimeout(() => {
            this.#focusCurrentPage();
        }, 200);
    }

    render ({ core, authState, isAdmin, totpSetupRequired, ueaCode }, { mode, login, token, allowsNonAdmin }) {
        const selectedPageIndex = this.#getSelectedPageIndex();

        let className = 'login';
        if (allowsNonAdmin) className += ' allows-non-admin';
        if (selectedPageIndex === 2) className += ' logged-in';

        return (
            <div class={className} onKeyDown={this.#onKeyDown}>
                <div class="login-dialog">
                    <LoginHeader
                        authenticated={authState === LoginAuthStates.AUTHENTICATED}
                        core={core}
                        mode={mode}
                        showTotp={selectedPageIndex === 1}
                        selectedPageIndex={selectedPageIndex} />
                    <AutosizingPageView
                        ref={view => this.#autosizingPageView = view}
                        selected={selectedPageIndex}
                        onPageChange={this.#onPageChange}>
                        <DetailsPage
                            ref={view => this.#detailsPage = view}
                            core={core}
                            authState={authState}
                            isAdmin={isAdmin}
                            ueaCode={ueaCode}
                            login={login}
                            onLoginChange={login => this.setState({ login })}
                            allowsNonAdmin={allowsNonAdmin}
                            onHeightChange={this.#onHeightChange}
                            token={token}
                            mode={mode} />
                        <TotpPage
                            ref={view => this.#totpPage = view}
                            core={core}
                            authState={authState}
                            ueaCode={ueaCode}
                            onHeightChange={this.#onHeightChange}
                            totpSetupRequired={totpSetupRequired} />
                        <div class="logged-in-page" />
                    </AutosizingPageView>
                    <LoginMeta />
                </div>
                <LoginMeta />
            </div>
        );
    }
});

function LoginHeader ({ authenticated, core, mode, selectedPageIndex, showTotp }) {
    const logOut = () =>
        authenticated && core.createTask('login/logOut').runOnceAndDrop().catch(() => {});

    let loginTitle = locale.details;
    if (mode === Mode.CREATING_PASSWORD) loginTitle = locale.createPassword;
    else if (mode === Mode.RESETTING_PASSWORD) loginTitle = locale.resetPassword;

    return (
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
            <ProgressIndicator selected={selectedPageIndex}>
                <span onClick={logOut}>
                    {loginTitle}
                </span>
                <span class={showTotp ? '' : 'is-hidden'}>
                    {locale.totp}
                </span>
                <span />
            </ProgressIndicator>
        </header>
    );
}

function LoginMeta () {
    return (
        <div class="login-meta">
            {localeMeta.copyright} <a
                href={localeMeta.copyrightHref}
                target="_blank"
                rel="noopener noreferrer">
                {localeMeta.copyrightHolder}
            </a>, {localeMeta.license} · <a
                href={localeMeta.sourceHref}
                target="_blank"
                rel="noopener noreferrer">
                {localeMeta.source}
            </a>
        </div>
    );
}
