import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import Logo from '../../components/logo';
import { Spring, globalAnimator, lerp, clamp } from '../../animation';

// renders the logo transition when the user logs in
export default class LogoTransition extends Component {
    static propTypes = {
        // initial logo position and size
        initialRect: PropTypes.object.isRequired,
        onEnd: PropTypes.func.isRequired,
    };

    x = new Spring(0.5, 0.7);
    y = new Spring(0.5, 0.7);
    scale = new Spring(0.5, 0.7);
    opacity = new Spring(1, 0.5);

    // true while the app has not registered itself yet
    aimless = true;
    directed = false;

    lt = 0;
    t = 0;

    componentDidMount () {
        this.x.value = this.props.initialRect.left + this.props.initialRect.width / 2;
        this.y.value = this.props.initialRect.top + this.props.initialRect.height / 2;
        this.scale.value = this.props.initialRect.width / 64;
        this.opacity.value = this.opacity.target = 1;
        this.lt = 0;

        globalAnimator.register(this);
    }

    direct (logoRect, endHandler) {
        this.aimless = false;
        this.endHandler = endHandler;
        globalAnimator.deregister(this.logo);

        if (logoRect) {
            this.xTarget = logoRect.left + logoRect.width / 2;
            this.yTarget = logoRect.top + logoRect.height / 2;
            this.zTarget = logoRect.width / 64;

            this.directed = true;
            this.xStart = this.x.value;
            this.yStart = this.y.value;
            this.zStart = this.scale.value;
        } else {
            this.x.target = this.x.value;
            this.y.target = this.y.value;
            this.scale.target = 1;
            this.opacity.target = 0;
        }

        return true;
    }

    update (dt) {
        if (this.aimless) {
            this.x.target = window.innerWidth / 2;
            this.y.target = window.innerHeight / 2;
            this.scale.target = 1.5;

            const plt = this.lt;
            this.lt += dt;

            if (this.lt % 2 < plt % 2) {
                this.logo.bounce(100);
                this.logo.spin();
                this.logoIsSpinning = true;
            }
        } else if (this.directed) {
            this.t += dt;
            const yt = clamp(this.t / 0.7, 0, 1);
            const tx = lerp(this.xStart, this.xTarget, yt);
            const yfn = t => 1.1 - 0.8 * (1.5 * t - 1.15) ** 2;
            const ty = lerp(this.yStart, this.yTarget, yfn(yt));
            const tz = lerp(this.zStart, this.zTarget, yt);
            this.x.target = tx;
            this.y.target = ty;
            this.scale.target = tz;

            this.logo.rotation.value = yt * Math.PI;
            for (const state of this.logo.states) {
                state.bounce.value = 7 * (1 - (2 * yt - 1) ** 2);
            }
        }

        this.x.update(dt);
        this.y.update(dt);
        this.scale.update(dt);
        this.opacity.update(dt);

        if (this.scale.value < 0) this.scale.value = 0;

        this.forceUpdate();
        this.logo.forceUpdate();

        if (!this.aimless
            && !this.x.wantsUpdate()
            && !this.y.wantsUpdate()
            && !this.scale.wantsUpdate()) {
            this.props.onEnd();
            if (this.endHandler) this.endHandler();
        }
    }

    componentWillUnmount () {
        globalAnimator.deregister(this);
    }

    render () {
        const style = {
            transform: `translate(${this.x.value}px, ${this.y.value}px) scale(${this.scale.value})`,
            opacity: this.opacity.value,
        };

        return (
            <div class="akso-logo-transition" style={style}>
                <Logo ref={view => this.logo = view} />
            </div>
        );
    }
}
