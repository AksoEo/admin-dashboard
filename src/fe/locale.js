import config from '../config.val';

const startYear = 2019;
const thisYear = new Date(config.buildTime).getUTCFullYear();
const copyrightYear = `${startYear}–${thisYear}`;

export const timestampFormat = 'LLL [UTC]';
// for dates that are today
export const timestampFormatToday = '[hodiaŭ] LT [UTC]';

export const insecureContext = 'La paĝo ne estas sekura (http)!';

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
    address: {
        invalidPostalCode: 'Nevalida poŝtkodo',
    },
    ueaCode: {
        newCode: 'Seslitera UEA-kodo',
        invalidUEACode: 'Nevalida seslitera UEA-kodo',
        codeTaken: 'La UEA-kodo estas jam uzata',
        idFailed: 'Ne sukcesis ŝarĝi UEA-kodon',
    },
    deleteTitle: 'Forigi',
    deleteDescription: 'Ĉu vi certas, ke vi volas forigi tiun ĉi eron?',
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
    timespanUnits: {
        days: d => d === 1 ? '1 tago' : `${d} tagoj`,
        hours: h => h === 1 ? '1 horo' : `${h} horoj`,
        minutes: m => m === 1 ? '1 minuto' : `${m} minutoj`,
        seconds: s => s === 1 ? '1 sekundo' : `${s} sekundoj`,
        d: 't',
        h: 'h',
        m: 'm',
        s: 's',
    },
    invalidCurrencyAmount: '[[invalid currency amount]]', // this will only happen very rarely
    permsEditor: {
        note: 'Bv. noti, ke uzantaj permesoj estas kombinitaj de pluraj fontoj; tial la ĉi-suba montrilo ne donas la plenan superrigardon.',
        requires: 'Bezonas',
        update: {
            title: 'Ĝisdatigi permesojn',
            button: 'Ĝisdatigi',

            // changes
            added: n => `Aldonis ${n} permeso${n === 1 ? '' : 'j'}n`,
            removed: n => `Forigis ${n} permeso${n === 1 ? '' : 'j'}n`,
            mrChanged: 'Ŝanĝis membrorestriktojn',

            // task completion list
            px: 'Permesoj',
            mr: 'Membrorestriktoj',
        },
    },
};

export const errors = {
    unknown: err => `Okazis nekonata eraro: ${err}`,
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
    'bad-request': err => `Nevalida peto: ${err}`,
    'unauthorized': 'Mankas aŭtentiko',
    'forbidden': 'Mankas permeso',
    'not-found': 'La paĝo ne estis trovita',
    'conflict': 'Okazis interna konflikto, bonvolu reprovi',
    'internal-server-error': 'Okazis interna eraro',
};

export const login = {
    title: 'Ensaluti',
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

    lostTotpDescription: 'Bv. kontakti AKSO-administranton ĉe helpo@akso.org',

    genericTotpError: 'Ne sukcesis ensaluti, bv. reprovi poste',
    invalidTotp: 'Nevalida sekurkodo',
    invalidTotpFormat: 'Bonvolu enmeti vian sesciferan sekurkodon',
};

export const app = {
    title: p => p ? `${p} | AKSO-Administranto` : 'AKSO-Administranto',
    logOut: 'Elsaluti',

    // literally any error that causes the UI to fail to render
    genericErrorTitle: 'Eraro',
    genericError: 'Okazis neatendita eraro. Bonvolu poste reprovi. Se tiu ĉi eraro okazadas indus kontakti administranton.',
    genericErrorReload: 'Reŝarĝi la paĝon',
    genericErrorViewDetails: 'Montri teĥnikajn detalojn',

    notFound: 'Ni ne sukcesis trovi tiun ĉi paĝon. Eventaule kontrolu ĉu vi mistajpis adreson.',
    forbidden: 'Vi ne rajtas aliri tiun ĉi paĝon.',
    goHome: 'Hejmen',

    debugPageInfo: 'Se vi ne scias kio estas tio ĉi, ne zorgu kaj alklaku sur \'Hejmo\' en la menuo.',
};

