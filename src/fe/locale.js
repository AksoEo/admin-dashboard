import config from '../config.val';

const startYear = 2019;
const thisYear = new Date(config.buildTime).getUTCFullYear();
const copyrightYear = `${startYear}–${thisYear}`;

export const timestampFormat = 'LLL [UTC]';

export const meta = {
    copyright: `© ${copyrightYear}`,
    copyrightHolder: 'TEJO',
    copyrightHref: 'https://tejo.org',
    license: 'MIT-Permesilo',
    sourceHref: 'https://github.com/AksoEo',
    source: 'GitHub',
};

export const generic = {
    close: 'Fermi',
    cancel: 'Nuligi',
};

export const data = {
    requiredField: 'Tiu ĉi kampo estas deviga',
    byteSizes: [
        ['bajto', 'bajtoj'],
        'kB',
        'MB',
        'GB',
    ],
    delete: 'Forigi',
    retry: 'Reprovi',
    showMore: 'Montri pliajn',
    objViewerArrayItems: items => `${items} ero${items === 1 ? '' : 'j'}`,
    addressFields: {
        country: 'Lando',
        countryArea: 'Regiono',
        city: 'Urbo',
        cityArea: 'Urboparto',
        streetAddress: 'Stratadreso',
        postalCode: 'Poŝtkodo',
        sortingCode: 'Ordigkodo',
    },
    ueaCode: {
        newCode: 'Seslitera UEA-kodo',
        invalidUEACode: 'Nevalida seslitera UEA-kodo',
        codeTaken: 'La UEA-kodo estas jam uzata',
        idFailed: '[[failed to load]]',
    },
    deleteTitle: 'Forigi',
    deleteDescription: '[[are you sure you want to delete this item?]]',
    months: [
        'Januaro',
        'Februaro',
        'Marto',
        'Aprilo',
        'Majo',
        'Junio',
        'Julio',
        'Aŭgusto',
        'Septembro',
        'Oktobro',
        'Novembro',
        'Decembro',
    ],
    countryPicker: {
        // section labels in <select>
        countryGroups: 'Landaroj',
        countries: 'Landoj',
        // types
        all: 'ne gravas',
        fee: 'paglando',
        address: 'loĝlando',
        dialogTitle: 'Elekti land(ar)ojn',
        placeholder: 'Elekti land(ar)ojn',
        search: 'Serĉi land(ar)ojn',
        selectAll: 'Elekti ĉiujn',
        deselectAll: 'Malelekti ĉiujn',
    },
    weekdays: 'DLMMJVS',
    weekStart: 1, // Monday
    permsEditor: {
        note: '[[note that permissions will be merged from multiple sources so this isnt a complete picture]]',
        requires: 'Bezonas',
    },
};

export const errors = {
    unknown: err => `[[unknown error: ${err}]]`,
    invalidSearchQuery: {
        pre: [
            'La serĉkriterio ne estas valida. Ĉiuj signoj ne literaj aŭ numeraj estas ignoritaj.',
            'Eblas uzi la jenajn kontrolsignojn por fari malsimplan serĉon:',
        ],
        list: [
            ['*', ' post vorto por permesi ajnajn sekvantajn signojn post la vorto'],
            ['+', ' antaŭ vorto por postuli ĝian ekziston'],
            ['-', ' antaŭ vorto por postuli ĝian malekziston'],
            ['""', '-citilojn ĉirkaŭ frazo aŭ vorto por postuli la ekzaktan kombinon de la vortoj'],
        ],
        post: ['Serĉoj kun kontrolsignoj ne rajtas enhavi vortojn malpli longajn ol tri signoj.'],
    },
    'bad-request': err => `[[bad request: ${err}]]`,
    'unauthorized': '[[unauthorized]]',
    'forbidden': '[[forbidden]]',
    'not-found': '[[not found]]',
    'conflict': '[[conflict]]',
    'internal-server-error': '[[internal server error]]',
};

