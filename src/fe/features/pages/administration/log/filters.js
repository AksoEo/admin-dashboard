import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';

/*
class CodeholderPicker extends PureComponent {
    state = {
        search: '',
        suggestions: [],

        // cached id -> uea code mappings
        codeCache: {},
    };

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
        this.scheduledLoads.add(+id);
        clearTimeout(this.batchedCodeLoad);
        if (this.scheduledLoads.size >= 90) {
            this.flushLoad();
        } else {
            this.batchedCodeLoad = setTimeout(() => this.flushLoad(), 100);
        }
    }

    flushLoad () {
        const ids = [...this.scheduledLoads];
        this.scheduledLoads.clear();

        client.get('/codeholders', {
            filter: { id: { $in: ids } },
            fields: ['id', 'newCode'],
            limit: ids.length,
        }).then(res => {
            const codeCache = { ...this.state.codeCache };
            for (const item of res.body) {
                codeCache[item.id] = item.newCode;
            }
            this.setState({ codeCache });
        }).catch(err => {
            console.error(err); // eslint-disable-line no-console
            // TODO: handle maybe
        });
    }

    getChunk = async (offset, limit) => {
        const idFilter = { $nin: this.props.value };

        const options = {
            fields: ['id', 'newCode'],
            filter: { id: idFilter },
            offset,
            limit,
        };

        if (this.state.search) {
            options.search = { cols: ['name'], str: util.transformSearch(this.state.search) };
        }

        const items = [];

        if (this.state.search.length === 6) {
            const codeSearch = await client.get('/codeholders', {
                fields: ['id', 'newCode'],
                filter: { newCode: this.state.search, id: idFilter },
                limit: 1,
            });
            if (codeSearch.body.length) {
                if (offset === 0) {
                    items.push(codeSearch.body[0]);
                    options.limit--;
                } else {
                    options.offset--;
                }
            }
        }

        const res = await client.get('/codeholders', options);
        items.push(...res.body);

        const codeCache = { ...this.state.codeCache };
        for (const item of items) {
            codeCache[item.id] = item.newCode;
        }
        await new Promise(resolve => this.setState({ codeCache }, resolve));
        return items.map(({ id }) => id);
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
                        toString: () => this.state.codeCache[id],
                    })),
                });
            }).catch(err => {
                console.error(err); // eslint-disable-line no-console
            });
        });
    };

    render ({ value, onChange }) {
        return (
            <div class="codeholder-filter">
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
                                ? <data.ueaCode.inlineRenderer value={this.state.codeCache[id]} />
                                : `(${id})`}
                        </div>
                    ))}
                    {!value.length && locale.administration.log.noCodeholdersSelected}

                    <SuggestionField
                        class="codeholder-search"
                        value={this.state.search}
                        onChange={this.onSearchChange}
                        placeholder={locale.administration.log.searchCodeholders}
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
                </div>
            </div>
        );
    }
}*/

function CodeholderPicker () {
    // TODO: this
    return 'todo: codeholder picker';
}

const MIN_TIME = new Date('2019-05-21T18:00:00Z');

function DateTimeEditor ({ value, onChange }) {
    const dateParts = value.toISOString().split('T');
    const timePart = dateParts[1].match(/^(\d{1,2}:\d{2})/)[1];

    return (
        <span class="date-time-editor">
            <input type="date" value={dateParts[0]} onChange={e => {
                const v = e.target.value;
                const date = new Date(v + 'T' + dateParts[1]);
                if (Number.isFinite(+date)) onChange(date);
            }} />
            <input type="time" value={timePart} onChange={e => {
                const v = e.target.value;
                const timePart = v.match(/^(\d{1,2}:\d{2})/)[1];
                const date = new Date(dateParts[0] + 'T' + timePart + ':00Z');
                if (Number.isFinite(+date)) onChange(date);
            }} />
        </span>
    );
}

export default {
    codeholders: {
        default: () => ({ enabled: false, value: [] }),
        serialize: value => value.join(','),
        deserialize: value => value.split(','),
        editor: CodeholderPicker,
    },
    time: {
        needsSwitch: true,
        default: () => ({ enabled: false, value: [MIN_TIME, new Date()] }),
        serialize: value => `${value[0].toISOString()}$${value[1].toISOString()}`,
        deserialize: value => value.split('$').map(date => new Date(date)),
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="time-filter">
                    <DateTimeEditor value={value[0]} onChange={v => {
                        onChange([v, value[1]]);
                        onEnabledChange(true);
                    }} />
                    <DateTimeEditor value={value[1]} onChange={v => {
                        onChange([value[0], v]);
                        onEnabledChange(true);
                    }} />
                </div>
            );
        },
    },
    apiKey: {
        default: () => ({ enabled: false, value: '' }),
        serialize: value => value,
        deserialize: value => value,
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="api-key-filter">
                    <TextField value={value} onChange={e => {
                        onChange(e.target.value);
                        onEnabledChange(!!e.target.value);
                    }} />
                </div>
            );
        },
    },
    ip: {
        default: () => ({ enabled: false, value: '' }),
        serialize: value => value,
        deserialize: value => value,
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="ip-filter">
                    <TextField value={value} onChange={e => {
                        onChange(e.target.value);
                        onEnabledChange(!!e.target.value);
                    }} />
                </div>
            );
        },
    },
    origin: {
        default: () => ({ enabled: false, value: '' }),
        serialize: value => value,
        deserialize: value => value,
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="origin-filter">
                    <TextField value={value} onChange={e => {
                        onChange(e.target.value);
                        onEnabledChange(!!e.target.value);
                    }} />
                </div>
            );
        },
    },
    method: {
        default: () => ({ enabled: false, value: '' }),
        serialize: value => value,
        deserialize: value => value,
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="method-filter">
                    <TextField value={value} onChange={e => {
                        onChange(e.target.value);
                        onEnabledChange(!!e.target.value);
                    }} />
                </div>
            );
        },
    },
    path: {
        default: () => ({ enabled: false, value: '' }),
        serialize: value => value,
        deserialize: value => value,
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="path-filter">
                    <TextField value={value} onChange={e => {
                        onChange(e.target.value);
                        onEnabledChange(!!e.target.value);
                    }} />
                </div>
            );
        },
    },
    resStatus: {
        default: () => ({ enabled: false, value: '' }),
        serialize: value => value,
        deserialize: value => value,
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="res-status-filter">
                    <TextField value={value} onChange={e => {
                        onChange(e.target.value);
                        onEnabledChange(!!e.target.value);
                    }} />
                </div>
            );
        },
    },
    resTime: {
        default: () => ({ enabled: false, value: '' }),
        serialize: value => value,
        deserialize: value => value,
        editor ({ value, onChange, onEnabledChange }) {
            return (
                <div class="res-time-filter">
                    <TextField value={value} onChange={e => {
                        onChange(e.target.value);
                        onEnabledChange(!!e.target.value);
                    }} />
                </div>
            );
        },
    },
};
