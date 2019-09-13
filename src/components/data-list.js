import { h, Component } from 'preact';
import { Button } from 'yamdl';
import DeleteIcon from '@material-ui/icons/Delete';

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
                items.push(
                    <div
                        key={item.id}
                        class="data-list-item"
                        style={{ transform: `translateY(${y}px)` }}
                        onClick={() => this.props.onItemClick && this.props.onItemClick(item)}>
                        <div class="list-item-contents">
                            {this.props.renderItem(item)}
                        </div>
                        {this.props.onRemove && (
                            <div class="list-item-extra">
                                <Button
                                    icon
                                    class="list-item-delete-button"
                                    onClick={() => {
                                        // TODO: confirmation step
                                        this.deleteItem(i);
                                    }}>
                                    <DeleteIcon />
                                </Button>
                            </div>
                        )}
                    </div>
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
                class="data-list"
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