export const pages = {
    home: 'Hejmo',
    ch: 'Membroj',
    codeholders: 'Membroj',
    statistics: 'Statistiko',
    membership: 'Membreco',
    email: 'Amasmesaĝoj',
    magazines: 'Revuoj',
    congresses: 'Kongresoj',
    votes: 'Voĉdonado',
    newsletters: 'Bultenoj',
    payments: 'AKSO-Pago',
    'payment-intents': 'Pagoj',
    'payment-orgs': 'Pagorganizoj',
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

export const index = {
    tasks: {
        title: 'Taskoj',
    },
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
    viewJSON: 'Konverti al JSON-filtrilo',
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
    status: (n, m) => `Ŝarĝis ${n} el ${m} ero${m === 1 ? '' : 'j'}`,
    endingExport: (n, m) => `Elportis ${n} el entute ${m} vico${m === 1 ? '' : 'j'}`,
    summary: rows => `Kreis csv-dosieron de ${rows} vico${rows === 1 ? '' : 'j'}`,
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
            codeList: 'Listo de UEA-kodoj',
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
            activeAtTime: 'aktiva je', // comes before the date picker
        },
        types: {
            all: 'ne gravas',
            human: 'homo',
            org: 'organizo',
        },
        codeList: {
            pickCodes: 'Listo de kodoj',
            description: 'Enmetu UEA-kodojn en la ĉi-suban liston; po unu en unu vico.',
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
        ageFormat: (age, agep, dead) => `${age}` + (dead ? '' : ` (${agep} jarkomence)`),
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
        description: 'Se la komenca kaj fina datoj restas malplenaj, la valido iĝas senlimaj.',
        durationFrom: 'Valida ekde',
        durationTo: 'Valida ĝis',
        notADate: 'Ne estas valida dato',
    },
    files: {
        downloadToView: 'Elŝuti',
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
        inTimezone: 'en la horzono',
        viewInOSM: 'Montri ĉirkaŭaĵon sur mapo',
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
    },

    picker: {
        none: 'Neniu elektita',
        search: 'Aldoni laŭ nomo aŭ UEA-kodo',
    },
    resetPassword: {
        create: 'Sciigi pri kontokreado',
        reset: 'Sciigi pri pasvortonuligo',
        descriptionCreate: 'Tio ĉi sendas retpoŝtmesaĝon al la membro pri kreado de AKSO-konto.',
        descriptionReset: 'Tio ĉi sendas sciigon al la membro pri nuligo de ties pasvorto.',
        orgsSelect: 'Elekti AKSO-organizon por la sciigo',
        orgs: {
            uea: 'UEA',
            tejo: 'TEJO',
            akso: 'AKSO',
        },
        send: 'Sciigo',
        success: 'Sciigo sendita',
    },
};