export const login = {
    details: 'Ensaluti',
    createPassword: 'Krei pasvorton',
    resetPassword: 'Rekrei pasvorton',

    login: 'UEA-kodo aŭ retpoŝtadreso',
    password: 'Pasvorto',
    confirmPassword: 'Pasvorto denove',
    createPasswordPlaceholder: 'Skribu pasvorton',
    confirmPasswordPlaceholder: 'Skribu pasvorton denove',
    forgotPassword: 'Mi forgesis mian pasvorton',
    forgotCode: 'Mi forgesis mian UEA-kodon',
    continue: 'Daŭrigi',

    genericError: 'Ne sukcesis ensaluti, bv. reprovi poste',
    invalidUEACode: 'Nevalida UEA-kodo aŭ retpoŝtadreso',
    passwordMismatch: 'Bonvolu skribi la saman pasvorton dufoje',
    invalidLogin: {
        ueaCode: 'Nevalida UEA-kodo aŭ pasvorto',
        email: 'Nevalida retpoŝtadreso aŭ pasvorto',
    },

    loggedInAs: code => `Vi estas ensalutinta kiel ${code}.`,
    notAdminShort: 'Vi ne estas administranto',
    notAdmin: 'Nur administrantoj povas uzi tiun ĉi retejon.',
    notAdminPWR: 'Sed via pasvorto estis sukcese nuligita.',
    notAdminLogout: 'Bonvolu elsaluti kaj reensaluti per konto de administranto se vi volas uzi la administran sistemon.',
    logOut: 'Elsaluti',

    totpSetupDescription: 'Bonvolu skani la QR-kodon per via aplikaĵo por agordi dua-faktoran ensaluton.',
    totpAppDescriptionPre: 'Se vi ne havas dua-faktoran aplikaĵon, ni rekomendas ',
    totpAppName: 'Authy',
    totpAppHref: userAgent => {
        void userAgent;
        return 'https://authy.com/download/';
    },
    totpAppDescriptionPost: '.',

    totp: 'Sekurkodo',
    totpDescription: 'Bonvolu enmeti sekurkodon generitan de via duafaktora aplikaĵo.',
    rememberTotp: 'Memori tiun ĉi aparaton dum 60 tagoj',
    rememberTotpDescription: 'Nur uzu tiun ĉi funkcion ĉe personaj komputiloj.',
    lostTotp: 'Mi ne povas generi sekurkodon',
    continueTotp: 'Ensaluti',

    createPasswordDescription: login => `Via konto ${login} ŝajne ne havas pasvorton. Bv. alklaki por sendi retpoŝtmesaĝon kun instrukcioj pri kiel agordi vian konton.`,
    resetPasswordDescription: 'Se vi forgesis vian pasvorton, bv. enmeti viajn ensalutinformojn kaj premi la butonon por sendi pasvort-nuligligilon al via retpoŝtadreso.',
    sendPasswordReset: 'Sendi retpoŝtmesaĝon',
    sendPasswordSetup: 'Sendi retpoŝtmesaĝon',
    createPasswordSent: 'Sendis retpoŝtmesaĝon. Bonvolu kontroli vian retpoŝtkeston (kaj spamujon).',
    resetPasswordSent: 'Sendis retpoŝtmesaĝon. Bonvolu kontroli vian retpoŝtkeston (kaj spamujon).',

    forgotCodeDescription: '[[use your email i guess?]]',

    lostTotpDescription: '[[contact your local sysadmin]]',

    genericTotpError: 'Ne sukcesis ensaluti, bv. reprovi poste',
    invalidTotp: 'Nevalida sekurkodo',
    invalidTotpFormat: 'Bonvolu enmeti vian sesciferan sekurkodon',
};

export const app = {
    title: 'AKSO',
    logOut: 'Elsaluti',

    // literally any error that causes the UI to fail to render
    genericError: 'Okazis neatendita eraro. Bonvolu poste reprovi. Se tiu ĉi eraro okazadas indus kontakti administranton.',
    genericErrorReload: 'Reŝarĝi la paĝon',

    notFound: 'Ni ne sukcesis trovi tiun ĉi paĝon. Eventaule kontrolu ĉu vi mistajpis adreson.',
    forbidden: 'Vi ne rajtas aliri tiun ĉi paĝon.',
    goHome: 'Hejmen',

    debugPageInfo: 'Se vi ne scias kio estas tio ĉi, ne zorgu kaj alklaku sur \'Hejmo\' en la menuo.',
};

export const pages = {
    home: 'Hejmo',
    codeholders: 'Membroj',
    membership: 'Membreco',
    email: 'Amasmesaĝoj',
    magazines: 'Revuoj',
    statistics: 'Statistiko',
    congresses: 'Kongresoj',
    payments: 'Pagoj',
    votes: 'Voĉdonado',
    newsletters: 'Bultenoj',
    administration: 'Administrado',
    'administration-groups': 'Administraj grupoj',
    'administration-clients': 'API-klientoj',
    'administration-log': 'API-protokolo',
    'administration-countries': 'Landoj',
    'administration-country-groups': 'Landaroj',
    lists: 'Listoj',
    reports: 'Raportoj',
    documents: 'Ŝpureblaj dokumentoj',
};

