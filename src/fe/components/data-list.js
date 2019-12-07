import { h } from 'preact';
import { PureComponent, useState } from 'preact/compat';
import { Button, Menu } from '@cpsdqs/yamdl';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { data as locale } from '../locale';
import { coreContext } from '../core/connection';
import { deepEq } from '../../util';
import './data-list.less';

const VLIST_CHUNK_SIZE = 100;

// TODO: this might need a refactor

/// Virtual list with auto-sorting and remove/load callbacks.
///
/// # Props
/// - onLoad: async (offset, limit) -> { items: [item], total: number } callback (required)
/// - renderItem: (item) -> VNode callback (required)
/// - onRemove: async (item) -> void callback
/// - onItemClick: (item) -> void callback
/// - itemHeight: fixed item height in pixels
/// - emptyLabel: label to show when there are no items
/// - updateView: argument list to create a data view that emits updates (if available)
/// - useShowMore: if true, will use a “show more” button instead of scrollng magic
export default class DataList extends PureComponent {
    state = {
        items: [],
        total: -1,
    };

    static contextType = coreContext;

    async fetchChunk (chunk) {
        if (this.state.total > -1 && chunk * VLIST_CHUNK_SIZE > this.state.total) return;
        const result = await this.props.onLoad(chunk * VLIST_CHUNK_SIZE, VLIST_CHUNK_SIZE);
        if (!this.maySetState) return;

        const items = this.state.items.slice();
        for (let i = 0; i < result.items.length; i++) {
            items[i + chunk * VLIST_CHUNK_SIZE] = result.items[i];
        }

        this.setState({
            total: result.total,
            items,
        });
    }

    onScroll = () => {
        if (!this.node || this.props.useShowMore) return;
        const lower = Math.max(0, Math.floor(this.node.scrollTop / this.props.itemHeight));
        const upper = Math.ceil((this.node.scrollTop + this.node.offsetHeight) / this.props.itemHeight);

        const lowerChunk = Math.floor(lower / VLIST_CHUNK_SIZE);
        const upperChunk = Math.ceil(upper / VLIST_CHUNK_SIZE);

        for (let i = lowerChunk; i <= upperChunk; i++) {
            if (!this.state.items[i * VLIST_CHUNK_SIZE]) {
                this.fetchChunk(i).catch(this.onFailFetch);
            }
        }
    };

    showMore = () => {
        let i = 0;
        while (i <= Math.ceil(this.state.total / VLIST_CHUNK_SIZE)) {
            if (!this.state.items[i * VLIST_CHUNK_SIZE]) {
                this.fetchChunk(i).catch(this.onFailFetch);
                break;
            }
            i++;
        }
    };

    onFailFetch = err => {
        // TODO: error handling
        console.error(err); // eslint-disable-line no-console
    };

    deleteItem (index) {
        const item = this.state.items[index];
        if (!item) return;

        this.props.onRemove(item).then(() => {
            const items = this.state.items.slice();
            items.splice(index, 1);
            this.setState({ items, total: this.state.total - 1 });
        }).catch(err => {
            console.error('Failed to delete item', err); // eslint-disable-line no-console
            // TODO: handle error properly
        });
    }

    #updateView;

    bindUpdates () {
        if (this.#updateView) this.unbindUpdates();
        if (!this.props.updateView) return;
        this.#updateView = this.context.createDataView(...this.props.updateView);
        this.#updateView.on('update', () => {
            // data updated
            // re-fetch all chunks (and if we don’t have any right now; fetch at least one)
            for (let i = 0; i < Math.max(1, this.state.items.length / VLIST_CHUNK_SIZE); i++) {
                this.fetchChunk(i).catch(this.onFailFetch);
            }
        });
    }

    unbindUpdates () {
        if (!this.#updateView) return;
        this.#updateView.drop();
        this.#updateView = null;
    }

    componentDidMount () {
        this.maySetState = true;
        this.fetchChunk(0).catch(this.onFailFetch);
        this.bindUpdates();
    }

    componentDidUpdate (prevProps) {
        if (!deepEq(prevProps.updateView, this.props.updateView)) {
            this.bindUpdates();
        }
    }

    componentWillUnmount () {
        this.maySetState = false;
        this.unbindUpdates();
    }

    render () {
        const items = [];

        const useAbsolutePositioning = !this.props.useShowMore;

        for (let i = 0; i < this.state.items.length; i++) {
            const item = this.state.items[i];
            if (item) {
                const y = useAbsolutePositioning ? i * this.props.itemHeight : 0;
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

        let total = this.state.total;
        if (total === 0 && this.props.emptyLabel) {
            total++;
            items.push(<div class="data-list-empty" key={0}>{this.props.emptyLabel}</div>);
        }

        let showMore = null;
        if (this.props.useShowMore) {
            const hasMore = this.state.items.length < this.state.total;
            if (hasMore) {
                showMore = (
                    <Button class="show-more-button" onClick={this.showMore}>
                        {locale.showMore}
                    </Button>
                );
            }
        }

        return (
            <div
                class={'data-list ' + (useAbsolutePositioning ? '' : 'is-flat ') + (this.props.class || '')}
                ref={node => this.node = node}
                onScroll={this.onScroll}>
                <div
                    class="vlist-spacer"
                    style={{ height: total * this.props.itemHeight }} />
                {items}
                {showMore}
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
                    label: locale.delete,
                    action: onDelete,
                }]} />
        </Button>
    );
}
