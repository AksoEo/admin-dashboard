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
};

export const pages = {
    home: 'Hejmo',
    members: 'Membroj',
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

// TODO: remove this
import compatLocale from './locale_old';
export default compatLocale;
