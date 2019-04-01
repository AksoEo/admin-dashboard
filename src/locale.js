/** The default locale (Esperanto). */
export default {
    // Information shown in the sidebar
    meta: {
        copyright: '© 2019',
        copyrightHolder: 'TEJO',
        copyrightHref: 'https://tejo.org',
        license: 'MIT-Permesilo',
        githubHref: 'https://github.com/AksoEo',
        github: 'GitHub'
    },
    // App header bar
    header: {
        // Hamburger button
        menu: 'Menuo',
        // Overflow menu item
        overflow: 'Pli'
    },
    // Sidebar
    sidebar: {
        // Search input placeholder
        search: 'Serĉi',
        logout: 'Elsaluti'
    },
    documentTitleTemplate: pageTitle => `${pageTitle} | AKSO`,
    // Page titles
    pages: {
        home: 'Hejmo',
        members: 'Membroj',
        magazines: 'Revuoj',
        statistics: 'Statistiko',
        congresses: 'Kongresoj',
        payments: 'Pagoj',
        elections: 'Voĉdonado'
    },
    // Login screen
    login: {
        // Used in the document title
        title: 'Ensaluti',
        username: 'UEA-kodo aŭ retpoŝtadreso',
        password: 'Pasvorto',
        continue: 'Daŭrigi',
        securityCode: 'Sekurkodo',
        // Text shown above the security code input
        securityCodeDescription: 'Bonvolu enmeti sekurkodon generitan de via duafaktora aplikaĵo.',
        // The following three are both a link and a title
        forgotPassword: 'Mi forgesis mian pasvorton',
        forgotCode: 'Mi forgesis mian UEA-kodon',
        lostSecurityCode: 'Mi ne povas generi sekurkodon',
        // Login progress indicator titles
        detailsStage: 'Detaloj',
        securityCodeStage: 'Sekurkodo',
        // Login button
        login: 'Ensaluti',

        // Errors
        invalidUEACode: 'Nevalida UEA-kodo aŭ retpoŝtadreso',
        invalidSecurityCode: 'Nevalida sekurkodo'
    },
    // Members page
    members: {
        search: {
            title: 'Serĉi membrojn',
            titleFilter: 'Filtri membrojn',
            expand: 'Montri filtrilojn',
            collapse: 'Kaŝi filtrilojn',
            submit: 'Serĉi',
            submitFilter: 'Filtri',
            filters: 'Filtriloj',
            existence: {
                yes: 'ekzistas',
                no: 'ne ekzistas'
            },
            fields: {
                age: 'Aĝo',
                nameOrCode: 'Nomo aŭ UEA-kodo',
                email: 'Retpoŝtadreso',
                notes: 'Notoj',
                hasOldCode: 'Malnova UEA-kodo',
                hasEmail: 'Retpoŝtadreso'
            },
            fieldPlaceholders: {
                nameOrCode: 'Ekz. xxtejo aŭ Zamenhof',
                email: 'Ekz. zamenhof@co.uea.org'
            }
        },
        fields: {
            codeholderType: 'Membrospeco',
            name: 'Nomo',
            code: 'UEA-kodo',
            country: 'Lando',
            age: 'Aĝo',
            email: 'Retpoŝtadreso',
            codeholderTypes: {
                human: 'Homo',
                org: 'Organizo'
            }
        },
        fieldPicker: {
            title: 'Montrotaj kampoj'
        }
    }
};
