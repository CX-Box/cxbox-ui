import { build } from 'esbuild'
import terser from 'terser'
import rollup from 'rollup'
import path from 'path'
import fs from 'fs-extra'
import ts from 'typescript'
import type { RawSourceMap } from 'source-map'
import merge from 'merge-source-map'
import yargs from 'yargs/yargs'

import { extractInlineSourceMap, removeInlineSourceMap, appendInlineSourceMap } from './sourcemap'

const { argv } = yargs(process.argv)
    .option('local', {
        alias: 'l',
        type: 'boolean',
        description: 'Run API extractor in local mode'
    })
    .option('skipExtraction', {
        alias: 's',
        type: 'boolean',
        description: 'Skip running API extractor'
    })

const outDir = path.join(__dirname, '../dist')

interface BuildOptions {
    format: 'cjs' | 'umd' | 'esm'
    name: 'cjs.development' | 'cjs.production.min' | 'esm' | 'modern' | 'modern.development' | 'modern.production.min' | 'umd' | 'umd.min'
    minify: boolean
    env: 'development' | 'production' | ''
    target?: 'es2017'
}

interface EntryPointOptions {
    prefix: string
    folder: string
    entryPoint: string
    // globalName is used in the conversion to umd files to separate rtk from rtk-query on a global namespace
    globalName: string
}

const buildTargets: BuildOptions[] = [
    {
        format: 'cjs',
        name: 'cjs.development',
        minify: false,
        env: 'development'
    },

    {
        format: 'cjs',
        name: 'cjs.production.min',
        minify: true,
        env: 'production'
    },
    // ESM, embedded `process`, ES5 syntax: typical Webpack dev
    {
        format: 'esm',
        name: 'esm',
        minify: false,
        env: ''
    },
    // ESM, embedded `process`, ES2017 syntax: modern Webpack dev
    {
        format: 'esm',
        name: 'modern',
        target: 'es2017',
        minify: false,
        env: ''
    },
    // ESM, pre-compiled "dev", ES2017 syntax: browser development
    {
        format: 'esm',
        name: 'modern.development',
        target: 'es2017',
        minify: false,
        env: 'development'
    },
    // ESM, pre-compiled "prod", ES2017 syntax: browser prod
    {
        format: 'esm',
        name: 'modern.production.min',
        target: 'es2017',
        minify: true,
        env: 'production'
    },
    {
        format: 'umd',
        name: 'umd',
        minify: false,
        env: 'development'
    },
    {
        format: 'umd',
        name: 'umd.min',
        minify: true,
        env: 'production'
    }
]

const entryPoints: EntryPointOptions[] = [
    {
        prefix: 'cxbox-ui-core',
        folder: '',
        entryPoint: 'src/index.ts',
        globalName: 'CXBOX'
    }
]

const esVersionMappings = {
    // Don't output ES2015 - have TS convert to ES5 instead
    es2015: ts.ScriptTarget.ES5,
    es2017: ts.ScriptTarget.ES2017,
    es2018: ts.ScriptTarget.ES2018,
    es2019: ts.ScriptTarget.ES2019,
    es2020: ts.ScriptTarget.ES2020
}