export const search = {
    normalFilter: 'Facilaj filtriloj',
    jsonFilter: 'JSON-filtriloj',
    loadingJSONEditor: 'Ŝarĝas...',
    filtersDisclosure: 'Filtriloj',
    json: {
        help: {
            title: 'JSON-helpo',
            content: `[[json help content goes here. if you would like this to be raw html\
            that can be arranged (it’s not like we’re going to html inject ourselves though\
            this locale object isn’t immutable so technically that is a possibility but who\
            would even do that)\
            if this is going to be interactive (api doc browser?) that too can be\
            arranged]]`,
        },
    },
    stats: (count, filtered, total, time) => {
        const plural = n => n === 1 ? '' : 'j';
        return `Montras ${count} rezulto${plural(count)}n ${
            filtered ? `filtrita${plural(count)}n ` : ''}el entute ${
            total} trovita${plural(total)} en ${time
            .replace('.', ',')
            // put a space before the unit
            .replace(/ms/, ' ms')}`;
    },
    prevPage: 'Antaŭa',
    nextPage: 'Sekva',
    paginationItems: (from, to, count) => `${from}–${to} el ${count.toLocaleString('de-DE')}`,
    pickFields: 'Elekti kampojn',
    resetFilters: 'Nuligi filtrilojn',
    viewJSON: '[[convert 2 json]]',
    loadFilter: 'Ŝargi',
    saveFilter: 'Konservi',
    pickFilter: 'Ŝargi filtrilon',
    saveFilterTitle: 'Konservi filtrilon',
    noFilters: 'Neniuj konservitaj filtriloj',
    savedFilterName: 'Nomo',
    savedFilterDesc: 'Priskribo',
    csvExport: 'Elporti kiel CSV',
    sorting: {
        none: 'ne ordigata',
        asc: 'kreskanta',
        desc: 'malkreskanta',
    },
    fieldPicker: {
        title: 'Montrotaj kampoj',
        searchPlaceholder: 'Serĉi kampon',
    },
};

export const detail = {
    editing: 'Redakti',
    edit: 'Redakti',
    delete: 'Forigi',
    cancel: 'Nuligi',
    done: 'Konservi',
    saveTitle: 'Konservado',
    diff: 'Redaktitaj kampoj',
    updateComment: 'Fonto aŭ kialo de ŝanĝoj farotaj',
    commit: 'Aktualigi',
};

export const csvExport = {
    title: 'Elporti kiel CSV',
    beginExport: 'Elporti',
    tryResumeExport: 'Provi daŭrigi',
    abortExport: 'Nuligi',
    download: 'Elŝuti CSV',
    commaSeparated: 'CSV (komoj)',
    tabSeparated: 'TSV (taboj)',
    status: (n, m) => `[[loaded ${n} of ${m} total item${m === 1 ? '' : 's'}]]`,
    endingExport: (n, m) => `[[exported ${n} of ${m} total row${m === 1 ? '' : 's'}]]`,
    summary: rows => `[[created csv with ${rows} row${rows === 1 ? '' : 's'}]]`,
};

