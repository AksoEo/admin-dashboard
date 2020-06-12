const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
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

global.aksoConfig = {
    base: process.env['AKSO_BASE'] || 'https://apitest.akso.org/',
};

module.exports = function (env, argv) {
    const analyze = env === 'analyze';
    const prod = env === 'prod' || analyze;

    if (!prod) console.warn('\x1b[33mbuilding for development\x1b[m');

    const babelOptions = {
        presets: [
            [
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
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-export-default-from',
            '@babel/plugin-syntax-dynamic-import'
        ],
    };

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
            chunkFilename: prod ? '[id].[chunkhash].js' : '[name].js',
            path: path.resolve(__dirname, 'dist'),
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
            },
        },
        devtool: prod ? 'source-map' : 'inline-source-map',
        stats: prod ? 'minimal' : undefined,
        optimization: {
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    sourceMap: true,
                    terserOptions: {
                        safari10: true
                    }
                })
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: prod ? '[name].[hash].css' : '[name].css',
                chunkFilename: prod ? '[id].[hash].css' : '[name].css',
                ignoreOrder: true,
            }),
            prod && new OptimizeCssAssetsPlugin(),
            new HtmlWebpackPlugin({
                template: 'src/fe/index.html',
                inject: 'body',
                chunks: ['unsupported', 'entry'],
            }),
            new ScriptExtHtmlWebpackPlugin({
                defaultAttribute: 'async',
            }),
            analyze && new BundleAnalyzerPlugin(),
            new AksoMagicStringReplacer(),
            // stop moment from loading all the locales
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
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
                    // exclude unsupported.js
                    // exclude all node_modules
                    // (except yamdl because it doesn’t have a compiler setup yet)
                    exclude: /unsupported\.js|node_modules\/(?!@cpsdqs\/yamdl)/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: babelOptions,
                        }, {
                            loader: 'eslint-loader'
                        }
                    ]
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
                                plugins: [
                                    autoprefixer({
                                        env: browserTargets
                                    })
                                ]
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
                                plugins: [
                                    autoprefixer({
                                        env: browserTargets
                                    })
                                ]
                            }
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
            contentBase: path.join(__dirname, 'src'),
            port: 2576,
            stats: 'minimal',
            historyApiFallback: true,
            before (app, server) {
                app.use('/assets', express.static('assets'));
                app.use('/apple-touch-icon.png', express.static('assets/apple-touch-icon.png'));
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
