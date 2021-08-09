import { h } from 'preact';
import { createPortal, PureComponent } from 'preact/compat';
import { globalAnimator, Spring, Button, AppBarProxy, MenuIcon } from 'yamdl';
import './dialog-sheet.less';

const clamp = (x, a, b) => Math.max(a, Math.min(x, b));
const lerp = (a, b, t) => (b - a) * t + a;

// TODO: deduplicate with yamdl
const DEFAULT_FULLSCREEN_WIDTH = 420;

/// A more persistent and less transient dialog.
///
/// # Props
/// - open/onClose
/// - title
export default class DialogSheet extends PureComponent {
    container = document.createElement('div');
    presence = new Spring(1, 0.3);

    state = {
        fullScreen: false,
    };

    updatePeriod () {
        this.presence.setPeriod((this.state.fullScreen || this.props.open) ? 0.5 : 0.3);
    }

    updateFullScreen () {
        const wasFullScreen = this.state.fullScreen;
        const onSet = () => {
            if (wasFullScreen !== this.state.fullScreen) {
                this.updatePeriod();
            }
        };

        if (typeof this.props.fullScreen === 'function') {
            this.setState({ fullScreen: this.props.fullScreen(window.innerWidth) }, onSet);
            this.presence.setPeriod(0.5);
        } else {
            const fullScreen = ('fullScreen' in this.props)
                ? this.props.fullScreen
                : window.innerWidth <= DEFAULT_FULLSCREEN_WIDTH;
            this.setState({ fullScreen }, onSet);
        }
    }

    update (dt) {
        this.presence.update(dt);
        if (!this.presence.wantsUpdate()) globalAnimator.deregister(this);
        this.forceUpdate();
    }

    onContainerClick = e => {
        if (e.target === this.containerNode && this.props.onClose) {
            const button = this.closeButton.button;
            button.classList.add('highlight-focus');
            setTimeout(() => {
                button.classList.remove('highlight-focus');
            }, 500);
        }
    };

    onResize = () => {
        this.updateFullScreen();
    };

    componentDidMount () {
        window.addEventListener('resize', this.onResize);
        if (this.props.open) this.presence.value = 1;
        this.updateFullScreen();
        this.forceUpdate();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.fullScreen !== this.props.fullScreen) this.updateFullScreen();
        if (prevProps.open !== this.props.open) {
            this.presence.target = +!!this.props.open;
            this.updatePeriod();
            globalAnimator.register(this);
        }
        if (this.presence.value > 1 / 100) {
            if (!this.container.parentNode && !this.props.container) {
                document.body.appendChild(this.container);
            }
        } else if (this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }

    componentWillUnmount () {
        window.removeEventListener('resize', this.onResize);
        globalAnimator.deregister(this);
    }

    render () {
        const props = { ...this.props };
        delete props.open;
        delete props.fixed;
        delete props.backdrop;
        delete props.title;
        delete props.actions;
        delete props.fullScreen;
        delete props.container;
        delete props.appBarProps;

        props.class = (props.class || '') + ' paper-dialog';

        let containerClass = 'paper-dialog-container';
        if (this.state.fullScreen) {
            containerClass += ' is-full-screen';
            props.class += ' is-full-screen';
        }
        containerClass += ('fixed' in this.props
            ? this.props.fixed
            : !this.props.container) ? ' is-fixed' : '';

        props.style = { ...(props.style || {}) };
        props.style.transform = props.style.transform || '';
        props.style.opacity = 'opacity' in props.style ? +props.style.opacity : 1;

        if (this.state.fullScreen) {
            props.style.transform += ` translateY(${lerp(100, 0, this.presence.value)}%)`;
            props.style.opacity *= clamp(lerp(0, 50, this.presence.value), 0, 1);
        } else if (this.props.open) {
            props.style.transform += ` translateY(${lerp(window.innerHeight / 2, 0, this.presence.value)}px)`;
            props.style.opacity *= this.presence.value ** 0.2;
        } else {
            props.style.opacity *= this.presence.value;
        }

        return this.presence.value > 1 / 100 ? createPortal((
            <div
                class={containerClass}
                ref={node => this.containerNode = node}
                onClick={this.onContainerClick}>
                {this.props.backdrop && <div
                    class="paper-dialog-backdrop"
                    style={{ opacity: this.presence.value }} />}
                <div {...props}>
                    {this.state.fullScreen || this.props.title ? (
                        <AppBarProxy
                            local={!this.state.fullScreen}
                            priority={this.props.open
                                ? (this.props.appBarPriority || 1000)
                                : -Infinity}
                            class="paper-dialog-app-bar"
                            menu={this.props.onClose ? (
                                <Button
                                    class="dialog-sheet-close-button"
                                    ref={node => this.closeButton = node}
                                    icon
                                    small
                                    onClick={this.props.onClose}>
                                    <MenuIcon type="close" />
                                </Button>
                            ) : null}
                            title={this.props.title}
                            actions={this.state.fullScreen ? this.props.actions : null}
                            proxied={<div class="p-app-bar-placeholder" />}
                            {...(this.props.appBarProps || {})} />
                    ) : null}
                    <div class="paper-dialog-contents">
                        {this.props.children}
                    </div>
                    {!this.state.fullScreen && this.props.actions ? (
                        <footer class="paper-dialog-actions">
                            {this.props.actions.map(({ label, action, disabled, props }, i) => (
                                <Button
                                    key={i}
                                    class="p-action"
                                    onClick={action}
                                    disabled={disabled}
                                    {...(props || {})}>
                                    {label}
                                </Button>
                            ))}
                        </footer>
                    ) : null}
                </div>
            </div>
        ), this.props.container || this.container) : null;
    }
}
