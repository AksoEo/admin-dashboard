import { h } from 'preact';
import { lazy } from 'preact/compat';
import SvgIcon from '@material-ui/core/SvgIcon';
import HomeIcon from '@material-ui/icons/Home';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import AssessmentIcon from '@material-ui/icons/Assessment';
import BusinessIcon from '@material-ui/icons/Business';
import PaymentIcon from '@material-ui/icons/Payment';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import CardMembershipIcon from '@material-ui/icons/CardMembership';
import EmailIcon from '@material-ui/icons/Email';
import MarkunreadMailboxIcon from '@material-ui/icons/MarkunreadMailbox';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import HttpIcon from '@material-ui/icons/Http';
import DeveloperModeIcon from '@material-ui/icons/DeveloperMode';
import PublicIcon from '@material-ui/icons/Public';
import LanguageIcon from '@material-ui/icons/Language';
import AssignmentIcon from '@material-ui/icons/Assignment';
import FileIcon from '@material-ui/icons/InsertDriveFile';

export function NewspaperIcon () {
    return (
        <SvgIcon>
            <path fillRule="evenodd" fill="currentColor" d="M4 19a2 2 0 0 0 2-2V5h16v12a2 2 0 0 1-2 2H4zm4-7v4h5v-4H8zm7 0v4h5v-4h-5zM8 7v3h12V7H8z M4 19a2 2 0 0 1-2-2V7h3v10c0 1.1-.4 2-1 2z"/>
        </SvgIcon>
    );
}

export function ListsIcon () {
    return (
        <SvgIcon>
            <path fillRule="evenodd" fill="currentColor" d="M12 1a3 3 0 0 1 2.83 2H19a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h4.17A3 3 0 0 1 12 1zm-2 13.5c-2 0-5 1-5 3V19h10v-1.5c0-2-3-3-5-3zm5.62.4c.83.73 1.38 1.42 1.38 2.6V19h2v-1.5c0-1.54-1.37-2.25-3.38-2.6zM15 7c-.32 0-.63.05-.91.14a4.93 4.93 0 0 1 0 5.72 2.99 2.99 0 0 0 3.9-2.86c0-1.66-1.33-3-2.99-3zm-5 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm2-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
        </SvgIcon>
    );
}

/// Lazily load a page and also have some basic error handling.
const elazy = (inner, map) => lazy(() => inner().then(e => {
    if (map) return { default: map(e) };
    return e;
}).catch(err => {
    console.error('Failed to load app page', err); // eslint-disable-line no-console
    return { __esModule: true, default: () => 'okazas eraro' };
}));

