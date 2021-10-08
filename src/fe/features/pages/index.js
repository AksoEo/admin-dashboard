import { h } from 'preact';
import { lazy } from 'preact/compat';
import SvgIcon from '../../components/svg-icon';
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
import AddMembershipIcon from '../../components/add-membership-icon';
import ConfigMembershipIcon from '../../components/config-membership-icon';
import { TravelExploreIcon, ChangeRequestIcon, ChangeRequestNewIcon } from '../../components/icons';
// import AssignmentIcon from '@material-ui/icons/Assignment';
// import FileIcon from '@material-ui/icons/InsertDriveFile';
import WorkOutlineIcon from '@material-ui/icons/WorkOutline';

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

export function PaymentOrgsIcon () {
    return (
        <SvgIcon>
            <path d="M17.2,10 L2.8,10 C1.801,10 1.009,10.723125 1.009,11.625 L1,21.375 C1,22.276875 1.801,23 2.8,23 L17.2,23 C18.199,23 19,22.276875 19,21.375 L19,11.625 C19,10.723125 18.199,10 17.2,10 Z M17,21 L3,21 L3,16 L17,16 L17,21 Z M17,13 L3,13 L3,12 L17,12 L17,13 Z" fill="currentColor" fillRule="nonzero"></path>
            <path d="M21.2,1 C22.199,1 23,1.723125 23,2.625 L23,2.625 L23,12.375 C23,13.276875 22.199,14 21.2,14 L21.2,14 L19.999,14 L19.999,12 L21,12 L21,7 L7,7 L6.999,9 L5.003,9 L5.009,2.625 C5.009,1.77059211 5.71982548,1.07661357 6.64406867,1.00592998 L6.8,1 Z M21,3 L7,3 L7,4 L21,4 L21,3 Z" fill="currentColor" fillRule="nonzero"></path>
        </SvgIcon>
    );
}

