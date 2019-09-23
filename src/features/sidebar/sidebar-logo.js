import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import PropTypes from 'prop-types';
import Logo from '../../components/logo';

// lazy-loaded particles
let particlesPromise, triggerParticles;
function loadParticles () {
    if (!particlesPromise) {
        particlesPromise = import('../logo-particles');
        particlesPromise.then(e => {
            triggerParticles = e.default;
        }).catch(() => {
            // fail silently and allow for retries
            particlesPromise = false;
        });
    }
}

export default class SidebarLogo extends PureComponent {
    static propTypes = {
        onClick: PropTypes.func,
        onDirectTransition: PropTypes.func,
        onDoAnimateIn: PropTypes.func,
    };

    state = {
        logoVisible: true,
    }

    onClick = e => {
        if (this.props.onClick) this.props.onClick(e);
        this.logo.bounce(100);
        this.logo.spin();
    };

    componentDidMount () {
        if (this.props.onDirectTransition) {
            if (window.innerWidth < 900) { // FIXME: hardcoded perma sidebar width
                this.props.onDirectTransition();
            } else if (this.props.onDirectTransition(
                this.logo.node.getBoundingClientRect(),
                () => this.setState({ logoVisible: true }),
            )) {
                this.props.onDoAnimateIn();
                this.setState({ logoVisible: false });
            }
        }
    }

    render () {
        return (
            <div class="sidebar-logo" onClick={this.onClick} ref={node => this.node = node}>
                <Logo
                    ref={view => this.logo = view}
                    style={!this.state.logoVisible && ({ opacity: 0 })}
                    onUpdate={logo => {
                        // trigger particles when the user pointlessly clicks the logo quickly
                        // enough for it to bounce 96 px far
                        if (logo.states[0].bounce.value > 96) {
                            if (triggerParticles) {
                                triggerParticles(this.node);
                                for (const state of logo.states) {
                                    state.bounce.value = 0;
                                    state.bounce.velocity = 0;
                                }
                                logo.rotation.finish();
                            } else loadParticles();
                        }
                    }} />
                <img
                    class="logo-label"
                    src="/assets/logo-label.svg"
                    draggable="false"
                    aria-label="AKSO"
                    alt="AKSO" />
            </div>
        );
    }
}