export const codeholders = {
    title: 'Membroj',
    detailTitle: 'Membro',
    search: {
        fields: {
            nameOrCode: 'Nomo aŭ UEA-kodo',
            email: 'Retpoŝtadreso',
            landlinePhone: 'Hejma telefono',
            cellphone: 'Poŝtelefono',
            officePhone: 'Oficeja telefono',
            searchAddress: 'Adreso',
            notes: 'Notoj',
        },
        placeholders: {
            nameOrCode: 'Ekz. xxtejo aŭ Zamenhof',
            email: 'Ekz. zamenhof@co.uea.org',
            landlinePhone: 'Ekz. +314666…',
            cellphone: 'Ekz. +314666…',
            officePhone: 'Ekz. +314666…',
            searchAddress: 'Ekz. Nieuwe Binnenweg',
            notes: 'Serĉi en notoj',
        },
        filters: {
            age: 'Aĝo',
            hasOldCode: 'Kvarlitera UEA-kodo',
            hasEmail: 'Retpoŝtadreso',
            type: 'Membrospeco',
            enabled: 'Konto ŝaltita',
            isDead: 'Mortinta',
            country: 'Lando',
            birthdate: 'Naskiĝtago',
            hasPassword: 'Kreis konton',
            membership: 'Membreckategorioj',
            roles: 'Roloj',
            isActiveMember: 'Aktiva membro iam en',
            deathdate: 'Mortjaro',
        },
        countryFilter: {
            all: 'ne gravas',
            fee: 'paglando',
            address: 'loĝlando',
        },
        enabledStates: {
            all: 'ne gravas',
            enabled: 'ŝaltita',
            disabled: 'malŝaltita',
        },
        agePrime: 'jarkomence',
        ageBirthYear: range => `naskiĝintoj en ${range}`,
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
        membership: {
            invert: {
                yes: 'ne havas',
                no: 'havas',
            },
            lifetime: {
                yes: 'dumviva',
                no: 'unujara',
                all: 'ne gravas',
            },
            givesMembership: {
                yes: 'membrecdona',
                no: 'nemembrecdona',
                all: 'ne gravas',
            },
            conjunction: 'kaj',
            pickSome: 'Elekti kategoriojn',
        },
        role: {
            pickSome: 'Elekti rolojn',
        },
        types: {
            all: 'ne gravas',
            human: 'homo',
            org: 'organizo',
        },
    },
    globalFilterTitle: 'La rezultoj estas filtritaj',
    globalFilterNotice: ['Ĉiuj viaj serĉoj estas limigitaj laŭ ', 'membrofiltrilo', '. Okaze de demandoj, kontaktu vian administranton.'],
    fields: {
        type: 'Membrospeco',
        types: {
            human: 'Homo',
            org: 'Organizo',
        },
        disabledTitle: 'malŝaltita',
        deadTitle: 'mortinta',
        name: 'Nomo',
        code: 'UEA-kodo',
        country: 'Lando',
        disjunctCountry: (fee, country) => `Pagas laŭ ${fee}, loĝas en ${country}`,
        disjunctCountryCSV: (fee, country) => `Pago: ${fee}, Loĝo: ${country}`,
        age: 'Aĝo',
        ageFormat: (age, agep) => `${age} (${agep} jarkomence)`,
        email: 'Retpoŝtadreso',
        address: 'Adreso',
        addressCity: 'Urbo',
        addressCountryArea: 'Regiono',
        codeholderDisabledTitle: 'malŝaltita',
        codeholderDeadTitle: 'mortinta',
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
        deathdate: 'Mortdato',
        honorific: 'Titolo',
        profession: 'Profesio',
        membership: 'Membreco',
        website: 'Retejo',
        biography: 'Biografio',
        careOf: 'P/a',
        creationTime: 'Horo de kreiĝo',
        hasPassword: 'Kreis konton',
        password: 'Pasvorto',
        addressPublicity: 'Publikeco de adreso',
        emailPublicity: 'Publikeco de retpoŝtadreso',
        officePhonePublicity: 'Publikeco de oficeja telefono',
        profilePicturePublicity: 'Publikeco de profilbildo',
        lastNamePublicity: 'Publikeco de familinomo',
        landlinePhonePublicity: 'Publikeco de hejma telefono',
        cellphonePublicity: 'Publikeco de poŝtelefono',

        // used only in field history
        profilePictureHash: 'Profilbildo',
    },
    profilePictureHashSome: 'Havas bildon',
    profilePictureHashNone: 'Havas neniun bildon',
    csvFields: {
        membership: 'Membreco (resumo)',
    },
    csvFilename: 'membroj',
    nameSubfields: {
        legal: 'Jura nomo',
        abbrev: 'Mallongigo',
        honorific: 'Titolo',
        firstLegal: 'Jura persona nomo',
        lastLegal: 'Jura familia nomo',
        first: 'Persona nomo',
        last: 'Familia nomo',
        full: 'Plena nomo',
        local: 'Plena, loka nomo',
    },
    postalAddress: 'Poŝtadreso',
    postalLocale: 'Lingvo de adreso',
    honorificSuggestions: [
        'S-ro',
        'S-ino',
        'S-ano',
        'Prof.',
        'Prof-ino',
        'D-ro',
        'D-ino',
        'Mag.',
        'Mag-ino',
        'Fraŭlo',
        'F-ino',
        'Inĝ.',
        'Inĝ-ino',
        'Pastro',
        'Pastrino',
        'Civitano',
        'Ges-ro',
    ],
    csvOptions: {
        countryLocale: 'Lingvo de landnomoj',
        countryLocales: {
            eo: 'Esperanto',
            en: 'English',
            fr: 'Français',
            es: 'Español',
            nl: 'Nederlands',
            pt: 'Português',
            sk: 'Slovenčina',
            zh: '中文',
            de: 'Deutsch',
        },
    },
    profilePicture: {
        crop: 'Tondi profilfoton',
        cancel: 'Nuligi',
        set: 'Alŝuti',
    },
    create: 'Aldoni membron',
    createNoName: 'Nomo estas deviga',
    createAction: 'Aldoni',
    invalidUEACode: 'Nevalida seslitera UEA-kodo',
    invalidHumanCode: 'UEA-kodoj por homoj ne rajtas komenciĝi je xx',
    invalidOrgCode: 'UEA-kodoj por organizoj devas komenciĝi je xx',
    createGenericError: 'Okazis neatendita eraro dum kreado de membro, bv. reprovi poste',
    memberships: 'Membrecoj',
    noMemberships: 'Neniuj membrecoj',
    addMembership: 'Aldoni membrecon',
    membership: {
        lifetime: {
            yes: 'dumviva',
            no: 'unujara',
        },
        givesMembership: {
            yes: 'membrecdona',
            no: 'nemembrecdona',
        },
        availableFrom: 'nur de',
        availableTo: 'nur ĝis',
        year: 'Jaro',
        notAYear: 'Bonvolu enmeti validan jaron',
        add: 'Aldoni',
    },
    roles: 'Roloj',
    noRoles: 'Neniuj roloj',
    addRole: 'Aldoni rolon',
    updateRole: 'Redakti rolon',
    role: {
        add: 'Aldoni',
        edit: 'Redakti',
        update: 'Redakti',
        description: '[[Leave the start or end date blank to make it indefinite.]]',
        durationFrom: 'Valida ekde',
        durationTo: 'Valida ĝis',
        notADate: 'Ne estas valida dato',
    },
    files: {
        fields: {
            name: 'Nomo',
            description: 'Priskribo',
            addedBy: 'Aldonita de',
            time: '[[time]]',
            mime: '[[mime]]',
            size: '[[size]]',
        },
    },
    // TODO: move these in files
    filesButton: n => !n ? 'dosieroj' : n === 1 ? '1 dosiero' : `${n} dosieroj`,
    filesTitle: 'Dosieroj',
    fileTitle: 'Dosiero',
    noFiles: 'Neniuj dosieroj',
    editFile: 'Redakti dosieron',
    uploadFile: 'Alŝuti dosieron',
    uploadThisFile: 'Alŝuti',
    deleteFile: 'Forigi dosieron',
    downloadFile: 'Elŝuti',
    fileName: 'Dosiernomo',
    fileDescription: 'Priskribo',
    cancelUploadFile: 'Nuligi',
    retryFileUpload: 'Reprovi',
    failedFileUpload: 'Ne sukcesis alŝuti la dosieron',
    fileAddedBy: 'aldonita de ',
    delete: 'Forigi',
    deleteDescription: 'Ĉu vi certas, ke vi volas forigi tiun ĉi membron? Ne eblas malfari tion ĉi.',
    fieldHistory: {
        title: field => `Historio de ${field}`,
        comment: 'Priskribo de ŝanĝoj',
        changedBy: 'Ŝanĝita de',
        initial: 'Origina datumo',
    },
    addrLabelGen: {
        menuItem: 'Krei adresetikedojn',
        title: 'Kreado de adresetikedoj',
        labels: {
            language: 'Lingvo',
            latin: 'Latinigita',
            includeCode: 'UEA-kodoj',
            paper: 'Paperspeco',
            margins: 'Marĝenoj',
            cols: 'Kolumnoj',
            rows: 'Vicoj',
            colGap: 'Interkolumna spaco',
            rowGap: 'Intervica spaco',
            cellPadding: 'Enĉela marĝeno',
            fontSize: 'Tipargrandeco',
            drawOutline: 'Montri kadrojn',
        },
        paperSizes: {
            A3: 'A3',
            A4: 'A4',
            A5: 'A5',
            LETTER: 'US Letter',
            FOLIO: 'Folio',
            LEGAL: 'Legal',
            EXECUTIVE: 'Executive',
        },
        cursedNotice: 'Rezultoj trovitaj laŭ UEA-kodo markitaj per ora koloro ne aperos en la adresetikedoj.',
        generate: 'Krei etikedojn',
        success: 'Komencis generadon de viaj etikedoj. Vi ricevos sciigon/retmesaĝon kun alkroĉaĵo laŭeble baldaŭ.',
        genericError: 'Ne sukcesis sendi la adresetikedpeton.',
        closeDialog: 'Fermi',
        stats: ({ perPage, pages, total, withAddresses }) => `Trovis ${withAddresses} rezultojn (el entute ${total}) kiuj havas poŝtadreson. Kun po ${perPage} adreso${perPage === 1 ? '' : 'j'} por paĝo, tio estos ${pages} paĝo${pages === 1 ? '' : 'j'}`,
    },
    publicity: {
        private: 'Privata',
        members: 'Nur membroj',
        public: 'Publika',
    },
    logins: {
        title: 'Historio de ensalutoj',
        empty: 'Neniuj ensalutoj',
        inTimezone: '[[in timezone]]',
        viewInOSM: '[[view approximate area in osm]]',
        osmLink: (area, lat, lon) => {
            // FIXME: bad zoom approximation
            let zoom = 6;
            if (area <= 1000) zoom = 7;
            if (area <= 100) zoom = 8;
            return `https://www.openstreetmap.org/#map=${zoom}/${lat}/${lon}`;
        },
    },
    perms: {
        title: 'Permesoj',
        setTitle: 'Ĝisdatigi permesojn',
        setButton: 'Ĝisdatigi',
        setRestrictions: 'Ĝisdatigi restriktojn',
        setRestrictionsButton: 'Ĝisdatigi',
    },

    picker: {
        none: '[[none selected]]',
        search: 'Aldoni laŭ nomo aŭ UEA-kodo',
    },
    resetPassword: {
        create: '[[send pw creation email]]',
        reset: '[[send pw reset email]]',
        descriptionCreate: '[[this will send an email to this user (if they have an email registered) that will allow them to create their password]]',
        descriptionReset: '[[this will send an email to this user (if they have an email registered) that will allow them to reset their password]]',
        orgsSelect: '[[select an org for the email]]',
        orgs: {
            uea: 'UEA',
            tejo: 'TEJO',
            akso: 'AKSO',
        },
        send: '[[send]]',
        success: '[[email request succeeded with http 2xx. we dont actually know if it sent an email]]',
    },
};

