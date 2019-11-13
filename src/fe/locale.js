import config from '../config.val';

const startYear = 2019;
const thisYear = new Date(config.buildTime).getUTCFullYear();
const copyrightYear = thisYear === startYear ? thisYear : `${startYear}–${thisYear}`;

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

    totpSetupDescription: 'Bonvolu skani la QR-kodon per via aplikaĵo por agordi dua-faktoran ensaluton.',
    totpAppDescriptionPre: 'Se vi ne havas dua-faktoran aplikaĵon, ni rekomendas ',
    totpAppName: 'Authy',
    totpAppHref: userAgent => 'https://authy.com/download/',
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
    logOut: 'Elsaluti',
    // literally any error that causes the UI to fail to render
    genericError: '[[something went wrong :shrug:]]',
    genericErrorReload: '[[reload page]]',
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
    elections: 'Voĉdonado',
    newsletters: 'Bultenoj',
    administration: 'Administrado',
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
};

export const codeholders = {
    title: 'Membroj',
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
            isActiveMember: 'Aktiva membro en',
            deathdate: 'Mortdato',
        },
    },
    fields: {
        type: 'Membrospeco',
        types: {
            human: 'Homo',
            org: 'Organizo',
        },
        name: 'Nomo',
        code: 'UEA-kodo',
        country: 'Lando',
        disjunctCountry: (fee, country) => `Pagas laŭ ${fee}, loĝas en ${country}`,
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
    },
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
};

// TODO: remove this
import compatLocale from './locale_old';
export default compatLocale;
