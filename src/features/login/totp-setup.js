import { h, Component } from 'preact';
import { CircularProgress } from 'yamdl';
import { generateTotp } from 'akso-client/totp-utils';
import locale from '../../locale';

export default class TotpSetup extends Component {
    state = {
        secrets: null,
    };

    componentDidMount () {
        this.props.onHeightChange();

        const ueaCode = 'hsdjkfhjska'; // TODO: use actual UEA code once that’s available

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
                    {locale.login.totpSetupDescription}
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
