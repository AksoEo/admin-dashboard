import config from '../../config.val';

const startYear = 2019;
const thisYear = new Date(config.buildTime).getUTCFullYear();
const copyrightYear = `${startYear}–${thisYear}`;

export const timestampFormat = 'LLL [UTC]';
export const timestampTzFormat = 'LLL';
// for dates that are today
export const timestampFormatToday = '[hodiaŭ] LT [UTC]';
export const timestampTzFormatToday = '[hodiaŭ] LT';

export const osmAddressSearchEndpoint = 'https://nominatim.openstreetmap.org/search?';

export const insecureContext = 'La paĝo ne estas sekura (http)!';
export const getAuthSureIsTakingAWhile = '[[Connecting to the backend sure is taking a while... have you checked |https://status.akso.org| to see if it’s down? Or maybe just try reloading the page.]]';
export const getAuthTryCounter = n => `(${n} [[tries]])`;

export const meta = {
    copyright: `© ${copyrightYear}`,
    copyrightHolder: 'TEJO',
    copyrightHref: 'https://tejo.org',
    license: 'MIT-Permesilo',
    sourceHref: 'https://github.com/AksoEo',
    source: 'GitHub',

    feVersion: 'AKSO-Admin versio',
    feVersionBuilt: 'kompilita',
    apiVersion: 'API versio',
};

export * from './data';
export * from './errors';
export * from './login';
export * from './app';
export * from './codeholders';
export * from './congresses';
export * from './delegations';
export * from './memberships';
export * from './magazines';
export * from './notif-templates';
export * from './roles';
export * from './payments';
export * from './admin';
export * from './lists';
export * from './votes';
export * from './form-editor';
