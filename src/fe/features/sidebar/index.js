import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Spring } from '@cpsdqs/yamdl';
import SidebarContents from './contents';
import './style';

/** Width of the region at the left screen edge from which the sidebar may be dragged out. */
const EDGE_DRAG_WIDTH = 50;

/// Renders the sidebar.
///
/// # Props
/// - permanent: Whether or not the sidebar should be permanent and inline or slide out temporarily.
///   If this is true, `open` will be ignored.
/// - open/onOpen/onClose: open state
/// - currentPage: Current page identifier passed to the SidebarContents
export default class Sidebar extends PureComponent {
    node = null;
    backdropNode = null;

    /// The spring used to animate the sidebar’s X position.
    spring = new Spring(1, 0.5);

    /// Called when the sidebar drag ends, by the sidebar drag handler.
    onDragEnd = (open) => {
        if (open && this.props.onOpen) this.props.onOpen();
        else if (!open && this.props.onClose) this.props.onClose();
    };

    sidebarDragHandler = new SidebarDragHandler(this.spring, this.onDragEnd);

    constructor (props) {
        super(props);
        this.spring.on('update', this.onSpringUpdate);
    }

    /// Updates the spring target; called when the `open` property changes.
    updateSpringTarget () {
        this.spring.target = this.props.permanent || this.props.open ? 1 : 0;
        this.spring.locked = false;
        this.spring.start();
    }

    /// Called when the position spring updates.
    onSpringUpdate = (position) => {
        position = Math.max(0, position);
        if (position <= 1) {
            this.node.style.transform = `translateX(-${(1 - position) * 100}%)`;
        } else {
            const mapped = 1 + Math.pow(position - 1, 0.3) / 20;
            this.node.style.transform = `scaleX(${mapped})`;
        }
        this.node.style.visibility = position == 0 ? 'hidden' : '';
        this.backdropNode.style.opacity = this.props.permanent ? 0 : Math.min(1, position);
    }

    componentDidMount () {
        this.updateSpringTarget();
        if ((this.props.permanent || this.props.open) && !this.animatingIn) {
            this.spring.value = 1;
        }
        this.spring.start();
        if (!this.props.permanent) this.sidebarDragHandler.bind();
        this.sidebarDragHandler.setSidebarNode(this.node);
    }

    /// Will animate the sidebar sliding in.
    animateIn (delay) {
        this.spring.value = 0;
        this.onSpringUpdate(0);
        this.spring.stop();
        this.animatingIn = true;
        setTimeout(() => this.spring.start(), delay);
    }

    componentDidUpdate (prevProps) {
        if (this.props.open !== prevProps.open) {
            this.updateSpringTarget();
        }
        if (this.props.permanent !== prevProps.permanent) {
            if (!this.props.permanent) this.sidebarDragHandler.bind();
            else this.sidebarDragHandler.unbind();
            this.updateSpringTarget();
        }
    }

    componentWillUnmount () {
        this.spring.stop();
        this.sidebarDragHandler.unbind();
    }

    render () {
        let className = 'app-sidebar-container';
        if (this.props.permanent) className += ' permanent';
        if (!this.props.permanent && this.props.open) className += ' open';

        return (
            <div class={className}>
                <div
                    class="app-sidebar-backdrop"
                    ref={node => this.backdropNode = node}
                    onClick={() => {
                        this.spring.locked = false;
                        this.props.onClose();
                    }} />
                <div
                    class="app-sidebar"
                    ref={node => this.node = node}
                    onKeyDown={e => {
                        if (e.key === 'Escape') {
                            this.spring.locked = false;
                            this.props.onClose();
                        }
                    }}>
                    <SidebarContents
                        currentPage={this.props.currentPage}
                        onLogout={this.props.onLogout}
                        onDirectTransition={this.props.onDirectTransition}
                        permissions={this.props.permissions} />
                </div>
            </div>
        );
    }
}

/** Handles sidebar touch-dragging. */
class SidebarDragHandler {
    /** True if a touch drag may turn into a sidebar drag. */
    mayDrag = false;

    /** True if the sidebar is currently being dragged. */
    isDragging = false;

    /** Temporarily stores the sidebar width. */
    sidebarWidth = 0;

