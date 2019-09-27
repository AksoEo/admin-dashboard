import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Dialog } from 'yamdl';
import { util } from 'akso-client';
import SearchIcon from '@material-ui/icons/Search';
import MulticolList from '../../../../components/multicol-list';
import data from '../../../../components/data';
import client from '../../../../client';
import locale from '../../../../locale';

class CodeholderPicker extends PureComponent {
    state = {
        dialogOpen: false,
        search: '',
        selectedColumnAge: 0,
        searchColumnAge: 0,

        // cached id -> uea code mappings
        codeCache: {},
    };

    itemHeight = 48;

    scheduledLoads = new Set();

    componentDidMount () {
        for (const id of this.props.value) this.loadCodeForId(id);
    }

    componentDidUpdate (prevProps) {
        if (prevProps.value !== this.props.value) {
            for (const id of this.props.value) this.loadCodeForId(id);
            this.setState({ selectedColumnAge: this.state.selectedColumnAge + 1 });
        }
    }

    loadCodeForId (id) {
        if (this.state.codeCache[id]) return;
        this.scheduledLoads.add(id);
        clearTimeout(this.batchedCodeLoad);
        if (this.scheduledLoads.size() >= 90) {
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
        }).catch(err => {
            console.error(err); // eslint-disable-line no-console
            // TODO: handle maybe
        });
    }

    onGetChunk = async (column, offset, limit) => {
        if (column === 0) {
            return {
                items: this.props.value.slice(offset, offset + limit).map(id => ({
                    key: id,
                    column: 0,
                    id: id,
                })),
                total: this.props.value.length,
            };
        }

        const options = {
            fields: ['id', 'newCode'],
            offset,
            limit,
        };

        if (this.state.search) {
            options.search = { cols: ['name'], str: util.transformSearch(this.state.search) };
        }

        const items = [];
        let total = 0;

        if (this.state.search.length === 6) {
            const codeSearch = await client.get('/codeholders', {
                fields: ['id', 'newCode'],
                filter: { newCode: this.state.search },
                limit: 1,
            });
            if (codeSearch.body.length) {
                total++;
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
        total += res.res.headers.map['x-total-items'];

        const codeCache = { ...this.state.codeCache };
        for (const item of items) {
            codeCache[item.id] = item.newCode;
        }
        this.setState({ codeCache });

        return {
            items: items.map(({ id }) => ({ key: id, column: 1, id: id })),
            total,
        };
    };

    renderItem = id => {
        return (
            <div class="codeholder-item" data-id={id} onClick={() => {
                const value = this.props.value.slice();
                if (value.includes(id)) value.splice(value.indexOf(id), 1);
                else value.push(id);
                this.props.onChange(value);
            }}>
                {this.state.codeCache[id]
                    ? <data.ueaCode.inlineRenderer value={this.state.codeCache[id]} />
                    : `(${id})`}
            </div>
        );
    };

    onSearchChange (search) {
        this.setState({ search, searchColumnAge: this.state.searchColumnAge + 1 });
    }

    render ({ value, onChange, filterHeader }) {
        return (
            <div class="codeholder-filter">
                {filterHeader}
                <div
                    class="selected-codeholders"
                    onClick={() => this.setState({ dialogOpen: true })}>
                    {value.map(id => this.state.codeCache[id]
                        ? <data.ueaCode.inlineRenderer value={this.state.codeCache[id]} />
                        : `(${id})`)}
                    {!value.length && locale.administration.log.noCodeholdersSelected}
                </div>

                <Dialog
                    backdrop
                    open={this.state.dialogOpen}
                    fullScreen={width => width < 650}
                    class="codeholder-filter-picker-dialog"
                    onClose={() => this.setState({ dialogOpen: false })}
                    title={locale.administration.log.codeholderPickerTitle}
                    appBarProps={{
                        actions: [
                            {
                                node: <div class="picker-dialog-search-box-container">
                                    <div class="search-icon-container">
                                        <SearchIcon />
                                    </div>
                                    <input
                                        class="search-box"
                                        value={this.state.search}
                                        onChange={e => this.onSearchChange(e.target.value)}
                                        ref={node => this.searchBox = node}
                                        placeholder={locale.administration.log.searchCodeholders} />
                                </div>,
                            },
                        ],
                    }}>
                    <MulticolList
                        columns={2}
                        ref={node => this.multicolList = node}
                        itemHeight={this.itemHeight}
                        onGetChunk={this.onGetChunk}
                        columnAge={[this.state.selectedColumnAge, this.state.searchColumnAge]}
                        renderItem={this.renderItem} />
                </Dialog>
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
