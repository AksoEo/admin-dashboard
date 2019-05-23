/** The default locale (Esperanto). */
export default {
    // Information shown in the sidebar
    meta: {
        copyright: '© 2019',
        copyrightHolder: 'TEJO',
        copyrightHref: 'https://tejo.org',
        license: 'MIT-Permesilo',
        githubHref: 'https://github.com/AksoEo',
        github: 'GitHub',
    },
    // App header bar
    header: {
        // Hamburger button
        menu: 'Menuo',
        // Overflow menu item
        overflow: 'Pli',
        // Back button
        back: 'Reen',
    },
    // Sidebar
    sidebar: {
        // Search input placeholder
        search: 'Serĉi',
        logout: 'Elsaluti',
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
        elections: 'Voĉdonado',
    },
    // Login screen
    login: {
        // Used in the document title
        title: 'Ensaluti',
        username: 'UEA-kodo aŭ retpoŝtadreso',
        password: 'Pasvorto',
        confirmPassword: 'Pasvorto denove',
        continue: 'Daŭrigi',
        securityCode: 'Sekurkodo',
        createPasswordPlaceholder: 'Skribu pasvorton',
        confirmPasswordPlaceholder: 'Skribu pasvorton denove',
        bypassTotp: 'Memori tiun ĉi aparaton dum 60 tagoj',
        // Text shown above the security code input
        securityCodeDescription: 'Bonvolu enmeti sekurkodon generitan de via duafaktora aplikaĵo.',
        // The following three are both a link and a title
        forgotPassword: 'Mi forgesis mian pasvorton',
        forgotCode: 'Mi forgesis mian UEA-kodon',
        lostSecurityCode: 'Mi ne povas generi sekurkodon',
        // Login progress indicator titles
        detailsStage: 'Detaloj',
        createPasswordStage: 'Krei pasvorton',
        resetPasswordStage: 'Rekrei pasvorton',
        securityCodeStage: 'Sekurkodo',
        // Login button
        login: 'Ensaluti',

        // Errors
        invalidUEACode: 'Nevalida UEA-kodo aŭ retpoŝtadreso',
        invalidSecurityCode: 'Bonvolu enmeti vian sesciferan sekurkodon',
        passwordMismatch: 'Bonvolu skribi la saman pasvorton dufoje',
        invalidLogin: {
            ueaCode: 'Nevalida UEA-kodo aŭ pasvorto',
            email: 'Nevalida retpoŝtadreso aŭ pasvorto',
        },
        genericError: 'Ne sukcesis ensaluti, bv. reprovi poste',
        notAdmin: 'Nur administrantoj povas uzi tiun ĉi retejon',
        genericTotpError: 'Ne sukcesis ensaluti, bv. reprovi poste',
        invalidTotp: 'Nevalida sekurkodo',
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
            agePrime: 'jarkomence',
            codeholderTypes: {
                all: 'ne gravas',
                human: 'homo',
                org: 'organizo',
            },
            enabledStates: {
                all: 'ne gravas',
                enabled: 'ŝaltita',
                disabled: 'malŝaltita',
            },
            boolean: {
                all: 'ne gravas',
                yes: 'jes',
                no: 'ne',
            },
            existence: {
                all: 'ne gravas',
                yes: 'ekzistas',
                no: 'ne ekzistas',
            },
            fields: {
                age: 'Aĝo',
                nameOrCode: 'Nomo aŭ UEA-kodo',
                email: 'Retpoŝtadreso',
                notes: 'Notoj',
                hasOldCode: 'Malnova UEA-kodo',
                hasEmail: 'Retpoŝtadreso',
                codeholderType: 'Membrospeco',
                landlinePhone: 'Hejma telefono',
                cellphone: 'Poŝtelefono',
                officePhone: 'Oficeja telefono',
                enabled: 'Konto ŝaltita',
                isDead: 'Mortinta',
                feeCountry: 'Paglando',
                birthdate: 'Naskiĝtago',
                address: 'Adreso',
                hasPassword: 'Kreis konton',
            },
            countries: {
                // section labels in <select>
                countryGroups: 'Landaroj',
                countries: 'Landoj',
            },
            fieldPlaceholders: {
                nameOrCode: 'Ekz. xxtejo aŭ Zamenhof',
                email: 'Ekz. zamenhof@co.uea.org',
                landlinePhone: 'Ekz. +314666...',
                cellphone: 'Ekz. +314666...',
                officePhone: 'Ekz. +314666...',
                address: 'Ekz. Nieuwe Binnenweg',
                notes: 'Serĉi en notoj',
            },
        },
        resultStats: (count, filtered, total, time) => {
            const plural = n => n === 1 ? '' : 'j';
            return `Montras ${count} rezulto${plural(count)}n ${
                filtered ? `filtrita${plural(count)}n ` : ''}el entute ${
                total} trovita${plural(total)} en ${time}`;
        },
        fields: {
            codeholderType: 'Membrospeco',
            name: 'Nomo',
            code: 'UEA-kodo',
            country: 'Lando',
            disjunctCountry: (fee, country) => `Paĝas laŭ ${fee}, loĝas en ${country}`,
            age: 'Aĝo',
            ageFormat: (age, agep) => `${age} (${agep} jarkomence)`,
            email: 'Retpoŝtadreso',
            addressLatin: 'Adreso',
            addressCity: 'Urbo',
            addressCountryArea: 'Regiono',
            codeholderTypes: {
                human: 'Homo',
                org: 'Organizo',
            },
            notes: 'Notoj',
            landlinePhone: 'Hejma telefono',
            cellphone: 'Poŝtelefono',
            officePhone: 'Oficeja telefono',
            enabled: 'Konto ŝaltita',
            enabledStates: {
                yes: 'Jes',
                no: 'Ne',
            },
            isDead: 'Mortinta',
            feeCountry: 'Paglando',
            birthdate: 'Naskiĝtago',
            honorific: 'Titolo',
            profession: 'Profesio',
        },
        fieldPicker: {
            title: 'Montrotaj kampoj',
        },
        sorting: {
            none: 'ne ordigata',
            asc: 'kreskanta',
            desc: 'malkreskanta',
        },
        pagination: {
            displayedRows: ({ from, to, count }) => `${from}–${to} el ${count}`,
            rowsPerPage: 'Rezultoj po paĝo',
        },
        globalFilterNotice: '[[all your search queries are restricted to a filter etc etc]]',
    },
};
