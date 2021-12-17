import { h } from 'preact';
import { globalAnimator, Dialog, Button, MenuIcon } from 'yamdl';
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
export default class DialogSheet extends Dialog {
    _container = document.createElement('div');

    updatePeriod () {
        this.presence.setPeriod((this.state.fullScreen || this.props.open) ? 0.5 : 0.3);
    }

    updateFullScreen () {
        const fullScreen = typeof this.props.fullScreen === 'function'
            ? this.props.fullScreen(window.innerWidth)
            : ('fullScreen' in this.props)
                ? this.props.fullScreen
                : window.innerWidth <= DEFAULT_FULLSCREEN_WIDTH;
        this.setState({ fullScreen }, () => this.updatePeriod());
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

    renderStyle (props) {
        if (this.state.fullScreen) {
            props.style.transform += ` translateY(${lerp(100, 0, this.presence.value)}%)`;
            props.style.opacity *= clamp(lerp(0, 50, this.presence.value), 0, 1);
        } else if (this.props.open) {
            props.style.transform += ` translateY(${lerp(window.innerHeight / 2, 0, this.presence.value)}px)`;
            props.style.opacity *= this.presence.value ** 0.2;
        } else {
            props.style.opacity *= this.presence.value;
        }
    }

    renderAppBarMenu () {
        return this.props.onClose ? (
            <Button
                class="dialog-sheet-close-button"
                ref={node => this.closeButton = node}
                icon
                small
                onClick={this.props.onClose}>
                <MenuIcon type="close" />
            </Button>
        ) : null;
    }

    get container () {
        return this.props.container || this._container;
    }
}