export const adminGroups = {
    title: 'Administraj grupoj',
    detailTitle: 'Administra grupo',
    permsTitle: 'Permesoj',
    add: 'Aldoni grupon',
    addButton: 'Aldoni',
    edit: 'Redakti',
    editGroup: 'Redakti grupon',
    editUpdate: 'Konservi',
    delete: 'Forigi grupon',
    deleteButton: 'Forigi',
    deleteAreYouSure: 'Ĉu vi certas, ke vi volas forigi tiun ĉi administran grupon? Ne eblas malfari tiun ĉi agon.',
    search: {
        placeholders: 'Serĉi nomojn de grupoj',
    },
    fields: {
        name: 'Nomo',
        description: 'Priskribo',
        memberRestrictions: '[[memberRestrictions]]',
    },
    tabs: {
        codeholders: 'Membroj',
        clients: 'API-klientoj',
    },
    editPerms: 'Redakti permesojn',
    deleteSelection: '[[delete selection]]',

    addCodeholders: 'Aldoni membron',
    addCodeholdersCount: n => `${n} membro${n === 1 ? '' : 'j'} elektitaj`,
    removeCodeholders: 'Elpreni membrojn el grupo',
    removeButton: 'Elpreni',
    removeCodeholdersAreYouSure: n => `Ĉu vi certas, ke vi volas elpreni ${n} membro${n === 1 ? '' : 'j'}n?`,
    addCodeholdersDone: 'Aldoni elektitojn',
    addClients: 'Aldoni API-klientojn',
    removeClients: 'Elpreni API-klientojn el grupo',
    addClientsCount: n => `${n} API-kliento${n === 1 ? '' : 'j'} elektitaj`,
    addClientsDone: 'Aldoni elektitojn',
    removeClientsAreYouSure: n => `Ĉu vi certas, ke vi volas elpreni ${n} API-kliento${n === 1 ? '' : 'j'}n?`,

    nameRequired: 'Necesas nomo',

    setPermissions: 'Agordi permesojn',
    setPermsButton: 'Agordi permesojn',

    csvFilename: 'administraj-grupoj',
};

