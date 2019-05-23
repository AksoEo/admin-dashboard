import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Link  } from '../../router';
import pages from '../../pages';
import locale from '../../locale';
import { TEJOIcon, UEAIcon } from './icons';
import client from '../../client';

/** Renders a single item in `ROUTES`. */
function NavItem (props) {
    const { id, icon, url } = props.item;
    return (
        <Link target={`/${url}`} className="sidebar-link">
            <ListItem
                button
                selected={props.currentPage === id}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText>{locale.pages[id]}</ListItemText>
            </ListItem>
        </Link>
    );
}

NavItem.propTypes = {
    item: PropTypes.object.isRequired,
    currentPage: PropTypes.string.isRequired,
};

/** Renders a category in `pages`. */
function NavCategory (props) {
    const { id, contents } = props.item;
    return (
        <List subheader={
            <ListSubheader>
                {locale.pages[id]}
            </ListSubheader>
        }>
            {contents.map(item => (
                <NavItem
                    key={item.id}
                    item={item}
                    currentPage={props.currentPage} />
            ))}
        </List>
    );
}

NavCategory.propTypes = {
    item: PropTypes.any.isRequired,
    currentPage: PropTypes.string.isRequired,
};

/** Renders the sidebar contents. */
export default class SidebarContents extends React.PureComponent {
    static propTypes = {
        /** The current page ID. Used to highlight the corresponding sidebar item. */
        currentPage: PropTypes.string.isRequired,
        /** Logout callback. */
        onLogout: PropTypes.func.isRequired,
    };

    state = {
        userMenuOpen: false,
        userName: null,
        hasProfilePicture: false,
    };

    componentDidMount () {
        client.get('/codeholders/self', {
            fields: [
                'hasProfilePicture',
                'codeholderType',
                'firstName',
                'firstNameLegal',
                'lastName',
                'lastNameLegal',
                'fullName',
                'nameAbbrev',
            ],
        }).then(result => {
            const data = result.body;
            const name = data.codeholderType === 'human'
                ? (data.firstName || data.firstNameLegal) + ' '
                    + (data.lastName || data.lastNameLegal)
                : (data.fullName.length > 20 && data.nameAbbrev) || data.fullName;
            this.setState({
                userName: name,
                hasProfilePicture: data.hasProfilePicture,
            });
        });
    }

    render () {
        let avatarURLBase = new URL(client.client.host);
        avatarURLBase.pathname = '/codeholders/self/profile_picture/';
        avatarURLBase = avatarURLBase.toString();
        const avatarSrcSet = [32, 64, 128, 256].map(w => `${avatarURLBase}${w}px ${w}w`).join(', ');

        return (
            <div className="app-sidebar-contents">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img
                            className="logo"
                            src="/assets/logo.svg"
                            draggable={0}
                            aria-hidden="true"
                            role="presentation" />
                        <img
                            className="logo-label"
                            src="/assets/logo-label.svg"
                            draggable={0}
                            aria-label="AKSO"
                            alt="AKSO" />
                    </div>
                    <div className="sidebar-user">
                        <Avatar
                            className="user-avatar"
                            srcSet={this.state.hasProfilePicture ? avatarSrcSet : null}>
                            {!this.state.hasProfilePicture && this.state.userName
                                ? this.state.userName[0]
                                : null}
                        </Avatar>
                        <Typography
                            className="user-name"
                            variant="subtitle1"
                            color="inherit">
                            {this.state.userName}
                        </Typography>
                        <IconButton
                            color="inherit"
                            className="user-options"
                            aria-owns={this.state.userMenuOpen ? 'sidebar-user-popup-menu' : null}
                            aria-haspopup="true"
                            buttonRef={node => this.userMenuButton = node}
                            onClick={e => this.setState({ userMenuOpen: e.currentTarget })}>
                            <ExpandMoreIcon color="inherit" />
                        </IconButton>
                        <Menu
                            id="sidebar-user-popup-menu"
                            anchorEl={this.userMenuButton}
                            open={!!this.state.userMenuOpen}
                            onClose={() => this.setState({ userMenuOpen: false })}>
                            <MenuItem onClick={() => {
                                this.setState({ userMenuOpen: false }, this.props.onLogout);
                            }}>
                                {locale.sidebar.logout}
                            </MenuItem>
                        </Menu>
                    </div>
                </div>
                <div className="sidebar-nav-container">
                    <div className="sidebar-nav">
                        <nav className="sidebar-nav-list" role="navigation">
                            {pages.map(item => (
                                <NavCategory
                                    key={item.id}
                                    item={item}
                                    currentPage={this.props.currentPage} />
                            ))}
                        </nav>
                    </div>
                    <div className="sidebar-meta-info">
                        <div className="info-logos">
                            <UEAIcon />
                            <TEJOIcon />
                        </div>
                        <div className="info-line">
                            {locale.meta.copyright} <a
                                href={locale.meta.copyrightHref}
                                target="_blank"
                                rel="noopener noreferrer">
                                {locale.meta.copyrightHolder}
                            </a>, {locale.meta.license} · <a
                                href={locale.meta.githubHref}
                                target="_blank"
                                rel="noopener noreferrer">
                                {locale.meta.github}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
