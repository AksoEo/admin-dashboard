import { h } from 'preact';
import { PureComponent, Fragment } from 'preact/compat';
import PropTypes from 'prop-types';
import { Dialog, Button } from 'yamdl';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import TextField from '@material-ui/core/TextField';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import JSON5 from 'json5';
import locale from '../../locale';
import client from '../../client';

const Action = {
    NONE: 'none',
    LOAD: 'load',
    SAVE: 'save',
    SAVING: 'saving',
};

export default class SavedFiltersBar extends PureComponent {
    static propTypes = {
        jsonFilterEnabled: PropTypes.bool,
        jsonFilter: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        canSaveFilters: PropTypes.bool,
        onSetJSONFilter: PropTypes.func.isRequired,
        onSetJSONFilterEnabled: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
    };

    state = {
        action: Action.NONE,
        saveError: null,
        name: '',
        description: '',
    };

    save = () => {
        this.setState({ action: Action.SAVING, saveError: null });

        try {
            const query = JSON5.parse(this.props.jsonFilter);

            client.post('/queries', {
                category: this.props.category,
                name: this.state.name,
                description: this.state.description || null,
                query,
            }).then(() => {
                this.setState({ action: Action.NONE });
            }).catch(err => {
                console.error('Failed to save query', err); // eslint-disable-line no-console
                this.setState({ action: Action.SAVE, saveError: err });
            });
        } catch (err) {
            this.setState({ action: Action.SAVING, saveError: err });
        }
    };

    render () {
        const { jsonFilterEnabled } = this.props;

        return (
            <div className={'saved-filters-bar' + (jsonFilterEnabled ? '' : ' collapsed')}>
                <div className="saved-filters-inner">
                    {jsonFilterEnabled ? (
                        <Fragment>
                            <div>
                                <Button
                                    icon
                                    aria-label={locale.listView.savedFilters.load}
                                    onClick={() => this.setState({ action: Action.LOAD })}>
                                    <FolderOpenIcon />
                                </Button>
                                {this.props.canSaveFilters ? (
                                    <Button
                                        icon
                                        aria-label={locale.listView.savedFilters.save}
                                        onClick={() => this.setState({ action: Action.SAVE })}>
                                        <SaveIcon />
                                    </Button>
                                ) : null}
                            </div>
                            <Button
                                class="disable-json-button"
                                onClick={() => this.props.onSetJSONFilterEnabled(false)}>
                                {locale.listView.json.disable}
                            </Button>
                        </Fragment>
                    ) : (
                        <Button
                            class="saved-filters-button"
                            onClick={() => this.setState({ action: Action.LOAD })}>
                            {locale.listView.savedFilters.savedFilters}
                        </Button>
                    )}
                </div>
                <Dialog
                    open={this.state.action === Action.LOAD}
                    class="list-view-saved-filters-load"
                    backdrop
                    fullScreen={width => width < 500}
                    onClose={() => this.setState({ action: Action.NONE })}
                    title={locale.listView.savedFilters.load}>
                    <SavedFiltersList
                        category={this.props.category}
                        onLoad={(name, description, query) => {
                            this.props.onSetJSONFilter(query);
                            this.setState({ name, description, action: Action.NONE });
                            if (!this.props.jsonFilterEnabled) {
                                this.props.onSetJSONFilterEnabled(true);
                                this.props.onSubmit();
                            }
                        }} />
                </Dialog>
                <Dialog
                    open={this.state.action === Action.SAVE || this.state.action === Action.SAVING}
                    class="list-view-saved-filters-save"
                    backdrop
                    onClose={() => this.state.action === Action.SAVE
                        && this.setState({ action: Action.NONE })}
                    title={locale.listView.savedFilters.save}>
                    todo: use login form for this
                    <div className="form-field">
                        <TextField
                            className="text-field"
                            required
                            label={locale.listView.savedFilters.name}
                            value={this.state.name}
                            onChange={e =>
                                this.setState({ name: e.target.value })} />
                    </div>
                    <div className="form-field">
                        <TextField
                            className="text-field"
                            label={locale.listView.savedFilters.description}
                            value={this.state.description || ''}
                            onChange={e =>
                                this.setState({ description: e.target.value })} />
                    </div>
                    <div className="save-button-container">
                        <Button className="save-button" onClick={this.save}>
                            {locale.listView.savedFilters.save}
                        </Button>
                    </div>
                    {this.state.saveError && (
                        <div className="save-error">
                            {locale.listView.savedFilters.error}
                        </div>
                    )}
                </Dialog>
            </div>
        );
    }
}

// TODO: use ../data-list
const FILTER_ITEM_HEIGHT = 56;
const VLIST_CHUNK_SIZE = 100;
class SavedFiltersList extends PureComponent {
    static propTypes = {
        category: PropTypes.string.isRequired,
        onLoad: PropTypes.func.isRequired,
    };

    state = {
        items: [],
        totalItems: -1,
    };

    async fetchChunk (chunk) {
        if (this.state.totalItems > -1 && chunk * VLIST_CHUNK_SIZE > this.state.totalItems) return;
        const result = await client.get('/queries', {
            offset: chunk * VLIST_CHUNK_SIZE,
            limit: VLIST_CHUNK_SIZE,
            fields: ['id', 'name', 'description', 'query'],
            order: [['name', 'asc']],
            filter: { category: this.category },
        });

        if (!this.maySetState) return;

        const items = this.state.items.slice();
        for (let i = 0; i < result.body.length; i++) {
            items[i + chunk * VLIST_CHUNK_SIZE] = result.body[i];
        }

        this.setState({
            totalItems: +result.res.headers.map['x-total-items'],
            items,
        });
    }

    onScroll = () => {
        if (!this.node) return;
        const lower = Math.max(0, Math.floor(this.node.scrollTop / FILTER_ITEM_HEIGHT));
        const upper = Math.ceil((this.node.scrollTop + this.node.offsetHeight) / FILTER_ITEM_HEIGHT);

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
        client.delete(`/queries/${item.id}`).then(() => {
            const items = this.state.items.slice();
            items.splice(index, 1);
            this.setState({ items, totalItems: this.state.totalItems - 1 });
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
                const y = i * FILTER_ITEM_HEIGHT;
                items.push(
                    <ListItem
                        button
                        key={item.id}
                        className="list-item-inner"
                        ContainerComponent="div"
                        ContainerProps={{
                            className: 'list-item',
                            style: { transform: `translateY(${y}px)` },
                        }}
                        onClick={() => {
                            this.props.onLoad(
                                item.name,
                                item.description,
                                JSON5.stringify(item.query, {
                                    space: '\t',
                                }),
                            );
                        }}>
                        <ListItemText primary={item.name} secondary={item.description} />
                        <ListItemSecondaryAction className="list-item-extra">
                            <Button
                                icon
                                class="list-item-delete-button"
                                aria-label={locale.listView.savedFilters.delete}
                                onClick={() => this.deleteItem(i)}>
                                <DeleteIcon />
                            </Button>
                        </ListItemSecondaryAction>
                    </ListItem>
                );
            }
        }

        return (
            <div
                className="saved-filters-list"
                ref={node => this.node = node}
                onScroll={this.onScroll}>
                <div
                    className="vlist-spacer"
                    style={{ height: this.state.totalItems * FILTER_ITEM_HEIGHT }} />
                {items}
            </div>
        );
    }
}