export const clients = {
    title: 'API-klientoj',
    detailTitle: 'API-kliento',
    add: 'Aldoni API-klienton',
    addButton: 'Aldoni',
    update: 'Konservi',
    updateButton: 'Konservi',
    delete: 'Forigi API-klienton',
    deleteButton: 'Forigi',
    deleteAreYouSure: 'Ĉu vi certas, ke vi volas forigi tiun ĉi API-klienton? Ne eblas malfari tiun ĉi agon.',
    secret: {
        title: 'Sekreta API-ŝlosilo',
        description: 'Tio ĉi estas la sekreta API-ŝlosilo. Konservu ĝin aŭ ĝi estos perdita.',
        done: 'Fermi',
    },
    search: {
        placeholders: {
            name: 'Serĉi laŭ nomo',
            apiKey: 'Serĉi ekzaktan API-ŝlosilon',
            ownerName: 'Serĉi laŭ nomo de posedanto',
            ownerEmail: 'Serĉi laŭ retpoŝtadreso',
        },
    },
    fields: {
        name: 'Nomo',
        apiKey: 'API-ŝlosilo',
        ownerName: 'Nomo de posedanto',
        ownerEmail: 'Retpoŝtadreso',
    },

    nameRequired: 'Necesas nomo',
    ownerNameRequired: 'Necesas nomo de posedanto',
    ownerEmailRequired: 'Necesas retpoŝtadreso',

    perms: {
        linkButton: 'Redakti permesojn',
        title: 'Permesoj',
        setTitle: 'Ĝisdatigi permesojn',
        setButton: 'Ĝisdatigi',
    },
    csvFilename: 'api-klientoj',
};

export const httpLog = {
    title: 'API-protokolo',
    detailTitle: 'HTTP-peto',
    search: {
        placeholders: {
            userAgent: 'Serĉi retumilon',
            userAgentParsed: 'Serĉi legeblan retumilon',
        },
        filters: {
            codeholders: 'Membroj',
            time: 'Horo',
            apiKey: 'API-ŝlosilo',
            ip: 'IP-adreso',
            origin: 'Fonto',
            method: 'Metodo',
            path: 'Adreso',
            resStatus: 'Rezulta stato',
            resTime: 'Daŭro (ms)',

            originPlaceholder: '[[ekz. https://admin.akso.org]]',
            pathEq: '[[is exactly]]',
            pathStartsWith: '[[starts with]]',
            pathInverted: '[[does not start with]]',
            pathPlaceholder: '[[ekz. /auth]]',
            resStatusPlaceholder: '[[ekz. 200]]',
        },
    },
    fields: {
        time: 'Horo',
        identity: 'Uzanto',
        ip: 'IP-adreso',
        origin: 'Fonto',
        userAgent: 'Retumilo',
        userAgentParsed: 'Retumilo (legebla)',
        method: 'Metodo',
        path: 'Adreso',
        query: 'Peto',
        resStatus: 'Rezulta stato',
        resTime: 'Daŭro',
        resLocation: 'Rezulta loko',
    },
    query: {
        some: 'Havas peton',
        none: '',
    },
    viewCodeholder: 'Vidi membron',
    viewClient: 'Vidi API-klienton',
    csvFilename: 'protokolo',
};

