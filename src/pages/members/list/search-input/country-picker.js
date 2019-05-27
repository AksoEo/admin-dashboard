import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Divider from '@material-ui/core/Divider';
import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LanguageIcon from '@material-ui/icons/Language';
import locale from '../../../../locale';
import data from '../data';

const toRI = v => String.fromCodePoint(v.toLowerCase().charCodeAt(0) - 0x60 + 0x1f1e5);
const countryCodeToEmoji = code => toRI(code[0]) + toRI(code[1]);

export default class CountryPicker extends React.PureComponent {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        value: PropTypes.arrayOf(PropTypes.string).isRequired,
    };

    state = {
        countries: {},
        countryGroups: {},
        dialogOpen: false,
    };

    componentDidMount () {
        data.getCountries().then(countries => this.setState({ countries }));
        data.getCountryGroups().then(countryGroups => this.setState({ countryGroups }));
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

        const selectedItems = this.props.value.map(id => (
            <ListItem button key={id} onClick={onItemClick(id)}>
                <ListItemIcon>
                    {id in this.state.countries
                        ? <span>{countryCodeToEmoji(id)}</span>
                        : <LanguageIcon />}
                </ListItemIcon>
                <ListItemText>
                    {this.state.countries[id]
                        || this.state.countryGroups[id] && this.state.countryGroups[id].name}
                </ListItemText>
                <ListItemSecondaryAction>
                    <CheckIcon />
                </ListItemSecondaryAction>
            </ListItem>
        ));

        const availableItems = Object.keys(this.state.countryGroups)
            .filter(group => !this.props.value.includes(group))
            .map(group => (
                <ListItem button key={group} onClick={onItemClick(group)}>
                    <ListItemIcon><LanguageIcon /></ListItemIcon>
                    <ListItemText>{this.state.countryGroups[group].name}</ListItemText>
                </ListItem>
            )).concat(Object.keys(this.state.countries)
                .filter(country => !this.props.value.includes(country))
                .map(country => (
                    <ListItem button key={country} onClick={onItemClick(country)}>
                        <ListItemIcon><span>{countryCodeToEmoji(country)}</span></ListItemIcon>
                        <ListItemText>{this.state.countries[country]}</ListItemText>
                    </ListItem>
                )));

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
                    open={this.state.dialogOpen}>
                    <DialogTitle>
                        <IconButton onClick={() => this.setState({ dialogOpen: false })}>
                            <CloseIcon />
                        </IconButton>
                        {locale.members.search.countries.dialogTitle}
                    </DialogTitle>
                    <DialogContent>
                        <List>
                            {selectedItems}
                            <Divider />
                            {availableItems}
                        </List>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
}
