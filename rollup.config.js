import babel from 'rollup-plugin-babel';
import alias from '@rollup/plugin-alias';
// import resolve from '@rollup/plugin-node-resolve';
import resolve from './build-lib/node-resolve/src/index.js';
import commonjs from '@rollup/plugin-commonjs';
import omt from '@surma/rollup-plugin-off-main-thread';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import json from '@rollup/plugin-json';
import inject from '@rollup/plugin-inject';
import builtins from './build-lib/node-builtins-plugin/index.js';
import config from './build-lib/config-plugin';
import pkg from './package.json';
import path from 'path';
import fs from 'fs';

const isProdBuild = false;

// this object can be loaded via 'akso:config'
const CONFIG = {
    buildTime: new Date().toISOString(),
    // AKSO api base url, **may include a path**
    base: process.env['AKSO_BASE'] || 'https://apitest.akso.org/',
};

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

export default {
    input: 'src/fe/index.js',
    output: [
        {
            dir: 'dist',
            format: 'amd',
            sourcemap: false,
            entryFileNames: '[name].js',
            chunkFileNames: '[name].[hash].js',
        },
    ],
    plugins: [
        // file handlers
        postcss({
            plugins: [
                autoprefixer({
                    env: browserTargets,
                }),
            ],
            extensions: ['.css', '.less'],
            extract: true,
        }),
        babel({
            include: ['src/**/*.js', 'node_modules/@cpsdqs/yamdl/**/*.js'],
            presets: [
                isProdBuild && [
                    '@babel/preset-env',
                    {
                        targets: browserTargets,
                        useBuiltIns: 'usage',
                        corejs: pkg.dependencies['core-js'],
                    }
                ],
                [
                    '@babel/preset-react',
                    { pragma: 'h' },
                ]
            ].filter(x => x),
            plugins: [
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-proposal-export-default-from',
                '@babel/plugin-syntax-dynamic-import'
            ],
        }),
        json(),

        // resolving
        config(CONFIG),
        builtins(),
        alias({
            entries: [
                { find: 'react', replacement: 'preact/compat' },
                { find: 'react-dom', replacement: 'preact/compat' },
                // this is because cross-fetch insists on using a polyfill even though we don’t need
                // it according to caniuse
                { find: 'cross-fetch', replacement: path.resolve(__dirname, 'src/fetch.js') },
            ],
        }),
        resolve({
            extensions: ['.mjs', '.js', '.json', '.less'],
            browser: true,
            preferBuiltins: true,
            jail: process.cwd(),
        }),
        omt({
            loader: fs.readFileSync(path.resolve(__dirname, 'build-lib/loader.ejs')).toString(),
        }),
        commonjs({
            namedExports: {
                'react-is': ['ForwardRef'],
                'prop-types': ['elementType'],
            },
        }),

        // processing
        inject({
            process: isProdBuild
                ? path.resolve(__dirname, 'build-lib/globals/process-prod.js')
                : path.resolve(__dirname, 'build-lib/globals/process.js'),
            Buffer: ['buffer', 'Buffer'],
            global: path.resolve(__dirname, 'build-lib/globals/global.js'),
            setImmediate: path.resolve(__dirname, 'build-lib/globals/setImmediate.js'),
        }),
    ],
    context: 'window',
};