async function bundle(options: BuildOptions & EntryPointOptions) {
    const { format, minify, env, folder = '', prefix = 'cxbox-ui-core', name, target, entryPoint } = options
    const outFolder = path.join('dist', folder)
    const outFilename = `${prefix}.${name}.js`
    const outFilePath = path.join(outFolder, outFilename)

    const result = await build({
        entryPoints: [entryPoint],
        outfile: outFilePath,
        write: false,
        target: target,
        sourcemap: 'inline',
        bundle: true,
        format: format === 'umd' ? 'esm' : format,
        platform: 'node',
        mainFields: ['browser', 'module', 'main'],
        conditions: ['browser'],
        define: env
            ? {
                  'process.env.NODE_ENV': JSON.stringify(env)
              }
            : {},
        plugins: [
            {
                name: 'node_module_external',
                setup(buildPlugin) {
                    buildPlugin.onResolve({ filter: /.*/ }, args => {
                        if (format === 'umd') {
                            return undefined
                        }
                        if (args.path.startsWith('.') || args.path.startsWith('/')) {
                            return undefined
                        } else {
                            return {
                                path: args.path,
                                external: true
                            }
                        }
                    })
                    buildPlugin.onLoad({ filter: /getDefaultMiddleware/ }, async args => {
                        if (env !== 'production' || format !== 'umd') {
                            return undefined
                        }
                        const source = await fs.readFile(args.path, 'utf-8')
                        const defaultPattern = /\/\* PROD_START_REMOVE_UMD[\s\S]*?\/\* PROD_STOP_REMOVE_UMD \*\//g
                        const code = source.replace(defaultPattern, '')
                        return {
                            contents: code,
                            loader: 'ts'
                        }
                    })
                }
            }
        ]
    })

    for (const chunk of result.outputFiles) {
        const esVersion = target in esVersionMappings ? esVersionMappings[target] : ts.ScriptTarget.ES5

        const origin = chunk.text
        const sourcemap = extractInlineSourceMap(origin)
        const resultTS = ts.transpileModule(removeInlineSourceMap(origin), {
            fileName: chunk.path,
            compilerOptions: {
                sourceMap: true,
                module: format !== 'cjs' ? ts.ModuleKind.ES2015 : ts.ModuleKind.CommonJS,
                target: esVersion
            }
        })

        const mergedSourcemap = merge(sourcemap as string, resultTS.sourceMapText)
        let code = resultTS.outputText
        let mapping: RawSourceMap = mergedSourcemap

        if (minify) {
            const transformResult = await terser.minify(appendInlineSourceMap(code, mapping), {
                sourceMap: {
                    content: 'inline',
                    asObject: true,
                    url: path.basename(chunk.path) + '.map'
                } as any,
                output: {
                    comments: false
                },
                compress: {
                    keep_infinity: true,
                    pure_getters: true,
                    passes: 10
                },
                ecma: 5,
                toplevel: true
            })
            code = transformResult.code
            mapping = transformResult.map as RawSourceMap
        }

        const relativePath = path.relative(process.cwd(), chunk.path)
        console.log(`Build artifact: ${relativePath}, settings: `, {
            target,
            output: ts.ScriptTarget[esVersion]
        })
        await fs.writeFile(chunk.path, code)
        await fs.writeJSON(chunk.path + '.map', mapping)
    }
}

async function buildUMD(outputPath: string, prefix: string, globalName: string) {
    for (const umdExtension of ['umd', 'umd.min']) {
        const input = path.join(outputPath, `${prefix}.${umdExtension}.js`)
        const instance = await rollup.rollup({
            input: [input],
            onwarn(warning, warn) {
                if (warning.code === 'THIS_IS_UNDEFINED') return
                warn(warning) // this requires Rollup 0.46
            }
        })
        await instance.write({
            format: 'umd',
            name: globalName,
            file: input,
            sourcemap: true,
            globals: {
                // These packages have specific global names from their UMD bundles
                react: 'React',
                'react-redux': 'ReactRedux'
            }
        })
    }
}

async function writeEntry(folder: string, prefix: string) {
    await fs.writeFile(
        path.join('dist', folder, 'index.js'),
        `'use strict'
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./${prefix}.cjs.production.min.js')
} else {
  module.exports = require('./${prefix}.cjs.development.js')
}`
    )
}

async function main({ skipExtraction = false, local = false }) {
    // Dist folder will be removed by rimraf beforehand so TSC can generate typedefs
    await fs.ensureDir(outDir)

    for (const entryPoint of entryPoints) {
        const { folder, prefix } = entryPoint
        const outputPath = path.join('dist', folder)
        fs.ensureDirSync(outputPath)

        // Run builds in parallel
        const bundlePromises = buildTargets.map(options =>
            bundle({
                ...options,
                ...entryPoint
            })
        )
        await Promise.all(bundlePromises)
        await writeEntry(folder, prefix)
    }

    // Run UMD builds after everything else so we don't have to sleep after each set
    for (const entryPoint of entryPoints) {
        const { folder } = entryPoint
        const outputPath = path.join('dist', folder)
        await buildUMD(outputPath, entryPoint.prefix, entryPoint.globalName)
    }
}

main({ skipExtraction: argv.skipExtraction, local: argv.local })
