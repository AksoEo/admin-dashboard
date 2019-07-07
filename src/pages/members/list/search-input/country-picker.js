import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';
import SearchIcon from '@material-ui/icons/Search';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LanguageIcon from '@material-ui/icons/Language';
import fuzzaldrin from 'fuzzaldrin';
import { Spring, globalAnimator, lerp } from '../../../../animation';
import locale from '../../../../locale';
import cache from '../cache';

/** Converts a letter to a regional indicator */
const toRI = v => String.fromCodePoint(v.toLowerCase().charCodeAt(0) - 0x60 + 0x1f1e5);
/** Converts a two-letter country code to its corresponding emoji */
const countryCodeToEmoji = code => toRI(code[0]) + toRI(code[1]);

/** Renders a country picker. */
export default class CountryPicker extends React.PureComponent {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        value: PropTypes.arrayOf(PropTypes.string).isRequired,
    };

    state = {
        countries: {},
        countryGroups: {},
        dialogOpen: false,
        search: '',
    };

    componentDidMount () {
        cache.getCountries().then(countries => this.setState({ countries }));
        cache.getCountryGroups().then(countryGroups => this.setState({ countryGroups }));
    }

    render () {
        // TODO: twemojify
        const pickedCountries = this.props.value.map(id =>
            id in this.state.countries
                ? countryCodeToEmoji(id)
                : this.state.countryGroups[id] && this.state.countryGroups[id].name).join(', ');

        const onItemClick = id => () => {
            const value = this.props.value.slice();
            if (this.props.value.includes(id)) {
                value.splice(value.indexOf(id), 1);
            } else {
                value.push(id);
            }
            this.props.onChange(value);
        };

        const selectedItems = this.props.value.map(id => ({
            key: id,
            column: 0,
            node: <div class="country-item" onClick={onItemClick(id)}>
                <div class="country-icon">
                    {id in this.state.countries
                        ? <span>{countryCodeToEmoji(id)}</span>
                        : <LanguageIcon />}
                </div>
                <div class="country-name">
                    {this.state.countries[id]
                        || this.state.countryGroups[id] && this.state.countryGroups[id].name}
                </div>
                <div class="country-check">
                    <CheckIcon />
                </div>
            </div>,
        }));

        // list of all items that are to be visible
        let searchResults = Object.keys(this.state.countryGroups)
            .map(id => ({ id, name: this.state.countryGroups[id].name }))
            .concat(Object.keys(this.state.countries)
                .map(id => ({ id, name: this.state.countries[id] })))
            .filter(x => !this.props.value.includes(x));

        if (this.state.search) {
            searchResults = fuzzaldrin.filter(searchResults, this.state.search, { key: 'name' });
        }
        searchResults = searchResults.map(x => x.id);

        const availableItems = Object.keys(this.state.countryGroups)
            .filter(group => !this.props.value.includes(group))
            .filter(group => searchResults.includes(group))
            .map(group => ({
                key: group,
                column: 1,
                node: <div class="country-item" onClick={onItemClick(group)}>
                    <div class="country-icon"><LanguageIcon /></div>
                    <div class="country-name">{this.state.countryGroups[group].name}</div>
                </div>,
            })).concat(Object.keys(this.state.countries)
                .filter(country => !this.props.value.includes(country))
                .filter(country => searchResults.includes(country))
                .map(country => ({
                    key: country,
                    column: 1,
                    node: <div class="country-item" onClick={onItemClick(country)}>
                        <div class="country-icon"><span>{countryCodeToEmoji(country)}</span></div>
                        <div class="country-name">{this.state.countries[country]}</div>
                    </div>,
                })));

        return (
            <div className="country-picker" onClick={() => this.setState({ dialogOpen: true })}>
                <span className="picked-countries">
                    {pickedCountries
                        ? pickedCountries
                        : (
                            <span className="countries-placeholder">
                                {locale.members.search.countries.placeholder}
                            </span>
                        )
                    }
                </span>
                <ExpandMoreIcon className="expand-icon" />

                <Dialog
                    onClick={e => e.stopPropagation()}
                    onClose={() => this.setState({ dialogOpen: false })}
                    className="country-picker-dialog"
                    open={this.state.dialogOpen}>
                    <DialogTitle className="dialog-title">
                        <IconButton onClick={() => this.setState({ dialogOpen: false })}>
                            <CloseIcon />
                        </IconButton>
                        {locale.members.search.countries.dialogTitle}
                        <div class="search-box-container">
                            <div class="search-icon-container">
                                <SearchIcon />
                            </div>
                            <input
                                class="search-box"
                                value={this.state.search}
                                onChange={e => this.setState({ search: e.target.value })}
                                placeholder={locale.members.search.countries.search} />
                        </div>
                    </DialogTitle>
                    <DialogContent>
                        <MulticolList columns={2}>
                            {selectedItems.concat(availableItems)}
                        </MulticolList>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
}

const LI_HEIGHT = 48;

/**
 * Renders multiple columns with fixed order, with items able to be dragged in between.
 */
class MulticolList extends React.PureComponent {
    static propTypes = {
        children: PropTypes.arrayOf(PropTypes.object).isRequired,
        columns: PropTypes.number.isRequired,
    };

    itemData = new Map();
    columnRefs = [];

    createItemData (item, index) {
        const data = {
            x: new Spring(1, 0.5),
            y: new Spring(1, 0.5),
            key: item.key,
            column: item.column,
            index,
            vnode: item.node,
        };
        data.x.value = data.x.target = item.column;
        data.y.value = data.y.target = index;
        this.itemData[item.key] = data;
    }

    update (dt) {
        let wantsUpdate = false;
        for (const key in this.itemData) {
            const item = this.itemData[key];
            item.x.target = item.column;
            item.y.target = item.index;
            item.x.update(dt);
            item.y.update(dt);

            if (!wantsUpdate && (item.x.wantsUpdate() || item.y.wantsUpdate())) wantsUpdate = true;
        }

        if (!wantsUpdate) globalAnimator.deregister(this);
        this.forceUpdate();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.children !== this.props.children) globalAnimator.register(this);
    }

    render () {
        let columns = [];
        const columnHeights = [];
        for (let i = 0; i < this.props.columns; i++) {
            columns.push([]);
            columnHeights.push(0);
        }

        const itemKeys = new Set();
        for (const item of this.props.children) {
            if (!item.key) throw new Error('MulticolList: child has no key');
            itemKeys.add(item.key);
            if (!this.itemData[item.key]) {
                this.createItemData(item, columns[item.column].length);
            } else {
                const data = this.itemData[item.key];
                data.index = columnHeights[item.column];
                columnHeights[item.column]++;
                data.vnode = item.node;
                data.column = item.column;
            }
            const data = this.itemData[item.key];
            columns[Math.round(data.x.value)].push(data);
        }

        const isItemFixed = item => item.x.value === Math.round(item.x.value);
        const columnScrollOffsets = this.columnRefs.map(column => column.scrollTop);

        const floatingItems = columns.flatMap(column => (
            column.filter(item => !isItemFixed(item)).map(item => {
                const leftCol = Math.floor(item.x.value);
                const rightCol = Math.ceil(item.x.value);
                const leftScroll = columnScrollOffsets[leftCol] | 0;
                const rightScroll = columnScrollOffsets[rightCol] | 0;
                const scrollOffset = lerp(leftScroll, rightScroll, item.x.value - leftCol);
                const y = item.y.value * LI_HEIGHT - scrollOffset;

                return (
                    <div
                        className="list-item floating"
                        key={item.key}
                        style={{
                            width: `${100 / columns.length}%`,
                            transform: `translate(${item.x.value * 100}%, ${y}px)`,
                        }}>
                        {item.vnode}
                    </div>
                );
            })
        ));

        columns = columns.map((column, i) => (
            <div
                className="column"
                ref={node => node && (this.columnRefs[i] = node)}
                key={i}>
                {column.filter(isItemFixed).map(item => (
                    <div
                        className="list-item"
                        key={item.key}
                        style={{
                            width: '100%',
                            transform: `translate(${
                                (item.x.value - i) * 100}%, ${
                                item.y.value * LI_HEIGHT}px)`,
                        }}>
                        {item.vnode}
                    </div>
                ))}
                <div className="column-scroll-height" style={{
                    height: column.length * LI_HEIGHT,
                }} />
            </div>
        ));

        return (
            <div className="multicol-list">
                {columns}
                {floatingItems}
            </div>
        );
    }
}
