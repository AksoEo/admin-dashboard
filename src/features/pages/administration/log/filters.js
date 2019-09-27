import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Button } from 'yamdl';
import { util } from 'akso-client';
import RemoveIcon from '@material-ui/icons/Remove';
import SuggestionField from '../../../../components/suggestion-field';
import data from '../../../../components/data';
import client from '../../../../client';
import locale from '../../../../locale';

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

    render ({ value, onChange, filterHeader }) {
        return (
            <div class="codeholder-filter">
                {filterHeader}
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
}

export default {
    codeholders: {
        default: () => [],
        isNone: value => !value.length,
        toRequest: value => ({
            codeholderId: { $in: value },
        }),
        serialize: value => value.join(','),
        deserialize: value => value.split(','),
        editor: CodeholderPicker,
    },
};
