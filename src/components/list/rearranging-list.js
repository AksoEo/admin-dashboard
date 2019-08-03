import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import PropTypes from 'prop-types';
import DragHandleIcon from '@material-ui/icons/DragHandle';
import { Spring, globalAnimator } from '../../animation';

// constant li height
const LI_HEIGHT = 56;

/** Material list with drag controls, for the field picker. */
export default class RearrangingList extends PureComponent {
    static propTypes = {
        children: PropTypes.arrayOf(PropTypes.element).isRequired,
        /** `fn(index: number) -> bool` */
        isItemDraggable: PropTypes.func.isRequired,
        /** `fn(toPos: number) -> bool` */
        canMove: PropTypes.func.isRequired,
        /** `fn(fromPos: number, toPos: number) -> bool` */
        onMove: PropTypes.func.isRequired,
    };

    itemData = new Map();

    createItemData (node, index) {
        const spring = new Spring(1, 0.5);
        spring.value = spring.target = index;
        this.itemData[node.key] = {
            index,
            spring,
            vnode: node,
            node: null,
        };
    }

    /** Called by the global animator. */
    update (dt) {
        let wantsUpdate = false;
        for (const key in this.itemData) {
            const item = this.itemData[key];
            item.spring.locked = this.state.draggingKey === key;
            if (this.state.draggingKey === key) {
                if (dt > 0) item.spring.velocity = (this.dragTarget - item.spring.value) / dt;
                item.spring.value = item.spring.target = this.dragTarget;
            } else if (item.index >= this.indexPush.from && item.index < this.indexPush.to) {
                item.spring.target = item.index + this.indexPush.dir;
            } else item.spring.target = item.index;

            if (item.spring.wantsUpdate()) wantsUpdate = true;
            item.spring.update(dt);
        }
        if (!wantsUpdate) globalAnimator.deregister(this);
        else this.forceUpdate();
    }

    beginAnimating () {
        globalAnimator.register(this);
    }

    componentDidUpdate (prevProps) {
        if (prevProps.children !== this.props.children) this.beginAnimating();
    }

    state = {
        draggingKey: null,
    };

    lastDraggingKey = null;

    /** List container node ref. */
    node = null;

    /** Offset from the cursor to the top of the item being dragged. */
    dragOffset = 0;

    /** Spring target for the item being dragged. */
    dragTarget = 0;

    /** New index for the item being dragged. */
    dragEndIndex = 0;

    /** Target index mapping during a drag operation. */
    indexPush = {
        from: 0,
        to: 0,
        dir: 1,
    };

    onPointerDown (clientX, clientY, key) {
        if (!this.node) return;
        const listRect = this.node.getBoundingClientRect();
        const y = clientY - listRect.top;
        const itemIndex = this.itemData[key].index;

        this.dragOffset = y - itemIndex * LI_HEIGHT;
        this.dragTarget = this.dragEndIndex = itemIndex;
        this.indexPush.dir = 0;

        this.lastDraggingKey = key;
        this.setState({ draggingKey: key });
    }

    onPointerMove (clientX, clientY) {
        const listRect = this.node.getBoundingClientRect();
        const y = clientY - listRect.top;

        const item = this.itemData[this.state.draggingKey];
        const newItemIndex = Math.floor(y / LI_HEIGHT);

        if (this.props.canMove(newItemIndex)) {
            if (newItemIndex < item.index) {
                this.indexPush.from = newItemIndex;
                this.indexPush.to = item.index;
                this.indexPush.dir = 1;
            } else if (newItemIndex > item.index) {
                this.indexPush.from = item.index;
                this.indexPush.to = newItemIndex + 1;
                this.indexPush.dir = -1;
            } else this.indexPush.dir = 0;

            this.dragEndIndex = newItemIndex;
        }

        this.dragTarget = (y - this.dragOffset) / LI_HEIGHT;
        this.beginAnimating();
    }

    onPointerUp () {
        this.indexPush.dir = 0;
        const item = this.itemData[this.state.draggingKey];
        // this fixes a minor glitch where the item will momentarily render with
        // spring value = spring target
        item.spring.target = item.index;
        this.props.onMove(item.index, this.dragEndIndex);
        this.setState({ draggingKey: null });
        this.beginAnimating();
    }

    onMouseDownOnItem = (e, key) => {
        e.preventDefault();
        this.onPointerDown(e.clientX, e.clientY, key);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
    };
    onTouchStartOnItem = (e, key) => {
        this.onPointerDown(e.touches[0].clientX, e.touches[0].clientY, key);
        window.addEventListener('touchmove', this.onTouchMove, { passive: false });
        window.addEventListener('touchend', this.onTouchEnd, { passive: false });
    };
    onMouseMove = e => this.onPointerMove(e.clientX, e.clientY);
    onTouchMove = e => {
        e.preventDefault();
        this.onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    onMouseUp = () => {
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
        this.onPointerUp();
    };
    onTouchEnd = () => {
        window.removeEventListener('touchmove', this.onTouchMove);
        window.removeEventListener('touchend', this.onTouchEnd);
        this.onPointerUp();
    };

    render () {
        let index = 0;
        const itemKeys = new Set();
        for (const item of this.props.children) {
            if (!item.key) throw new Error('RearrangingList: child has no key prop');
            itemKeys.add(item.key);
            if (!this.itemData[item.key]) {
                this.createItemData(item, index);
            } else {
                const data = this.itemData[item.key];
                data.index = index;
                data.vnode = item;
            }
            index++;
        }

        for (const key in this.itemData) {
            if (!itemKeys.has(key)) delete this.itemData[key];
        }

        const items = [];

        for (const key in this.itemData) {
            const item = this.itemData[key];
            const posY = item.spring.value * LI_HEIGHT;
            const draggable = this.props.isItemDraggable(item.index);

            let className = 'rearranging-list-item';
            if (this.state.draggingKey === key) className += ' dragging';
            else if (this.lastDraggingKey === key) {
                if (Math.abs(item.spring.value - item.spring.target) > 0.1) {
                    // item that was being dragged has not reached its resting position yet
                    className += ' dragging';
                } else {
                    this.lastDraggingKey = null;
                }
            }

            items.push(
                <div
                    key={key}
                    className={className}
                    ref={node => (this.itemData[key] && (this.itemData[key].node = node))}
                    style={{
                        transform: `translateY(${posY}px)`,
                    }}>
                    <div className="rearranging-list-item-content">
                        {item.vnode}
                    </div>
                    {draggable && (
                        <div
                            className="rearranging-list-item-drag-handle"
                            onMouseDown={e => this.onMouseDownOnItem(e, key)}
                            onTouchStart={e => this.onTouchStartOnItem(e, key)}>
                            <DragHandleIcon className="rearranging-list-item-drag-icon" />
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="rearranging-list" ref={node => this.node = node}>
                <div
                    className="rearranging-list-scroll-height"
                    style={{ height: this.props.children.length * LI_HEIGHT }} />
                {items}
            </div>
        );
    }
}