export const countries = {
    title: 'Landoj',
    detailTitle: 'Lando',
    search: {
        placeholders: 'Serĉi landojn',
    },
    fields: {
        code: 'Landokodo',
        enabled: 'Ŝaltita',
        name_eo: 'Esperante',
        name_en: 'Angle',
        name_fr: 'France',
        name_es: 'Hispane',
        name_nl: 'Nederlande',
        name_pt: 'Portugale',
        name_sk: 'Slovake',
        name_zh: 'Ĉine',
        name_de: 'Germane',
    },
    update: {
        title: 'Redakti landojn',
        button: 'Redakti',
    },
    csvFilename: 'landoj',
    enabled: {
        true: 'ŝaltita',
        false: 'malŝaltita',
    },
};
export const countryGroups = {
    title: 'Landaroj',
    detailTitle: 'Landaro',
    search: {
        placeholders: 'Serĉi landarojn',
    },
    detailSearchPlaceholder: 'Serĉi landojn',
    fields: {
        code: 'Landarokodo',
        name: 'Nomo',
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei landaron',
        button: 'Krei',
    },
    update: {
        title: 'Redakti landaron',
        button: 'Redakti',
    },
    delete: {
        title: 'Forigi landaron',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la landaron? Ne eblas malfari tiun ĉi agon.',
    },
    csvFilename: 'landaroj',
};

export const lists = {
    title: 'Listoj',
    detailTitle: 'Listo',
    search: {
        placeholders: {
            name: 'Serĉi listonomon',
            description: 'Serĉi priskribon',
        },
    },
    filters: {
        title: 'Filtriloj',
        itemTitle: i => `Filtrilo n-ro ${i + 1}`,
    },
    preview: {
        title: '[[preview]]',
        empty: '[[empty]]',
    },
    fields: {
        name: 'Nomo',
        description: 'Priskribo',
    },

    create: {
        menuItem: 'Krei',
        title: 'Krei liston',
        button: 'Krei',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti liston',
        button: 'Redakti',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi liston',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la liston? Ne eblas malfari tiun ĉi agon.',
    },

    nameRequired: 'Necesas nomo',

    csvFilename: 'listoj',
};

export const votes = {
    title: 'Voĉdonadoj',
    templateTitle: '[[tpl]]',
    detailTitle: 'Voĉdonado',
    templates: {
        menuItem: 'Ŝablonoj',
    },
    search: {
        placeholders: {
            name: 'Serĉi nomon',
            description: 'Serĉi priskribon',
        },
    },
    fields: {
        org: '[[org]]',
        type: '[[type]]',
        name: 'Nomo',
        state: '[[state]]',
        description: 'Priskribo',
        voterCodeholders: '[[voterCodeholders]]',
        voterCodeholdersMemberFilter: '[[voterCodeholdersMemberFilter]]',
        viewerCodeholders: '[[viewerCodeholders]]',
        viewerCodeholdersMemberFilter: '[[viewerCodeholdersMemberFilter]]',
        timespan: '[[timespan]]',
        timeStart: '[[timeStart]]',
        timeEnd: '[[timeEnd]]',
        ballotsSecret: '[[ballotsSecret]]',
        config: '[[config]]',
    },
    voterCodeholdersDescription: '[[voter codeholders is a json filter for members etc etc]]',
    viewerCodeholdersSame: '[[same as votercodeholders]]',
    filters: {
        org: '[[org]]',
        timeStart: '[[start time]]',
        timeEnd: '[[end time]]',
        state: '[[state]]',
        type: '[[type]]',
        orgTypes: {
            tejo: 'TEJO',
            uea: 'UEA',
            none: 'ne gravas',
        },
        stateTypes: {
            pending: '[[pending]]',
            started: '[[started]]',
            active: '[[active]]',
            ended: '[[ended]]',
            none: 'ne gravas',
        },
        noneType: 'ne gravas',
    },
    cannotEditActive: '[[cannot edit active vote]]',
    bool: {
        yes: '[[yes]]',
        no: '[[no]]',
    },
    rational: {
        numerator: '[[numerator]]',
        denominator: '[[denominator]]',
    },
    noMaxOptions: '[[infinite options!!!]]',
    state: {
        hasNotStarted: '[[has not started]]',
        isActive: '[[active]]',
        hasEnded: '[[has ended]]',
        hasResults: '[[has results]]',
        hasResultsTiebreaker: '[[has results, used tb]]',
    },
    config: {
        quorum: '[[quorum]]',
        quorumInclusive: '[[quorumInclusive]]',
        majorityBallots: '[[majorityBallots]]',
        majorityBallotsInclusive: '[[majorityBallotsInclusive]]',
        majorityVoters: '[[majorityVoters]]',
        majorityVotersInclusive: '[[majorityVotersInclusive]]',
        majorityMustReachBoth: '[[majorityMustReachBoth]]',
        blankBallotsLimit: '[[blankBallotsLimit]]',
        blankBallotsLimitInclusive: '[[blankBallotsLimitInclusive]]',
        numChosenOptions: '[[numChosenOptions]]',
        mentionThreshold: '[[mentionThreshold]]',
        mentionThresholdInclusive: '[[mentionThresholdInclusive]]',
        maxOptionsPerBallot: '[[maxOptionsPerBallot]]',
        tieBreakerCodeholder: '[[tieBreakerCodeholder]]',
        publishVoters: '[[publishVoters]]',
        publishVotersPercentage: '[[publishVotersPercentage]]',
        options: '[[options]]',
    },
    inclusive: '[[inclusive]]', // checkbox label
    options: {
        simple: '[[simple]]',
        codeholder: '[[codeholder]]',
        name: 'Nomo',
        descriptionPlaceholder: 'Priskribo',
    },
    types: {
        yn: '[[yes/no]]',
        ynb: '[[yes/no/blank]]',
        rp: '[[tejo® ranked pairs]]',
        stv: '[[tejo® single transferable vote]]',
        tm: '[[uea® threshold majority]]',
    },
    results: {
        link: 'Vidi rezultojn',
        title: 'Rezultoj',
        resultTypes: {
            undefined: 'Eraro',
            NO_QUORUM: '[[no quorum]]',
            TOO_MANY_BLANK_BALLOTS: '[[too many blank ballots]]',
            TIE_BREAKER_NEEDED: '[[tie breaker needed]]',
            TIE: '[[tie]]',
            CHOSEN: '[[chosen]]',
            MAJORITY: '[[majority]]',
            NO_MAJORITY: '[[no majority]]',
        },
        turnout: '[[turnout]]',
        voters: n => `[[${n} voters]]`,
        nonVoters: n => `[[${n} non-voters]]`,
        votersBlank: n => `[[${n} blank ballots]]`,
        tally: '[[tally]]',
        optionYes: '[[aye]]',
        optionNo: '[[nay]]',
        optionBlank: '[[blank]]',
        excludedByMentionThreshold: '[[excl by mention threshold]]',
        isEqualOpt: '[[not in chosen but same amount of mention as an option present in chosen]]',
        electionQuota: n => `[[election quota: ${n}]]`,
        majorityBallotsOkay: k => k ? '[[majorityBallotsOkay]]' : '[[majorityBallotsSad]]',
        majorityVotersOkay: k => k ? '[[majorityVotersOkay]]' : '[[majorityVotersSad]]',
        majorityOkay: k => k ? '[[majorityOkay]]' : '[[majoritySad]]',
        rounds: '[[rounds]]',
        roundsPagination: (n, m) => `[[round ${n} of ${m}]]`,
        roundsChosen: '[[chosen:]] ',
        roundsOptionStats: (won, lost, mentions) => `[[won ${won}, lost ${lost}, mentioned ${mentions} time(s)]]`,
        lockGraph: '[[lock graph]]',
        rankedPairs: {
            diff: '[[diff]]',
            winner: '[[winner]]',
            pair: '[[pair]]',
            vs: 'kontraŭ',
        },
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei voĉdonadon',
        button: 'Krei',
        pages: {
            template: '[[template]]',
            general: '[[general]]',
            vote: '[[vote]]',
            voters: '[[voters]]',
            config: '[[config]]',
        },
        continue: 'Daŭrigi',

        nameRequired: '[[name is required]]',
        requiresSelection: '[[requires selection]]',
    },
    numberRequired: '[[enter a number]]',
    optionsRequired: '[[options required]]',
    update: {
        menuItem: 'Aktualigi',
        title: 'Aktualigi voĉdonadon',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi voĉdonadon',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la voĉdonadon? Ne eblas malfari tiun ĉi agon.',
    },
    csvFilename: 'vochdonadoj',
};

