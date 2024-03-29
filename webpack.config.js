/*
 * © OOO "SI IKS LAB", 2022-2023
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require('path')
const tsImportPluginFactory = require('ts-import-plugin')
const rxjsExternals = require('webpack-rxjs-externals')
const CopyWebpackPlugin = require('copy-webpack-plugin')

/* Dependencies from package.json that ship in ES2015 module format */
const es2015modules = [
    'marked'
].map((item) => path.resolve(__dirname, 'node_modules', item))

module.exports = (_env, options) => {
    return  {
        entry: {
            'cxbox-ui-core': './src/index.ts',
            'interfaces/widget': './src/interfaces/widget.ts',
            'interfaces/filters': './src/interfaces/filters.ts',
            'interfaces/objectMap': './src/interfaces/objectMap.ts',
            'interfaces/operation': './src/interfaces/operation.ts',
            'interfaces/router': './src/interfaces/router.ts',
            'interfaces/view': './src/interfaces/view.ts'
        },
        mode: options.mode || 'development',
        devServer: {
            writeToDisk: false,
            port: 8081
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js',
            library: '',
            libraryTarget: 'commonjs'
        },
        resolve: {
            extensions: [ '.tsx', '.ts', '.js' ],
            modules: ['src', 'node_modules'],
        },
        externals: [
            rxjsExternals(),
            {
            antd: {
                root: 'antd',
                commonjs2: 'antd',
                commonjs: 'antd',
                amd: 'antd'
            },
            axios: {
                root: 'axios',
                commonjs2: 'axios',
                commonjs: 'axios',
                amd: 'axios'
            },
            react: {
                root: 'React',
                commonjs2: 'react',
                commonjs: 'react',
                amd: 'react'
            },
            'react-dom': {
                root: 'ReactDOM',
                commonjs2: 'react-dom',
                commonjs: 'react-dom',
                amd: 'react-dom'
            },
            'react-redux': {
                root: 'ReactRedux',
                commonjs2: 'react-redux',
                commonjs: 'react-redux',
                amd: 'react-redux'
            },
            'redux-observable': {
                root: 'ReduxObservable',
                commonjs2: 'redux-observable',
                commonjs: 'redux-observable',
                amd: 'redux-observable'
            },
            'rxjs': {
                root: 'RxJs',
                commonjs2: 'rxjs',
                commonjs: 'rxjs',
                amd: 'rxjs'
            },
            'moment': {
                root: 'moment',
                commonjs2: 'moment',
                commonjs: 'moment',
                amd: 'moment'
            }
        }],
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    include: [path.resolve(__dirname, 'src')],
                    exclude: [/(\.test.tsx?$)/, path.resolve(__dirname, 'src', 'tests')],
                    use: {
                        loader: 'ts-loader',
                        options: {
                            configFile: path.resolve(__dirname, './tsconfig.json'),
                            getCustomTransformers: function() {
                                return {
                                    before: [
                                        tsImportPluginFactory({
                                            libraryName: 'antd',
                                            libraryDirectory: 'es',
                                            style: false
                                        })
                                    ]
                                }
                            },
                            happyPackMode: false,
                            experimentalWatchApi: false,
                            compilerOptions: {
                                sourceMap: true
                            }
                        }
                    }
                },
                {
                    test: /\.less$/,
                    include: [
                        path.resolve(__dirname, 'src')
                    ],
                    use: [
                        { loader: 'style-loader' },
                        { loader: 'css-loader', options: {
                            modules: true,
                            localIdentName: '[name]__[local]___[hash:base64:5]'
                        } },
                        { loader: 'less-loader', options: { javascriptEnabled: true } }
                    ]
                },
                {
                    test: /\.(png|jpg|jpeg|gif|woff|woff2)$/,
                    use: {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            name: (file) => {
                                return '[path][name].[ext]'
                            }
                        }
                    }
                },
                {
                    test: /\.svg$/,
                    use: {
                        loader: 'svg-inline-loader?classPrefix'
                    }
                },
                // Translating ES2015 modules from npm to support IE11
                {
                    test: /\.jsx?$/,
                    include: es2015modules,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true
                            }
                        }
                    ]
                },
            ]
        },
        plugins: [
            new CopyWebpackPlugin([
                { from: 'package.json' },
                { from: 'README.md' },
                { from: 'LICENSE' },
                { from: 'CHANGELOG.md' },
                { from: 'CONTRIBUTING.md' }
            ])
        ]
    }
}
