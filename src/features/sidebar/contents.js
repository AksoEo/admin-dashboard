import { h } from 'preact';
import { PureComponent, Fragment } from 'preact/compat';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { Button, Menu, DrawerItem, DrawerLabel } from 'yamdl';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Link, appContext } from '../../router';
import SidebarLogo from './sidebar-logo';
import pages from '../../pages';
import locale from '../../locale';
import { TEJOIcon, UEAIcon } from './icons';
import client from '../../client';

// also see src/pages/index.js

/** Renders a single item in the sidebar. */
function NavItem (props) {
    const { id, icon, url } = props.item;
    return (
        <Link target={`/${url}`} class="sidebar-link">
            <DrawerItem
                selected={props.currentPage === id}
                icon={icon}>
                {locale.pages[id]}
            </DrawerItem>
        </Link>
    );
}

NavItem.propTypes = {
    item: PropTypes.object.isRequired,
    currentPage: PropTypes.string.isRequired,
};

/** Renders a sidebar category. */
function NavCategory (props) {
    const { id, contents } = props.item;
    const label = locale.pages[id] ? <DrawerLabel>{locale.pages[id]}</DrawerLabel> : null;
    return (
        <Fragment>
            {label}
            {contents.map(item => (
                <NavItem
                    key={item.id}
                    item={item}
                    currentPage={props.currentPage} />
            ))}
        </Fragment>
    );
}

NavCategory.propTypes = {
    item: PropTypes.any.isRequired,
    currentPage: PropTypes.string.isRequired,
};

/** Renders the sidebar contents. */
export default class SidebarContents extends PureComponent {
    static propTypes = {
        /** The current page ID. Used to highlight the corresponding sidebar item. */
        currentPage: PropTypes.string.isRequired,
        /** Logout callback. */
        onLogout: PropTypes.func.isRequired,
        /** Forwarded from app. */
        onDirectTransition: PropTypes.func.isRequired,
        /** Forwarded from app. */
        onDoAnimateIn: PropTypes.func.isRequired,
    };

    static contextType = appContext;

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
            <div class="app-sidebar-contents">
                <div class="sidebar-header">
                    <SidebarLogo
                        onDirectTransition={this.props.onDirectTransition}
                        onDoAnimateIn={() => {
                            this.props.onDoAnimateIn();
                        }}
                        onClick={() => this.context.navigate('/')} />
                    <div class="sidebar-user">
                        <Avatar
                            class="user-avatar"
                            srcSet={this.state.hasProfilePicture ? avatarSrcSet : null}>
                            {!this.state.hasProfilePicture && this.state.userName
                                ? this.state.userName[0]
                                : null}
                        </Avatar>
                        <Typography
                            class="user-name"
                            variant="subtitle1"
                            color="inherit">
                            {this.state.userName}
                        </Typography>
                        <Button
                            icon
                            class="user-options"
                            aria-owns={this.state.userMenuOpen ? 'sidebar-user-popup-menu' : null}
                            aria-haspopup="true"
                            onClick={e => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                this.userMenuPosition = [
                                    rect.right - rect.width / 3,
                                    rect.top + rect.height / 3,
                                ];
                                this.setState({ userMenuOpen: true });
                            }}>
                            <ExpandMoreIcon color="inherit" />
                        </Button>
                        <Menu
                            id="sidebar-user-popup-menu"
                            position={this.userMenuPosition}
                            open={!!this.state.userMenuOpen}
                            anchor={[1, 0]}
                            onClose={() => this.setState({ userMenuOpen: false })}
                            items={[
                                {
                                    label: locale.sidebar.logout,
                                    action: this.props.onLogout,
                                },
                            ]} />
                    </div>
                </div>
                <div class="sidebar-nav-container">
                    <div class="sidebar-nav">
                        <nav class="sidebar-nav-list" role="navigation">
                            {pages.map(item => (
                                <NavCategory
                                    key={item.id}
                                    item={item}
                                    currentPage={this.props.currentPage} />
                            ))}
                        </nav>
                    </div>
                    <div class="sidebar-meta-info">
                        <div class="info-logos">
                            <UEAIcon />
                            <TEJOIcon />
                        </div>
                        <div class="info-line">
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
