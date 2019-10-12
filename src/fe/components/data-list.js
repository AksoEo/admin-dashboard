import { h, Component } from 'preact';
import { useState } from 'preact/compat';
import { Button, Menu } from '@cpsdqs/yamdl';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import locale from '../locale';

const VLIST_CHUNK_SIZE = 100;

/// Virtual list with auto-sorting and remove/load callbacks.
///
/// # Props
/// - onLoad: async (offset, limit) -> { items: [item], totalItems: number } callback (required)
/// - renderItem: (item) -> VNode callback (required)
/// - onRemove: async (item) -> void callback
/// - onItemClick: (item) -> void callback
/// - itemHeight: fixed item height in pixels
/// - emptyLabel: label to show when there are no items
export default class DataList extends Component {
    state = {
        items: [],
        totalItems: -1,
    };

    async fetchChunk (chunk) {
        if (this.state.totalItems > -1 && chunk * VLIST_CHUNK_SIZE > this.state.totalItems) return;
        const result = await this.props.onLoad(chunk * VLIST_CHUNK_SIZE, VLIST_CHUNK_SIZE);
        if (!this.maySetState) return;

        const items = this.state.items.slice();
        for (let i = 0; i < result.items.length; i++) {
            items[i + chunk * VLIST_CHUNK_SIZE] = result.items[i];
        }

        this.setState({
            totalItems: result.totalItems,
            items,
        });
    }

    onScroll = () => {
        if (!this.node) return;
        const lower = Math.max(0, Math.floor(this.node.scrollTop / this.props.itemHeight));
        const upper = Math.ceil((this.node.scrollTop + this.node.offsetHeight) / this.props.itemHeight);

        const lowerChunk = Math.floor(lower / VLIST_CHUNK_SIZE);
        const upperChunk = Math.ceil(upper / VLIST_CHUNK_SIZE);

        for (let i = lowerChunk; i < upperChunk; i++) {
            if (!this.state.items[i * VLIST_CHUNK_SIZE]) {
                this.fetchChunk(i);
            }
        }
    };

    deleteItem (index) {
        const item = this.state.items[index];
        if (!item) return;

        this.props.onRemove(item).then(() => {
            const items = this.state.items.slice();
            items.splice(index, 1);
            this.setState({ items, totalItems: this.state.totalItems - 1 });
        }).catch(err => {
            console.error('Failed to delete item', err); // eslint-disable-line no-console
            // TODO: handle error properly
        });
    }

    componentDidMount () {
        this.maySetState = true;
        this.fetchChunk(0);
    }

    componentWillUnmount () {
        this.maySetState = false;
    }

    render () {
        const items = [];

        for (let i = 0; i < this.state.items.length; i++) {
            const item = this.state.items[i];
            if (item) {
                const y = i * this.props.itemHeight;
                const Component = this.props.onItemClick ? Button : 'div';
                items.push(
                    <Component
                        key={item.id}
                        class="data-list-item"
                        style={{ transform: `translateY(${y}px)` }}
                        onClick={() => this.props.onItemClick && this.props.onItemClick(item)}>
                        <div class="list-item-contents">
                            {this.props.renderItem(item)}
                        </div>
                        {this.props.onRemove && (
                            <div class="list-item-extra">
                                <ListItemDeleteOverflow onDelete={() => this.deleteItem(i)} />
                            </div>
                        )}
                    </Component>
                );
            }
        }

        let totalItems = this.state.totalItems;
        if (totalItems === 0 && this.props.emptyLabel) {
            totalItems++;
            items.push(<div class="data-list-empty" key={0}>{this.props.emptyLabel}</div>);
        }

        return (
            <div
                class={'data-list ' + (this.props.class || '')}
                ref={node => this.node = node}
                onScroll={this.onScroll}>
                <div
                    class="vlist-spacer"
                    style={{ height: totalItems * this.props.itemHeight }} />
                {items}
            </div>
        );
    }
}

function ListItemDeleteOverflow ({ onDelete }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPos, setMenuPos] = useState([0, 0]);

    return (
        <Button small icon class="list-item-overflow" onClick={e => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPos([rect.right - rect.width / 3, rect.top + rect.height / 3]);
            setMenuOpen(true);
        }}>
            <MoreVertIcon />
            <Menu
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                position={menuPos}
                anchor={[1, 0]}
                items={[{
                    label: locale.data.delete,
                    action: onDelete,
                }]} />
        </Button>
    );
}
