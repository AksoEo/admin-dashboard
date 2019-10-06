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
    totpAppDescriptionPre: '[[if you do not have a 2fa app, we recommend]] ',
    totpAppName: 'Authy',
    totpAppHref: 'https://authy.com/download/',
    totpAppDescriptionPost: '.',

    totp: 'Sekurkodo',
    totpDescription: 'Bonvolu enmeti sekurkodon generitan de via duafaktora aplikaĵo.',
    rememberTotp: 'Memori tiun ĉi aparaton dum 60 tagoj',
    rememberTotpDescription: 'Nur uzu tiun ĉi funkcion ĉe personaj komputiloj.',
    lostSecurityCode: 'Mi ne povas generi sekurkodon',

    genericTotpError: 'Ne sukcesis ensaluti, bv. reprovi poste',
    invalidTotp: 'Nevalida sekurkodo',
    invalidTotpFormat: 'Bonvolu enmeti vian sesciferan sekurkodon',
};