    /** Initial touch position X. */
    startTouchX = 0;
    /** Initial touch position Y. */
    startTouchY = 0;
    /** Previous touch position. */
    lastTouchX = 0;
    /** Initial spring value offset. */
    startTouchOffset = 0;
    /** Previous event timestamp. */
    lastTouchTime = 0;

    /**
     * @param {Spring} sidebarSpring - the sidebar spring. Should be 0 when closed and 1 when open.
     * @param {Function} onEnd - a function `(bool) => void` called when the user ends the drag
     *                           with whether or not the sidebar should be considered open or not.
     */
    constructor (sidebarSpring, onEnd) {
        this.spring = sidebarSpring;
        this.onEnd = onEnd;
    }

    /** @param {Node} sidebarNode - the sidebar node. */
    setSidebarNode (sidebarNode) {
        this.sidebarNode = sidebarNode;
    }

    /** Binds global event handlers. */
    bind () {
        window.addEventListener('touchstart', this.onTouchStart);
        window.addEventListener('touchmove', this.onTouchMove, { passive: false });
        window.addEventListener('touchend', this.onTouchEnd, { passive: false });
        window.addEventListener('touchcancel', this.onTouchCancel);
    }

    /** Unbinds global event handlers. */
    unbind () {
        window.removeEventListener('touchstart', this.onTouchStart);
        window.removeEventListener('touchmove', this.onTouchMove);
        window.removeEventListener('touchend', this.onTouchEnd);
        window.removeEventListener('touchcancel', this.onTouchCancel);
    }

    /**
     * Returns true if a touch event should be ignored, e.g. because the target is a button.
     * @param {Node} target
     * @returns {boolean}
     */
    shouldIgnoreEventFor (target) {
        if (!target) return false;
        if (target.tagName === 'BUTTON') return true;
        return this.shouldIgnoreEventFor(target.parentNode);
    }

    onTouchStart = e => {
        this.isDragging = false;

        if (this.shouldIgnoreEventFor(e.target)) return;

        if (e.touches.length > 1) {
            // exit if there are multiple touches
            this.mayDrag = false;
            return;
        }

        this.sidebarWidth = this.sidebarNode.offsetWidth;

        this.startTouchX = this.lastTouchX = e.touches[0].clientX;
        this.startTouchOffset = this.startTouchX / this.sidebarWidth - this.spring.value;
        this.startTouchY = e.touches[0].clientY;
        this.lastTouchTime = Date.now();

        this.mayDrag = this.spring.target === 1 || this.startTouchX < EDGE_DRAG_WIDTH;

        this.spring.locked = true;
        this.spring.velocity = 0;
    }

    onTouchMove = e => {
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;

        if (this.mayDrag && !this.isDragging) {
            const wouldClose = this.spring.target === 1;
            const touchXIsMovingInTheRightDirection = wouldClose
                ? touchX < this.startTouchX
                : touchX > this.startTouchX;
            const touchXIsMovingInTheWrongDirection = wouldClose
                ? touchX > this.startTouchX
                : touchX < this.startTouchX;
            const touchYHasntMovedTooFar = Math.abs(touchY - this.startTouchY) < 5;
            if (touchXIsMovingInTheRightDirection && touchYHasntMovedTooFar) {
                this.isDragging = true;
            } else if (touchXIsMovingInTheWrongDirection) {
                this.mayDrag = false;
            }
        }

        if (this.isDragging) {
            e.preventDefault();

            this.spring.value = touchX / this.sidebarWidth - this.startTouchOffset;
            const deltaTime = (Date.now() - this.lastTouchTime) / 1000;
            this.lastTouchTime = Date.now();
            this.spring.velocity = (touchX - this.lastTouchX) / this.sidebarWidth / deltaTime;
            this.lastTouchX = touchX;

            // make sure update is still being fired
            this.spring.start();
        }
    }

    onTouchEnd = e => {
        if (this.isDragging) {
            e.preventDefault();
            this.isDragging = false;
            this.spring.locked = false;

            // guess where it’s going to land
            const projectedPosition = this.spring.value + this.spring.velocity;
            if (projectedPosition < 0.5) {
                this.spring.target = 0;
                this.onEnd(false);
            } else {
                this.spring.target = 1;
                this.onEnd(true);
            }

            this.spring.start();
        }
    }

    onTouchCancel = () => {
        if (this.isDragging) {
            this.isDragging = false;
            this.spring.locked = false;
            this.spring.start();
        }
    }
}
