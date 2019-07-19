import React from 'react';
import PropTypes from 'prop-types';
import { Spring, globalAnimator } from '../animation';

// lazy-loaded particles
let particlesPromise, triggerParticles;
function loadParticles () {
    if (!particlesPromise) {
        particlesPromise = import('../features/logo-particles');
        particlesPromise.then(e => {
            triggerParticles = e.default;
        }).catch(() => {
            // fail silently and allow for retries
            particlesPromise = false;
        });
    }
}

const PATH = 'M33 5h8.053c6.24 0 8.503.65 10.785 1.87a12.721 12.721 0 0 1 5.292 5.292C58.35 14.444'
    + ' 59 16.707 59 22.947V31H33V5z';

export default class HeaderLogo extends React.PureComponent {
    static propTypes = {
        onClick: PropTypes.func,
    };

    states = [1, 8, 8, 7].map((_, i) => ({
        offset: i * Math.PI / 2,
        bounce: new Mass(4, -120, 0.63),
    }));
    rotation = new Spring(1, 1);

    onClick = e => {
        if (this.props.onClick) this.props.onClick(e);
        for (const state of this.states) {
            state.bounce.velocity = 100;
        }
        this.rotation.target += Math.PI;
        globalAnimator.register(this);
    };

    update (dt) {
        let wantsUpdate = false;
        for (const state of this.states) {
            state.bounce.update(dt);
            if (state.bounce.wantsUpdate) wantsUpdate = true;
        }
        this.rotation.update(dt);
        if (this.rotation.wantsUpdate()) wantsUpdate = true;
        if (!wantsUpdate) globalAnimator.deregister(this);
        this.forceUpdate();

        if (this.states[0].bounce.value > 96) {
            if (triggerParticles) {
                triggerParticles(this.node);
                for (const state of this.states) {
                    state.bounce.value = 0;
                    state.bounce.velocity = 0;
                }
                this.rotation.finish();
            } else loadParticles();
        }
    }

    componentWillUnmount () {
        globalAnimator.deregister(this);
    }

    render () {
        return (
            <div className="header-logo" onClick={this.onClick} ref={node => this.node = node}>
                <svg
                    className="logo"
                    aria-hidden="true"
                    role="presentation"
                    viewBox="0 0 64 64">
                    {this.states.map((state, i) => (
                        <path
                            className="corner"
                            key={i}
                            fill={i % 2 === 0 ? '#31a64f' : '#363636'}
                            d={PATH}
                            style={{
                                transformOrigin: '32px 32px',
                                transform: `rotate(${state.offset + this.rotation.value}rad) `
                                    + `translate(${state.bounce.value}px, ${-state.bounce.value}px)`,
                            }} />
                    ))}
                </svg>
                <img
                    className="logo-label"
                    src="/assets/logo-label.svg"
                    draggable="false"
                    aria-label="AKSO"
                    alt="AKSO" />
            </div>
        );
    }
}

class Mass {
    value = 0;
    velocity = 0;
    ground = 0;

    constructor (mass, gravity, bounce) {
        this.mass = mass;
        this.gravity = gravity;
        this.bounce = bounce;
    }

    update (elapsed) {
        let timeLeft = elapsed;
        while (timeLeft > 0) {
            const dt = Math.min(1 / 60, timeLeft);
            timeLeft -= dt;
            this.velocity += this.gravity * this.mass * dt;
            this.value += this.velocity * dt;

            if (this.value < this.ground) {
                this.value = this.ground;
                this.velocity *= -this.bounce;
            }
        }

        if (!this.wantsUpdate) {
            this.value = this.ground;
            this.velocity = 0;
        }
    }

    get wantsUpdate () {
        return Math.abs(this.value - this.ground)
            + Math.abs(this.velocity) / (this.gravity ** 2) > 1e-3;
    }
}
