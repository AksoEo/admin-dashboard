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
    // Page titles
    pages: {
        general: 'Ĝeneralaj',
        home: 'Hejmo',
        members: 'Membroj',
        magazines: 'Revuoj',
        statistics: 'Statistiko',
        congresses: 'Kongresoj',
        payments: 'Pagoj',
        elections: 'Voĉdonado',
        uea: 'UEA',
        tejo: 'TEJO'
    },
    // Login screen
    login: {
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
            title: 'Serĉi',
            titleFilter: '[[filter]]',
            expand: '[[More options]]',
            collapse: '[[Fewer options]]',
            submit: '[[Serĉi]]',
            submitFilter: '[[filter]]',
            filters: 'Filtriloj',
            existence: {
                yes: '[[havas]]',
                no: '[[ne havas]]'
            },
            fields: {
                age: 'Aĝo',
                nameOrCode: 'Nomo aŭ UEA-kodo',
                email: '[[email]]',
                notes: '[[notes]]',
                hasOldCode: '[[havas malnovan UEA-kodon]]',
                hasEmail: '[[has email]]'
            },
            fieldPlaceholders: {
                nameOrCode: '[[placeholder]]',
                email: '[[a@b.c]]'
            }
        }
    }
};
