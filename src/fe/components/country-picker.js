import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Dialog, Button } from '@cpsdqs/yamdl';
import CheckIcon from '@material-ui/icons/Check';
import SearchIcon from '@material-ui/icons/Search';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LanguageIcon from '@material-ui/icons/Language';
import fuzzaldrin from 'fuzzaldrin';
import { WithCountries, CountryFlag } from './data/country';
import MulticolList from './multicol-list';
import locale from '../locale';
import './country-picker.less';

const LI_HEIGHT = 48;

export default function CountryPicker (props) {
    return (
        <WithCountries>
            {(countries, countryGroups) => (
                <CountryPickerInnerComponent
                    {...props}
                    countries={countries}
                    countryGroups={countryGroups} />
            )}
        </WithCountries>
    );
}

/// Renders a country picker.
///
/// # Props
/// - value/onChange: array of strings
/// - hideGroups: if false, will hide country groups
/// - hidden: if true, will disable tab focusing
class CountryPickerInnerComponent extends PureComponent {
    state = {
        dialogOpen: false,
        search: '',
    };

    selectAll = () => {
        if (this.props.hideGroups) {
            this.props.onChange(Object.keys(this.props.countries));
            return;
        }
        this.props.onChange(Object.keys(this.props.countryGroups)
            .concat(Object.keys(this.props.countries)));
    };

    deselectAll = () => {
        this.props.onChange([]);
    };

    render () {
        // TODO: twemojify
        const pickedCountries = [];

        for (let i = 0; i < this.props.value.length; i++) {
            const id = this.props.value[i];
            if (id in this.props.countries) {
                pickedCountries.push(<CountryFlag key={i} country={id} />);
            } else if (this.props.countryGroups[id]) {
                pickedCountries.push(<span key={i}>{this.props.countryGroups[id].name}</span>);
            }
            if (i < this.props.value.length - 1) pickedCountries.push(<span key={'s' + i}>, </span>);
        }

        // Event handler for when a country item is clicked; moves it to the other column
        const onItemClick = id => () => {
            const value = this.props.value.slice();
            if (this.props.value.includes(id)) {
                value.splice(value.indexOf(id), 1);
            } else {
                let altInsertionPoint = Infinity;
                if (this.multicolList && this.multicolList.columnRefs[0]) {
                    // slightly hacky: get scroll position from the column ref and insert there
                    // so the user can see what they’re doing
                    altInsertionPoint = Math.floor((this.multicolList.columnRefs[0].scrollTop
                        + this.multicolList.columnRefs[0].offsetHeight / 2) / LI_HEIGHT);
                }
                const insertionPoint = Math.min(value.length, altInsertionPoint);
                value.splice(insertionPoint, 0, id);
            }
            this.props.onChange(value);
        };

        const selectedItems = this.props.value.map(id => ({
            key: id,
            column: 0,
            node: <div class="country-item" onClick={onItemClick(id)}>
                <div class="country-icon">
                    {id in this.props.countries
                        ? <CountryFlag country={id} />
                        : <LanguageIcon />}
                </div>
                <div class="country-name">
                    {this.props.countries[id] ? this.props.countries[id].name_eo
                        : this.props.countryGroups[id] && this.props.countryGroups[id].name}
                </div>
                <div class="country-check">
                    <CheckIcon />
                </div>
            </div>,
        }));

        // list of all items that are to be visible
        let searchResults = Object.keys(this.props.countryGroups)
            .map(id => ({ id, name: this.props.countryGroups[id].name }))
            .concat(Object.keys(this.props.countries)
                .map(id => ({ id, name: this.props.countries[id] })))
            .filter(x => !this.props.value.includes(x));

        if (this.state.search) {
            searchResults = fuzzaldrin.filter(searchResults, this.state.search, { key: 'name' });
        }
        searchResults = searchResults.map(x => x.id);

        const availableItems = (this.props.hideGroups ? [] : Object.keys(this.props.countryGroups)
            .filter(group => !this.props.value.includes(group))
            .filter(group => searchResults.includes(group))
            .map(group => ({
                key: group,
                column: 1,
                node: <div class="country-item" onClick={onItemClick(group)}>
                    <div class="country-icon"><LanguageIcon /></div>
                    <div class="country-name">{this.props.countryGroups[group].name}</div>
                </div>,
            }))).concat(Object.keys(this.props.countries)
            .filter(country => !this.props.value.includes(country))
            .filter(country => searchResults.includes(country))
            .map(country => ({
                key: country,
                column: 1,
                node: <div class="country-item" onClick={onItemClick(country)}>
                    <div class="country-icon"><CountryFlag country={country} /></div>
                    <div class="country-name">{this.props.countries[country].name_eo}</div>
                </div>,
            })));

        return (
            <div
                class="country-picker"
                tabIndex={this.props.hidden ? -1 : 0}
                onKeyDown={e => {
                    if (e.key === ' ' || e.key === 'Enter') this.setState({ dialogOpen: true });
                }}
                onClick={() => this.setState({ dialogOpen: true })}>
                <span class="picked-countries">
                    {pickedCountries.length
                        ? pickedCountries
                        : (
                            <span class="countries-placeholder">
                                {locale.members.search.countries.placeholder}
                            </span>
                        )
                    }
                </span>
                <ExpandMoreIcon className="expand-icon" />

                <Dialog
                    onClick={e => e.stopPropagation()}
                    backdrop
                    fullScreen={width => width < 650}
                    onClose={() => this.setState({ dialogOpen: false })}
                    class="country-picker-dialog"
                    open={this.state.dialogOpen}
                    title={locale.members.search.countries.dialogTitle}
                    appBarProps={{
                        actions: [
                            {
                                node: <div class="country-picker-search-box-container">
                                    <div class="search-icon-container">
                                        <SearchIcon />
                                    </div>
                                    <input
                                        class="search-box"
                                        value={this.state.search}
                                        onChange={e => this.setState({ search: e.target.value })}
                                        ref={node => this.searchBox = node}
                                        placeholder={locale.members.search.countries.search} />
                                </div>,
                            },
                        ],
                    }}>
                    <MulticolList
                        columns={2}
                        ref={node => this.multicolList = node}
                        itemHeight={LI_HEIGHT}>
                        {selectedItems.concat(availableItems)}
                    </MulticolList>
                    <div class="selection-controls">
                        <Button onClick={this.selectAll} class="selection-button">
                            {locale.members.search.countries.selectAll}
                        </Button>
                        <Button onClick={this.deselectAll} class="selection-button">
                            {locale.members.search.countries.deselectAll}
                        </Button>
                    </div>
                </Dialog>
            </div>
        );
    }
}