export const paymentOrgs = {
    title: 'Pagorganizoj',
    detailTitle: 'Pagorganizo',
    fields: {
        org: 'Organizo',
        name: 'Nomo',
        description: 'Priskribo',
    },
    detailTabs: {
        org: 'Pri la pagorganizo',
        addons: 'Donacebloj',
        methods: 'Pagmetodoj',
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei pagorganizon',
        button: 'Krei',
        orgs: {
            tejo: 'TEJO',
            uea: 'UEA',
        },
    },
    createAddon: 'Krei donaceblon',
    createMethod: 'Krei pagmetodon',
    update: {
        menuItem: 'Redakti',
        title: 'Ĝisdatigi',
        button: 'Konservi',
        nameRequired: 'Necesas nomo',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi pagorganizon',
        description: 'Ĉu vi certas, ke vi volas forigi tiun ĉi pagorganizon?',
        button: 'Forigi',
    },
};
export const paymentAddons = {
    detailTitle: 'Donacebloj',
    fields: {
        name: 'Nomo',
        description: 'Priskribo',
    },
    create: {
        title: 'Krei donaceblon',
        button: 'Krei',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Ĝisdatigi',
        button: 'Konservi',
        nameRequired: 'Necesas nomo',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi donaceblon',
        description: 'Ĉu vi certas, ke vi volas forigi tiun ĉi donaceblon?',
        button: 'Forigi',
    },
};
export const paymentMethods = {
    detailTitle: 'Pagmetodo',
    fields: {
        type: 'Pagmaniero',
        stripeMethods: 'Stripe-metodoj',
        name: 'Nomo',
        internalDescription: 'Internaj notoj',
        description: 'Publika priskribo',
        currencies: 'Valutoj',
        paymentValidity: 'Valideco de neplenumitaj pagoj',
        isRecommended: 'Rekomendita',
        stripeSecretKey: 'Sekreta ŝlosilo de Stripe',
        stripePublishableKey: 'Publika ŝlosilo de Stripe',

        types: {
            manual: 'Permana',
            stripe: 'Stripe™',
        },
        stripeMethodValues: {
            card: 'Karto',
        },
        noCurrenciesSelected: 'Neniu valuto estis elektita',
        paymentValidityTypes: {
            limited: 'Validas dum ...',
            forever: 'Neniam ekvalidiĝas',
        },
    },
    create: {
        title: 'Krei pagmetodon',
        button: 'Krei',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Ĝisdatigi',
        button: 'Konservi',
        nameRequired: 'Necesas nomo',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi pagmetodon',
        description: 'Ĉu vi certas, ke vi volas forigi tiun ĉi pagmetodon?',
        button: 'Forigi',
    },
    methodPicker: {
        title: '[[pick payment method]]',
        orgsEmpty: '[[no payment orgs]]',
        empty: '[[no manual methods in this org]]',
    },
};
export const paymentIntents = {
    openInStripePrefix: 'Malfermi ĉe',
    stripeIntentLink: id => `https://dashboard.stripe.com/test/payments/${id}`,

    title: 'Pagoj',
    detailTitle: 'Pago',
    filters: {
        customerName: 'Nomo de Kliento',
        customerEmail: 'Retpoŝtadreso de Kliento',
        paymentOrg: 'Pagorganizo',
        paymentMethod: 'Pagmetodo',
        org: 'AKSO-Organizo',
        currencies: 'Valutoj',
        status: 'Stato',

        orgs: {
            tejo: 'TEJO',
            uea: 'UEA',
            '': 'ne gravas',
        },
        statuses: {
            '': 'ne gravas',
            pending: 'ankoraŭ ne plenumita',
            processing: 'traktata de sistemo',
            submitted: 'pago sendita de kliento',
            canceled: 'nuligita',
            succeeded: 'fintraktita',
            abandoned: 'eksvalidiĝis',
            disputed: 'disputita',
            refunded: 'mono redonita',
        },
    },
    fields: {
        customer: 'Kliento',
        customerName: 'Nomo',
        customerEmail: 'Retpoŝtadreso',
        method: 'Pagmetodo',
        org: 'Organizo',
        currency: 'Valuto',
        status: 'Stato',
        events: 'Okazintaĵoj',
        timeCreated: 'Kreiĝhoro',
        statusTime: 'Horo de lasta okazintaĵo',
        internalNotes: 'Internaj notoj',
        customerNotes: 'Notoj de la kliento',
        foreignId: 'Eksterna identigilo',
        stripePaymentIntentId: 'Identigilo ĉe Stripe (PaymentIntent ID)',
        stripeClientSecret: 'Sekreta klientŝlosilo ĉe Stripe (Client Secret)',
        purposes: 'Pagceloj',
        totalAmount: 'Sumo',
        amountRefunded: 'Sumo redonita',

        statuses: {
            created: 'Kreita', // not a real status; used in event log
            pending: 'Ankoraŭ ne plenumita',
            processing: 'Traktata de sistemo',
            submitted: 'Pago sendita de kliento',
            canceled: 'Nuligita',
            succeeded: 'Fintraktita',
            abandoned: 'Eksvalidiĝis',
            disputed: 'Disputita',
            refunded: 'Mono redonita',
            willBeAbandoned: 'Eksvalidiĝos', // used to indicate future abandonment
        },
        purposeTypes: {
            trigger: 'AKSO-ago',
            manual: 'Permana',
            addon: 'Donaco',
        },
    },
    detailTo: 'al', // X currency >to< org
    detailViewCodeholder: 'Montri membron',
    detailNoCodeholder: 'Neniu ligita membro',
    detailRefundSuffix: 'redonita', // goes after the refunded amount
    detailViewMethod: 'Montri pagmetodon',
    actions: {
        cancel: {
            title: 'Nuligi',
            description: 'Ĉu vi certas, ke vi volas nuligi tiun ĉi pagon?',
            button: 'Nuligi',
        },
        markDisputed: {
            title: 'Krei disputon',
            description: 'Ĉu vi certas, ke vi volas krei disputon pri tiu ĉi pago? Bv. aldoni detalojn pri la disputo en la internaj notoj.',
            button: 'Krei disputon',
        },
        markRefunded: {
            title: 'Indiki pagon redonita',
            description: 'Ĉu vi certas, ke vi volas indiki, ke mono estis redonita el tiu ĉi pago? Bv. aldoni detalojn pri la redonita mono en la internaj notoj.',
            amount: 'Redonita monkvanto',
            button: 'Indiki',

            stripeTitle: '[[you need to do this in stripe]]',
            stripeDescription: '[[we were too lazy to implement this in the admin fe]]',
            stripeButton: '[[do it in stripe]]',

            // errors
            lowerBound: 'Ne eblas redoni negativan monkvanton',
            upperBound: 'Ne eblas redoni pli ol estis pagita',
        },
        markSucceeded: {
            title: 'Indiki pagon ricevita',
            description: 'Ĉu vi certas, ke la mono estis ricevita? Bv. aldoni la eksteran identigilon de la pago se eblas.',
            button: 'Indiki',
        },
        submit: {
            title: 'Indiki monon sendita',
            description: 'Ĉu vi certas, ke la mono estis sendita (eĉ se ankoraŭ ne ricevita)?',
            button: 'Indiki',
        },
    },
    transitionUnavailabilityReasons: {
        stripe: '[[not available for stripe intents]]', // fallback

        // current state -> new state
        // the following table is for MANUAL methods. If something is allowed in manual but not
        // in stripe, the stripe fallback above will be shown
        pending: {
            submitted: '', // allowed
            canceled: '', // allowed
            succeeded: '[[submit first]]',
            disputed: '[[nope]]',
            refunded: '', // allowed
        },
        processing: '[[patience]]',
        submitted: {
            submitted: '[[already submitted]]',
            canceled: '', // allowed
            succeeded: '', // allowed
            disputed: '[[nope]]',
            refunded: '', // allowed
        },
        canceled: {
            submitted: '[[nope]]',
            canceled: '[[already canceled]]',
            succeeded: '[[nope]]',
            disputed: '[[nope]]',
            refunded: '[[nope]]',
        },
        abandoned: '[[nope]]',
        succeeded: {
            submitted: '[[nope]]',
            canceled: '[[nope]]',
            succeeded: '[[already succeeded]]',
            disputed: {
                stripe: '[[idk why]]',
                manual: '', // allowed,
            },
            refunded: '[[nope]]',
        },
        disputed: {
            submitted: '[[nope]]',
            canceled: '', // allowed
            succeeded: '[[nope]]',
            disputed: '[[already disputed]]',
            refunded: '', // allowed
        },
        refunded: {
            submitted: '[[nope]]',
            canceled: '[[nope]]',
            succeeded: '[[nope]]',
            disputed: '[[nope]]',
            refunded: '', // allowed
        },
    },
    search: {
        fields: {
            customerEmail: 'Retpoŝtadreso de la kliento',
            customerName: 'Nomo de la kliento',
            internalNotes: 'Internaj notoj',
            customerNotes: 'Notoj de la kliento',
        },
        placeholders: {
            customerEmail: 'ekz. zamenhof@akso.org',
            customerName: 'ekz. Zamenhof',
            internalNotes: 'Traserĉi internajn notojn',
            customerNotes: 'Traserĉi notojn de klientoj',
        },
    },
    purposesPicker: {
        addTitle: '[[add purpose]]',
        selectMethodFirst: '[[select a payment method first]]',
        selectCurrencyFirst: '[[select a currency first]]',
        addPurposeButton: '[[add]]',
        types: {
            manual: 'Permana',
            addon: 'Donaceblo',
        },
        manual: {
            title: '[[title]]',
            description: 'Priskribo',
        },
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei pagon',
        button: 'Krei',

        noCurrencySelected: '[[no currency selected]]',
        paymentMethod: 'Pagmetodo',
        purposes: '[[purposes]]',
        total: '[[Total:]]',
        totalNote: '[[estimate; actual value will be clamped to 1USD-500KUSD]]',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Ĝisdatigi',
        button: 'Konservi',
    },

    report: {
        title: '[[report]]',
        csvFilename: '[[payment_report]]',

        totals: '[[totals]]',

        startTime: '[[range start]]',
        endTime: '[[range end]]',
    },
};

