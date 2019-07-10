const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');
const autoprefixer = require('autoprefixer');
const express = require('express');
const webpack = require('webpack');

const browserTargets = {
    edge: '17',
    chrome: '49',
    firefox: '63',
    safari: '10',
    // FIXME: did browserslist remove these? babel fails when they’re added
    // and_chr: '70',
    // and_uc: '11.8',
    // ios_saf: '11'
};

global.aksoConfig = {
    host: process.env['AKSO_HOST'] || 'https://apitest.akso.org',
};

module.exports = function (env, argv) {
    const analyze = env === 'analyze';
    const prod = env === 'prod' || analyze;

    if (!prod) console.warn('\x1b[33mbuilding for development\x1b[m');

    return {
        mode: prod ? 'production' : 'development',
        entry: {
            entry: './src/index.js',
            'service-worker': './src/service-worker.js'
        },
        output: {
            filename: '[name].[chunkhash].js',
            chunkFilename: '[name].[chunkhash].js',
            path: path.resolve(__dirname, 'dist'),
        },
        resolve: {
            extensions: ['.js', '.json', '.less'],
            alias: {
                // use source files from akso-client directly to avoid a bunch of issues
                // (such as source-map-support being loaded)
                'akso-client': 'akso-client/src'
            }
        },
        devtool: prod ? 'source-map' : 'inline-source-map',
        stats: 'minimal',
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
                filename: '[name].[contenthash].css',
                chunkFilename: '[name].[contenthash].css'
            }),
            new OptimizeCssAssetsPlugin(),
            new HtmlWebpackPlugin({
                template: 'src/index.html',
                inject: 'body'
            }),
            analyze && new BundleAnalyzerPlugin(),
            new SWCacheGenPlugin(),
            new webpack.IgnorePlugin({
                // required by akso-client but not used
                resourceRegExp: /fetch-cookie/,
            }),
        ].filter(x => x),
        module: {
            rules: [
                {
                    test: /\.val\.js$/,
                    exclude: /node_modules/,
                    use: 'val-loader',
                },
                {
                    test: /\.m?js$/,
                    // exclude all node_modules (except akso-client; see above)
                    exclude: /node_modules\/(?!akso-client)/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    [
                                        '@babel/preset-env',
                                        {
                                            targets: browserTargets,
                                            useBuiltIns: 'usage',
                                            corejs: '3.0.1',
                                        }
                                    ],
                                    [
                                        '@babel/preset-react'
                                    ]
                                ],
                                plugins: [
                                    '@babel/plugin-proposal-class-properties',
                                    '@babel/plugin-proposal-export-default-from',
                                    '@babel/plugin-syntax-dynamic-import'
                                ]
                            }
                        }, {
                            loader: 'eslint-loader'
                        }
                    ]
                },
                {
                    test: /\.(c|le)ss$/,
                    exclude: /node_modules/,
                    use: [
                        MiniCssExtractPlugin.loader,
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
            }
        },
        node: {
            net: 'empty', // fix Can't resolve 'net' error
        }
    };
};

// kinda hacky service worker impl
class SWCacheGenPlugin {
    apply (compiler) {
        compiler.hooks.emit.tapPromise('SWCacheGenPlugin', async compilation => {
            let foundSW = false;
            let foundEntry = false;

            // make a list of all assets (except the service worker)
            const assets = [];
            let serviceWorkerName = null;
            for (const name in compilation.assets) {
                if (name.startsWith('service-worker') && name.endsWith('.js')) {
                    serviceWorkerName = name;
                } else assets.push(name);
            }

            // replace magic strings in source files
            for (const name in compilation.assets) {
                if (name.startsWith('service-worker.') && name.endsWith('.js')) {
                    foundSW = true;
                    const asset = compilation.assets[name];
                    const source = asset.source();
                    asset.source = function () {
                        return source.replace(
                            '"**list of assets goes here (see webpack config)**"',
                            JSON.stringify(JSON.stringify(assets))
                        ).replace(
                            '**true if dev mode (see webpack config)**',
                            JSON.stringify(compiler.options.mode === 'development')
                        )
                    };
                } else if (name.startsWith('entry.') && name.endsWith('.js')) {
                    foundEntry = true;
                    const asset = compilation.assets[name];
                    const source = asset.source();
                    asset.source = function () {
                        return source.replace(
                            '**service worker file name (see webpack config)**',
                            serviceWorkerName
                        );
                    };
                }
            }
            if (!foundSW || !foundEntry) {
                throw new Error('Could not find service worker file and entry file');
            }
        });
    }
}
