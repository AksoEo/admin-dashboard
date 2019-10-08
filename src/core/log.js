/* eslint-disable no-console */
export function any(f, ...args) {
    console[f](
        '%ccore%c ' + args.map(arg => typeof arg === 'string' ? '%s' : '%o').join(' '),
        'padding:1px 2px;border-radius:4px;border:1px solid #4ebc6b',
        '',
        ...args
    );
}
export function debug(...args) {
    any('debug', ...args);
}
export function error(...args) {
    any('error', ...args);
}