/// Navigation hierarchy.
/// IDs are `locale->pages[id]` keys and are also used to identify pages elsewhere.
export default [
    {
        // TODO: proper grouping
        id: 'undefined',
        contents: [
            {
                id: 'debug',
                component: elazy(() =>
                    import(/* webpackChunkName: "debug-tools" */ './debug')),
                icon: () => null,
                path: 'debug',
                hasPerm: () => true,
                hidden: true,
            },
            {
                id: 'home',
                icon: HomeIcon,
                path: '',
                hasPerm: () => true,
            },
            {
                id: 'codeholders',
                component: elazy(() =>
                    import(/* webpackChunkName: "codeholders", webpackPrefetch: true */ './codeholders')),
                icon: AssignmentIndIcon,
                path: 'membroj',
                paths: [
                    {
                        match: /^(\d+)$/,
                        component: elazy(() =>
                            import(/* webpackChunkName: "codeholders", webpackPrefetch: true */ './codeholders/detail')),
                        type: 'stack',
                        paths: [
                            {
                                path: 'redakti',
                                type: 'state',
                                state: 'editing',
                            },
                            {
                                path: 'membrecoj',
                                component: elazy(() =>
                                    import(/* webpackChunkName: "codeholders", webpackPrefetch: true */ './codeholders/membership-roles'), e => e.MembershipPage),
                                type: 'stack',
                                hasPerm: perms => perms.hasCodeholderField('membership', 'r'),
                            },
                            {
                                path: 'roloj',
                                component: elazy(() =>
                                    import(/* webpackChunkName: "codeholders", webpackPrefetch: true */ './codeholders/membership-roles'), e => e.RolesPage),
                                type: 'stack',
                                hasPerm: perms => perms.hasPerm('codeholder_roles.read'),
                            },
                            {
                                path: 'historio',
                                component: elazy(() =>
                                    import(/* webpackChunkName: "codeholders", webpackPrefetch: true */ './codeholders/history')),
                                type: 'stack',
                                hasPerm: perms => perms.hasPerm('codeholders.hist.read'),
                            },
                            {
                                path: 'ensalutoj',
                                component: elazy(() =>
                                    import(/* webpackChunkName: "codeholders", webpackPrefetch: true */ './codeholders/logins')),
                                type: 'stack',
                                hasPerm: perms => perms.hasCodeholderField('logins', 'r'),
                            },
                            {
                                path: 'permesoj',
                                component: elazy(() =>
                                    import(/* webpackChunkName: "codeholders", webpackPrefetch: true */ './codeholders/perms')),
                                type: 'stack',
                                hasPerm: perms => perms.hasPerm('codeholders.perms.read'),
                            },
                        ],
                    },
                    {
                        path: 'etikedoj',
                        type: 'state',
                        state: 'addrLabelGen',
                    },
                ],
                hasPerm: perms => perms.hasPerm('codeholders.read'),
            },
            {
                id: 'membership',
                icon: CardMembershipIcon,
                path: 'membreco',
                hasPerm: () => true,
            },
            {
                id: 'email',
                icon: EmailIcon,
                path: 'amasmesaghoj',
                hasPerm: () => true,
            },
            {
                id: 'magazines',
                icon: NewspaperIcon,
                path: 'revuoj',
                hasPerm: () => true,
            },
            {
                id: 'statistics',
                icon: AssessmentIcon,
                path: 'statistiko',
                hasPerm: () => true,
            },
            {
                id: 'congresses',
                icon: BusinessIcon,
                path: 'kongresoj',
                hasPerm: () => true,
            },
            {
                id: 'payments',
                icon: PaymentIcon,
                path: 'pagoj',
                hasPerm: () => true,
            },
            {
                id: 'votes',
                icon: HowToVoteIcon,
                path: 'vochdonado',
                component: elazy(() =>
                    import(/* webpackChunkName: "votes", webpackPrefetch: true */ './votes')),
                hasPerm: perms => perms.hasPerm('votes.read.uea') || perms.hasPerm('votes.read.tejo'),
                paths: [
                    {
                        match: /^(\d+)$/,
                        component: elazy(() =>
                            import(/* webpackChunkName: "votes", webpackPrefetch: true */ './votes/detail')),
                        type: 'stack',
                        paths: [
                            {
                                path: 'redakti',
                                type: 'state',
                                state: 'editing',
                            },
                            {
                                path: 'rezultoj',
                                component: elazy(() =>
                                    import(/* webpackChunkName: "votes-results", webpackPrefetch: true */ './votes/results')),
                                type: 'stack',
                            },
                        ],
                    },
                    {
                        path: 'shablonoj',
                        component: elazy(() =>
                            import(/* webpackChunkName: "votes", webpackPrefetch: true */ './votes/templates')),
                        type: 'stack',
                    },
                ],
            },
            {
                id: 'newsletters',
                icon: MarkunreadMailboxIcon,
                path: 'bultenoj',
                hasPerm: () => true,
            },
            {
                id: 'lists',
                icon: ListsIcon,
                path: 'listoj',
                component: elazy(() =>
                    import(/* webpackChunkName: "lists", webpackPrefetch: true */ './lists')),
                paths: [
                    {
                        match: /^(\d+)$/,
                        component: elazy(() =>
                            import(/* webpackChunkName: "lists", webpackPrefetch: true */ './lists/detail')),
                        type: 'stack',
                        paths: [
                            {
                                path: 'redakti',
                                type: 'state',
                                state: 'editing',
                            },
                        ],
                    },
                ],
                hasPerm: perms => perms.hasPerm('lists.read'),
            },
            {
                id: 'reports',
                icon: AssignmentIcon,
                path: 'raportoj',
                hasPerm: () => true,
            },
            {
                id: 'documents',
                icon: FileIcon,
                path: 'dokumentoj',
                hasPerm: () => true,
            },
        ],
    },
    {
        id: 'administration',
        path: 'administrado',
        contents: [
            {
                id: 'administration-groups',
                component: elazy(() =>
                    import(/* webpackChunkName: "administration", webpackPrefetch: true */ './administration/groups')),
                icon: SupervisorAccountIcon,
                type: 'bottom',
                path: 'grupoj',
                hasPerm: perms => perms.hasPerm('admin_groups.read'),
                paths: [
                    {
                        match: /^(\d+)$/,
                        component: elazy(() =>
                            import(/* webpackChunkName: "administration", webpackPrefetch: true */ './administration/groups/detail')),
                        type: 'stack',
                        paths: [
                            {
                                path: 'permesoj',
                                component: elazy(() =>
                                    import(/* webpackChunkName: "administration", webpackPrefetch: true */ './administration/groups/perms')),
                                type: 'stack',
                            },
                            {
                                path: 'redakti',
                                type: 'state',
                                state: 'editing',
                            },
                        ],
                    },
                ],
            },
            {
                id: 'administration-clients',
                icon: DeveloperModeIcon,
                component: elazy(() =>
                    import(/* webpackChunkName: "administration", webpackPrefetch: true */ './administration/clients')),
                type: 'bottom',
                path: 'klientoj',
                hasPerm: perms => perms.hasPerm('clients.read'),
                paths: [
                    {
                        match: /^([\da-fA-F]+)$/,
                        component: elazy(() =>
                            import(/* webpackChunkName: "administration", webpackPrefetch: true */ './administration/clients/detail')),
                        type: 'stack',
                        paths: [
                            {
                                path: 'permesoj',
                                component: elazy(() =>
                                    import(/* webpackChunkName: "administration", webpackPrefetch: true */ './administration/clients/perms')),
                                type: 'stack',
                            },
                            {
                                path: 'redakti',
                                type: 'state',
                                state: 'editing',
                            },
                        ],
                    },
                ],
            },
            {
                id: 'administration-log',
                icon: HttpIcon,
                component: elazy(() =>
                    import(/* webpackChunkName: "administration", webpackPrefetch: true */ './administration/log')),
                type: 'bottom',
                path: 'protokolo',
                hasPerm: perms => perms.hasPerm('log.read'),
                paths: [
                    {
                        match: /^(\d+)$/,
                        component: elazy(() =>
                            import(/* webpackChunkName: "administration", webpackPrefetch: true */ './administration/log/detail')),
                        type: 'stack',
                    },
                ],
            },
            {
                id: 'administration-countries',
                icon: PublicIcon,
                component: elazy(() =>
                    import(/* webpackChunkName: "administration", webpackPrefetch: true */ './administration/countries')),
                type: 'bottom',
                path: 'landoj',
                hasPerm: () => true,
                paths: [
                    {
                        match: /^([a-z]{2})$/i,
                        component: elazy(() =>
                            import(/* webpackChunkName: "administration", webpackPrefetch: true */ './administration/countries/detail')),
                        type: 'stack',
                        paths: [
                            {
                                path: 'redakti',
                                type: 'state',
                                state: 'editing',
                            },
                        ],
                    },
                ],
            },
            {
                id: 'administration-country-groups',
                icon: LanguageIcon,
                component: elazy(() =>
                    import(/* webpackChunkName: "administration", webpackPrefetch: true */ './administration/country-groups')),
                type: 'bottom',
                path: 'landaroj',
                hasPerm: () => true,
                paths: [
                    {
                        match: /^(x[a-z0-9]{2})$/i,
                        component: elazy(() =>
                            import(/* webpackChunkName: "administration", webpackPrefetch: true */ './administration/country-groups/detail')),
                        type: 'stack',
                        paths: [
                            {
                                path: 'redakti',
                                type: 'state',
                                state: 'editing',
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
