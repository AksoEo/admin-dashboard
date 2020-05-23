import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Spring, globalAnimator } from '@cpsdqs/yamdl';
import SidebarContents from './contents';
import './style';

/// Width of the region at the left screen edge from which the sidebar may be dragged out.
const EDGE_DRAG_WIDTH = 50;

/// After holding down on the edge for this long, the sidebar will peek out and start a dragging
/// action.
const PEEK_TIMEOUT = 0.3;

/// Renders the sidebar.
///
/// # Props
/// - permanent: Whether or not the sidebar should be permanent and inline or slide out temporarily.
///   If this is true, `open` will be ignored.
/// - open/onOpen/onClose: open state
/// - currentPage: Current page identifier passed to the SidebarContents
/// - locked: if true, will lock the sidebar to user interactions
export default class Sidebar extends PureComponent {
    node = null;
    backdropNode = null;

    /// The spring used to animate the sidebar’s X position.
    position = new Spring(1, 0.5);

    /// Called when the sidebar drag ends, by the sidebar drag handler.
    onDragEnd = (open) => {
        if (open && this.props.onOpen) this.props.onOpen();
        else if (!open && this.props.onClose) this.props.onClose();
    };

    sidebarDragHandler = new SidebarDragHandler(this, this.position, this.onDragEnd);

    /// Updates the spring target; called when the `open` property changes.
    updateSpringTarget () {
        this.position.target = this.props.permanent || this.props.open ? 1 : 0;
        this.position.locked = false;
        globalAnimator.register(this);
    }

    update (dt) {
        this.sidebarDragHandler.update(dt);
        this.position.update(dt);
        this.onSpringUpdate(this.position.value);

        if (!this.position.wantsUpdate() && !this.sidebarDragHandler.wantsUpdate()) {
            globalAnimator.deregister(this);
        }
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
            this.position.value = 1;
        }
        if (!this.props.permanent) this.sidebarDragHandler.bind();
        this.sidebarDragHandler.setSidebarNode(this.node);
        globalAnimator.register(this);
    }

    /// Will animate the sidebar sliding in.
    animateIn (delay) {
        this.position.value = 0;
        this.onSpringUpdate(0);
        this.position.stop();
        this.animatingIn = true;
        this.position.locked = true;
        setTimeout(() => this.position.locked = false, delay);
        globalAnimator.register(this);
    }

    componentDidUpdate (prevProps) {
        if (this.props.open !== prevProps.open) {
            this.position.locked = false;
            this.updateSpringTarget();
        }
        if (this.props.permanent !== prevProps.permanent) {
            if (!this.props.permanent) this.sidebarDragHandler.bind();
            else this.sidebarDragHandler.unbind();
            this.updateSpringTarget();
        }
    }

    componentWillUnmount () {
        globalAnimator.deregister(this);
        this.sidebarDragHandler.unbind();
    }

    #contents;

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
                        this.position.locked = false;
                        this.props.onClose();
                    }} />
                <div
                    class="app-sidebar"
                    ref={node => this.node = node}
                    onKeyDown={e => {
                        if (e.key === 'Escape') {
                            this.position.locked = false;
                            this.props.onClose();
                        }
                    }}
                    // don’t focus the scroll view
                    tabIndex={-1}
                    onFocus={e => {
                        if (e.target === e.currentTarget) {
                            e.preventDefault();
                            e.target.blur();
                            this.#contents.focus();
                        }
                    }}>
                    <SidebarContents
                        ref={contents => this.#contents = contents}
                        locked={this.props.locked}
                        currentPage={this.props.currentPage}
                        onLogout={this.props.onLogout}
                        onDirectTransition={this.props.onDirectTransition}
                        permissions={this.props.permissions} />
                </div>
            </div>
        );
    }
}

/// Handles sidebar touch-dragging.
class SidebarDragHandler {
    /// True if a touch drag may turn into a sidebar drag.
    mayDrag = false;

    /// True if the sidebar is currently being dragged.
    isDragging = false;

    /// Temporarily stores the sidebar width.
    sidebarWidth = 0;

    /// Initial touch position X.
    startTouchX = 0;
    /// Initial touch position Y.
    startTouchY = 0;
    /// Previous touch position.
    lastTouchX = 0;
    /// Initial spring value offset.
    startTouchOffset = 0;
    /// Previous event timestamp.
    lastTouchTime = 0;
    /// Current pointer id
    currentPointer = null;

