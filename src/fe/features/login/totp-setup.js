import { h, Component } from 'preact';
import { CircularProgress } from '@cpsdqs/yamdl';
import { generateTotp } from '@tejo/akso-client';
import { login as locale } from '../../locale';

export default class TotpSetup extends Component {
    state = {
        secrets: null,
    };

    componentDidMount () {
        this.props.onHeightChange();

        const ueaCode = this.props.ueaCode;

        generateTotp(ueaCode).then(secrets => {
            this.setState({ secrets }, () => {
                this.props.onGenerateSecret(secrets.secret);
                this.props.onHeightChange();
            });
        });
    }

    render () {
        const { secrets } = this.state;

        if (!secrets) {
            return (
                <div class="totp-setup is-generating">
                    <CircularProgress indeterminate />
                </div>
            );
        }

        return (
            <div class="totp-setup">
                <p>
                    {locale.totpSetupDescription}
                </p>
                <p>
                    {locale.totpAppDescriptionPre}
                    <a
                        href={locale.totpAppHref}
                        target="_blank"
                        rel="noopener noreferrer">
                        {locale.totpAppName}
                    </a>
                    {locale.totpAppDescriptionPost}
                </p>
                <div class="totp-setup-qr-container">
                    <img
                        class="totp-qr"
                        draggable={false}
                        src={secrets.qrCode}
                        onLoad={this.props.onHeightChange} />
                </div>
                {this.props.contents}
            </div>
        );
    }
}
