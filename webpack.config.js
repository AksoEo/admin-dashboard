const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const EsLintPlugin = require('eslint-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');
const autoprefixer = require('autoprefixer');
const express = require('express');
const webpack = require('webpack');
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

const aksoBase = process.env['AKSO_BASE'] || 'https://api.akso.org';
const isDevServer = process.env.WEBPACK_SERVE;

console.log(`\x1b[32mAKSO_BASE: ${aksoBase}\x1b[m`);
if (isDevServer) console.warn(`\x1b[33musing dev server api proxy\x1b[m`);
global.aksoConfig = {
    base: isDevServer ? 'http://localhost:2576/_api/' : aksoBase,
};

module.exports = function (env, argv) {
    const analyze = !!argv.env.analyze;
    const prod = !!argv.env.prod || analyze;

    if (!prod) console.warn('\x1b[33mbuilding for development\x1b[m');

    const entry = {};
    entry.entry = './src/fe/index.js';
    if (prod) {
        entry.unsupported = './src/unsupported.js';
    }

    return {
        mode: prod ? 'production' : 'development',
        entry,
        output: {
            filename: prod ? '[name].[hash].js' : '[name].js',
            chunkFilename: (prod && !analyze) ? '[id].[chunkhash].js' : '[name].js',
            globalObject: 'this',
        },
        resolve: {
            extensions: ['.js', '.ts', '.json', '.less'],
            alias: {
                // this is because cross-fetch insists on using a polyfill even though we don’t need
                // it according to caniuse
                'cross-fetch': path.resolve(__dirname, 'src/fetch.js'),

                'react': 'preact/compat',
                'react-dom': 'preact/compat',

                'yamdl': path.resolve(__dirname, 'yamdl/src'),
                'preact-debug-if-dev': prod
                    ? path.resolve(__dirname, 'src/nothing.js')
                    : 'preact/debug',
            },
            fallback: {
                buffer: require.resolve('buffer/'),
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
                path: require.resolve('path-browserify'),
                process: require.resolve('process/browser'),
                util: require.resolve('util/'),
                url: require.resolve('url/'),
            },
        },
        devtool: prod ? 'source-map' : 'inline-source-map',
        stats: {
            preset: prod ? 'minimal' : undefined,
            errorDetails: true,
            children: true,
        },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    terserOptions: {
                        safari10: true
                    }
                }),
                new CssMinimizerPlugin(),
            ],
        },
        plugins: [
            new webpack.ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer'],
            }),
            new MiniCssExtractPlugin({
                filename: prod ? '[name].[hash].css' : '[name].css',
                chunkFilename: prod ? '[id].[hash].css' : '[name].css',
                ignoreOrder: true,
            }),
            new HtmlWebpackPlugin({
                template: 'src/fe/index.html',
                inject: 'body',
                chunks: ['unsupported', 'entry'],
            }),
            analyze && new BundleAnalyzerPlugin(),
            new AksoMagicStringReplacer(),
            // stop moment from loading all the locales
            new webpack.IgnorePlugin({
                resourceRegExp: /^\.\/locale$/,
                contextRegExp: /moment$/,
            }),
            new EsLintPlugin({
                exclude: ['node_modules', 'src/unsupported.js'],
            }),
            // a lot of modules want these nodejs globals
        ].filter(x => x),
        module: {
            rules: [
                {
                    test: /\.val\.js$/,
                    exclude: /node_modules/,
                    use: 'val-loader',
                },
                {
                    test: /()\.m?js$/,
                    // exclude val-loader stuff
                    // exclude unsupported.js
                    // exclude all node_modules
                    exclude: /\.val\.js$|unsupported\.js|node_modules/,
                    use: [
                        {
                            loader: 'babel-loader',
                        },
                    ],
                },
                {
                    // some dependencies seem to have syntax not supported by MS Edge
                    test: /node_modules\/csv-stringify\/.+\.js$/,
                    use: [{
                        loader: 'babel-loader',
                        options: {
                            plugins: [
                                '@babel/plugin-proposal-object-rest-spread',
                            ],
                        },
                    }],
                },
                {
                    test: /noextract\.css$/,
                    use: [
                        { loader: 'to-string-loader' },
                        {
                            loader: 'css-loader',
                            options: { url: false },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        autoprefixer({
                                            env: browserTargets
                                        })
                                    ],
                                },
                            }
                        },
                    ],
                },
                {
                    test: /\.(c|le)ss$/,
                    exclude: /noextract\.css$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                url: false,
                                sourceMap: true
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        autoprefixer({
                                            env: browserTargets
                                        })
                                    ],
                                },
                            },
                        },
                        {
                            loader: 'less-loader',
                            options: { sourceMap: true },
                        }
                    ]
                }
            ]
        },
        devServer: {
            static: {
                directory: path.join(__dirname, 'src'),
            },
            port: 2576,
            proxy: {
                '/_api': {
                    target: aksoBase,
                    pathRewrite: { '^/_api': '' },
                    changeOrigin: true,
                },
            },
            magicHtml: false,
            historyApiFallback: true,
            onBeforeSetupMiddleware (server) {
                server.app.use('/assets', express.static('assets'));
                server.app.use('/apple-touch-icon.png', express.static('assets/apple-touch-icon.png'));
            }
        },
    };
};

// replaces magic strings in source files
class AksoMagicStringReplacer {
    apply (compiler) {
        compiler.hooks.emit.tapPromise('AksoMagicStringReplacer', async compilation => {
            for (const name in compilation.assets) {
                const asset = compilation.assets[name];
                const source = asset.source();
                asset.source = function () {
                    const re = /@!AKSO-MAGIC:(chunk|assets|dev)(?:\:(.+?))?(['"`])/;
                    const stringEscape = s => s.replace(/["'`\n\r\t]/g, m => `\\${m}`);

                    return source.replace(
                        new RegExp(re, 'g'),
                        m => {
                            const a = m.match(re);
                            const cmd = a[1];
                            if (cmd === 'chunk') {
                                for (const name in compilation.assets) {
                                    if (name.startsWith(a[2])) {
                                        return stringEscape(name) + a[3];
                                    }
                                }
                            } else if (cmd === 'assets') {
                                const assets = [];
                                for (const n in compilation.assets) {
                                    if (n === name) continue;
                                    assets.push(n);
                                }
                                return stringEscape(JSON.stringify(assets)) + a[3];
                            } else if (cmd === 'dev') {
                                return (compiler.options.mode === 'development').toString() + a[3];
                            }
                        },
                    );
                };
            }
        });
    }
}