    /// # Parameters
    /// - owner: { update: number => void } - update target
    /// - sidebarSpring: Spring - the sidebar spring. Should be 0 when closed and 1 when open.
    /// - onEnd: `(bool) => void` - called when the user ends the drag with whether or not the
    ///   sidebar should be considered open or not.
    constructor (owner, sidebarSpring, onEnd) {
        this.owner = owner;
        this.spring = sidebarSpring;
        this.onEnd = onEnd;

        this.dragSurface = document.createElement('div');
        this.dragSurface.id = 'sidebar-drag-event-surface';
        Object.assign(this.dragSurface.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            zIndex: '999999',
        });
        this.dragSurface.addEventListener('pointermove', e => {
            this.onPointerMove(e);
            e.stopPropagation();
        });
        this.dragSurface.addEventListener('pointerend', e => {
            this.onPointerEnd(e);
            e.stopPropagation();
        });
        this.dragSurface.addEventListener('pointercancel', this.onPointerCancel);
    }

    /// Sets the sidebar node.
    setSidebarNode (sidebarNode) {
        this.sidebarNode = sidebarNode;
    }

    #capturedPointer = null;
    beginDragging () {
        if (this.isDragging) return;
        this.isDragging = true;
        document.body.appendChild(this.dragSurface);
        this.dragSurface.setPointerCapture(this.currentPointer);
        this.#capturedPointer = this.currentPointer;
    }

    endDragging () {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.dragSurface.releasePointerCapture(this.#capturedPointer);
        document.body.removeChild(this.dragSurface);
    }

    /// Binds global event handlers.
    bind () {
        window.addEventListener('pointerdown', this.onPointerDown);
        window.addEventListener('pointermove', this.onPointerMove);
        window.addEventListener('pointerup', this.onPointerUp);
    }

    /// Unbinds global event handlers.
    unbind () {
        window.removeEventListener('pointerdown', this.onPointerDown);
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerUp);
    }

    onPointerDown = e => {
        if (e.pointerType !== 'touch') return;
        if (this.currentPointer !== null) return;
        this.currentPointer = e.pointerId;
        this.spring.locked = false;
        this.endDragging();

        this.sidebarWidth = this.sidebarNode.offsetWidth;
        if (this.spring.target === 0) {
            // currently closed; start peek timeout
            this.peekTimeout = PEEK_TIMEOUT;
        }

        this.startTouchX = this.lastTouchX = e.clientX;
        this.startTouchY = e.clientY;
        this.lastTouchTime = Date.now();

        this.mayDrag = this.spring.target === 1 || this.startTouchX < EDGE_DRAG_WIDTH;

        this.spring.velocity = 0;

        globalAnimator.register(this.owner);
    }

    peekTimeout = null;
    peekWaiting = false;

    update (dt) {
        if (this.peekTimeout !== null) {
            this.peekTimeout -= dt;
            if (this.peekTimeout < 0) {
                this.peekTimeout = null;
                if (this.mayDrag && !this.isDragging) {
                    this.spring.target = EDGE_DRAG_WIDTH / this.sidebarWidth;
                    this.peekWaiting = true;

                    // HACK: fire last event again to update position
                    this.onMove(this.lastTouchX, this.startTouchY);
                }
            }
        }
        if (this.peekWaiting && this.mayDrag) {
            if (Math.abs(this.spring.value - EDGE_DRAG_WIDTH / this.sidebarWidth) < 1e-2) {
                // close enough
                this.peekWaiting = false;
                // start dragging
                this.beginDragging();
                this.startTouchOffset = this.lastTouchX / this.sidebarWidth - this.spring.value;
                this.spring.locked = true;
                document.body.setPointerCapture(this.currentPointer);
            }
        }
    }

    wantsUpdate () {
        return this.peekTimeout !== null || this.peekWaiting;
    }

    onMove (touchX, touchY) {
        let signal = null;

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
                this.beginDragging();
                this.startTouchOffset = touchX / this.sidebarWidth - this.spring.value;
                this.spring.locked = true;
                signal = 'drag';
            } else if (touchXIsMovingInTheWrongDirection) {
                this.mayDrag = false;
                signal = 'cancel';
            }
        }

        if (this.isDragging) {
            this.spring.value = touchX / this.sidebarWidth - this.startTouchOffset;
            const deltaTime = (Date.now() - this.lastTouchTime) / 1000;
            if (deltaTime !== 0) {
                this.spring.velocity = (touchX - this.lastTouchX) / this.sidebarWidth / deltaTime;
            }

            // make sure update is still being fired
            globalAnimator.register(this.owner);
        }

        this.lastTouchX = touchX;
        this.lastTouchTime = Date.now();

        return signal;
    }

    onPointerMove = e => {
        if (e.pointerId !== this.currentPointer) return;
        const touchX = e.clientX;
        const touchY = e.clientY;

        const signal = this.onMove(touchX, touchY);

        if (this.isDragging) e.preventDefault();

        if (signal === 'drag') {
            // started drag
            this.peekTimeout = null;
            this.peekWaiting = false;
        } else if (signal === 'cancel') {
            this.peekTimeout = null;
            this.peekWaiting = false;
            this.spring.locked = false;
        }
    }

    onPointerUp = e => {
        if (e.pointerId !== this.currentPointer) return;
        this.currentPointer = null;

        this.spring.locked = false;
        this.spring.target = Math.round(this.spring.target);
        this.peekTimeout = null;
        this.peekWaiting = false;

        if (this.isDragging) {
            e.preventDefault();
            this.endDragging();

            // guess where it’s going to land
            const projectedPosition = this.spring.value + this.spring.velocity;
            if (projectedPosition < 0.5) {
                this.spring.target = 0;
                this.onEnd(false);
            } else {
                this.spring.target = 1;
                this.onEnd(true);
            }
        }
        globalAnimator.register(this.owner);
    }

    onPointerCancel = e => {
        if (e.pointerId !== this.currentPointer) return;
        this.currentPointer = null;

        this.spring.locked = false;
        this.spring.target = Math.round(this.spring.target);
        this.peekTimeout = null;
        this.peekWaiting = false;

        if (this.isDragging) {
            this.endDragging();
        }
        globalAnimator.register(this.owner);
    }
}
