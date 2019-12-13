import { h } from 'preact';
import { PureComponent, Fragment, useState } from 'preact/compat';
import { Button, Menu, DrawerItem, DrawerLabel } from '@cpsdqs/yamdl';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ProfilePicture from '../../components/profile-picture';
import { Link, routerContext } from '../../router';
import permsContext from '../../perms';
import SidebarLogo from './sidebar-logo';
import pages from '../pages';
import { app as locale, pages as localePages, meta as localeMeta } from '../../locale';
import { connect } from '../../core/connection';
import { TEJOIcon, UEAIcon } from './icons';

// also see src/pages/index.js

/// Renders a single item in the sidebar.
function NavItem ({ item, currentPage }) {
    const { id, icon, path } = item;
    const Icon = icon || (() => null);
    return (
        <Link target={`/${path}`} class="sidebar-link">
            <DrawerItem
                selected={currentPage === id}
                icon={<Icon />}
                onKeyDown={e => {
                    if (e.key === 'ArrowDown') {
                        const parent = e.currentTarget.parentNode;
                        const next = parent.nextElementSibling;
                        if (next) {
                            const drawerItem = next.children[0];
                            e.preventDefault();
                            drawerItem.focus();
                        }
                    } else if (e.key === 'ArrowUp') {
                        const parent = e.currentTarget.parentNode;
                        const prev = parent.previousElementSibling;
                        if (prev) {
                            const drawerItem = prev.children[0];
                            e.preventDefault();
                            drawerItem.focus();
                        }
                    }
                }}>
                {localePages[id]}
            </DrawerItem>
        </Link>
    );
}

/// Renders a sidebar category.
function NavCategory ({ item, currentPage, perms }) {
    const { id, contents } = item;
    const label = localePages[id] ? <DrawerLabel>{localePages[id]}</DrawerLabel> : null;

    const filteredContents = contents.filter(item => item.hasPerm(perms));

    return (
        <Fragment>
            {label}
            {filteredContents.map(item => (
                <NavItem
                    key={item.id}
                    item={item}
                    currentPage={currentPage} />
            ))}
        </Fragment>
    );
}

/// Renders the sidebar contents.
///
/// # Props
/// - currentPage: current page ID, use to highlight the corresponding sidebar item
export default class SidebarContents extends PureComponent {
    static contextType = routerContext;

    state = {
        userMenuOpen: false,
        userName: null,
        id: null,
        profilePictureHash: null,
    };

    focus () {

    }

    render () {
        return (
            <div class="app-sidebar-contents">
                <div class="sidebar-header">
                    <SidebarLogo onClick={() => this.context.navigate('/')} />
                    <SidebarUser />
                </div>
                <div class="sidebar-nav-container">
                    <div class="sidebar-nav">
                        <permsContext.Consumer>
                            {perms => (<nav class="sidebar-nav-list" role="navigation">
                                {pages.map(item => (
                                    <NavCategory
                                        key={item.id}
                                        item={item}
                                        currentPage={this.props.currentPage}
                                        perms={perms} />
                                ))}
                            </nav>)}
                        </permsContext.Consumer>
                    </div>
                    <div class="sidebar-meta-info">
                        <div class="info-logos">
                            <UEAIcon />
                            <TEJOIcon />
                        </div>
                        <div class="info-line">
                            {localeMeta.copyright} <a
                                href={localeMeta.copyrightHref}
                                target="_blank"
                                rel="noopener noreferrer">
                                {localeMeta.copyrightHolder}
                            </a>, {localeMeta.license} · <a
                                href={localeMeta.sourceHref}
                                target="_blank"
                                rel="noopener noreferrer">
                                {localeMeta.source}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const SidebarUser = connect('codeholders/codeholder', {
    id: 'self',
    fields: ['name', 'type', 'profilePictureHash'],
})((data, core) => ({ ...data, core }))(function SidebarUser (props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPos, setMenuPos] = useState([0, 0]);

    let compiledName = '';
    if (props.type === 'human') {
        compiledName = [
            props.name.honorific,
            props.name.first || props.name.firstLegal,
            props.name.last || props.name.lastLegal,
        ].map(x => x).join(' ');
    } else if (props.type === 'org') {
        compiledName = props.name.full.length > 30
            ? props.name.abbrev || props.name.full
            : props.name.full;
    }

    const onLogout = () => props.core.createTask('login/logOut').run();

    return (
        <div class="sidebar-user">
            <div class="user-profile-picture">
                <ProfilePicture
                    id={props.id}
                    self={true}
                    profilePictureHash={props.profilePictureHash} />
            </div>
            <div class="user-name">
                {compiledName}
            </div>
            <Button
                icon
                small
                class="user-options"
                aria-owns={this.state.userMenuOpen ? 'sidebar-user-popup-menu' : null}
                aria-haspopup="true"
                onClick={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMenuPos([
                        rect.right - rect.width / 3,
                        rect.top + rect.height / 3,
                    ]);
                    setMenuOpen(true);
                }}>
                <ExpandMoreIcon color="inherit" />
            </Button>
            <Menu
                id="sidebar-user-popup-menu"
                position={menuPos}
                open={menuOpen}
                anchor={[1, 0]}
                onClose={() => setMenuOpen(false)}
                items={[
                    {
                        label: locale.logOut,
                        action: onLogout,
                    },
                ]} />
        </div>
    );
});
