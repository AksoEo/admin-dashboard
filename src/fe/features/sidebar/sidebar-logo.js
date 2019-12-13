import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import Logo from '../../components/logo';
import { coreContext } from '../../core/connection';

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

/// # Props
/// - onClick
export default class SidebarLogo extends PureComponent {
    static contextType = coreContext;

    onClick = e => {
        if (this.props.onClick) this.props.onClick(e);
        this.logo.bounce(100);
        this.logo.spin();
    };

    onFocus = e => this.logo.focus();
    onBlur = e => this.logo.blur();

    render () {
        return (
            <button
                class="sidebar-logo"
                onClick={this.onClick}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                ref={node => this.node = node}>
                <Logo
                    ref={view => this.logo = view}
                    onUpdate={logo => {
                        // trigger particles when the user pointlessly clicks the logo quickly
                        // enough for it to bounce 96 px far
                        if (logo.states[0].bounce.value > 96) {
                            if (triggerParticles) {
                                triggerParticles(this.node, this.context);
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
            </button>
        );
    }
}
