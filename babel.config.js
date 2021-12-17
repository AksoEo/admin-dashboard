const pkg = require('./package.json');

const browserTargets = {
    // because Web Worker API
    edge: '18',
    // because CSS grid
    chrome: '57',
    // ?
    firefox: '63',
    // because CSS grid
    safari: '10',
};

module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: browserTargets,
                useBuiltIns: 'usage',
                corejs: pkg.dependencies['core-js'],
            },
        ],
        [
            '@babel/preset-react',
            { pragma: 'h' },
        ],
    ],
    plugins: [
        '@babel/plugin-proposal-export-default-from',
    ],
};
