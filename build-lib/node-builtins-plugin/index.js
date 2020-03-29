const rawMapping = {
    buffer: './node_modules/buffer',
    crypto: 'crypto-browserify',
    events: './node_modules/events',
    path: 'path-browserify',
    punycode: './node_modules/punycode',
    querystring: './node_modules/querystring',
    stream: 'stream-browserify',
    string_decoder: './node_modules/string_decoder',
    url: './node_modules/url',
    util: './node_modules/util',
    vm: 'vm-browserify',
};
const mapping = Object.fromEntries(Object.entries(rawMapping).map(([k, v]) => [k, require.resolve(v)]));

export default function nodeBuiltins () {
    return {
        name: 'node-builtins',
        resolveId (id) {
            if (mapping[id]) {
                return mapping[id];
            }
            return null;
        },
    };
}