export const currencies = {
    USD: 'Usonaj Dolaroj (USD)',
    AUD: 'Aŭstraliaj Dolaroj (AUD)',
    CAD: 'Kanadaj Dolaroj (CAD)',
    CHF: 'Svisaj Frankoj (CHF)',
    DKK: 'Danaj Kronoj (DKK)',
    EUR: 'Eŭroj (EUR)',
    GBP: 'Britaj Pundoj (GBP)',
    HKD: 'Honkonga Dolaro (HKD)',
    JPY: 'Japana eno (JPY)',
    MXN: 'Meksika peso (MXN)',
    MYR: 'Malajzia ringito (MYR)',
    NOK: 'Norvega krono (NOK)',
    NZD: 'Nov-Zelanda dolaro (NZD)',
    PLN: 'Polaj zlotoj (PLN)',
    SEK: 'Svedaj kronoj (SEK)',
    SGD: 'Singapuraj dolaroj (SGD)',
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
        memberRestrictions: 'Membrodatumaj restriktoj',
    },
    tabs: {
        codeholders: 'Membroj',
        clients: 'API-klientoj',
    },
    editPerms: 'Redakti permesojn',
    deleteSelection: 'Forigi elektitojn',

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

            originPlaceholder: 'Ekz. https://admin.akso.org',
            pathEq: 'egalas ekzakte',
            pathStartsWith: 'komenciĝas je',
            pathInverted: 'ne komenciĝas je',
            pathPlaceholder: 'Ekz. /auth',
            resStatusPlaceholder: 'Ekz. 200',
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
        name_eo: 'Nomo en Esperanto',
        name_en: 'Nomo en la angla',
        name_fr: 'Nomo en la franca',
        name_es: 'Nomo en la hispana',
        name_nl: 'Nomo en la nederlanda',
        name_pt: 'Nomo en la portugala',
        name_sk: 'Nomo en la slovaka',
        name_zh: 'Nomo en la ĉina',
        name_de: 'Nomo en la germana',
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
        title: 'Antaŭvido de listo',
        empty: 'Neniu enestas la liston',
    },
    fields: {
        name: 'Nomo',
        description: 'Priskribo',
    },

    create: {
        menuItem: 'Krei',
        title: 'Krei liston',
        button: 'Krei',
        warning: 'Notu: Listoj kaj ĝiaj apartenantaj membroj estas publikaj. Tial nur kreu listojn de membroj, kies datumoj laŭ ĜDPR rajtas esti publikaj. Se vi havas ajnan dubon pri tio ĉi, ne kreu liston sen antaŭkonsulto.',
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
    templatesTitle: 'Ŝablonoj',
    detailTitle: 'Voĉdonado',
    templateDetailTitle: 'Ŝablono',
    templates: {
        menuItem: 'Ŝablonoj',
        createVote: 'Krei voĉdonon surbaze de la ŝablono',
    },
    search: {
        placeholders: {
            name: 'Serĉi nomon',
            description: 'Serĉi priskribon',
        },
    },
    fields: {
        org: 'AKSO-Organizo',
        type: 'Speco',
        name: 'Nomo',
        state: 'Ŝtato',
        description: 'Priskribo',
        voterCodeholders: 'Voĉdonantoj',
        voterCodeholdersMemberFilter: 'Membrofiltrilo de voĉdonantoj',
        viewerCodeholders: 'Rigardantoj',
        viewerCodeholdersMemberFilter: 'Membrofiltrilo de rigardantoj',
        timespan: 'Daŭro',
        timeStart: 'Komenciĝo',
        timeEnd: 'Finiĝo',
        ballotsSecret: 'Sekretaj balotiloj',
        config: 'Agordoj',
        // template fields
        vote: 'Voĉdonagordoj',
    },
    voterCodeholdersDescription: 'Voĉdonantoj estas JSON-filtrilo de membroj, kiuj rajtas voĉdoni.',
    viewerCodeholdersDescription: 'Rigardantoj estas JSON-filtrilo de membroj, kiuj rajtas rigardi la voĉdonon (sed ne nepre voĉdoni).',
    viewerCodeholdersSame: 'Nur voĉdonantoj',
    filters: {
        org: 'AKSO-organizo',
        timeStart: 'Komenĉiĝo',
        timeEnd: 'Finiĝo',
        state: 'Ŝtato',
        type: 'Speco',
        orgTypes: {
            tejo: 'TEJO',
            uea: 'UEA',
            none: 'ne gravas',
        },
        stateTypes: {
            pending: 'Ankoraŭ ne komenciĝis',
            active: '[[active]]',
            ended: '[[ended]]',
            none: 'ne gravas',
        },
        noneType: 'ne gravas',
    },
    cannotEditActive: 'Ne eblas redakti aktivan voĉdonon',
    bool: {
        yes: 'Jes',
        no: 'Ne',
    },
    rational: {
        numerator: 'Numeratoro',
        denominator: 'Denominatoro',
    },
    state: {
        hasNotStarted: 'Ankoraŭ ne komenciĝis',
        isActive: 'Voĉdonado malfermita',
        hasEnded: 'Voĉdonado finiĝis,\natendas rezultojn',
        hasResults: 'Rezultoj pretas',
        hasResultsTiebreaker: 'Rezultoj pretas,\nuzis egalecrompanton',
    },
    config: {
        quorum: 'Necesa kvorumo',
        majorityBallots: 'Plimulto de voĉdonintoj',
        majorityVoters: 'Plimulto de rajtantoj',
        majorityMustReachBoth: 'Devas esti plimulto de kaj voĉdonintoj kaj rajtintoj',
        blankBallotsLimit: 'Maksimuma kvanto de blankaj balotiloj',
        numChosenOptions: 'Kvanto de venkontaj opcioj',
        mentionThreshold: 'Minimuma postulata kvanto de mencioj por kandidato',
        maxOptionsPerBallot: 'Maksimuma kvanto de elektitaj opcioj sur balotilo',
        tieBreakerCodeholder: 'Egalecrompanto',
        publishVoters: 'Publikigi nomojn de voĉdonintoj',
        publishVotersPercentage: 'Publikigi procentaĵon de voĉdonintoj',
        options: 'Opcioj',

        noMaxOptions: '[[infinite options!!!]]',
    },
    inclusive: 'Inkluziva', // checkbox label
    options: {
        simple: 'Simpla opcio',
        codeholder: 'Membro',
        name: 'Nomo',
        descriptionPlaceholder: 'Priskribo',
    },
    types: {
        yn: 'Jes/Ne',
        ynb: 'Jes/Ne/Sindetene',
        rp: 'TEJO-Paroranga Sistemo',
        stv: 'TEJO-Unuopa Transdonebla Voĉo',
        tm: 'UEA-Unuvica Plurnoma Majoritata Balotsistemo',
    },
    results: {
        link: 'Vidi rezultojn',
        title: 'Rezultoj',
        resultTypes: {
            undefined: 'Eraro',
            success: '[[success]]',
            NO_QUORUM: 'Ne atingis kvorumon',
            TOO_MANY_BLANK_BALLOTS: 'Tro da blankaj balotiloj',
            TIE_BREAKER_NEEDED: 'Necesas egalecrompanto',
            TIE: 'Finiĝis en egaleco',
            CHOSEN: 'Rezulto trovita',
            MAJORITY: 'Voĉdono havas plimulton',
            NO_MAJORITY: 'Voĉdono ne havas plimulton',
        },
        turnout: 'Voĉdonintoj',
        voters: n => `${n} voĉdonintoj`,
        nonVoters: n => `${n} nevoĉdonintoj`,
        votersBlank: n => `${n} blankaj balotiloj`,
        tally: 'Nombrigo de balotiloj',
        optionYes: 'Jes',
        optionNo: 'Ne',
        optionBlank: 'Blanka',
        excludedByMentionThreshold: 'Opcioj nekonsiderataj pro limigo pri minimumaj mencioj',
        isEqualOpt: 'Neelektitaj opcioj ricevintaj je same multe da voĉoj kiel elektita opcio',
        electionQuota: n => `Elektiĝkvoto: ${n}`,
        majorityBallotsOkay: k => k ? 'Plimulto de la balotiloj estis atingita.' : 'Plimulto de la balotiloj NE estis atingita.',
        majorityVotersOkay: k => k ? 'Plimulto de la rajtantaj voĉdonantoj estis atingita.' : 'Plimulto de la rajtantaj voĉdonantoj NE estis atingita.',
        majorityOkay: k => k ? 'Ambaŭ plimultoj estis atingitaj.' : 'Ambaŭ plimultoj NE estis atingitaj.',
        rounds: 'Raŭndoj',
        roundsPagination: (n, m) => `Raŭndo ${n} el ${m}`,
        roundsChosen: 'Venkintoj: ',
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
        title: 'Krei voĉdonon',
        templateTitle: 'Krei ŝablonon',
        button: 'Krei',
        pages: {
            template: 'Ŝablono',
            general: 'Ĝenerale',
            vote: 'Voĉdono',
            voters: 'Voĉdonantoj',
            config: 'Agordoj',
        },
        continue: 'Daŭrigi',

        nameRequired: 'Necesas nomo',
        requiresSelection: 'Vi devas elekti opcion',
    },
    numberRequired: 'Bv. enmeti nombron',
    optionsRequired: 'Bv. enmeti voĉdonopciojn',
    update: {
        menuItem: 'Aktualigi',
        title: 'Aktualigi voĉdonon',
        templateTitle: 'Aktualigi ŝablonon',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi voĉdonon',
        templateTitle: 'Forigi ŝablonon',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la voĉdonon? Ne eblas malfari tiun ĉi agon.',
        templateDescription: 'Ĉu vi certas, ke vi volas forigi la ŝablonon? Ne eblas malfari tiun ĉi agon.',
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
        'text/csv': 'CSV-tabelo',
    },
};