/// Lazily load a page and also have some basic error handling.
const elazy = (inner, map) => lazy(() => inner().then(e => {
    if (map) return { default: map(e) };
    return e;
}).catch(err => {
    console.error('Failed to load app page', err); // eslint-disable-line no-console
    return {
        __esModule: true,
        default: () => {
            throw err;
        },
    };
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
                paths: [
                    {
                        type: 'stack',
                        path: 'components',
                        component: elazy(() =>
                            import(/* webpackChunkName: "debug-tools" */ './debug/components')),
                    },
                    {
                        type: 'stack',
                        path: 'launchpad_mcquack.jpg',
                        component: elazy(() =>
                            import(/* webpackChunkName: "debug-tools" */ './debug/crash')),
                    },
                ],
            },
            {
                id: 'home',
                icon: HomeIcon,
                component: elazy(() =>
                    import(/* webpackChunkName: "home" */ './home')),
                path: '',
                hasPerm: () => true,
            },
            {
                id: 'email',
                icon: EmailIcon,
                path: 'amasmesaghoj',
                component: elazy(() =>
                    import(/* webpackChunkName: "notif-templates" */ './notif-templates')),
                hasPerm: perms => perms.hasPerm('notif_templates.read.uea') || perms.hasPerm('notif_templates.read.tejo'),
                paths: [
                    {
                        match: /^(\d+)$/,
                        matchKey: 'template',
                        component: elazy(() =>
                            import(/* webpackChunkName: "notif-templates" */ './notif-templates/detail')),
                        type: 'stack',
                        paths: [
                            {

                                path: 'redakti',
                                type: 'state',
                                state: 'editing',
                            },
                            {
                                path: 'antauhvido',
                                type: 'stack',
                                component: elazy(() =>
                                    import(/* webpackChunkName: "notif-templates" */ './notif-templates/preview')),
                            },
                        ],
                    },
                ],
            },
            {
                id: 'magazines',
                icon: NewspaperIcon,
                path: 'revuoj',
                component: elazy(() =>
                    import(/* webpackChunkName: "magazines" */ './magazines')),
                hasPerm: () => true,
                paths: [
                    {
                        match: /^(\d+)$/,
                        matchKey: 'magazine',
                        component: elazy(() =>
                            import(/* webpackChunkName: "magazines" */ './magazines/detail')),
                        type: 'stack',
                        paths: [
                            {
                                path: 'redakti',
                                type: 'state',
                                state: 'editing',
                            },
                            {
                                path: 'numero',
                                type: 'state',
                                state: '_dummy',
                                paths: [
                                    {
                                        match: /^(\d+)$/,
                                        matchKey: 'edition',
                                        type: 'stack',
                                        component: elazy(() =>
                                            import(/* webpackChunkName: "magazines-editions" */ './magazines/editions/detail')),
                                        paths: [
                                            {
                                                path: 'redakti',
                                                type: 'state',
                                                state: 'editing',
                                            },
                                            {
                                                path: 'enhavo',
                                                type: 'state',
                                                state: '_dummy',
                                                paths: [
                                                    {
                                                        match: /^(\d+)$/,
                                                        matchKey: 'toc',
                                                        type: 'stack',
                                                        component: elazy(() =>
                                                            import(/* webpackChunkName: "magazines-toc" */ './magazines/editions/toc/detail')),
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
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 'congresses',
                icon: BusinessIcon,
                path: 'kongresoj',
                component: elazy(() =>
                    import(/* webpackChunkName: "congresses", webpackPrefetch: true */ './congresses')),
                hasPerm: perms => perms.hasPerm('congresses.read.uea') || perms.hasPerm('congresses.read.tejo'),
                paths: [
                    {
                        match: /^(\d+)$/,
                        matchKey: 'congress',
                        component: elazy(() =>
                            import(/* webpackChunkName: "congresses" */ './congresses/detail')),
                        type: 'stack',
                        paths: [
                            {
                                path: 'redakti',
                                type: 'state',
                                state: 'editing',
                            },
                            {
                                path: 'okazigoj',
                                type: 'state',
                                state: '_dummy',
                                paths: [
                                    {
                                        match: /^(\d+)$/,
                                        matchKey: 'instance',
                                        component: elazy(() =>
                                            import(/* webpackChunkName: "congresses-instances" */ './congresses/instances/detail')),
                                        type: 'stack',
                                        paths: [
                                            {
                                                path: 'redakti',
                                                type: 'state',
                                                state: 'editing',
                                            },
                                            {
                                                path: 'lokoj',
                                                type: 'state',
                                                state: 'locations',
                                                paths: [
                                                    {
                                                        match: /^(\d+)$/,
                                                        matchKey: 'location',
                                                        type: 'stack',
                                                        component: elazy(() => import(/* webpackChunkName: "congresses-locations" */ './congresses/instances/locations/detail')),
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
                                                path: 'programeroj',
                                                type: 'state',
                                                state: 'programs',
                                                paths: [
                                                    {
                                                        match: /^(\d+)$/,
                                                        matchKey: 'program',
                                                        type: 'stack',
                                                        component: elazy(() => import(/* webpackChunkName: "congresses-programs" */ './congresses/instances/programs/detail')),
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
                                                path: 'alighintoj',
                                                type: 'state',
                                                state: 'participants',
                                                paths: [
                                                    {
                                                        match: /^([\da-fA-F]+)$/,
                                                        matchKey: 'participant',
                                                        type: 'stack',
                                                        component: elazy(() => import(/* webpackChunkName: "congresses-participants" */ './congresses/instances/participants/detail')),
                                                        paths: [
                                                            {
                                                                path: 'redakti',
                                                                type: 'state',
                                                                state: 'editing',
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        match: 'tabelo',
                                                        type: 'stack',
                                                        component: elazy(() => import(/* webpackChunkName: "congresses-spreadsheet" */ './congresses/instances/participants/spreadsheet-view')),
                                                    },
                                                ],
                                            },
                                            {
                                                path: 'alighilo',
                                                type: 'stack',
                                                component: elazy(() => import(/* webpackChunkName: "congresses-registration" */ './congresses/instances/registration-form')),
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
                        ],
                    },
                ],
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
                        matchKey: 'vote',
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
                        paths: [
                            {
                                match: /^(\d+)$/,
                                matchKey: 'template',
                                component: elazy(() =>
                                    import(/* webpackChunkName: "votes", webpackPrefetch: true */ './votes/template')),
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
            {
                id: 'newsletters',
                icon: MarkunreadMailboxIcon,
                path: 'bultenoj',
                hasPerm: () => true,
            },
            /* { // future features
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
            }, */
        ],
    },
    {
        id: 'ch',
        contents: [
            {
                id: 'codeholders',
                component: elazy(() =>
                    import(/* webpackChunkName: "codeholders", webpackPrefetch: true */ './codeholders')),
                icon: AssignmentIndIcon,
                path: 'membroj',
                paths: [
                    {
                        match: /^(\d+|self)$/,
                        matchKey: 'codeholder',
                        component: elazy(() =>
                            import(/* webpackChunkName: "codeholder-detail", webpackPrefetch: true */ './codeholders/detail')),
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
                                    import(/* webpackChunkName: "codeholder-memberships" */ './codeholders/membership-roles'), e => e.MembershipPage),
                                type: 'stack',
                                hasPerm: perms => perms.hasCodeholderField('membership', 'r'),
                            },
                            {
                                path: 'roloj',
                                component: elazy(() =>
                                    import(/* webpackChunkName: "codeholder-roles" */ './codeholders/membership-roles'), e => e.RolesPage),
                                type: 'stack',
                                hasPerm: perms => perms.hasPerm('codeholder_roles.read'),
                            },
                            {
                                path: 'historio',
                                component: elazy(() =>
                                    import(/* webpackChunkName: "codeholder-history" */ './codeholders/history')),
                                type: 'stack',
                                hasPerm: perms => perms.hasPerm('codeholders.hist.read'),
                            },
                            {
                                path: 'ensalutoj',
                                component: elazy(() =>
                                    import(/* webpackChunkName: "codeholder-logins" */ './codeholders/logins')),
                                type: 'stack',
                                hasPerm: perms => perms.hasCodeholderField('logins', 'r'),
                            },
                            {
                                path: 'permesoj',
                                component: elazy(() =>
                                    import(/* webpackChunkName: "codeholder-perms" */ './codeholders/perms')),
                                type: 'stack',
                                hasPerm: perms => perms.hasPerm('codeholders.perms.read'),
                            },
                            {
                                path: 'dosieroj',
                                component: elazy(() =>
                                    import(/* webpackChunkName: "codeholder-files" */ './codeholders/files-page')),
                                type: 'stack',
                                hasPerm: perms => perms.hasCodeholderField('files', 'r'),
                                paths: [
                                    {
                                        match: /^(\d+)$/,
                                        component: elazy(() =>
                                            import(/* webpackChunkName: "codeholder-files" */ './codeholders/file-detail')),
                                        type: 'stack',
                                    },
                                ],
                            },
                            {
                                path: 'shanghopetoj',
                                component: elazy(() => import(/* webpackChunkName: "chgreqs" */ './change-requests')),
                                type: 'stack',
                                hasPerm: perms => perms.hasPerm('codeholders.change_requests.read'),
                            },
                            {
                                path: 'delegitoj',
                                type: 'state',
                                hasPerm: perms => perms.hasPerm('codeholders.delegations.read.uea'),
                                paths: [
                                    {
                                        match: /^(\w+)$/,
                                        matchKey: 'org',
                                        component: elazy(() =>
                                            import(/* webpackChunkName: "delegates" */ './delegations/delegates/detail')),
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
                    {
                        path: 'etikedoj',
                        type: 'state',
                        state: 'addrLabelGen',
                    },
                    {
                        path: 'amasmesaghoj',
                        type: 'state',
                        state: 'sendNotifTemplates',
                    },
                ],
                hasPerm: perms => perms.hasPerm('codeholders.read'),
            },
            {
                id: 'change-requests',
                icon: { resolve: tasks => tasks?.changeRequests ? ChangeRequestNewIcon : ChangeRequestIcon },
                badge: tasks => tasks?.changeRequests ? 'todo' : null,
                path: 'shanghopetoj',
                component: elazy(() => import(/* webpackChunkName: "chgreqs" */ './change-requests')),
                type: 'stack',
                hasPerm: perms => perms.hasPerm('codeholders.change_requests.read'),
                paths: [
                    {
                        match: /^(\d+)$/,
                        component: elazy(() => import(/* webpackChunkName: "chgreqs" */ './change-requests/detail')),
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
                id: 'roles',
                icon: WorkOutlineIcon,
                component: elazy(() =>
                    import(/* webpackChunkName: "roles" */ './roles')),
                path: 'roloj',
                hasPerm: perms => perms.hasPerm('codeholder_roles.read'),
                paths: [
                    {
                        match: /^(\d+)$/,
                        matchKey: 'role',
                        component: elazy(() =>
                            import(/* webpackChunkName: "roles" */ './roles/detail')),
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
                id: 'lists',
                icon: ListsIcon,
                path: 'listoj',
                component: elazy(() =>
                    import(/* webpackChunkName: "lists" */ './lists')),
                paths: [
                    {
                        match: /^(\d+)$/,
                        matchKey: 'list',
                        component: elazy(() =>
                            import(/* webpackChunkName: "lists" */ './lists/detail')),
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
                id: 'delegations',
                icon: ListsIcon,
                path: 'delegitoj',
                component: elazy(() =>
                    import(/* webpackChunkName: "delegates" */ './delegations/delegates')),
                hasPerm: perms => perms.hasPerm('codeholders.read') && perms.hasPerm('codeholders.delegations.read.uea'),
            },
            {
                id: 'statistics',
                icon: AssessmentIcon,
                path: 'statistiko',
                hasPerm: () => true,
            },
        ],
    },
    {
        id: 'membership',
        path: 'membreco',
        contents: [
            {
                id: 'membership-categories',
                path: 'kategorioj',
                icon: CardMembershipIcon,
                type: 'bottom',
                component: elazy(() =>
                    import(/* webpackChunkName: "membership-categories" */ './memberships/categories')),
                hasPerm: perms => perms.hasPerm('membership_categories.read'),
                paths: [
                    {
                        match: /^(\d+)$/,
                        matchKey: 'category',
                        component: elazy(() =>
                            import(/* webpackChunkName: "membership-categories" */ './memberships/categories/detail')),
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
                id: 'membership-registration',
                path: 'agordoj',
                icon: ConfigMembershipIcon,
                type: 'bottom',
                component: elazy(() =>
                    import(/* webpackChunkName: "membership-options" */ './memberships/options')),
                hasPerm: perms => perms.hasPerm('registration.options.read'),
                paths: [
                    {
                        match: /^(\d+)$/,
                        matchKey: 'year',
                        component: elazy(() =>
                            import(/* webpackChunkName: "membership-options" */ './memberships/options/detail')),
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
                id: 'membership-entries',
                path: 'alighoj',
                icon: AddMembershipIcon,
                badge: tasks => tasks.registration ? tasks.registration.pending : null,
                type: 'bottom',
                component: elazy(() =>
                    import(/* webpackChunkName: "membership-entries" */ './memberships/entries')),
                hasPerm: perms => perms.hasPerm('registration.entries.read'),
                paths: [
                    {
                        match: /^(\w+)$/,
                        matchKey: 'entry',
                        component: elazy(() =>
                            import(/* webpackChunkName: "membership-entries" */ './memberships/entries/detail')),
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
    {
        id: 'payments',
        path: 'aksopago',
        contents: [
            {
                id: 'payment-intents',
                icon: PaymentIcon,
                component: elazy(() =>
                    import(/* webpackChunkName: "payment-intents" */ './payments/intents')),
                type: 'bottom',
                path: 'pagoj',
                badge: tasks => tasks.aksopay
                    ? tasks.aksopay.submitted + tasks.aksopay.disputed
                    : null,
                hasPerm: perms => perms.hasPerm('pay.payment_intents.read.tejo') || perms.hasPerm('pay.payment_intents.read.uea'),
                paths: [
                    {
                        path: 'raporto',
                        component: elazy(() =>
                            import(/* webpackChunkName: "payment-balance-report" */ './payments/intents/report')),
                        type: 'stack',
                    },
                    {
                        match: /^(\w+)$/,
                        matchKey: 'intent',
                        component: elazy(() =>
                            import(/* webpackChunkName: "payment-intents" */ './payments/intents/detail')),
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
                id: 'payment-orgs',
                icon: PaymentOrgsIcon,
                type: 'bottom',
                path: 'organizoj',
                component: elazy(() =>
                    import(/* webpackChunkName: "payment-orgs" */ './payments/orgs')),
                hasPerm: perms => perms.hasPerm('pay.read.tejo') || perms.hasPerm('pay.read.uea'),
                paths: [
                    {
                        match: /^(\d+)$/,
                        matchKey: 'org',
                        component: elazy(() =>
                            import(/* webpackChunkName: "payment-orgs" */ './payments/orgs/detail')),
                        type: 'stack',
                        paths: [
                            {
                                path: 'redakti',
                                type: 'state',
                                state: 'editing',
                            },
                            {
                                path: 'aldonebloj',
                                type: 'state',
                                state: 'addons',
                                paths: [
                                    {
                                        match: /^(\d+)$/,
                                        matchKey: 'addon',
                                        type: 'stack',
                                        component: elazy(() =>
                                            import(/* webpackChunkName: "payment-orgs" */ './payments/orgs/addons/detail')),
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
                                path: 'metodoj',
                                type: 'state',
                                state: 'methods',
                                paths: [
                                    {
                                        match: /^(\d+)$/,
                                        matchKey: 'method',
                                        type: 'stack',
                                        component: elazy(() =>
                                            import(/* webpackChunkName: "payment-orgs" */ './payments/orgs/methods/detail')),
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
                ],
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
                    import(/* webpackChunkName: "admin-groups" */ './administration/groups')),
                icon: SupervisorAccountIcon,
                type: 'bottom',
                path: 'grupoj',
                hasPerm: perms => perms.hasPerm('admin_groups.read'),
                paths: [
                    {
                        match: /^(\d+)$/,
                        matchKey: 'group',
                        component: elazy(() =>
                            import(/* webpackChunkName: "admin-groups" */ './administration/groups/detail')),
                        type: 'stack',
                        paths: [
                            {
                                path: 'permesoj',
                                component: elazy(() =>
                                    import(/* webpackChunkName: "admin-group-perms" */ './administration/groups/perms')),
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
                    import(/* webpackChunkName: "admin-clients" */ './administration/clients')),
                type: 'bottom',
                path: 'klientoj',
                hasPerm: perms => perms.hasPerm('clients.read'),
                paths: [
                    {
                        match: /^([\da-fA-F]+)$/,
                        matchKey: 'client',
                        component: elazy(() =>
                            import(/* webpackChunkName: "admin-clients" */ './administration/clients/detail')),
                        type: 'stack',
                        paths: [
                            {
                                path: 'permesoj',
                                component: elazy(() =>
                                    import(/* webpackChunkName: "admin-client-perms" */ './administration/clients/perms')),
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
                    import(/* webpackChunkName: "admin-log" */ './administration/log')),
                type: 'bottom',
                path: 'protokolo',
                hasPerm: perms => perms.hasPerm('log.read'),
                paths: [
                    {
                        match: /^(\d+)$/,
                        matchKey: 'entry',
                        component: elazy(() =>
                            import(/* webpackChunkName: "admin-log" */ './administration/log/detail')),
                        type: 'stack',
                    },
                ],
            },
            {
                id: 'administration-countries',
                icon: PublicIcon,
                component: elazy(() =>
                    import(/* webpackChunkName: "admin-countries" */ './administration/countries')),
                type: 'bottom',
                path: 'landoj',
                hasPerm: () => true,
                paths: [
                    {
                        match: /^([a-z]{2})$/i,
                        matchKey: 'country',
                        component: elazy(() =>
                            import(/* webpackChunkName: "admin-countries" */ './administration/countries/detail')),
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
                    import(/* webpackChunkName: "admin-country-groups" */ './administration/country-groups')),
                type: 'bottom',
                path: 'landaroj',
                hasPerm: () => true,
                paths: [
                    {
                        match: /^(x[a-z0-9]{2})$/i,
                        matchKey: 'group',
                        component: elazy(() =>
                            import(/* webpackChunkName: "admin-country-groups" */ './administration/country-groups/detail')),
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
                id: 'administration-country-lists',
                icon: TravelExploreIcon,
                component: elazy(() =>
                    import(/* webpackChunkName: "admin-country-lists" */ './administration/country-lists')),
                type: 'bottom',
                path: 'landaj-organizoj',
                hasPerm: perms => perms.hasPerm('countries.lists.read') && perms.hasPerm('codeholders.read'),
                paths: [
                    {
                        match: /^(.+)$/,
                        matchKey: 'list',
                        component: elazy(() => import(/* webpackChunkName: "admin-country-lists" */ './administration/country-lists/detail')),
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
