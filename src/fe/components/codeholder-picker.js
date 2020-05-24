import { h, Component } from 'preact';
import { Button } from '@cpsdqs/yamdl';
import RemoveIcon from '@material-ui/icons/Remove';
import { ueaCode } from './data';
import SuggestionField from './suggestion-field';
import { coreContext } from '../core/connection';
import { codeholders as locale } from '../locale';
import './codeholder-picker.less';

/// Picks a codeholder and displays their UEA code.
///
/// # Props
/// - value/onChange
/// - limit: if set, will limit number of selectable codeholders
export default class CodeholderPicker extends Component {
    state = {
        search: '',
        suggestions: [],

        // cached id -> uea code mappings
        codeCache: {},
    };

    static contextType = coreContext;

    itemHeight = 48;

    scheduledLoads = new Set();

    componentDidMount () {
        for (const id of this.props.value) this.loadCodeForId(id);
        this.onSearchChange('');
    }

    componentDidUpdate (prevProps) {
        if (prevProps.value !== this.props.value) {
            for (const id of this.props.value) this.loadCodeForId(id);
        }
    }

    loadCodeForId (id) {
        if (this.state.codeCache[id]) return;
        return new Promise((resolve, reject) => {
            const view = this.context.createDataView('codeholders/codeholder', {
                id,
                fields: ['code'],
                lazyFetch: true,
            });
            view.on('update', () => {
                // HACK: mutate object directly to avoid lost updates
                const codeCache = this.state.codeCache;
                codeCache[id] = view.data.code.new;
                this.setState({ codeCache });
                view.drop();
                resolve();
            });
            view.on('error', () => {
                view.drop();
                reject();
            });
        });
    }

    getChunk = async (offset, limit) => {
        const idFilter = { $nin: this.props.value };

        const res = await this.context.createTask('codeholders/list', {}, {
            search: {
                field: 'nameOrCode',
                query: this.state.search,
            },
            fields: [{ id: 'id', sorting: 'asc' }, { id: 'code', sorting: 'none' }],
            jsonFilter: { filter: { id: idFilter } },
            offset,
            limit,
        }).runOnceAndDrop();

        for (const id of res.items) {
            await this.loadCodeForId(id);
        }

        return res.items;
    };

    _searchReqId = 0;

    onSearchChange = search => {
        this.setState({ search }, () => {
            const reqId = ++this._searchReqId;
            this.getChunk(0, 7).then(items => {
                if (this._searchReqId !== reqId) return;
                this.setState({
                    suggestions: items.filter(id => !this.props.value.includes(id)).map(id => ({
                        id,
                        toString: () => '' + this.state.codeCache[id],
                    })),
                });
            }).catch(err => {
                console.error(err); // eslint-disable-line no-console
            });
        });
    };

    render ({ value, onChange, limit }) {
        return (
            <div class="codeholder-picker" data-limit={limit}>
                <div
                    class="selected-codeholders"
                    onClick={() => this.setState({ dialogOpen: true })}>
                    {value.map(id => (
                        <div class="codeholder-item" key={id}>
                            <Button class="remove-button" icon small onClick={() => {
                                const value = this.props.value.slice();
                                value.splice(value.indexOf(id), 1);
                                onChange(value);
                            }}>
                                <RemoveIcon />
                            </Button>
                            {this.state.codeCache[id]
                                ? <ueaCode.inlineRenderer value={this.state.codeCache[id]} />
                                : `(${id})`}
                        </div>
                    ))}
                    {(!value.length && this.props.limit !== 1) && locale.picker.none}

                    {(this.props.limit && value.length >= this.props.limit) ? null : (
                        <SuggestionField
                            class="codeholder-search"
                            value={this.state.search}
                            onChange={this.onSearchChange}
                            placeholder={locale.picker.search}
                            skipFilter={true}
                            alwaysHighlight={true}
                            autocomplete="off"
                            spellcheck="false"
                            autocorrect="off"
                            onSelect={selected => {
                                if (!selected) return;
                                const value = this.props.value.slice();
                                if (value.includes(selected.id)) return;
                                value.push(selected.id);
                                this.onSearchChange('');
                                onChange(value);
                            }}
                            suggestions={this.state.suggestions} />
                    )}
                </div>
            </div>
        );
    }
}
