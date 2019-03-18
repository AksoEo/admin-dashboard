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
        menu: '[[Menu]]',
        // Overflow menu item
        overflow: '[[More]]'
    },
    // Sidebar
    sidebar: {
        // Search input placeholder
        search: 'Serĉi',
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
        username: 'Retpoŝtadreso aŭ UEA-kodo',
        password: 'Pasvorto',
        continue: 'Daŭrigi',
        securityCode: '[[TOTP code]]',
        // Text shown above the security code input
        securityCodeDescription: '[[explainy text]]',
        // The following two are both a link and a title
        forgotPassword: 'Mi forgesis mian pasvorton',
        forgotCode: 'Mi forgesis mian UEA-kodon',
        lostSecurityCode: '[[I lost my TOTP key]]',
        // Login progress indicator titles
        detailsStage: 'Detaloj',
        securityCodeStage: 'Sekurkodo',
        // Login button
        login: 'Ensaluti',

        // Errors
        invalidUEACode: '[[Invalid UEA code (or email)]]',
        invalidSecurityCode: '[[Invalid TOTP code]]'
    }
};