export const mime = {
    types: {
        application: null,
        multipart: null,
        audio: 'sono',
        font: 'tiparo',
        image: 'bildo',
        model: '3D-modelo',
        text: 'teksto',
        video: 'video',
    },
    exceptions: {
        'application/pdf': 'PDF-dokumento',
        'application/msword': 'Word-dokumento', // .doc, .dot
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word-dokumento', // .docx
        'application/vnd.openxmlformats-officedocument.wordprocessingml.template': 'Word-ŝablono', // .dotx
        'application/msexcel': 'Excel-kalkultabelo', // .xls, .xlt
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel-kalkultabelo', // .xlsx
        'application/vnd.openxmlformats-officedocument.spreadsheetml.template': 'Excel-kalkultabelŝablono', // .xltx
        'application/mspowerpoint': 'PowerPoint-prezentaĵo', // .ppt, .pot
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint-prezentaĵo', // .pptx
        'application/vnd.openxmlformats-officedocument.presentationml.template': 'PowerPoint-prezentaĵo', // .potx
        'application/vnd.openxmlformats-officedocument.presentationml.slideshow': 'PowerPoint-prezentaĵo', // .ppsx
        'application/vnd.oasis.opendocument.presentation': 'OpenDocument-prezentaĵo', // .odp
        'application/vnd.oasis.opendocument.spreadsheet': 'OpenDocument-kalkultabelo', // .ods
        'application/vnd.oasis.opendocument.text': 'OpenDocument-dokumento', // .odt
        'application/rtf': 'RTF-dokumento',
        'text/plain': 'Teksto',
        'application/octet-stream': 'Dosiero',
        'application/zip': 'ZIP-dosiero',
        'application/x-rar': 'RAR-dosiero',
    },
};

// TODO: remove this
import compatLocale from './locale_old';
export default compatLocale;
